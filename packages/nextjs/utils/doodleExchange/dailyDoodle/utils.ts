"use server";

import { storage } from "../../../app/firebaseConfig";
import { getCurrentUserToken } from "../../firebaseAuth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { fetchOrCreateUsername } from "~~/app/api/utils/utils";
import connectdb from "~~/lib/db";
import DailyDoodleResultsMultiple from "~~/lib/models/DailyDoodleResultsMultiple";
import { PlayerResult } from "~~/types/dailyDoodles/dailyDoodles";

export const getFormattedDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export async function uploadDailyDoodleToFirebase(
  drawWord: string,
  connectedAddress: string,
  score: string,
  drawingDataUrl: string,
) {
  try {
    const token = await getCurrentUserToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }
    const storageRef = ref(
      storage,
      `dailyDoodle/${drawWord.toLowerCase()}/${connectedAddress}_${score}_${getFormattedDateTime()}.png`,
    );
    await uploadString(storageRef, drawingDataUrl, "data_url").then(() => {
      console.log("Uploaded a data_url string!");
    });

    const downloadUrl = await getDownloadURL(storageRef);
    console.log("Image URL:", downloadUrl);

    return downloadUrl;
  } catch (error) {
    console.error("Upload failed", error);
    return "";
  }
}

export async function submitResult(connectedAddress: string, drawingLink: string, score: string, drawWord: string) {
  try {
    await connectdb();

    const userName = await fetchOrCreateUsername(connectedAddress);

    const dateOnly = new Date();
    const startOfDay = new Date(dateOnly.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(dateOnly.setUTCHours(23, 59, 59, 999));

    const existingResult: PlayerResult | null = await DailyDoodleResultsMultiple.findOne({
      address: connectedAddress,
      challengeDay: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).lean(); // Use .lean() to return a plain object

    if (existingResult) {
      // If an entry exists, update it by adding the new score and drawing link
      existingResult?.drawingLink?.push(drawingLink);
      existingResult?.score?.push(parseFloat(score));

      await DailyDoodleResultsMultiple.updateOne(
        { _id: existingResult._id },
        { $set: { drawingLink: existingResult.drawingLink, score: existingResult.score } },
      );
    } else {
      // If no entry exists, create a new one
      const result = new DailyDoodleResultsMultiple({
        address: connectedAddress,
        userName: userName,
        drawingLink: [drawingLink],
        score: [parseFloat(score)],
        challengeDay: startOfDay,
        word: drawWord,
      });

      await result.save();
    }

    return "saved";
  } catch (error) {
    console.error("Submission failed", error);
    return null;
  }
}

export async function getTodaysResults() {
  try {
    await connectdb();
    const dateOnly = new Date();

    const startOfDay = new Date(dateOnly.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(dateOnly.setUTCHours(23, 59, 59, 999));

    const results = await DailyDoodleResultsMultiple.find({
      challengeDay: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
      .sort({ score: -1 })
      .lean();

    // Map and convert `_id` to string
    const serializedData = results.map(item => ({
      ...item,
      _id: item?._id?.toString(),
    }));

    return serializedData;
  } catch (error) {
    console.error("Failed to retrieve today's results", error);
    return [];
  }
}

export async function hasSubmittedToday(connectedAddress: string) {
  try {
    await connectdb();
    const dateOnly = new Date();
    dateOnly.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(dateOnly);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const submission = await DailyDoodleResultsMultiple.findOne({
      address: connectedAddress,
      challengeDay: {
        $gte: dateOnly,
        $lt: endOfDay,
      },
    }).lean();

    return submission !== null; // Return true if a submission exists, otherwise false
  } catch (error) {
    console.error("Error checking submission:", error);
    return false; // Return false in case of an error
  }
}
