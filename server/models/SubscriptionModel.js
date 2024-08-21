const mongoose = require("mongoose");

// Define the schema for subscription
const subscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: true,
    unique: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model
const SubscriptionModel = mongoose.model("Subscription", subscriptionSchema);

module.exports = SubscriptionModel;
