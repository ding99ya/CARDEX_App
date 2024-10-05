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
  lastPrice: Number,
  trend: Number,
  shares: Number,
});

// Create the model for the cards collection
const Card = mongoose.model("cards", CardSchema);

// Function to create experimental data and push it to the collection
const createCard = async () => {
  const exampleCard = [];

  exampleCard.push({
    name: "2008 Majestic Dawn #41 Monferno - Holo (CGC 10 GEM MINT)",
    photo:
      "https://ipfs.io/ipfs/QmNm2KHEzhwUePa8G7HvtQTHkE2FMjQBDY4qPKrXJiR7Vn",
    backPhoto:
      "https://ipfs.io/ipfs/QmVE3DHcB1Nvtas6UbJEeZKEjg4BEc9q1YzJvWaTxVBAcg",
    rarity: "EPIC",
    uniqueId: "1",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.02,
    category: "pokemon",
    lastPrice: 0.011,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+2.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+3.png",
    rarity: "LEGEND",
    uniqueId: "2",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.075,
    category: "pokemon",
    lastPrice: 0.0103,
    shares: 0,
    trend: 3,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+3.png",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+4.png",
    rarity: "RARE",
    uniqueId: "3",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.01,
    category: "pokemon",
    lastPrice: 0.0107,
    shares: 0,
    trend: 17,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #29 Bayleef - 1st Edition (PSA 7 NM)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+4.png",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+5.png",
    rarity: "EPIC",
    uniqueId: "4",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.023,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 0,
    trend: 17,
  });

  exampleCard.push({
    name: "1999 Jungle #59 Paras - 1st Edition (CGC 8.5 NM-MT+)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+5.png",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+1.jpeg",
    rarity: "LEGEND",
    uniqueId: "5",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.05,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2018 Panini Prizm #181 Marvin Bagley III - Fast Break Prizm-Blue (PSA 9 MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+1.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+2.jpeg",
    rarity: "RARE",
    uniqueId: "6",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.007,
    category: "basketball",
    lastPrice: 0.0103,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2022 Panini Prizm #270 Max Christie - Red Choice (PSA 8 NM-MT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+2.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+3.jpeg",
    rarity: "RARE",
    uniqueId: "7",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.01,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2023 Panini Court Kings First Steps #9 Bilal Coulibaly (PSA 8 NM-MT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+3.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+4.jpeg",
    rarity: "EPIC",
    uniqueId: "8",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.02,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2019 Panini Prizm Instant Impact #1 Tyler Herro (PSA 6 EX-MT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+4.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+5.jpeg",
    rarity: "LEGEND",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.04,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2018 Panini Revolution #40 LeBron James (PSA 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+5.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/basketball/Grading+Basketball+1.jpeg",
    rarity: "RARE",
    uniqueId: "10",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.01,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2006 Topps '52 #311 Mickey Mantle - Yellow (PSA 9 MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+1.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+2.jpeg",
    rarity: "LEGEND",
    uniqueId: "11",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.06,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2024 Bowman #RI-17 Aidan Miller - Rising Infernos (SGC 9 MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+2.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+3.jpeg",
    rarity: "RARE",
    uniqueId: "12",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.015,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2023 Bowman #BP-3 Justin Crawford (SGC 9.5 MINT+)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+3.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+4.jpeg",
    rarity: "EPIC",
    uniqueId: "13",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.03,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2022 Panini Donruss Bomb Squad #BS6 Aaron Judge - Vector (PSA 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+4.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+5.jpeg",
    rarity: "RARE",
    uniqueId: "14",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.01,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2023 Topps Cosmic Chrome #35 Adley Rutschman - Nucleus (PSA 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+5.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+1.jpeg",
    rarity: "RARE",
    uniqueId: "15",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.01,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2008 Majestic Dawn #41 Monferno - Holo (CGC 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+1.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+1.jpeg",
    rarity: "LEGEND",
    uniqueId: "16",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.08,
    category: "presale",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+2.jpeg",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+2.jpeg",
    rarity: "LEGEND",
    uniqueId: "17",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.07,
    category: "presale",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+3.png",
    backPhoto:
      "https://cardexcardsimage.s3.amazonaws.com/pokemon/Grading+Pokemon+3.png",
    rarity: "LEGEND",
    uniqueId: "18",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.06,
    category: "presale",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
  });

  try {
    await Card.insertMany(exampleCard);
    console.log("Cards created successfully");
  } catch (error) {
    console.error("Error creating cards:", error);
  }
};

createCard();
