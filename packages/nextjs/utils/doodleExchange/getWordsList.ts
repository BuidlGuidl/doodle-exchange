"use server";

import { WORDS } from "~~/utils/constants";

export async function getWordsList(numberOfWords: number) {
  try {
    if (!numberOfWords || numberOfWords <= 0) {
      return { error: "Invalid number of words requested" };
    }

    if (numberOfWords > WORDS.length) {
      return { error: "Requested number of words exceeds available words" };
    }

    const wordsSet = new Set();
    while (wordsSet.size < numberOfWords) {
      const randomElement = WORDS[Math.floor(Math.random() * WORDS.length)];
      wordsSet.add(randomElement);
    }

    const wordsList = Array.from(wordsSet);
    return wordsList;
  } catch (error) {
    console.log("Something went wrong");
    return [];
  }
}
