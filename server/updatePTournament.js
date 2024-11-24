const mongoose = require("mongoose");
const PTournamentModel = require("./models/PTournamentModel.js");
const CTournamentModel = require("./models/CTournamentModel.js");
const CardModel = require("./models/CardModel.js");

require("dotenv").config();

function calculateETHReward(rank) {
  let rewardETH;

  if (rank >= 1 && rank <= 5) {
    rewardETH = (3 * Number(process.env.TOURNAMENT_ETH_REWARD)) / 100;
  } else if (rank >= 6 && rank <= 10) {
    rewardETH = Number(process.env.TOURNAMENT_ETH_REWARD) / 100;
  } else if (rank >= 11 && rank <= 55) {
    rewardETH = (5 * Number(process.env.TOURNAMENT_ETH_REWARD)) / 900;
  } else if (rank >= 56 && rank <= 100) {
    rewardETH = Number(process.env.TOURNAMENT_ETH_REWARD) / 300;
  } else if (rank >= 101 && rank <= 300) {
    rewardETH = Number(process.env.TOURNAMENT_ETH_REWARD) / 500;
  } else {
    rewardETH = 0;
  }

  return rewardETH;
}

function calculatePoints(rank) {
  let rewardPoints;

  if (rank >= 1 && rank <= 10) {
    rewardPoints = 155000 + 15000 * (10 - rank);
  } else if (rank >= 11 && rank <= 100) {
    rewardPoints = 60000 + 1000 * (100 - rank);
  } else if (rank >= 101 && rank <= 300) {
    rewardPoints = 25000 + 125 * (300 - rank);
  } else if (rank >= 301 && rank <= 500) {
    rewardPoints = 10000;
  } else if (rank >= 501 && rank <= 700) {
    rewardPoints = 5000;
  } else {
    rewardPoints = 0;
  }

  return rewardPoints;
}

function calculatePresalePoints(rank) {
  let rewardPresalePoints;

  if (rank >= 1 && rank <= 5) {
    rewardPresalePoints = 6000;
  } else if (rank >= 6 && rank <= 10) {
    rewardPresalePoints = 5000;
  } else if (rank >= 11 && rank <= 55) {
    rewardPresalePoints = 2500;
  } else if (rank >= 56 && rank <= 100) {
    rewardPresalePoints = 1500;
  } else if (rank >= 101 && rank <= 200) {
    rewardPresalePoints = 1000;
  } else if (rank >= 201 && rank <= 300) {
    rewardPresalePoints = 500;
  }

  return rewardPresalePoints;
}

async function updatePTournament() {
  try {
    // Connect to MongoDB
    await mongoose
      .connect(process.env.MONGO_URL)
      .then(() => console.log("MongoDB connected"))
      .catch((error) => console.error("MongoDB connection error:", error));

    const cTournaments = await CTournamentModel.find();

    // Group records by walletAddress
    const groupedRewards = {};

    cTournaments.forEach((item) => {
      const { walletAddress, deckId, rank } = item;

      // Calculate rewards based on the rank or other criteria
      const reward = {
        deckId,
        rank,
        ETHReward: calculateETHReward(rank),
        points: calculatePoints(rank),
        presalePoints: calculatePresalePoints(rank),
      };

      // Initialize an array for this walletAddress if it doesn't exist
      if (!groupedRewards[walletAddress]) {
        groupedRewards[walletAddress] = [];
      }

      // Add reward to this walletAddress's rewards array
      groupedRewards[walletAddress].push(reward);
    });

    // Define a unique tournamentId for this operation
    const tournamentId = process.env.CURRENT_TOURNAMENT_ID.toString();

    // Prepare bulk operations for PTournament updates
    const bulkOps = Object.entries(groupedRewards).map(
      ([walletAddress, rewardsArray]) => ({
        updateOne: {
          filter: { walletAddress: walletAddress },
          update: {
            $setOnInsert: { walletAddress: walletAddress },
            $push: {
              previousRewards: {
                tournamentId: tournamentId,
                claimedReward: false,
                rewards: rewardsArray,
              },
            },
          },
          upsert: true,
        },
      })
    );

    // Execute bulk write operation
    if (bulkOps.length > 0) {
      await PTournamentModel.bulkWrite(bulkOps);
      console.log("PTournament collection updated successfully");
    }
  } catch (error) {
    console.error("Error updating PTournament:", error);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }

  try {
    // Connect to MongoDB
    await mongoose
      .connect(process.env.MONGO_URL)
      .then(() => console.log("MongoDB connected"))
      .catch((error) => console.error("MongoDB connection error:", error));

    // Reset scores for all cards in the collection
    const result = await CardModel.updateMany(
      {}, // Match all documents
      {
        $set: {
          currentTournamentScore: 0,
          avgTournamentScore: 0,
        },
      }
    );

    console.log(`Updated ${result.nModified} cards successfully.`);
  } catch (error) {
    console.error("Error resetting tournament scores:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

// Run the update function
updatePTournament();

// Remember in production to clean the CTournament
