const mongoose = require("mongoose");

const holderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  shares: { type: Number, required: true },
});

const cardHolderSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  holders: { type: [holderSchema], required: true },
});

const CardHolderModel = mongoose.model("cardHolders", cardHolderSchema);
module.exports = CardHolderModel;
