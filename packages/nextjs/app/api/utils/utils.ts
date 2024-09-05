import connectdb from "~~/lib/db";
import PlayerUsernames from "~~/lib/models/PlayerUsernames";

const adjectives = ["Happy", "Sad", "Fast", "Slow", "Red", "Blue", "Quiet", "Loud", "Brave", "Calm"];

const nouns = ["Tiger", "Mountain", "River", "Sky", "Lion", "Wolf", "Eagle", "Fox", "Dragon", "Phoenix"];

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const generateUsername = (): string => {
  const randomAdjective = adjectives[getRandomNumber(0, adjectives.length - 1)];
  const randomNoun = nouns[getRandomNumber(0, nouns.length - 1)];
  const randomNumber = getRandomNumber(1000, 9999);
  return `${randomAdjective}${randomNoun}${randomNumber}`;
};

export const usernameExists = async (username: string): Promise<boolean> => {
  const existingUser = await PlayerUsernames.findOne({ username }).exec();
  return existingUser !== null;
};

export const generateUniqueUsername = async (): Promise<string> => {
  let username = generateUsername();

  while (await usernameExists(username)) {
    username = generateUsername();
  }

  return username;
};

export const fetchOrCreateUsername = async (address: string): Promise<string> => {
  try {
    await connectdb();

    let player = await PlayerUsernames.findOne({ address }).exec();

    if (player) {
      return player.username;
    }

    const uniqueUsername = await generateUniqueUsername();

    player = new PlayerUsernames({ address, username: uniqueUsername });
    await player.save();

    return uniqueUsername;
  } catch (error) {
    throw new Error("Error fetching or creating username: " + (error as Error).message);
  }
};
