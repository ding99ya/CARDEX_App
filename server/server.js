const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { fileURLToPath } = require("url");
const CardModel = require("./models/CardModel.js");
const PriceModel = require("./models/PriceModel.js");
const UserModel = require("./models/UserModel.js");
const LeaderboardModel = require("./models/LeaderboardModel.js");
const InviteCodeModel = require("./models/InviteCodeModel.js");
const PresaleUserModel = require("./models/PresaleUserModel.js");
const path = require("path");
const axios = require("axios");
const { PrivyClient } = require("@privy-io/server-auth");

require("dotenv").config();

const app = express();

const privy = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);

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
  const { DID, code, createdAt, lastUpdatedAt, currentUsage } = req.body;

  try {
    let inviteCode = new InviteCodeModel({
      DID: DID,
      code: code,
      createdAt: createdAt,
      lastUpdatedAt: lastUpdatedAt,
      currentUsage: currentUsage,
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
  const { DID, walletAddress, userName, paperPoints } = req.body;

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
      userName: userName,
      rank: count + 1, // Rank is the current count + 1
      paperPoints: paperPoints,
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

app.get("/api/leaderboard/containname/:userName", async (req, res) => {
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
  const { code, lastUpdatedAt, currentUsage } = req.body;

  try {
    const inviteCode = await InviteCodeModel.findOneAndUpdate(
      { code: code },
      { $set: { lastUpdatedAt: lastUpdatedAt, currentUsage: currentUsage } },
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

// app.use(express.static(path.join(__dirname, "../client/build")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/build", "index.html"));
// });

app.get("/*", (req, res) => res.send("Index Page"));

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
