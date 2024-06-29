const mongoose = require("mongoose");

const cardInventorySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  shares: { type: Number, required: true },
});

const usersSchema = new mongoose.Schema({
  DID: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: false },
  invited: { type: Boolean, default: false },
  inviteCode: { type: String, required: false },
  cardInventory: { type: [cardInventorySchema], required: true },
});

const UserModel = mongoose.model("users", usersSchema);
module.exports = UserModel;
