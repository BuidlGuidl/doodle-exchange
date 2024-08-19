"use server";

import { storage } from "../app/firebaseConfig";
import { getCurrentUserToken } from "./firebaseAuth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

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

export async function uploadToFirebase(
  drawWord: string,
  guessWord: string,
  connectedAddress: string,
  drawingDataUrl: string,
) {
  try {
    const token = await getCurrentUserToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }
    const storageRef = ref(
      storage,
      `${drawWord.toLowerCase()}/${guessWord.toLowerCase()}/${connectedAddress}_${getFormattedDateTime()}.png`,
    );
    await uploadString(storageRef, drawingDataUrl, "data_url").then(() => {
      console.log("Uploaded a data_url string!");
    });

    const downloadUrl = await getDownloadURL(storageRef);
    console.log("Image URL:", downloadUrl);

    return downloadUrl; // Return the download URL
  } catch (error) {
    console.error("Upload failed", error);
    return "";
  }
}
