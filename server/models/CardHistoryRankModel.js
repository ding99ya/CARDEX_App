const mongoose = require("mongoose");

const historyRankSchema = new mongoose.Schema({
  time: { type: String, required: true },
  rank: { type: Number, required: true },
});

const cardHistoryRankSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  historyRank: { type: [historyRankSchema], required: true },
});

const CardHistoryRankModel = mongoose.model(
  "cardHistoryRank",
  cardHistoryRankSchema
);
module.exports = CardHistoryRankModel;
