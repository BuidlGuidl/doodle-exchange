import { NextResponse } from "next/server";
import { fetchOrCreateUsername } from "../../utils/utils";
import { SignJWT } from "jose";
import doodleConfig from "~~/doodle.config";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";
import { Player } from "~~/types/game/game";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || doodleConfig.jwt_secret);

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { inviteCode, playerAddress } = body;
    await connectdb();

    if (!inviteCode || playerAddress == null) {
      return new NextResponse(JSON.stringify({ error: "Missing invite code or player address" }), { status: 400 });
    }

    const game = await Game.findOne({ inviteCode });

    let token;

    if (JWT_SECRET) {
      token = await new SignJWT({ address: playerAddress }).setProtectedHeader({ alg: "HS256" }).sign(JWT_SECRET);
    }

    if (!game || inviteCode.length == 0) {
      return new NextResponse(JSON.stringify({ error: "Game doesn't exist " }), { status: 403 });
    }

    if (game?.status === "finished") {
      return new NextResponse(JSON.stringify({ message: "Game has ended", game: game }), {
        status: 200,
      });
    }

    if (game.currentRound > 0) {
      return new NextResponse(JSON.stringify({ error: "Game has already started" }), { status: 403 });
    }

    if (game.players.some((player: Player) => player.address === playerAddress)) {
      const player = game.players.find((p: Player) => p.address === playerAddress);
      return new NextResponse(JSON.stringify({ message: "Joined game successfully", token, game, player }), {
        status: 200,
      });
    }

    const playerUsername = await fetchOrCreateUsername(playerAddress);

    game.players.push({ address: playerAddress, status: "waiting", userName: playerUsername });
    const savedGame = await game.save();

    const player = game.players.find((p: Player) => p.address === playerAddress);

    const gameChannel = ablyRealtime.channels.get(`gameUpdate`);
    await gameChannel.publish(`gameUpdate`, savedGame);
    // const playerChannel = ablyRealtime.channels.get(`playerUpdate`);
    // await playerChannel.publish(`playerUpdate`, player);
    return new NextResponse(
      JSON.stringify({ message: "Joined game Successfully", token, game: savedGame, player: player }),
      {
        status: 200,
      },
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error Joining Game " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
