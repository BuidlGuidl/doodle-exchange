import { NextResponse } from "next/server";

export const GET = async () => {
  return new NextResponse(JSON.stringify(process.env.ABLY_API_KEY), { status: 200 });
};
