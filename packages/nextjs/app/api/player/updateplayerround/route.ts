import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";
import { Player } from "~~/types/game/game";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, address, won } = body;

    await connectdb();
    const game = await Game.findById(id);
    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found" }), { status: 403 });
    }

    const player = game.players.find((p: Player) => p.address === address);
    if (!player) {
      return new NextResponse(JSON.stringify({ error: "Player not found" }), { status: 403 });
    }

    if (game.status === "finished") {
      return new NextResponse(JSON.stringify({ error: "Game has finished" }), { status: 403 });
    }

    if (player.currentRound > game.totalRounds - 1) {
      return new NextResponse(JSON.stringify({ error: "You have passed the last round" }), { status: 403 });
    }

    if (player.currentRound > game.currentRound) {
      return new NextResponse(JSON.stringify({ error: "You are ahead of the current game round" }), { status: 403 });
    }

    const currentPlayerRound = player.currentRound;
    const isFinalRound = player.currentRound === game.totalRounds - 1;
    const isCurrentRound = currentPlayerRound === game.currentRound;

    // Find or create the current round entry
    let roundEntry = player.rounds.find((r: any) => r.round === currentPlayerRound);
    if (!roundEntry) {
      roundEntry = {
        round: currentPlayerRound,
        points: 0,
        won: false,
      };
      player.rounds.push(roundEntry);
    }

    player.rounds[currentPlayerRound].points = won ? (!game?.winners[currentPlayerRound] ? 3 : 1) : 0;
    player.rounds[currentPlayerRound].won = won;

    if (!game.winners[currentPlayerRound]) {
      game.winners[currentPlayerRound] = [];
    }
    game.winners[currentPlayerRound].push(address);

    if (isFinalRound || isCurrentRound) {
      const roundChannel = ablyRealtime.channels.get("updateRound");
      await roundChannel.publish("updateRound", game);
    }

    if (isFinalRound) {
      player.status = "waiting";
    } else {
      player.currentRound += 1;
      player.status = "waiting";
    }

    const updatedGame = await game.save();

    const gameChannel = ablyRealtime.channels.get("gameUpdate");
    const playerChannel = ablyRealtime.channels.get("playerUpdate");
    await gameChannel.publish("gameUpdate", updatedGame);
    await playerChannel.publish("playerUpdate", player);

    return new NextResponse(
      JSON.stringify({
        message: `Updated current player round to ${player.currentRound}`,
        game: updatedGame,
        player: player,
      }),
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
