const mongoose = require("mongoose");

const leaderboardSchema = new mongoose.Schema({
  DID: String,
  walletAddress: String,
  userName: String,
  rank: Number,
  paperPoints: Number,
});

const LeaderboardModel = mongoose.model("leaderboard", leaderboardSchema);
module.exports = LeaderboardModel;
