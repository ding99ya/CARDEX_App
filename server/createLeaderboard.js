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

// Define the leaderboard schema
const leaderboardSchema = new mongoose.Schema({
  DID: String,
  walletAddress: String,
  userName: String,
  rank: Number,
  paperPoints: Number,
});

// Create the model for the prices collection
const Leaderboard = mongoose.model("leaderboard", leaderboardSchema);

// Function to create experimental data and push it to the collection
const createLeaderboard = async () => {
  const exampleDID1 = "clvoc7dzr00ftne36qf962c4u";
  const exampleWalletAddress1 = "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65";
  const exampleUserName1 = "DING99YA";
  const exampleDID2 = "clvjy5dj7000b11gxs0lbm4q3";
  const exampleWalletAddress2 = "0x0e2A4ae795BD9AA5c35c6278025020A7ceb92fE8";
  const exampleUserName2 = "FENGHU428";

  const exampleLeaderboard = [];

  for (let i = 0; i < 50; i++) {
    if (i % 2 === 0) {
      exampleLeaderboard.push({
        DID: exampleDID1,
        walletAddress: exampleWalletAddress2,
        userName: exampleUserName1 + "-" + i.toString(),
        rank: i + 1,
        paperPoints: 100 - i,
      });
    } else {
      exampleLeaderboard.push({
        DID: exampleDID2,
        walletAddress: exampleWalletAddress2,
        userName: exampleUserName2 + "-" + i.toString(),
        rank: i + 1,
        paperPoints: 100 - i,
      });
    }
  }

  try {
    await Leaderboard.insertMany(exampleLeaderboard);
    console.log("Leaderboard created successfully");
  } catch (error) {
    console.error("Error creating leaderboard:", error);
  }
};

createLeaderboard();
