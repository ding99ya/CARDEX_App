const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  time: { type: Date, required: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  profilePhoto: { type: String, required: true },
  isBuy: { type: Boolean, require: true },
  shares: { type: Number, required: true },
  ethAmount: { type: Number, required: true },
});

const cardActivitySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  activity: { type: [activitySchema], required: true },
});

const CardActivityModel = mongoose.model("cardActivity", cardActivitySchema);
module.exports = CardActivityModel;
