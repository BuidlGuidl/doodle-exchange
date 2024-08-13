import { NextResponse } from "next/server";
// import { ablyRealtime } from "~~/lib/socket";
import Ably from "ably";
import doodleConfig from "~~/doodle.config";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, newStatus } = body;
    const ablyRealtime = new Ably.Realtime({ key: process.env.ABLY_API_KEY || doodleConfig.ably_api_key });
    await connectdb();

    const game = await Game.findById(id);

    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found " }), { status: 403 });
    }

    if (game.status == "finished") {
      return new NextResponse(JSON.stringify({ error: "Game has finished " }), { status: 403 });
    }

    if (game.status == newStatus) {
      return new NextResponse(JSON.stringify({ error: `Game already ${newStatus}` }), { status: 403 });
    }

    game.status = newStatus;
    const updatedGame = await game.save();

    const channel = ablyRealtime.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, updatedGame);
    channel.unsubscribe();
    ablyRealtime.close();
    return new NextResponse(JSON.stringify({ message: `Updated game status to ${newStatus}`, game: updatedGame }), {
      status: 200,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error updating Game Status " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
