import mongoose from "mongoose";

export const playerSchema = new mongoose.Schema({
  address: {
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
  points: {
    type: [Number],
    default: [],
  },
  wonRound: {
    type: [Boolean],
    default: [],
  },
});
