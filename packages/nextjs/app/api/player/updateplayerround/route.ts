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
      return NextResponse.json({ error: "Game not found" }, { status: 403 });
    }

    const player = game.players.find((p: Player) => p.address === address);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 403 });
    }

    if (game.status === "finished") {
      return NextResponse.json({ error: "Game has finished" }, { status: 403 });
    }

    if (player.currentRound > game.totalRounds - 1) {
      return NextResponse.json({ error: "You have passed the last round" }, { status: 403 });
    }

    if (player.currentRound > game.currentRound) {
      return NextResponse.json({ error: "You are ahead of the current game round" }, { status: 403 });
    }

    const currentPlayerRound = player.currentRound;

    if (!game.winners[currentPlayerRound]) {
      game.winners[currentPlayerRound] = [];
    }

    const isAlreadyWinner = game.winners[currentPlayerRound].includes(address);
    if (won && !isAlreadyWinner) {
      game.winners[currentPlayerRound].push(address);
    }

    let roundEntry = player.rounds.find((r: any) => r.round === currentPlayerRound);
    if (!roundEntry) {
      roundEntry = { round: currentPlayerRound, points: 0, won: false };
      player.rounds.push(roundEntry);
    }

    if (won && !isAlreadyWinner) {
      roundEntry.points = game.winners[currentPlayerRound].length === 1 ? 3 : 1;
    } else {
      roundEntry.points = 0;
    }
    roundEntry.won = won;

    const anyPlayerAhead = game.players.some((p: Player) => p.currentRound > game.currentRound);
    if (!anyPlayerAhead) {
      const roundChannel = ablyRealtime.channels.get("updateRound");
      const nextRoundTimestamp = Date.now() + 20000;
      game.nextRoundTimestamp = nextRoundTimestamp;
      await game.save();
      await roundChannel.publish("updateRound", game);
    } else {
      await game.save();
    }

    if (currentPlayerRound === game.totalRounds - 1) {
      player.status = "waiting";
    } else {
      player.currentRound += 1;
      player.status = "waiting";
    }

    const gameChannel = ablyRealtime.channels.get("gameUpdate");
    const playerChannel = ablyRealtime.channels.get("playerUpdate");
    if (!anyPlayerAhead) await gameChannel.publish("gameUpdate", game);
    await playerChannel.publish("playerUpdate", player);

    return NextResponse.json(
      {
        message: `Updated current player round to ${player.currentRound}`,
        game,
        player,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: "Error updating player round: " + (error as Error).message }, { status: 500 });
  }
};
