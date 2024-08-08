import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, newRound } = body;

    await connectdb();

    const game = await Game.findById(id);

    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found " }), { status: 403 });
    }

    if (game.status == "finished") {
      return new NextResponse(JSON.stringify({ error: "Game has finished " }), { status: 403 });
    }

    for (const player of game.players) {
      if (player.currentRound < newRound) {
        player.currentRound = newRound;
        player.status = "waiting";
        player.points.push(0);
        player.wonRound.push(false);
      }
    }
    game.currentRound = newRound;
    const updatedGame = await game.save();

    const gameChannel = ablyRealtime.channels.get(`gameUpdate`);
    gameChannel.publish(`gameUpdate`, updatedGame);
    return new NextResponse(
      JSON.stringify({ message: `Updated current game round to ${newRound}`, game: updatedGame }),
      {
        status: 200,
      },
    );
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
