import { playerSchema } from "./Player";
import mongoose from "mongoose";
import { Player } from "~~/types/game/game";

const gameSchema = new mongoose.Schema(
  {
    hostAddress: {
      type: String,
      required: true,
    },
    hostUsername: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["lobby", "ongoing", "paused", "finished"],
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
    },
    players: {
      type: [playerSchema],
      default: [],
      validate: {
        validator: function (value: Player[]) {
          const uniqueAddresses = value.map(player => player.address);
          return uniqueAddresses.length === new Set(uniqueAddresses).size;
        },
        message: "The players array must contain unique addresses.",
      },
    },
    winners: {
      type: [[String]],
      default: [],
    },
    wordsList: {
      type: [String],
      default: [],
    },
    totalRounds: {
      type: Number,
      default: 0,
    },
    currentRound: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);

export default Game;
