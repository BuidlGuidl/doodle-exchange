import { NextResponse } from "next/server";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";
import { Player } from "~~/types/game/game";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, newRound, address, won } = body;
    const game = await Game.findById(id);
    const player = game.players.find((p: Player) => p.address === address);

    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found " }), { status: 403 });
    }

    if (game.status == "finished") {
      return new NextResponse(JSON.stringify({ error: "Game has finished " }), { status: 403 });
    }

    if (player.currentRound === newRound) {
      return new NextResponse(JSON.stringify({ error: "This round was passed " }), { status: 403 });
    }

    if (!player) {
      return new NextResponse(JSON.stringify({ error: "Player not found " }), { status: 403 });
    }
    const currentPlayerRound = player.currentRound;

    if (won) {
      currentPlayerRound === game.currentRound ? player.points.push(3) : player.points.push(1);
      if (currentPlayerRound === game.currentRound) {
        // game.currentRound = newRound;
        const roundChannel = ablyRealtime.channels.get(`updateRound`);
        roundChannel.publish(`updateRound`, game);
      }
      player.wonRound.push(true);
    } else {
      player.points.push(0);
      player.wonRound.push(false);
    }

    player.currentRound = newRound;
    player.status = "waiting";

    if (!game.winners[currentPlayerRound]) {
      game.winners[currentPlayerRound] = [];
    }
    game.winners[currentPlayerRound].push(address);
    const updatedGame = await game.save();

    const gameChannel = ablyRealtime.channels.get(`gameUpdate`);
    const playerChannel = ablyRealtime.channels.get(`playerUpdate`);
    gameChannel.publish(`gameUpdate`, updatedGame);
    playerChannel.publish(`playerUpdate`, player);
    return new NextResponse(
      JSON.stringify({ message: `Updated current player round to ${newRound}`, game: updatedGame, player: player }),
      {
        status: 200,
      },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error updating player round " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
