const mongoose = require("mongoose");

const PresaleUserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
});

const PresaleUserModel = mongoose.model("PresaleUser", PresaleUserSchema);
module.exports = PresaleUserModel;
