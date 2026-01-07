import { NextRequest, NextResponse } from "next/server";

// API URL includes /api suffix, e.g., http://localhost:3001/api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
// Base URL without /api suffix for static files
const BASE_URL = API_URL.replace(/\/api$/, "");

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Get authorization header from request
    const authHeader = request.headers.get("authorization");

    // Forward to backend - API_URL already includes /api
    const response = await fetch(`${API_URL}/upload/product-image`, {
      method: "POST",
      body: formData,
      headers: authHeader ? { Authorization: authHeader } : {},
    });

    const data = await response.json();

    // If successful, prepend the base URL (without /api) to the image URL
    if (data.success && data.data?.imageUrl) {
      data.data.url = `${BASE_URL}${data.data.imageUrl}`;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
