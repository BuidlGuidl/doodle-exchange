import mongoose from "mongoose";

const DailyDoodleSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  word: { type: String, required: true },
});

const DailyDoodle = mongoose.models.DailyDoodle || mongoose.model("DailyDoodle", DailyDoodleSchema);

export default DailyDoodle;
