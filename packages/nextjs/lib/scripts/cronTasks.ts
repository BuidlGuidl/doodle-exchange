import connectdb from "../db";
import Game from "../models/Game";
import { ablyRealtime } from "../socket";
import cron from "node-cron";

const pushGameUpdates = async () => {
  try {
    await connectdb();
    const activeGames = await Game.find({ status: "ongoing" });

    for (const game of activeGames) {
      const gameChannel = ablyRealtime.channels.get("gameUpdate");
      await gameChannel.publish("gameUpdate", game);
    }

    console.log("Game updates pushed successfully.");
  } catch (error) {
    console.error("Error pushing game updates:", error);
  }
};

cron.schedule("*/10 * * * * *", () => {
  console.log("Running periodic game update...");
  pushGameUpdates();
});
