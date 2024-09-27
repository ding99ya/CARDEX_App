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
  name: String,
  userName: String,
  profilePhoto: String,
  rank: Number,
  paperPoints: Number,
  currentPoints: Number,
});

// Create the model for the prices collection
const Leaderboard = mongoose.model("leaderboard", leaderboardSchema);

// Function to create experimental data and push it to the collection
const createLeaderboard = async () => {
  const exampleDID1 = "did:privy:clvoc7dzr00ftne36qf962c4u";
  const exampleWalletAddress1 = "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65";
  const exampleUserName1 = "ding99ya";
  const exampleDID2 = "did:privy:clz4nweqy045hogar0f4gh85n";
  const exampleWalletAddress2 = "0x19854409c8383F90b3f2B769A5ce1967fc2058a4";
  const exampleUserName2 = "0xLRM";

  const exampleLeaderboard = [];

  for (let i = 0; i < 50; i++) {
    if (i === 0) {
      exampleLeaderboard.push({
        DID: exampleDID1,
        walletAddress: exampleWalletAddress1,
        name: "",
        userName: exampleUserName1,
        profilePhoto: "",
        rank: i + 1,
        paperPoints: 100 - i,
        currentPoints: 100 - i,
      });
    } else if (i % 2 === 0) {
      exampleLeaderboard.push({
        DID: exampleDID1,
        walletAddress: exampleWalletAddress2,
        name: "",
        userName: exampleUserName1,
        profilePhoto: "",
        rank: i + 1,
        paperPoints: 100 - i,
        currentPoints: 100 - i,
      });
    } else {
      exampleLeaderboard.push({
        DID: exampleDID2,
        walletAddress: exampleWalletAddress2,
        name: exampleUserName2,
        userName: exampleUserName2,
        profilePhoto:
          "https://pbs.twimg.com/profile_images/1647822798566424576/ZfLTwjSK_normal.jpg",
        rank: i + 1,
        paperPoints: 100 - i,
        currentPoints: 100 - i,
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
