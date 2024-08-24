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
  initialSharesPrice: Number,
  ipoSharesPrice: Number,
  ipoShares: Number,
});

// Create the model for the cards collection
const Card = mongoose.model("cards", CardSchema);

// Function to create experimental data and push it to the collection
const createCard = async () => {
  const exampleCard = [];

  exampleCard.push({
    name: "2008 Majestic Dawn #41 Monferno - Holo (CGC 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    rarity: "EPIC",
    uniqueId: "1",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.011,
    category: "pokemon",
    lastPrice: 0.011,
    shares: 3,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
    rarity: "LEGEND",
    uniqueId: "2",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.0103,
    category: "pokemon",
    lastPrice: 0.0103,
    shares: 1,
    trend: 3,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon4.jpg",
    rarity: "RARE",
    uniqueId: "3",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.0107,
    category: "pokemon",
    lastPrice: 0.0107,
    shares: 2,
    trend: 17,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #29 Bayleef - 1st Edition (PSA 7 NM)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon4.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon5.jpg",
    rarity: "EPIC",
    uniqueId: "4",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.01,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 0,
    trend: 17,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "1999 Jungle #59 Paras - 1st Edition (CGC 8.5 NM-MT+)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon5.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    rarity: "LEGEND",
    uniqueId: "5",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.0107,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 2,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2018 Panini Prizm #181 Marvin Bagley III - Fast Break Prizm-Blue (PSA 9 MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball1.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/basketball2.jpg",
    rarity: "RARE",
    uniqueId: "6",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "basketball",
    lastPrice: 0.0103,
    shares: 1,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2022 Panini Prizm #270 Max Christie - Red Choice (PSA 8 NM-MT)",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball2.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/basketball3.jpg",
    rarity: "RARE",
    uniqueId: "7",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.011,
    category: "basketball",
    lastPrice: 0.01,
    shares: 3,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2023 Panini Court Kings First Steps #9 Bilal Coulibaly (PSA 8 NM-MT)",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball3.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/basketball4.jpg",
    rarity: "EPIC",
    uniqueId: "8",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.01,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2019 Panini Prizm Instant Impact #1 Tyler Herro (PSA 6 EX-MT)",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball4.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/basketball5.jpg",
    rarity: "LEGEND",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.0107,
    category: "basketball",
    lastPrice: 0.01,
    shares: 2,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2018 Panini Revolution #40 LeBron James (PSA 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball5.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/basketball1.jpg",
    rarity: "RARE",
    uniqueId: "10",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.01,
    category: "basketball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2006 Topps '52 #311 Mickey Mantle - Yellow (PSA 9 MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball1.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/baseball2.jpg",
    rarity: "LEGEND",
    uniqueId: "11",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2024 Bowman #RI-17 Aidan Miller - Rising Infernos (SGC 9 MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball2.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/baseball3.jpg",
    rarity: "RARE",
    uniqueId: "12",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.0107,
    category: "baseball",
    lastPrice: 0.01,
    shares: 2,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2023 Bowman #BP-3 Justin Crawford (SGC 9.5 MINT+)",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball3.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/baseball4.jpg",
    rarity: "EPIC",
    uniqueId: "13",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.0103,
    category: "baseball",
    lastPrice: 0.01,
    shares: 1,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2022 Panini Donruss Bomb Squad #BS6 Aaron Judge - Vector (PSA 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball4.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/baseball5.jpg",
    rarity: "RARE",
    uniqueId: "14",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.01,
    category: "baseball",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2023 Topps Cosmic Chrome #35 Adley Rutschman - Nucleus (PSA 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball5.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/basketball/baseball1.jpg",
    rarity: "RARE",
    uniqueId: "15",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.0103,
    category: "baseball",
    lastPrice: 0.01,
    shares: 1,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2008 Majestic Dawn #41 Monferno - Holo (CGC 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    rarity: "LEGEND",
    uniqueId: "16",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.0103,
    category: "presale",
    lastPrice: 0.01,
    shares: 1,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2021 Chinese Classic Collection #1 Charizard - Holo (PSA 10 GEM MINT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
    rarity: "LEGEND",
    uniqueId: "17",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.0103,
    category: "presale",
    lastPrice: 0.01,
    shares: 1,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "2000 Neo Genesis #38 Lanturn - 1st Edition (PSA 8 NM-MT)",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
    backPhoto: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    rarity: "LEGEND",
    uniqueId: "18",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "presale",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  try {
    await Card.insertMany(exampleCard);
    console.log("Cards created successfully");
  } catch (error) {
    console.error("Error creating cards:", error);
  }
};

createCard();
