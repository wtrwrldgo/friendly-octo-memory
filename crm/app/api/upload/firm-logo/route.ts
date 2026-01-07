import { NextRequest, NextResponse } from "next/server";

// Production VPS URL - hardcoded to avoid env var issues
const VPS_URL = "http://45.92.173.121";

export async function POST(request: NextRequest) {
  try {
    // Read env var at runtime, fallback to VPS URL
    const API_URL = process.env.NEXT_PUBLIC_API_URL || `${VPS_URL}/api`;
    const STATIC_URL = API_URL.replace(/\/api$/, "");

    const formData = await request.formData();

    // Get authorization header from request
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${API_URL}/upload/firm-logo`, {
      method: "POST",
      body: formData,
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    const data = await response.json();

    // Normalize response to match frontend expectations
    if (data.success && data.data?.logoUrl) {
      const fullUrl = `${STATIC_URL}${data.data.logoUrl}`;
      return NextResponse.json({
        success: true,
        data: { url: fullUrl }
      }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Firm logo upload proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload firm logo" },
      { status: 500 }
    );
  }
}
