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

// Define the card inventory schema
const cardInventorySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  shares: { type: Number, required: true },
});

// Define the users schema
const usersSchema = new mongoose.Schema({
  walletAddress: { type: String, required: true, unique: true },
  invited: { type: Boolean, default: false },
  paperPoints: { type: Number, required: true },
  cardInventory: { type: [cardInventorySchema], required: true },
});

// Create the model for the prices collection
// Create the model for the prices collection
const users = mongoose.model("users", usersSchema);

// Function to create experimental data and push it to the collection
const createAndPushExperimentalData = async () => {
  const uniqueId = "15";
  const initialPrice = 0.001;
  const initialTime = new Date("2024-05-23T01:51:41.098Z");
  const priceStep = 0.0001;
  const timeStep = 1000; // 1 second in milliseconds

  const priceHistory = [];

  for (let i = 0; i < 50; i++) {
    priceHistory.push({
      price: initialPrice + i * priceStep,
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
