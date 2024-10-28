import mongoose from "mongoose";

const DailyDoodleResultsSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    drawingLink: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    word: {
      type: String,
      required: true,
    },
    challengeDay: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const DailyDoodleResults =
  mongoose.models.DailyDoodleResults || mongoose.model("DailyDoodleResults", DailyDoodleResultsSchema);

export default DailyDoodleResults;
