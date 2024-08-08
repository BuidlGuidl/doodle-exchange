import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";
import { Player } from "~~/types/game/game";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, newStatus, address } = body;

    await connectdb();

    const game = await Game.findById(id);
    const player = game.players.find((p: Player) => p.address === address);

    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found " }), { status: 403 });
    }

    if (game.status == "finished") {
      return new NextResponse(JSON.stringify({ error: "Game has finished " }), { status: 403 });
    }

    if (player.status === newStatus) {
      return new NextResponse(JSON.stringify({ error: `Player already ${newStatus}` }), { status: 403 });
    }

    if (!player) {
      return new NextResponse(JSON.stringify({ error: "Player not found " }), { status: 403 });
    }

    player.status = newStatus;

    const updatedGame = await game.save();

    const gameChannel = ablyRealtime.channels.get(`gameUpdate`);
    const playerChannel = ablyRealtime.channels.get(`playerUpdate`);
    gameChannel.publish(`gameUpdate`, updatedGame);
    playerChannel.publish(`playerUpdate`, player);
    return new NextResponse(
      JSON.stringify({ message: `Updated player status to ${newStatus}`, game: updatedGame, player: player }),
      {
        status: 200,
      },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error updating Player Status " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
