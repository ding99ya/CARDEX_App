const mongoose = require("mongoose");
require("dotenv").config();

// Connect to the MongoDB database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define the price history schema
const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  time: { type: Date, required: true },
});

// Define the prices schema
const pricesSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  priceHistory: { type: [priceHistorySchema], required: true },
});

// Create the model for the prices collection
const Prices = mongoose.model("prices", pricesSchema);

// Function to create experimental data and push it to the collection
const createAndPushExperimentalData = async () => {
  const uniqueId = "9";
  const initialPrice = 0.02;
  const finalPrice = 1.6;
  const initialTime = new Date("2024-12-28T01:51:41.098Z");
  const timeStep = 1000; // 1 second in milliseconds
  const dataPoints = 150;

  const priceHistory = [];
  let currentPrice = initialPrice;

  for (let i = 0; i < dataPoints; i++) {
    // Simulate realistic price movement with upward trend
    const priceChange = Math.random() * 0.025 - 0.01; // Slightly larger fluctuations (-0.01 to +0.015)
    currentPrice += priceChange;

    // Add a strong upward movement occasionally to simulate a pump
    if (Math.random() < 0.25) {
      currentPrice += Math.random() * 0.07; // Larger pump
    }

    // Add a sell-off occasionally
    if (Math.random() < 0.12) {
      currentPrice -= Math.random() * 0.05; // Slightly larger dip
    }

    // Ensure the price stays within bounds and progresses toward the final price
    currentPrice = Math.max(
      currentPrice,
      initialPrice + ((finalPrice - initialPrice) / dataPoints) * i
    );

    currentPrice = Math.min(currentPrice, finalPrice);

    // Push the price and timestamp into the history
    priceHistory.push({
      price: parseFloat(currentPrice.toFixed(3)), // Round to 3 decimals
      time: new Date(initialTime.getTime() + i * timeStep),
    });
  }

  try {
    const existingDocument = await Prices.findOne({ uniqueId });

    if (existingDocument) {
      // If the document exists, update the priceHistory
      existingDocument.priceHistory.push(...priceHistory);

      await existingDocument.save();
      console.log(`Updated priceHistory for uniqueId: ${uniqueId}`);
    } else {
      // If the document does not exist, create a new one
      const newDocument = new Prices({
        uniqueId,
        priceHistory,
      });
      await newDocument.save();
      console.log(`Created new document for uniqueId: ${uniqueId}`);
    }
  } catch (err) {
    console.error("Error updating or creating document:", err);
  } finally {
    mongoose.connection.close(); // Close the connection after operation
  }
};

createAndPushExperimentalData();
