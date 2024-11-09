const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema({
  deckId: { type: String, required: true },
  rank: { type: Number, required: true },
  ETHReward: { type: Number, required: true },
  points: { type: Number, required: true },
  presalePoints: { type: Number, required: true },
});

const tournamentRewardsSchema = new mongoose.Schema({
  tournamentId: { type: String, required: true },
  claimedReward: { type: Boolean, required: true },
  rewards: { type: [rewardSchema], required: true },
});

const PTournamentSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true },
  previousRewards: { type: [tournamentRewardsSchema], required: true },
});

const PTournamentModel = mongoose.model("PTournament", PTournamentSchema);
module.exports = PTournamentModel;
