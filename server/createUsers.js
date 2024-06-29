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

// Define the card inventory schema
const cardInventorySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true },
  shares: { type: Number, required: true },
});

// Define the users schema
const usersSchema = new mongoose.Schema({
  DID: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true },
  username: { type: String, required: false },
  invited: { type: Boolean, default: false },
  inviteCode: { type: String, required: false },
  cardInventory: { type: [cardInventorySchema], required: true },
});

// Create the model for the prices collection
const users = mongoose.model("users", usersSchema);

const createUser = async () => {
  // const newUser = new users({
  //   DID: "clvoc7dzr00ftne36qf962c4u",
  //   walletAddress: "0xaB6144cD2f8b54F71cB7f91F7b8e56917B721c65",
  //   username: "DING99YA",
  //   invited: true,
  //   inviteCode: "",
  //   cardInventory: [
  //     { uniqueId: "1", shares: 6 },
  //     { uniqueId: "2", shares: 2 },
  //     { uniqueId: "3", shares: 4 },
  //     { uniqueId: "4", shares: 5 },
  //     { uniqueId: "5", shares: 5 },
  //     { uniqueId: "6", shares: 5 },
  //     { uniqueId: "7", shares: 2 },
  //     { uniqueId: "8", shares: 2 },
  //     { uniqueId: "9", shares: 2 },
  //     { uniqueId: "10", shares: 3 },
  //     { uniqueId: "11", shares: 2 },
  //     { uniqueId: "12", shares: 5 },
  //     { uniqueId: "13", shares: 3 },
  //     { uniqueId: "14", shares: 5 },
  //     { uniqueId: "15", shares: 5 },
  //   ],
  // });

  const newUser = new users({
    DID: "clvjy5dj7000b11gxs0lbm4q3",
    walletAddress: "0x0e2A4ae795BD9AA5c35c6278025020A7ceb92fE8",
    username: "FENGHU428",
    invited: false,
    inviteCode: "",
    cardInventory: [],
  });

  try {
    await newUser.save();
    console.log("User created successfully:", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

createUser();
