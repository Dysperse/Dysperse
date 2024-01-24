import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside

// why?? cuz there's a bug when calling fetch() from web
export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return Response.json(
      {},
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Headers": "*",
        },
      }
    );
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/:path*",
};
