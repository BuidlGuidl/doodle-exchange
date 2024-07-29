"use server";

import { WORDS } from "~~/utils/constants";

export async function getWord() {
  try {
    const randomElement = WORDS[Math.floor(Math.random() * WORDS.length)];

    return { success: randomElement };
  } catch (error) {
    return { error: "Something wrong with getting words" };
  }
}
