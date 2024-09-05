import { NextResponse } from "next/server";
import { fetchOrCreateUsername } from "../../utils/utils";
import { SignJWT } from "jose";
import doodleConfig from "~~/doodle.config";
import connectdb from "~~/lib/db";
import Game from "~~/lib/models/Game";
import Invites from "~~/lib/models/Invites";
import { getWordsList } from "~~/utils/doodleExchange/getWordsList";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || doodleConfig.jwt_secret);

async function generateUniqueInvite(length: number) {
  let invites = await Invites.findOne();

  if (!invites) {
    const newInvites = new Invites({
      codes: [],
    });
    invites = await newInvites.save();
  }

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let invite = "";
  const existingCodes = invites?.codes || [];

  while (true) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invite += characters.charAt(randomIndex);
    }

    if (!existingCodes.includes(invite)) {
      existingCodes.push(invite);
      await Invites.findByIdAndUpdate(invites?.id, {
        codes: existingCodes,
      });
      return invite;
    }

    invite = "";
  }
}

export const GET = async () => {
  try {
    await connectdb();
    const games = await Game.find();
    return new NextResponse(JSON.stringify(games), { status: 200 });
  } catch (error) {
    return new NextResponse("Error fetching games " + error, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { hostAddress, totalRounds, words, difficulty } = body;

    await connectdb();

    const hostUsername = await fetchOrCreateUsername(hostAddress);
    console.log;
    const newGame = new Game({
      hostAddress,
      hostUsername,
      status: "lobby",
      inviteCode: await generateUniqueInvite(8),
      wordsList: words.length === totalRounds ? words : await getWordsList(totalRounds, difficulty),
      totalRounds: totalRounds,
      currentRound: 0,
      winners: [],
    });

    await newGame.save();

    console.log("New game created", newGame);

    let token;

    if (JWT_SECRET) {
      token = await new SignJWT({ address: hostAddress }).setProtectedHeader({ alg: "HS256" }).sign(JWT_SECRET);
    }

    return new NextResponse(JSON.stringify({ message: "New game created", token, game: newGame }), { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error Creating Game " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};
