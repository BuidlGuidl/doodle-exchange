import { ablyRealtime } from "./socket";
import mongoose from "mongoose";
import doodleConfig from "~~/doodle.config";

const MONGODB_URI = process.env.MONGODB_URI || doodleConfig.mongodb_uri;

const connectdb = async () => {
  const connectionState = mongoose.connection.readyState;

  if (connectionState === 1) {
    console.log("Already connected");
    return;
  }

  if (connectionState === 2) {
    console.log("Connecting...");
    return;
  }

  try {
    await ablyRealtime.connection.once("connected");
    await mongoose.connect(MONGODB_URI, {
      dbName: "doodleExchange",
      bufferCommands: false,
      // connectTimeoutMS: 10000,
      // socketTimeoutMS: 45000,
      // serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected");
  } catch (error) {
    console.log("Error in connecting to database", error);
    throw new Error("Error connecting to database");
  }
};

export default connectdb;
