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
    name: "2006 Pokemon Ex Dragon Frontiers #101/101 Mew Holo CGC 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmVi4GjaZJ4kaVWo7BCbtwcoK3ibQUgsoMD2ikRu1kELvr",
    backPhoto:
      "https://ipfs.io/ipfs/QmUHWhE8DdX1e6sDJfxQKSJHhavFmNR2i2Uo5fFSrMig96",
    rarity: "EPIC",
    uniqueId: "1",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2006 Pokemon EX Holon Phantoms Holo Pikachu Gold Star #104 CGC 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmQv5k5hVW5GbPDM7WbbJEynuWEvNFWRvVqjPcP4ikazNf",
    backPhoto:
      "https://ipfs.io/ipfs/QmYx423HQSMKkXvTy22FzASfUUqaWb36FFV8PCfRAkQjRG",
    rarity: "EPIC",
    uniqueId: "2",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.01,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2016 Pokemon Japanese Xy Promo Poncho-Wear. Pikachu #207 Special Box PSA 10 MT",
    photo:
      "https://ipfs.io/ipfs/QmXR9Rsiv7FY9Q8QD4TpeKpksY61uMNg6CrikSLKV7E7vy",
    backPhoto:
      "https://ipfs.io/ipfs/Qmf5efhcPSZmPRqJpSUE7ZvPffYZ1PHKwsroEJjL2sqN68",
    rarity: "RARE",
    uniqueId: "3",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.007,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2016 Pokemon Japanese XY Promo Rayquaza #230 Poncho Wear Pikachu PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmUwhtKQvW2iE6JDvj6U5meWuGoRwAGHwZ4RHdrxr1NRgy",
    backPhoto:
      "https://ipfs.io/ipfs/QmTuh2YTViA5zQg9JP3VdgVQkua4pFqscvhLpREbUcfBYK",
    rarity: "RARE",
    uniqueId: "4",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.007,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2015 Pokemon Japanese XY #150 Prtd. Mgkrp. Pikachu Promo HOLO PSA 10",
    photo:
      "https://ipfs.io/ipfs/QmWJNP8xdXR83AhgT4BD2HExUqqp5rGcZxqfpWxFRCMEKk",
    backPhoto:
      "https://ipfs.io/ipfs/QmY877DWuGzt7mpqFpRaQRj67QihuRu9xtLf9jPuwE9S7Q",
    rarity: "RARE",
    uniqueId: "5",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.007,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2016 Japanese Pokemon Poncho Wear Pikachu Rayquaza #231XY Promo PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmVbym6EYhaS7erwy8U8ikEsE4mMibzMUNmTwtQh9b6kEY",
    backPhoto:
      "https://ipfs.io/ipfs/QmXpKohMgAKJie8eLFzGKdCuJt2oWN8Wks3wT3Q1wtuLaY",
    rarity: "RARE",
    uniqueId: "6",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.005,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2015 Pokemon Japanese XY Promo #151 Pretend Gyarados Pikachu Holo PSA 10",
    photo:
      "https://ipfs.io/ipfs/QmX5QE6exDRXQBcEfeW5E2NuGNUdHqh9yXhXDwdCJobDMb",
    backPhoto:
      "https://ipfs.io/ipfs/QmX7g3EaDhUjXcUN68fprjkJcsZtWzP1r1X51JekC41cUR",
    rarity: "RARE",
    uniqueId: "7",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.005,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2001 Pokemon Japanese Promo Corocoro Comics #151 Shining Mew Holo PSA 10",
    photo:
      "https://ipfs.io/ipfs/QmZUasqGuLkxipbKfqFJXL6xmCg5fnVPRLiRiTT54hQGvg",
    backPhoto:
      "https://ipfs.io/ipfs/QmVeVgcG8iCGLkzKNwHq7ZiS6dB9iRg6oyEt1GsqgFyAPn",
    rarity: "RARE",
    uniqueId: "8",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.008,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2002 Pokemon Japanese Split Earth 1st Edition Holo Umbreon #72 PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmfJCdbZPeH2buzMa8zGvgz1a1PrUb2Znv9cMfur6akBaE",
    backPhoto:
      "https://ipfs.io/ipfs/QmbfHkHoK5y36Y2k3Xwb8K7ivDvDtEjXwat1PMPgSwhyq1",
    rarity: "EPIC",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.008,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2015 Pokemon Japanese XY Gym Promo Holo Umbreon #140 PSA 10 Gem Mint",
    photo:
      "https://ipfs.io/ipfs/QmR8HaihTrAqctRcUNLXrYBZAQZyZER9Q3LV2ckHkiuasG",
    backPhoto:
      "https://ipfs.io/ipfs/QmecUuCMfbRf2gv5q522wDK3XuMWGzM3jBh9K656azE5d4",
    rarity: "EPIC",
    uniqueId: "10",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
    avgScore: 0,
    currentTournamentScore: 0,
    avgTournamentScore: 0,
    dayScore: 0,
  });

  exampleCard.push({
    name: "2011 Pokemon Japanese BW Red Collection 1st Edition Meowth #72 PSA 10 GEM MINT",
    photo:
      "https://ipfs.io/ipfs/QmcmFFKdn3MAQNiA3xdDak6Y4fZvr8Yotngeb6Dwja1bdU",
    backPhoto:
      "https://ipfs.io/ipfs/QmQ1XCLgApqbZeRmfaFSrpHn1w2kLNqXuDCRg9Kho9UR1b",
    rarity: "COMMON",
    uniqueId: "11",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.002,
    category: "pokemon",
    shares: 0,
    currentScore: 0,
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
