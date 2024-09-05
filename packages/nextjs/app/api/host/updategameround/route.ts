import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id } = body;
    await connectdb();
    const game = await Game.findById(id);

    if (!game) {
      return new NextResponse(JSON.stringify({ error: "Game not found" }), { status: 403 });
    }

    if (game.status === "finished" || game.currentRound > game.totalRounds - 1) {
      const errorMessage = game.status === "finished" ? "Game has finished" : "Game is on the last round";
      return new NextResponse(JSON.stringify({ error: errorMessage }), { status: 403 });
    }

    const newRound = game.currentRound + 1;
    const isFinalRound = newRound === game.totalRounds;

    for (const player of game.players) {
      const currentPlayerRound = player.currentRound;
      if (currentPlayerRound < newRound) {
        if (!isFinalRound) player.currentRound = newRound;
        player.status = "waiting";

        let roundEntry = player.rounds.find((r: any) => r.round === currentPlayerRound);
        if (!roundEntry) {
          roundEntry = {
            round: currentPlayerRound,
            points: 0,
            won: false,
          };
          player.rounds.push(roundEntry);
        } else if (!isFinalRound) {
          player.rounds[currentPlayerRound].points = 0;
          player.rounds[currentPlayerRound].won = false;
        }
      }
    }

    let message = `Moving to round ${newRound + 1}`;
    if (newRound === game.totalRounds) {
      game.status = "finished";
      message = "Ended game successfully";
    }

    if (newRound !== game.totalRounds) game.currentRound = newRound;

    const updatedGame = await game.save();
    const gameChannel = ablyRealtime.channels.get("gameUpdate");
    await gameChannel.publish("gameUpdate", updatedGame);

    return new NextResponse(
      JSON.stringify({
        message: message,
        game: updatedGame,
      }),
      {
        status: 200,
      },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error updating Game Round " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
