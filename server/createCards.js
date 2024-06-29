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
    name: "pokemon1",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    uniqueId: "1",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
    price: 0.01,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "pokemon2",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    uniqueId: "2",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
    price: 0.0103,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 1,
    trend: 3,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "pokemon3",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
    uniqueId: "3",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
    price: 0.0117,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 5,
    trend: 17,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "pokemon4",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon4.jpg",
    uniqueId: "4",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
    price: 0.0117,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 5,
    trend: 17,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "pokemon5",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon5.jpg",
    uniqueId: "5",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
    price: 0.01,
    category: "pokemon",
    lastPrice: 0.01,
    shares: 0,
    trend: 0,
    initialSharesPrice: 0.01,
    ipoSharesPrice: 0.05,
    ipoShares: 50,
  });

  exampleCard.push({
    name: "basketball1",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball1.jpg",
    uniqueId: "6",
    ipoTime: "Fri, 14 Jun 2024 16:51:43 GMT",
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
    name: "basketball2",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball2.jpg",
    uniqueId: "7",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
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
    name: "basketball3",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball3.jpg",
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
    name: "basketball4",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball4.jpg",
    uniqueId: "9",
    ipoTime: "Fri, 14 Jun 2024 16:51:52 GMT",
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
    name: "basketball5",
    photo: "https://cardsimage.s3.amazonaws.com/basketball/basketball5.jpg",
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
    name: "baseball1",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball1.jpg",
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
    name: "baseball2",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball2.jpg",
    uniqueId: "12",
    ipoTime: "Fri, 14 Jun 2024 16:51:48 GMT",
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
    name: "baseball3",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball3.jpg",
    uniqueId: "13",
    ipoTime: "Fri, 14 Jun 2024 16:51:45 GMT",
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
    name: "baseball4",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball4.jpg",
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
    name: "baseball5",
    photo: "https://cardsimage.s3.amazonaws.com/baseball/baseball5.jpg",
    uniqueId: "15",
    ipoTime: "Fri, 14 Jun 2024 16:51:39 GMT",
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
    name: "presale1",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon1.jpg",
    uniqueId: "16",
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

  exampleCard.push({
    name: "presale2",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon2.jpg",
    uniqueId: "17",
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

  exampleCard.push({
    name: "presale3",
    photo: "https://cardsimage.s3.amazonaws.com/pokemon/pokemon3.jpg",
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
