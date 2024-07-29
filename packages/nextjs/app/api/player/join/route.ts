import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import doodleConfig from "~~/doodle.config";
import Game from "~~/lib/models/Game";
import { ablyRealtime } from "~~/lib/socket";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || doodleConfig.jwt_secret);

export const PATCH = async (request: Request) => {
  try {
    const body = await request.json();
    const { inviteCode, playerAddress } = body;
    const game = await Game.findOne({ inviteCode });

    let token;

    if (JWT_SECRET) {
      token = await new SignJWT({ address: playerAddress }).setProtectedHeader({ alg: "HS256" }).sign(JWT_SECRET);
    }

    if (!game || inviteCode.length == 0) {
      return new NextResponse(JSON.stringify({ error: "Game doesn't exist " }), { status: 403 });
    }

    if (game.players.includes(playerAddress)) {
      return new NextResponse(JSON.stringify({ message: "Joined game Successfully", token, game: game }), {
        status: 200,
      });
    }

    if (playerAddress == null) {
      return new NextResponse(JSON.stringify({ error: "Player address is null " }), { status: 403 });
    }

    game.players.push(playerAddress);
    const savedGame = await game.save();

    const channel = ablyRealtime.channels.get(`gameUpdate`);
    channel.publish(`gameUpdate`, savedGame);
    return new NextResponse(JSON.stringify({ message: "Joined game Successfully", token, game: savedGame }), {
      status: 200,
    });
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
