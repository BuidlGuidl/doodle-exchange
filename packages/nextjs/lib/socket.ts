import Ably from "ably";
import doodleConfig from "~~/doodle.config";

export const ablyRealtime = new Ably.Realtime({ key: process.env.ABLY_API_KEY || doodleConfig.ably_api_key });
