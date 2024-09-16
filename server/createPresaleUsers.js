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
  walletAddress: { type: String, required: true, unique: true },
});

// Create the model for the cards collection
const PresaleUser = mongoose.model("PresaleUser", PresaleUserSchema);

// Function to create experimental data and push it to the collection
const createPresaleUser = async () => {
  const examplePresaleUser = [];

  // examplePresaleUser.push({
  //   walletAddress: "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65",
  // });

  examplePresaleUser.push({
    walletAddress: "0xe26403d401911021b21187E2242bF88D77da77D8",
  });

  try {
    await PresaleUser.insertMany(examplePresaleUser);
    console.log("Presale users created successfully");
  } catch (error) {
    console.error("Error creating presale users:", error);
  }
};

createPresaleUser();
