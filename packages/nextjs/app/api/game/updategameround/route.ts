import { NextResponse } from "next/server";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { id, newRound } = body;
    await connectdb();

    const game = await Game.findOneAndUpdate(
      { _id: id, status: { $ne: "finished" }, currentRound: { $lt: newRound } },
      { $set: { currentRound: newRound, lastRoundStartTimestamp: Date.now() } },
      { new: true },
    );

    if (!game) {
      return new NextResponse(
        JSON.stringify({
          error: "Game not found or invalid round update",
        }),
        { status: 403 },
      );
    }

    const isFinalRound = newRound === game.totalRounds;

    // Update players only if the round has changed
    for (const player of game.players) {
      const currentPlayerRound = player.currentRound;
      if (currentPlayerRound < newRound) {
        if (!isFinalRound) player.currentRound = newRound;
        player.status = "waiting";

        let roundEntry = player.rounds.find((r: any) => r.round === currentPlayerRound);
        if (!roundEntry) {
          roundEntry = { round: currentPlayerRound, points: 0, won: false };
          player.rounds.push(roundEntry);
        } else if (!isFinalRound) {
          player.rounds[currentPlayerRound].points = 0;
          player.rounds[currentPlayerRound].won = false;
        }
      }
    }

    if (isFinalRound) game.status = "finished";

    await game.save(); // Save the updated game state

    const gameChannel = ablyRealtime.channels.get("gameUpdate");
    await gameChannel.publish("gameUpdate", game);

    return new NextResponse(
      JSON.stringify({
        message: isFinalRound ? "Ended game successfully" : `Moving to round ${newRound + 1}`,
        game,
      }),
      { status: 200 },
    );
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Error updating Game Round: " + (error as Error).message }), {
      status: 500,
    });
  }
};
