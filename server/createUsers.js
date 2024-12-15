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
  const newUser = new users({
    DID: "testDID",
    walletAddress: "0xA67694fac5b9E5a1e410E331741612A5bB0497c8",
    username: "AbstractMM6",
    invited: true,
    inviteCode: "eHrjdc",
    cardInventory: [],
  });

  // const newUser = new users({
  //   DID: "clz659gkr03nek76e5dgbnx15",
  //   walletAddress: "0xe26403d401911021b21187E2242bF88D77da77D8",
  //   username: "FengHu479069",
  //   invited: true,
  //   inviteCode: "eHrjdc",
  //   cardInventory: [],
  // });

  try {
    await newUser.save();
    console.log("User created successfully:", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

createUser();
