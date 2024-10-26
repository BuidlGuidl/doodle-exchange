"use server";

import { storage } from "../../../app/firebaseConfig";
import { getCurrentUserToken } from "../../firebaseAuth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { fetchOrCreateUsername } from "~~/app/api/utils/utils";
import DailyDoodleResults from "~~/lib/models/DailyDoodleResults";

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
    const userName = await fetchOrCreateUsername(connectedAddress);

    const dateOnly = new Date();
    dateOnly.setUTCHours(0, 0, 0, 0);

    const result = new DailyDoodleResults({
      address: connectedAddress,
      userName: userName,
      drawingLink: drawingLink,
      score: parseFloat(score),
      challengeDay: dateOnly,
      word: drawWord,
    });

    await result.save();

    return "saved";
  } catch (error) {
    console.error("Submission failed", error);
    return null;
  }
}

export async function getTodaysResults() {
  try {
    const dateOnly = new Date();

    const startOfDay = new Date(dateOnly.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(dateOnly.setUTCHours(23, 59, 59, 999));

    const results = await DailyDoodleResults.find({
      challengeDay: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort({ score: -1 });

    return results;
  } catch (error) {
    console.error("Failed to retrieve today's results", error);
    return [];
  }
}
