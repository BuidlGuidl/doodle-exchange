import mongoose from "mongoose";

const DailyDoodleResultsMultipleSchema = new mongoose.Schema(
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
      type: [String],
      required: true,
    },
    score: {
      type: [Number],
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

const DailyDoodleResultsMultiple =
  mongoose.models.DailyDoodleResultsMultiple ||
  mongoose.model("DailyDoodleResultsMultiple", DailyDoodleResultsMultipleSchema);

export default DailyDoodleResultsMultiple;
