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

// Define the card schema
const CardSchema = new mongoose.Schema({
  name: String,
  photo: String,
  backPhoto: String,
  rarity: String,
  uniqueId: { type: String, unique: true },
  ipoTime: String,
  price: Number,
  category: String,
  shares: Number,
  currentScore: Number,
  avgScore: Number,
  currentTournamentScore: Number,
  avgTournamentScore: Number,
  dayScore: Number,
});

// Create the model for the cards collection
const Card = mongoose.model("cards", CardSchema);

// Function to create experimental data and push it to the collection
const createCard = async () => {
  const exampleCard = [];

  exampleCard.push({
    name: "2002 Pokemon Neo Destiny 1st Edition Shining Charizard #107 PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmTQ8Y7pnL4bTSPcaH3hb8JLbFgHuM91k8q3MpVi7YbuxQ",
    backPhoto:
      "https://ipfs.io/ipfs/QmcAkoCyETXTohTgi7NzzoHV3TFEiBydJm1Rm4x3aDcma3",
    rarity: "LEGEND",
    uniqueId: "8",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 1.2,
    category: "pokemon",
    shares: 78,
    currentScore: 96,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "1999 Pokemon Japanese Vending Masaki Promo Holo Gengar #94 PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmejDWk2HvoAurenF5g6rdgMukDYUEg6fogyp67kftSWy9",
    backPhoto:
      "https://ipfs.io/ipfs/QmSaspDAvFDsfDPhQQZT38r47TJ95hmguZquVu4WzkQTkq",
    rarity: "LEGEND",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 1.6,
    category: "pokemon",
    shares: 85,
    currentScore: 98,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  try {
    await Card.insertMany(exampleCard);
    console.log("Cards created successfully");
  } catch (error) {
    console.error("Error creating cards:", error);
  }
};

createCard();
