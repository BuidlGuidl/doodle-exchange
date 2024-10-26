"use server";

import DailyDoodle from "~~/lib/models/DailyDoodle";
import { gameDifficultyButtons } from "~~/types/utils";
import { EASY_WORDS, HARD_WORDS, MEDIUM_WORDS, WORDS } from "~~/utils/constants";

export async function getWordsList(numberOfWords: number, difficulty: gameDifficultyButtons) {
  try {
    if (!numberOfWords || numberOfWords <= 0) {
      return { error: "Invalid number of words requested" };
    }

    if (numberOfWords > WORDS.length) {
      return { error: "Requested number of words exceeds available words" };
    }

    const difficultyMap = {
      easy: EASY_WORDS,
      medium: MEDIUM_WORDS,
      hard: HARD_WORDS,
      custom: WORDS,
    };

    const dictionary = difficultyMap[difficulty] || WORDS;

    const wordsSet = new Set();
    while (wordsSet.size < numberOfWords) {
      const randomElement = dictionary[Math.floor(Math.random() * dictionary.length)];
      wordsSet.add(randomElement);
    }

    const wordsList = Array.from(wordsSet);
    return wordsList;
  } catch (error) {
    console.log("Something went wrong");
    return [];
  }
}

export async function getWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export async function getDailyWord() {
  const dateOnly = new Date();
  dateOnly.setUTCHours(0, 0, 0, 0);

  let dailyWord = await DailyDoodle.findOne({ date: dateOnly });

  // If no word is found for today, pick a new one
  if (!dailyWord) {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    dailyWord = new DailyDoodle({ date: dateOnly, word: randomWord });

    await dailyWord.save();
  }

  return dailyWord.word;
}
