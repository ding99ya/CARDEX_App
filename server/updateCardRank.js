const mongoose = require("mongoose");
const CardModel = require("./models/CardModel.js");
const CardHistoryRankModel = require("./models/CardHistoryRankModel.js");

require("dotenv").config();

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}-${day}`;
};

async function updateCardHistoryRank() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully");

    // Step 1: Fetch all cards and sort by currentTournamentScore descending
    const cards = await CardModel.find().sort({ currentTournamentScore: -1 });

    // Step 2: Prepare rank data
    const bulkOps = [];
    const currentTime = new Date();

    cards.forEach((card, index) => {
      const rank = Number(index + 1);
      const rankEntry = { time: formatDate(currentTime), rank: rank };

      bulkOps.push({
        updateOne: {
          filter: { uniqueId: card.uniqueId },
          update: {
            $setOnInsert: { uniqueId: card.uniqueId },
            $push: { historyRank: rankEntry },
          },
          upsert: true,
        },
      });
    });

    // Step 3: Execute bulkWrite operation to minimize load on the database
    if (bulkOps.length > 0) {
      await CardHistoryRankModel.bulkWrite(bulkOps);
      console.log("Card history ranks updated successfully.");
    }
  } catch (error) {
    console.error("Error updating card history ranks:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

updateCardHistoryRank();
