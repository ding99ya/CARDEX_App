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

// Define the presale user schema
const PresaleUserSchema = new mongoose.Schema({
  DID: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: false },
});

// Create the model for the cards collection
const PresaleUser = mongoose.model("PresaleUser", PresaleUserSchema);

// Function to create experimental data and push it to the collection
const createPresaleUser = async () => {
  const examplePresaleUser = [];

  examplePresaleUser.push({
    DID: "did:privy:clvjy5dj7000b11gxs0lbm4q3",
    walletAddress: "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65",
    username: "DING99YA",
  });

  examplePresaleUser.push({
    DID: "did:privy:clvoc7dzr00ftne36qf962c4u",
    walletAddress: "0x0e2A4ae795BD9AA5c35c6278025020A7ceb92fE8",
    username: "FENGHU428",
  });

  try {
    await PresaleUser.insertMany(examplePresaleUser);
    console.log("Presale users created successfully");
  } catch (error) {
    console.error("Error creating presale users:", error);
  }
};

createPresaleUser();
