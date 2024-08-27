import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";

export const GET = async (request: Request) => {
  try {
    await connectdb();

    const url = new URL(request.url);
    const inviteCode = url.pathname.split("/").pop();
    await connectdb();

    const game = await Game.findOne({ inviteCode });

    return new NextResponse(JSON.stringify(game), { status: 200 });
  } catch (error) {
    return new NextResponse("Error fetching games " + error, { status: 500 });
  }
};
