import mongoose from "mongoose";

const playerUsernameSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
});

const PlayerUsernames = mongoose.models.PlayerUsernames || mongoose.model("PlayerUsernames", playerUsernameSchema);

export default PlayerUsernames;
