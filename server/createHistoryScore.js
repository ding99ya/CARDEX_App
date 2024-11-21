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

const historyScoreSchema = new mongoose.Schema({
  time: { type: String, required: true },
  score: { type: Number, required: true },
});

const cardHistoryScoreSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  historyScore: { type: [historyScoreSchema], required: true },
});

const CardHistoryScore = mongoose.model(
  "cardHistoryScore",
  cardHistoryScoreSchema
);

const createAndPushExperimentalData = async () => {
  const uniqueId = "3";

  const scoreHistory = [];

  scoreHistory.push({
    time: "2024-11-16",
    score: 89,
  });

  scoreHistory.push({
    time: "2024-11-17",
    score: 92,
  });

  scoreHistory.push({
    time: "2024-11-18",
    score: 54,
  });

  scoreHistory.push({
    time: "2024-11-19",
    score: 35,
  });

  scoreHistory.push({
    time: "2024-11-20",
    score: 68,
  });

  scoreHistory.push({
    time: "2024-11-21",
    score: 76,
  });

  scoreHistory.push({
    time: "2024-11-22",
    score: 82,
  });

  try {
    const existingDocument = await CardHistoryScore.findOne({ uniqueId });

    if (existingDocument) {
      existingDocument.historyScore.push(...scoreHistory);

      await existingDocument.save();
      console.log(`Updated scoreHistory for uniqueId: ${uniqueId}`);
    } else {
      const newDocument = new CardHistoryScore({
        uniqueId: uniqueId,
        historyScore: scoreHistory,
      });
      await newDocument.save();
      console.log(`Created new document for uniqueId: ${uniqueId}`);
    }
  } catch (err) {
    console.error("Error updating or creating document:", err);
  } finally {
    mongoose.connection.close();
  }
};

createAndPushExperimentalData();
