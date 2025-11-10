// Supabase Edge Function: Verify Code and Login
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyCodeRequest {
  phone: string;
  code: string;
  name?: string;
  language?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request
    const { phone, code, name, language }: VerifyCodeRequest = await req.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Phone and code are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify code from database
    const { data: verificationData, error: verifyError } = await supabaseClient
      .from('verification_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verificationData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid or expired verification code'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark code as used
    await supabaseClient
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id);

    // Check if user exists
    let { data: existingUser } = await supabaseClient
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    let user;

    if (existingUser) {
      // Update existing user if name/language provided
      if (name || language) {
        const updates: any = {};
        if (name) updates.name = name;
        if (language) updates.language = language;

        const { data: updatedUser } = await supabaseClient
          .from('users')
          .update(updates)
          .eq('id', existingUser.id)
          .select()
          .single();

        user = updatedUser || existingUser;
      } else {
        user = existingUser;
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseClient
        .from('users')
        .insert({
          phone,
          name: name || 'User',
          language: language || 'en'
        })
        .select()
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Failed to create user'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      user = newUser;
    }

    // Generate JWT token (using user ID as payload)
    // In production, use proper JWT signing with secret
    const token = `watergo_token_${user.id}_${Date.now()}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            language: user.language
          }
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
