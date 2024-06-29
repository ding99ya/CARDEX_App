const mongoose = require("mongoose");

const PresaleUserSchema = new mongoose.Schema({
  DID: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: false },
});

const PresaleUserModel = mongoose.model("PresaleUser", PresaleUserSchema);
module.exports = PresaleUserModel;
