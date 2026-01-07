import { NextRequest, NextResponse } from "next/server";

// Proxy images from HTTP backend to serve via HTTPS (v2)
export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, message: "URL parameter required" },
        { status: 400 }
      );
    }

    // Only allow proxying from our VPS
    const allowedDomains = ["45.92.173.121", "api.watergo.uz"];
    const urlObj = new URL(url);

    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { success: false, message: "Domain not allowed" },
        { status: 403 }
      );
    }

    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch image" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
// force rebuild Thu Jan  8 03:30:01 +05 2026
