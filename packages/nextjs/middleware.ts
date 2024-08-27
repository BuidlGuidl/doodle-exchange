import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import doodleConfig from "./doodle.config";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || doodleConfig.jwt_secret);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that don't require authentication
  const publicRoutes = ["/api/host/create", "/api/player/join", "/api/ably"];

  if (publicRoutes.includes(pathname) || pathname.startsWith("/api/game/")) {
    return NextResponse.next();
  }

  const token = request.headers.get("authorization");

  if (!token) {
    return new NextResponse(JSON.stringify({ verified: false, message: "Access Denied" }), { status: 403 });
  }

  let jwtToken = token;
  if (jwtToken.startsWith("Bearer ")) {
    jwtToken = jwtToken.slice(7, jwtToken.length).trimStart();
  }

  try {
    await jwtVerify(jwtToken, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(JSON.stringify({ verified: false, error: "Invalid Token " + (error as Error).message }), {
      status: 403,
    });
  }
}

export const config = {
  matcher: "/api/:path*",
};
