import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    hostAddress: {
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
      type: [String],
      default: [],
      validate: {
        validator: function (value: [string]) {
          const uniqueStrings: string[] = [];
          value.forEach(item => {
            if (!uniqueStrings.includes(item)) {
              uniqueStrings.push(item);
            }
          });
          return uniqueStrings.length === value.length;
        },
        message: "The players array must contain unique addresses.",
      },
    },
    winners: {
      type: [String],
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
