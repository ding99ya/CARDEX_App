const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  time: { type: String, required: true },
});

const pricesSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  priceHistory: { type: [priceHistorySchema], required: true },
});

const PriceModel = mongoose.model("prices", pricesSchema);
module.exports = PriceModel;
