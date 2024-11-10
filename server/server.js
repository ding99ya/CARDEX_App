const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { fileURLToPath } = require("url");
const CardModel = require("./models/CardModel.js");
const PriceModel = require("./models/PriceModel.js");
const UserModel = require("./models/UserModel.js");
const LeaderboardModel = require("./models/LeaderboardModel.js");
const InviteCodeModel = require("./models/inviteCodeModel.js");
const PresaleUserModel = require("./models/PresaleUserModel.js");
const CardActivityModel = require("./models/CardActivityModel.js");
const CardHolderModel = require("./models/CardHolderModel.js");
const CTournamentModel = require("./models/CTournamentModel.js");
const PTournamentModel = require("./models/PTournamentModel.js");
const SubscriptionModel = require("./models/SubscriptionModel.js");
const path = require("path");
const axios = require("axios");
const webpush = require("web-push");
const { PrivyClient } = require("@privy-io/server-auth");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow any HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

mongoose.connect(process.env.MONGO_URL);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({ origin: "https://cardex-app.vercel.app", credentials: true }));

app.get("/test", (req, res) => {
  res.send("testtesttest!");
});

app.post("/register", (req, res) => {
  const { name, email, sms, owns } = req.body;
  User.create();
});

// API endpoint for lazy loading activities
app.get("/api/cardactivity/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  const { page, limit } = req.query;

  const skip = (page - 1) * limit;
  const limitInt = parseInt(limit);

  try {
    const result = await CardActivityModel.aggregate([
      { $match: { uniqueId } },
      {
        $project: {
          activity: { $slice: ["$activity", skip, limitInt] },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json([]);
    }

    const { activity } = result[0];

    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/cardholders/:uniqueId", async (req, res) => {
  try {
    const cardHolders = await CardHolderModel.findOne({
      uniqueId: req.params.uniqueId,
    });
    if (!cardHolders) {
      return res.json([]);
    }
    res.json(cardHolders.holders);
  } catch (error) {
    console.error("Error in /api/cardholders/:uniqueId:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create an endpoint to fetch user info
app.get("/api/user/:did", async (req, res) => {
  const userDid = req.params.did;
  const privyUrl = `https://auth.privy.io/api/v1/users/${userDid}`;

  try {
    const response = await axios.get(privyUrl, {
      headers: {
        Authorization: `Basic ${btoa(
          process.env.PRIVY_APP_ID + ":" + process.env.PRIVY_APP_SECRET
        )}`,
        "privy-app-id": process.env.PRIVY_APP_ID,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching user data from Privy: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch user info from Privy" });
  }
});

app.get("/api/users/:walletAddress", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      walletAddress: req.params.walletAddress,
    });
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error in /api/users/:walletAddress:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users/byname/:username", async (req, res) => {
  try {
    const user = await UserModel.findOne({
      username: req.params.username,
    });
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error("Error in /api/users/:username:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/users/check-username/:username", async (req, res) => {
  try {
    const user = await UserModel.findOne({ username: req.params.username });

    if (user) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking username:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/users", async (req, res) => {
  const { DID, walletAddress, username, invited, cardInventory } = req.body;

  // Basic validation
  // if (!DID || !walletAddress || !username) {
  //   return res
  //     .status(400)
  //     .json({ message: "DID, walletAddress, and username are required" });
  // }

  try {
    let user = await UserModel.findOne({ walletAddress });

    if (user) {
      // If user exists, update the 'invited' field
      user.DID = DID;
      user.invited = invited;
      await user.save();
    } else {
      // If user does not exist, create a new user
      user = new UserModel({
        DID: DID,
        walletAddress: walletAddress,
        username: username,
        invited: invited,
        inviteCode: "",
        cardInventory: cardInventory,
      });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/invitecodes", async (req, res) => {
  const { DID, code, createdAt, lastUpdatedAt, currentUsage, totalUsage } =
    req.body;

  try {
    let inviteCode = new InviteCodeModel({
      DID: DID,
      code: code,
      createdAt: createdAt,
      lastUpdatedAt: lastUpdatedAt,
      currentUsage: currentUsage,
      totalUsage: totalUsage,
    });
    await inviteCode.save();

    res.status(200).json(inviteCode);
  } catch (error) {
    console.error("Error in /api/invitecodes:", error);
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/users/nameandcode", async (req, res) => {
  const { walletAddress, username, inviteCode } = req.body;

  // if (!walletAddress || !username) {
  //   return res
  //     .status(400)
  //     .json({ message: "walletAddress and username are required" });
  // }

  try {
    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { $set: { username: username, inviteCode: inviteCode } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users/username:", error);
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/users/username", async (req, res) => {
  const { walletAddress, username } = req.body;

  // if (!walletAddress || !username) {
  //   return res
  //     .status(400)
  //     .json({ message: "walletAddress and username are required" });
  // }

  try {
    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { $set: { username } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users/username:", error);
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/users/invitecode", async (req, res) => {
  const { walletAddress, inviteCode } = req.body;

  // if (!walletAddress || !username) {
  //   return res
  //     .status(400)
  //     .json({ message: "walletAddress and username are required" });
  // }

  try {
    const user = await UserModel.findOneAndUpdate(
      { walletAddress },
      { $set: { inviteCode } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in /api/users/invitecode:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/cards", async (req, res) => {
  const { category, search, uniqueId } = req.query;

  try {
    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (uniqueId) {
      query.uniqueId = uniqueId;
    }

    const cards = await CardModel.find(query);
    res.json(cards);
  } catch (error) {
    console.error("Error in /api/cards:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/sortCards", async (req, res) => {
  try {
    // Fetch all cards and sort them by score in descending order (-1)
    // const cards = await CardModel.find().sort({ currentScore: -1 });
    const cards = await CardModel.find({ category: { $ne: "presale" } }).sort({
      currentScore: -1,
    });

    // Return the sorted cards array
    res.json(cards);
  } catch (error) {
    console.error("Error in /api/cards:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/sortTournamentCards", async (req, res) => {
  try {
    // Fetch all cards and sort them by score in descending order (-1)
    // const cards = await CardModel.find().sort({ currentScore: -1 });
    const cards = await CardModel.find({ category: { $ne: "presale" } }).sort({
      currentTournamentScore: -1,
    });

    // Return the sorted cards array
    res.json(cards);
  } catch (error) {
    console.error("Error in /api/sortTournamentCards:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/cards/searchName/:name", async (req, res) => {
  try {
    // Search for cards whose name contains the query string (case-insensitive)
    const cards = await CardModel.find({
      name: { $regex: req.params.name, $options: "i" }, // 'i' option makes it case-insensitive
      category: { $ne: "presale" },
    }).sort({ currentScore: -1 });

    res.json(cards);
  } catch (error) {
    console.error("Error in /api/cards/searchName:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/cards/:uniqueId", async (req, res) => {
  try {
    const card = await CardModel.findOne({ uniqueId: req.params.uniqueId });
    if (!card) {
      return res.status(404).json("Card not found");
    }
    res.json(card);
  } catch (error) {
    console.error("Error in /api/cards/:uniqueId:", error);
    res.status(500).json({ message: error.message });
  }
});

// Listen for changes and emit events
const changeStream = CardModel.watch();
changeStream.on("change", (change) => {
  console.log("Change detected:", change);
  if (change.operationType === "update") {
    if (change.updateDescription.updatedFields.hasOwnProperty("shares")) {
      CardModel.findById(change.documentKey._id).then((updatedCard) => {
        console.log("Will update card");
        io.emit("cardUpdate", updatedCard);
      });
    }
  }
});

app.post("/api/cards/multiple", async (req, res) => {
  try {
    const { uniqueIds } = req.body;
    // const uniqueIds = ["1", "2", "3"];
    if (!uniqueIds || !Array.isArray(uniqueIds)) {
      return res.status(400).json("Invalid uniqueIds array");
    }

    const cards = await CardModel.find({ uniqueId: { $in: uniqueIds } });
    res.json(cards);
  } catch (error) {
    console.error("Error in /api/cards/multiple:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/cards/category/:category", async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludedFields = ["name", "photo", "uniqueId", "price"];
    excludedFields.forEach((field) => delete queryObj[field]);
    queryObj.category = req.params.category;
    const cards = await CardModel.find(queryObj);
    res.json(cards);
  } catch (error) {
    console.error("Error in /api/category", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/prices/:uniqueId", async (req, res) => {
  try {
    const price = await PriceModel.findOne({ uniqueId: req.params.uniqueId });
    if (!price) {
      return res.status(404).json("Price not found");
    }
    res.json(price);
  } catch (error) {
    console.error("Error in /api/prices/:uniqueId:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await LeaderboardModel.find()
      .sort({ rank: 1 })
      .limit(30);
    res.json(leaderboard);
  } catch (error) {
    console.error("Error in /api/leaderboard:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/leaderboard", async (req, res) => {
  const {
    DID,
    walletAddress,
    name,
    userName,
    profilePhoto,
    paperPoints,
    currentPoints,
  } = req.body;

  // if (!DID || !walletAddress || !userName || paperPoints === undefined) {
  //   return res.status(400).json({ message: "All fields are required" });
  // }

  try {
    // Count the current number of documents in the collection
    const count = await LeaderboardModel.countDocuments();

    // Create the new leaderboard object
    const newLeaderboardEntry = new LeaderboardModel({
      DID: DID,
      walletAddress: walletAddress,
      name: name,
      userName: userName,
      profilePhoto: profilePhoto,
      rank: count + 1, // Rank is the current count + 1
      paperPoints: paperPoints,
      currentPoints: currentPoints,
    });

    // Save the new leaderboard object to the database
    await newLeaderboardEntry.save();
    res.status(201).json(newLeaderboardEntry);
  } catch (error) {
    console.error("Error in /api/leaderboard:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/leaderboard/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  try {
    const user = await LeaderboardModel.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/leaderboard/byname/:userName", async (req, res) => {
  const { userName } = req.params;
  try {
    const user = await LeaderboardModel.findOne({ userName: userName });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/leaderboard/containname/:username", async (req, res) => {
  const { username } = req.params;
  try {
    // Use regex to perform a case-insensitive search
    const users = await LeaderboardModel.find({
      userName: { $regex: username, $options: "i" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/leaderboard/containusername/:userName", async (req, res) => {
  const { userName } = req.params;
  try {
    // Use regex to perform a case-insensitive search
    const users = await LeaderboardModel.find({
      userName: { $regex: userName, $options: "i" },
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/leaderboard/update", async (req, res) => {
  const { walletAddress, currentPoints } = req.body;

  try {
    const leaderboardUser = await LeaderboardModel.findOneAndUpdate(
      { walletAddress: walletAddress },
      { $set: { currentPoints: currentPoints } },
      { new: true }
    );

    if (!leaderboardUser) {
      return res.status(404).json({ message: "User in leaderboard not found" });
    }

    res.status(200).json(leaderboardUser);
  } catch (error) {
    console.error("Error in /api/leaderboard/update", error);
    res.status(500).json({ message: error.message });
  }
});

app.patch("/api/leaderboard/nameandprofilephoto", async (req, res) => {
  const { walletAddress, name, profilePhoto } = req.body;

  // if (!walletAddress || !username) {
  //   return res
  //     .status(400)
  //     .json({ message: "walletAddress and username are required" });
  // }

  try {
    const leaderboardUser = await LeaderboardModel.findOneAndUpdate(
      { walletAddress: walletAddress },
      { $set: { name: name, profilePhoto: profilePhoto } },
      { new: true }
    );

    if (!leaderboardUser) {
      return res.status(404).json({ message: "User in leaderboard not found" });
    }

    res.status(200).json(leaderboardUser);
  } catch (error) {
    console.error("Error in /api/leaderboard/nameandprofilephoto", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/invitecodes/:invitecode", async (req, res) => {
  try {
    const code = await InviteCodeModel.findOne({ code: req.params.invitecode });
    if (!code) {
      return res.status(404).json({ message: "Code is invalid" });
    }
    res.json(code);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.patch("/api/invitecodes/updatedandusage", async (req, res) => {
  const { code, lastUpdatedAt, currentUsage, totalUsage } = req.body;

  try {
    const inviteCode = await InviteCodeModel.findOneAndUpdate(
      { code: code },
      {
        $set: {
          lastUpdatedAt: lastUpdatedAt,
          currentUsage: currentUsage,
          totalUsage: totalUsage,
        },
      },
      { new: true }
    );

    if (!inviteCode) {
      return res.status(404).json({ message: "Code not found" });
    }

    res.status(200).json(inviteCode);
  } catch (error) {
    console.error("Error in /api/invitecodes/updatedandusage", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/presaleUsers/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params; // Extract wallet address from URL

  try {
    // Search for the user in the presaleUsers collection
    let presaleUser = await PresaleUserModel.findOne({ walletAddress });

    // If the user is not found, create a default object with empty presaleInventory
    if (!presaleUser) {
      presaleUser = {
        walletAddress,
        presaleInventory: [],
      };
    }

    // Return the user object (either from DB or the default one)
    res.json(presaleUser);
  } catch (error) {
    console.error("Error in /api/presaleUsers/:walletAddress:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/presaleUsers/inventory", async (req, res) => {
  const { walletAddress, uniqueId, shares } = req.body;

  try {
    // Try to find the user by walletAddress
    let presaleUser = await PresaleUserModel.findOne({
      walletAddress: walletAddress,
    });

    if (!presaleUser) {
      // If the user doesn't exist, create a new user with the given walletAddress
      presaleUser = new PresaleUserModel({
        walletAddress,
        presaleInventory: [{ uniqueId, shares }],
      });
    } else {
      // Check if the uniqueId already exists in the user's presaleInventory
      const inventoryItem = presaleUser.presaleInventory.find(
        (item) => item.uniqueId === uniqueId.toString()
      );

      if (inventoryItem) {
        // If the item exists, add the new shares to existing shares
        inventoryItem.shares += Number(shares);
      } else {
        // If the item does not exist, add a new object to presaleInventory
        presaleUser.presaleInventory.push({
          uniqueId: uniqueId.toString(),
          shares: Number(shares),
        });
      }
    }

    // Save the user (new or updated) to the database
    await presaleUser.save();

    // Return the updated user object
    res.json(presaleUser);
  } catch (error) {
    console.error("Error in /api/presaleUsers/inventory:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get(
  "/api/presaleusers/check-presaleuser/:walletAddress",
  async (req, res) => {
    try {
      const user = await PresaleUserModel.findOne({
        walletAddress: req.params.walletAddress,
      });

      if (user) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error("Error checking presale user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

app.post("/api/presaleusers", async (req, res) => {
  const { walletAddress } = req.body;

  try {
    let presaleUser = new PresaleUserModel({
      walletAddress: walletAddress,
    });
    await presaleUser.save();

    res.status(200).json(presaleUser);
  } catch (error) {
    console.error("Error in /api/presaleusers:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/ctournament/userDecks/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find all documents for the given walletAddress
    const records = await CTournamentModel.find({ walletAddress });

    // If no records are found, return an empty hash table
    if (!records.length) {
      return res.json({});
    }

    // Transform the records into the desired hash table format
    const deckHashTable = records.reduce((acc, record) => {
      acc[record.deckId] = {
        deck: record.deck,
        rank: record.rank,
        totalTournamentScore: record.totalTournamentScore,
      };
      return acc;
    }, {});

    res.json(deckHashTable);
  } catch (error) {
    console.error("Error in /api/ctournament/userDecks/:walletAddress:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/ctournament/players/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const players = await CTournamentModel.find({
      username: { $regex: username, $options: "i" },
    });

    res.json(players);
  } catch (error) {
    console.error("Error in /api/ctournament/userDecks/:username:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/ctournament/lockedCount", async (req, res) => {
  try {
    const { walletAddress, uniqueId } = req.query;

    // Fetch all CTournament objects for the given walletAddress
    const tournaments = await CTournamentModel.find({
      walletAddress: walletAddress,
    });

    // Initialize a count variable
    let lockedCount = 0;

    // Loop through each tournament and each deck item to count occurrences of the uniqueId
    tournaments.forEach((tournament) => {
      tournament.deck.forEach((card) => {
        if (card.uniqueId === uniqueId.toString()) {
          lockedCount += 1;
        }
      });
    });

    // Return the total count
    res.json(lockedCount);
  } catch (error) {
    console.error("Error in /api/ctournament/lockedCount:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/ctournament/deleteDeck", async (req, res) => {
  const { walletAddress, deckId } = req.body;

  try {
    const result = await CTournamentModel.deleteOne({
      walletAddress: walletAddress,
      deckId: deckId,
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Deck not found or already deleted." });
    }

    res.json({ message: "Deck successfully deleted." });
  } catch (error) {
    console.error("Error in /api/ctournament/deleteDeck:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

app.post("/api/ctournament/updateUserDeck", async (req, res) => {
  try {
    const { walletAddress, username, profilePhoto, deckId, deck } = req.body;

    // Check if a record exists with the given walletAddress and deckId
    const existingRecord = await CTournamentModel.findOne({
      walletAddress: walletAddress,
      deckId: deckId,
    });

    if (existingRecord) {
      // Update the existing record
      existingRecord.username = username;
      existingRecord.profilePhoto = profilePhoto;
      existingRecord.rank = 0;
      existingRecord.totalTournamentScore = 0;
      existingRecord.deck = deck;

      await existingRecord.save();
      res.json({
        message: "Record updated successfully",
        record: existingRecord,
      });
    } else {
      // Create a new record
      const newRecord = new CTournamentModel({
        walletAddress: walletAddress,
        username: username,
        profilePhoto: profilePhoto,
        deckId: deckId,
        rank: 0,
        totalTournamentScore: 0,
        deck: deck,
      });

      await newRecord.save();
      res.json({
        message: "New record created successfully",
        record: newRecord,
      });
    }
  } catch (error) {
    console.error("Error in /api/ctournament/updateUserDeck:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/sortTournamentDecks", async (req, res) => {
  try {
    // Fetch all cards and sort them by score in descending order (-1)
    // const cards = await CardModel.find().sort({ currentScore: -1 });
    const decks = await CTournamentModel.find()
      .sort({
        totalTournamentScore: -1,
      })
      .limit(30);

    // Return the sorted cards array
    res.json(decks);
  } catch (error) {
    console.error("Error in /api/sortTournamentDecks:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/ptournament/previousRewards/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Find the document by walletAddress
    const tournament = await PTournamentModel.findOne({ walletAddress });

    // If not found, return an empty array for previousRewards
    if (!tournament) {
      return res.json({ previousRewards: [] });
    }

    // If found, return the previousRewards array
    res.json({ previousRewards: tournament.previousRewards });
  } catch (error) {
    console.error("Error in /api/ptournament/previousRewards:", error);
    res.status(500).json({ message: "Server error" });
  }
});

webpush.setVapidDetails(
  "mailto:ding99ya@gmail.com", // This should be your contact email
  vapidPublicKey,
  vapidPrivateKey
);

// API endpoint to serve the VAPID public key
app.get("/api/vapidPublicKey", (req, res) => {
  res.send(vapidPublicKey);
});

app.get("api/getAllSubscriptions", async (req, res) => {
  try {
    // Fetch all subscriptions from the database
    const subscriptions = await SubscriptionModel.find({});

    // If no subscriptions are found, return an empty array
    if (!subscriptions || subscriptions.length === 0) {
      return res.status(200).json([]);
    }

    // Map the subscriptions to the format expected by web-push
    // const formattedSubscriptions = subscriptions.map((sub) => ({
    //   endpoint: sub.endpoint,
    //   keys: {
    //     p256dh: sub.keys.p256dh,
    //     auth: sub.keys.auth,
    //   },
    // }));

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching subscriptions" });
  }
});

app.post("/api/subscribe", async (req, res) => {
  const { subscription } = req.body;

  try {
    const newSubscription = new SubscriptionModel({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    await newSubscription.save();

    res.status(201).json({ message: "Subscription saved successfully" });
  } catch (error) {
    console.error("Error in /api/save-subscription", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/unsubscribe", async (req, res) => {
  try {
    const subscription = req.body;
    await SubscriptionModel.findOneAndDelete({
      endpoint: subscription.endpoint,
    });
    res.status(200).json({ message: "Subscription removed successfully" });
  } catch (error) {
    console.error("Error removing subscription:", error);
    res.status(500).json({ error: "Failed to remove subscription" });
  }
});

// app.use(express.static(path.join(__dirname, "../client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

app.get("/*", (req, res) => res.send("Index Page"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
