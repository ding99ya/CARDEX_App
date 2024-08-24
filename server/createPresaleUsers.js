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
    DID: "did:privy:clvoc7dzr00ftne36qf962c4u",
    walletAddress: "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65",
    username: "ding99ya",
  });

  examplePresaleUser.push({
    DID: "did:privy:clz659gkr03nek76e5dgbnx15",
    walletAddress: "0xe26403d401911021b21187E2242bF88D77da77D8",
    username: "FengHu479069",
  });

  try {
    await PresaleUser.insertMany(examplePresaleUser);
    console.log("Presale users created successfully");
  } catch (error) {
    console.error("Error creating presale users:", error);
  }
};

createPresaleUser();
