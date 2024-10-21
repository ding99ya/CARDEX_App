const mongoose = require("mongoose");

const presaleInventorySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  shares: { type: Number, required: true },
});

const PresaleUserSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  presaleInventory: { type: [presaleInventorySchema], required: true },
});

const PresaleUserModel = mongoose.model("PresaleUser", PresaleUserSchema);
module.exports = PresaleUserModel;
