const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  DID: String,
  walletAddress: String,
  name: String,
  userName: String,
  profilePhoto: String,
  rank: Number,
  paperPoints: Number,
  currentPoints: Number,
});

const LeaderboardModel = mongoose.model("leaderboard", leaderboardSchema);
module.exports = LeaderboardModel;
