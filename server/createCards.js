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
    shares: 0,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon2Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon2Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "2",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.075,
    category: "pokemon",
    shares: 0,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon3Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon3Back.jpeg",
    rarity: "RARE",
    uniqueId: "3",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.01,
    category: "pokemon",
    shares: 0,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #29 Bayleef - 1st Edition (PSA 7 NM)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon4Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon4Back.jpeg",
    rarity: "EPIC",
    uniqueId: "4",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.023,
    category: "pokemon",
    shares: 0,
  });

  exampleCard.push({
    name: "1999 Jungle #59 Paras - 1st Edition (CGC 8.5 NM-MT+)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon5Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon5Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "5",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.05,
    category: "pokemon",
    shares: 0,
  });

  exampleCard.push({
    name: "2018 Panini Prizm #181 Marvin Bagley III - Fast Break Prizm-Blue (PSA 9 MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball1Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball1Back.jpeg",
    rarity: "RARE",
    uniqueId: "6",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.007,
    category: "basketball",
    shares: 0,
  });

  exampleCard.push({
    name: "2022 Panini Prizm #270 Max Christie - Red Choice (PSA 8 NM-MT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball2Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball2Back.jpeg",
    rarity: "RARE",
    uniqueId: "7",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.01,
    category: "basketball",
    shares: 0,
  });

  exampleCard.push({
    name: "2023 Panini Court Kings First Steps #9 Bilal Coulibaly (PSA 8 NM-MT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball3Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball3Back.jpeg",
    rarity: "EPIC",
    uniqueId: "8",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.02,
    category: "basketball",
    shares: 0,
  });

  exampleCard.push({
    name: "2019 Panini Prizm Instant Impact #1 Tyler Herro (PSA 6 EX-MT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball4Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball4Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.04,
    category: "basketball",
    shares: 0,
  });

  exampleCard.push({
    name: "2018 Panini Revolution #40 LeBron James (PSA 10 GEM MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball5Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Basketball5Back.jpeg",
    rarity: "RARE",
    uniqueId: "10",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.01,
    category: "basketball",
    shares: 0,
  });

  exampleCard.push({
    name: "2006 Topps '52 #311 Mickey Mantle - Yellow (PSA 9 MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball1Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball1Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "11",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.06,
    category: "baseball",
    shares: 0,
  });

  exampleCard.push({
    name: "2024 Bowman #RI-17 Aidan Miller - Rising Infernos (SGC 9 MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball2Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball2Back.jpeg",
    rarity: "RARE",
    uniqueId: "12",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.015,
    category: "baseball",
    shares: 0,
  });

  exampleCard.push({
    name: "2023 Bowman #BP-3 Justin Crawford (SGC 9.5 MINT+)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball3Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Baseball3Back.jpeg",
    rarity: "EPIC",
    uniqueId: "13",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.03,
    category: "baseball",
    shares: 0,
  });

  // exampleCard.push({
  //   name: "2022 Panini Donruss Bomb Squad #BS6 Aaron Judge - Vector (PSA 10 GEM MINT)",
  //   photo:
  //     "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+4.jpeg",
  //   backPhoto:
  //     "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+5.jpeg",
  //   rarity: "RARE",
  //   uniqueId: "14",
  //   ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
  //   price: 0.01,
  //   category: "baseball",
  //   shares: 0,
  // });

  // exampleCard.push({
  //   name: "2023 Topps Cosmic Chrome #35 Adley Rutschman - Nucleus (PSA 10 GEM MINT)",
  //   photo:
  //     "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+5.jpeg",
  //   backPhoto:
  //     "https://cardexcardsimage.s3.amazonaws.com/baseball/Grading+Baseball+1.jpeg",
  //   rarity: "RARE",
  //   uniqueId: "15",
  //   ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
  //   price: 0.01,
  //   category: "baseball",
  //   shares: 0,
  // });

  exampleCard.push({
    name: "2008 Majestic Dawn #41 Monferno - Holo (CGC 10 GEM MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon6Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon6Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "14",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.08,
    category: "presale",
    shares: 0,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon2Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon2Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "15",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.07,
    category: "presale",
    shares: 0,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon7Front.jpeg",
    backPhoto:
      "https://cyan-late-whippet-455.mypinata.cloud/ipfs/QmYFMugdsXLNEBCV9riu49Zqkw5JGgkn4BKGpyVvR2uPWB/Pokemon7Back.jpeg",
    rarity: "LEGEND",
    uniqueId: "16",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.06,
    category: "presale",
    shares: 0,
  });

  try {
    await Card.insertMany(exampleCard);
    console.log("Cards created successfully");
  } catch (error) {
    console.error("Error creating cards:", error);
  }
};

createCard();
