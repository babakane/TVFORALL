import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": new URL(decodedUrl).origin + "/",
        "Origin": new URL(decodedUrl).origin,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch stream: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "application/vnd.apple.mpegurl";
    const isM3U8 = contentType.includes("mpegurl") || contentType.includes("m3u8") || decodedUrl.endsWith(".m3u8");

    // If it's an M3U8 playlist, rewrite the segment URLs to go through our proxy
    if (isM3U8) {
      let body = await response.text();
      const baseUrl = decodedUrl.substring(0, decodedUrl.lastIndexOf("/") + 1);
      
      // Rewrite relative URLs to absolute URLs through our proxy
      body = body.split("\n").map((line) => {
        const trimmedLine = line.trim();
        
        // Skip comments and empty lines
        if (trimmedLine.startsWith("#") || trimmedLine === "") {
          // But handle URI= attributes in EXT-X-KEY tags
          if (trimmedLine.includes("URI=")) {
            return trimmedLine.replace(/URI="([^"]+)"/, (_, uri) => {
              const absoluteUri = uri.startsWith("http") ? uri : baseUrl + uri;
              return `URI="/api/stream?url=${encodeURIComponent(absoluteUri)}"`;
            });
          }
          return line;
        }
        
        // Handle segment URLs
        if (!trimmedLine.startsWith("http")) {
          const absoluteUrl = baseUrl + trimmedLine;
          return `/api/stream?url=${encodeURIComponent(absoluteUrl)}`;
        } else {
          return `/api/stream?url=${encodeURIComponent(trimmedLine)}`;
        }
      }).join("\n");

      return new NextResponse(body, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // For TS segments or other binary content - stream directly
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Stream proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy stream" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}
