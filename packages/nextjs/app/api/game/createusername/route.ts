import { NextResponse } from "next/server";
import { generateUsername } from "../../utils/utils";
import connectdb from "~~/lib/db";
import PlayerUsernames from "~~/lib/models/PlayerUsernames";

export const POST = async (request: Request) => {
  try {
    await connectdb();

    const body = await request.json();
    const { address } = body;

    if (!address) {
      return new NextResponse(JSON.stringify({ error: "Address parameter is required" }), { status: 400 });
    }

    let player = await PlayerUsernames.findOne({ address }).exec();
    if (player) {
      return new NextResponse(JSON.stringify({ message: "Player has a username", username: player.username }), {
        status: 201,
      });
    }

    const username = generateUsername();
    player = new PlayerUsernames({ address, username: username });
    await player.save();

    return new NextResponse(JSON.stringify({ message: "Username created", username: username }), { status: 201 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Error Creating Username: " + (error as Error).message,
      }),
      {
        status: 500,
      },
    );
  }
};

export const PATCH = async (request: Request) => {
  try {
    await connectdb();

    const body = await request.json();
    const { address, newUsername } = body;

    if (!address || !newUsername || newUsername === "") {
      return new NextResponse(JSON.stringify({ error: "Address and New Username are required" }), { status: 400 });
    }

    const existingUser = await PlayerUsernames.findOne({ address }).exec();

    if (!existingUser) {
      return new NextResponse(JSON.stringify({ error: "Player not found" }), { status: 404 });
    }

    existingUser.username = newUsername;
    await existingUser.save();

    return new NextResponse(JSON.stringify({ message: "Username updated", username: newUsername }), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: "Error updating username: " + (error as Error).message }), {
      status: 500,
    });
  }
};
