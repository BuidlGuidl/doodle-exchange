import mongoose from "mongoose";

export const playerSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["waiting", "drawing", "classifying"],
    required: true,
  },
  currentRound: {
    type: Number,
    default: 0,
  },
  rounds: {
    type: [
      {
        round: { type: Number, required: true },
        points: { type: Number, default: 0 },
        won: { type: Boolean, default: false },
        drawings: { type: [String], default: [] },
      },
    ],
    default: [],
  },
});
