const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const CardModel = require("./models/CardModel.js");
const PriceModel = require("./models/PriceModel.js");
const UserModel = require("./models/UserModel.js");
const LeaderboardModel = require("./models/LeaderboardModel.js");
const InviteCodeModel = require("./models/inviteCodeModel.js");
const PresaleUserModel = require("./models/PresaleUserModel.js");
const CardActivityModel = require("./models/CardActivityModel.js");
const CardHolderModel = require("./models/CardHolderModel.js");
const CardHistoryRankModel = require("./models/CardHistoryRankModel.js");
const CardHistoryScoreModel = require("./models/CardHistoryScoreModel.js");
const CTournamentModel = require("./models/CTournamentModel.js");
const PTournamentModel = require("./models/PTournamentModel.js");
const SubscriptionModel = require("./models/SubscriptionModel.js");
const WaitlistUserModel = require("./models/WaitlistUserModel.js");

const ethers = require("ethers");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

mongoose.connect(process.env.MONGO_URL);

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const abi = require("./CardexV1.json");
const alchemyKey = process.env.ABSTRACT_ALCHEMY_KEY;
const web3 = createAlchemyWeb3(alchemyKey);

// CardexV1 address on Base Sepolia
const CONTRACT_ADDR = process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR;

// CardexV1 contract instance
const contract = new web3.eth.Contract(abi, CONTRACT_ADDR);

const allowedIPs = ["54.236.136.17", "34.237.24.169"]; // Alchemy's IPs

const updateCard = async (uniqueId, newPrice, newShares) => {
  try {
    await CardModel.updateOne(
      { uniqueId: uniqueId },
      { $set: { price: newPrice, shares: newShares } }
    );

    console.log(`Card ${uniqueId} info updated`);
  } catch (err) {
    console.error(`Error updating Card ${uniqueId} info with error:  `, err);
  }
};

const updateCardScore = async (uniqueId, shares) => {
  try {
    const card = await CardModel.findOne({ uniqueId: uniqueId });

    const cardIPOTime = new Date(card.ipoTime);
    const currentTime = new Date();

    let deltaScore;

    if (card.rarity === "COMMON") {
      deltaScore = 2 * shares;
    } else if (card.rarity === "RARE") {
      deltaScore = 6 * shares;
    } else if (card.rarity === "EPIC") {
      deltaScore = 16 * shares;
    } else if (card.rarity === "LEGEND") {
      deltaScore = 36 * shares;
    }

    const newDayScore = card.dayScore + deltaScore;

    const largestDayScoreCard = await CardModel.findOne()
      .sort({ dayScore: -1 })
      .select("dayScore -_id")
      .lean();

    let largestDayScore = largestDayScoreCard.dayScore;

    largestDayScore =
      newDayScore > largestDayScore ? newDayScore : largestDayScore;

    const modifiedDayScore = Math.floor((newDayScore * 100) / largestDayScore);

    const differenceInDays = Math.floor(
      (currentTime - cardIPOTime) / (24 * 1000 * 60 * 60)
    );

    const newCurrentScore = Math.floor(
      Number(
        (card.avgScore * differenceInDays + modifiedDayScore) /
          (differenceInDays + 1)
      )
    );

    await CardModel.updateOne(
      { uniqueId: uniqueId },
      {
        $set: {
          currentScore: newCurrentScore,
          dayScore: newDayScore,
        },
      }
    );

    console.log(`Card ${uniqueId} score updated`);
  } catch (err) {
    console.error(`Error updating Card ${uniqueId} score with error:  `, err);
  }
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const updateOrCreatePrice = async (uniqueId, newPrice, newTime) => {
  try {
    const existingDocument = await PriceModel.findOne({ uniqueId });

    if (existingDocument) {
      // If the document exists, update the priceHistory
      existingDocument.priceHistory.push({ price: newPrice, time: newTime });

      // Check if priceHistory length exceeds 250
      if (existingDocument.priceHistory.length > 250) {
        // Remove excess elements from the beginning
        existingDocument.priceHistory.splice(
          0,
          existingDocument.priceHistory.length - 250
        );
      }

      await existingDocument.save();
      console.log(`Updated priceHistory for Card ${uniqueId}`);
    } else {
      // If the document does not exist, create a new one
      const newDocument = new PriceModel({
        uniqueId,
        priceHistory: [{ price: newPrice, time: newTime }],
      });
      await newDocument.save();
      console.log(`priceHistory created for Card ${uniqueId}`);
    }
  } catch (err) {
    console.error(
      `Error updating or creating priceHistory for Card ${uniqueId} with error: `,
      err
    );
  }
};

const updateOrCreateCardHolder = async (uniqueId, username, shares) => {
  try {
    const existingCardHolder = await CardHolderModel.findOne({ uniqueId });

    if (existingCardHolder) {
      // Find the index of the holder with the given username
      const holderIndex = existingCardHolder.holders.findIndex(
        (holder) => holder.username === username
      );
      if (holderIndex !== -1) {
        if (shares === 0) {
          // If shares is 0, remove the holder
          existingCardHolder.holders.splice(holderIndex, 1);
          console.log(`Holder with username ${username} removed successfully`);
        } else {
          // If the holder exists, update the shares
          existingCardHolder.holders[holderIndex].shares = shares;
        }
      } else {
        // If the holder does not exist, add a new holder
        if (shares !== 0) {
          existingCardHolder.holders.push({
            username,
            shares,
          });
        }
      }

      // Save the updated document
      await existingCardHolder.save();
      console.log("Holder updated successfully");
    } else {
      // If the document does not exist, create a new one
      const newCardHolder = new CardHolderModel({
        uniqueId,
        holders: [
          {
            username: username,
            shares: shares,
          },
        ],
      });
      await newCardHolder.save();
      console.log(`cardHolder created for Card ${uniqueId}`);
    }
  } catch (err) {
    console.error(
      `Error updating or creating cardHolder for Card ${uniqueId} with error: `,
      err
    );
  }
};

const updateCardHoldersAndActivity = async (
  walletAddress,
  uniqueId,
  shares,
  isBuy,
  deltaShares,
  ethAmount
) => {
  try {
    const user = await UserModel.findOne({ walletAddress });

    if (user && user.DID !== "0") {
      const username = user.username;
      const time = new Date();
      updateOrCreateCardHolder(uniqueId, username, shares);
      updateOrCreateCardActivity(
        uniqueId,
        time,
        username,
        isBuy,
        deltaShares,
        ethAmount
      );
    } else {
      const username = walletAddress.slice(0, 6);
      const time = new Date();
      updateOrCreateCardHolder(uniqueId, username, shares);
      updateOrCreateCardActivity(
        uniqueId,
        time,
        username,
        isBuy,
        deltaShares,
        ethAmount
      );
    }
  } catch (error) {
    console.error(error);
  }
};

const updateOrCreateCardActivity = async (
  uniqueId,
  time,
  username,
  isBuy,
  shares,
  ethAmount
) => {
  try {
    const existingCardActivity = await CardActivityModel.findOne({ uniqueId });

    if (existingCardActivity) {
      // If the document exists, update the activity history
      existingCardActivity.activity.unshift({
        time: time,
        username: username,
        isBuy: isBuy,
        shares: shares,
        ethAmount: ethAmount,
      });

      await existingCardActivity.save();
      console.log(`Updated card activity for Card ${uniqueId}`);
    } else {
      // If the document does not exist, create a new one
      const newCardActivity = new CardActivityModel({
        uniqueId,
        activity: [
          {
            time: time,
            username: username,
            isBuy: isBuy,
            shares: shares,
            ethAmount: ethAmount,
          },
        ],
      });
      await newCardActivity.save();
      console.log(`cardActivity created for Card ${uniqueId}`);
    }
  } catch (err) {
    console.error(
      `Error updating or creating cardActivity for Card ${uniqueId} with error: `,
      err
    );
  }
};

const updateUsersWhenIPO = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await UserModel.findOne({ walletAddress });

    if (!user) {
      console.log("This user should already exist", walletAddress);
    } else {
      // add the new card to the inventory
      user.cardInventory.push({ uniqueId, shares });
      await user.save();
      console.log(
        `Added Card ${uniqueId} to user's ${walletAddress} inventory`
      );
    }
  } catch (error) {
    console.error(
      `Error updatiing user's ${walletAddress} inventory for Card ${uniqueId} with error: `,
      error
    );
  }
};

const updateUsersWhenBuy = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await UserModel.findOne({ walletAddress });

    if (user) {
      // Find the card inventory corresponding to the uniqueId
      const cardIndex = user.cardInventory.findIndex(
        (card) => card.uniqueId === uniqueId
      );

      if (cardIndex === -1) {
        // If buying and card doesn't exist, add the new card to the inventory
        user.cardInventory.push({ uniqueId, shares });
        await user.save();
        console.log(
          `Added Card ${uniqueId} to user's ${walletAddress} inventory`
        );
      } else {
        // Increase users specific card shares
        user.cardInventory[cardIndex].shares = shares;

        // Save the updated user document
        await user.save();
        console.log(
          `Updated Card ${uniqueId} for user's ${walletAddress} inventory`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error updating user's ${walletAddress} inventory for Card ${uniqueId} with error: `,
      error
    );
  }
};

const updateUsersWhenSell = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await UserModel.findOne({ walletAddress });

    if (user) {
      // Find the card inventory corresponding to the uniqueId
      const cardIndex = user.cardInventory.findIndex(
        (card) => card.uniqueId === uniqueId
      );

      if (cardIndex === -1) {
        // If selling and card doesn't exist, add the new card to the inventory
        if (shares > 0) {
          user.cardInventory.push({ uniqueId, shares });
          await user.save();
        }

        console.log(
          `Added Card ${uniqueId} to user's ${walletAddress} inventory`
        );
      } else {
        // Decrease users specific card shares
        user.cardInventory[cardIndex].shares = shares;

        if (user.cardInventory[cardIndex].shares === 0) {
          user.cardInventory.splice(cardIndex, 1);
          console.log(
            `Removed Card ${uniqueId} from user's ${walletAddress} inventory as shares dropped to 0`
          );
        }

        // Save the updated user document
        await user.save();
        console.log(
          `Updated Card ${uniqueId} for user's ${walletAddress} inventory`
        );
      }
    }
  } catch (error) {
    console.error(
      `Error updating user's ${walletAddress} inventory for Card ${uniqueId} with error: `,
      error
    );
  }
};

// Function to fetch card
const loadCard = async (id) => {
  const card = await contract.methods.cards(id).call();
  return card;
};

// Function to fetch current card share price from blockchain
const loadCurrentPrice = async (id) => {
  const initialPrice = await contract.methods.getBuyPrice(id, 1).call();
  return initialPrice.toString();
};

// Function to load current shares being bought for a specific card
const loadShareHolders = async (id) => {
  const shareHolders = await contract.methods.boughtShares(id).call();
  return shareHolders.toString();
};

// Function to fetch user's current shares from blockchain
const loadUserShares = async (id, address) => {
  const userShares = await contract.methods.sharesBalance(id, address).call();
  return userShares.toString();
};

// Function to get card information
const getCard = async (id) => {
  const card = await loadCard(id);
  return card;
};

// Function to transfer current price to a format with 3 decimals (X.XXX ETH)
const getPrice = async (id) => {
  const price = await loadCurrentPrice(id);
  const priceToBigNumber = ethers.BigNumber.from(price);
  const oneEther = ethers.BigNumber.from("1000000000000000000");
  const priceInETH = Number(
    Number(priceToBigNumber.mul(1000).div(oneEther)) / 1000
  ).toFixed(3);

  return priceInETH;
};

// Function to get shares being bought
const getHolders = async (id) => {
  const holders = await loadShareHolders(id);
  return holders;
};

// Function to get Up/Down trend of a card in percentage compared to the price from last day
const getTrend = (currentPrice, lastPrice) => {
  const priceTrend = (((currentPrice - lastPrice) / lastPrice) * 100).toFixed(
    2
  );
  return Number(priceTrend).toFixed(2);
};

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  const eventData = req.body;

  const decodedEventHash = ethers.utils.defaultAbiCoder.decode(
    ["bytes32"],
    eventData.event.data.block.logs[0].topics[0]
  );
  console.log("Event Hash: ", decodedEventHash[0].toString());
  const eventHash = decodedEventHash[0].toString();

  if (
    eventHash ===
    "0x1332ffcaf35cfbfc3f485e5b0d84261a888899c9313312701f472f8882ae2d61"
  ) {
    try {
      const xForwardedFor = req.headers["x-forwarded-for"];
      const clientIP = xForwardedFor
        ? xForwardedFor.split(",")[0].trim()
        : req.ip;
      const requestIP = req.ip;

      if (!allowedIPs.includes(clientIP)) {
        console.log("Unauthorized IP:", clientIP);
        return res.status(403).send("Forbidden: Unauthorized IP");
      }

      const types = ["bool", "uint256", "uint256"];
      const decoded = ethers.utils.defaultAbiCoder.decode(
        types,
        eventData.event.data.block.logs[0].data
      );

      const isBuy = decoded[0];
      const sharesAmount = decoded[1].toNumber();
      const price = decoded[2];
      const priceToBigNumber = ethers.BigNumber.from(price);
      const oneEther = ethers.BigNumber.from("1000000000000000000");
      const priceInETH = Number(
        Number(priceToBigNumber.mul(1000).div(oneEther)) / 1000
      ).toFixed(3);

      console.log("isBuy:  ", isBuy);
      console.log("sharesAmount:  ", sharesAmount);
      console.log("price:  ", priceInETH);

      const decodedCardID = ethers.utils.defaultAbiCoder.decode(
        ["uint256"],
        eventData.event.data.block.logs[0].topics[1]
      );
      console.log("cardID: ", decodedCardID[0].toNumber().toString());
      const cardID = decodedCardID[0].toNumber().toString();

      const decodedTrader = ethers.utils.defaultAbiCoder.decode(
        ["address"],
        eventData.event.data.block.logs[0].topics[2]
      );
      console.log("trader: ", decodedTrader[0].toString());
      const trader = decodedTrader[0].toString();

      const deltaShares = sharesAmount;

      const ethAmount = priceToBigNumber;
      const ethAmountInETH = priceInETH;

      const currentPrice = await getPrice(Number(cardID));

      const currentShareHolders = await getHolders(Number(cardID));

      updateCard(
        cardID.toString(),
        Number(currentPrice),
        Number(currentShareHolders)
      );

      const updatedCard = {
        uniqueId: cardID.toString(),
        price: Number(currentPrice),
        shares: Number(currentShareHolders),
      };

      io.emit("cardUpdate", updatedCard);

      const currentTime = new Date();

      updateOrCreatePrice(
        cardID.toString(),
        Number(currentPrice),
        formatDate(currentTime)
      );

      updateCardScore(cardID.toString(), Number(deltaShares));

      const currentTraderShares = await loadUserShares(Number(cardID), trader);

      if (isBuy) {
        updateUsersWhenBuy(
          trader.toString(),
          cardID.toString(),
          Number(currentTraderShares)
        );
      } else {
        updateUsersWhenSell(
          trader.toString(),
          cardID.toString(),
          Number(currentTraderShares)
        );
      }

      updateCardHoldersAndActivity(
        trader.toString(),
        cardID.toString(),
        Number(currentTraderShares),
        isBuy,
        deltaShares,
        ethAmountInETH
      );

      res.status(200).send("Event processed successfully");
    } catch (error) {
      console.error("Error processing event:", error);
      res.status(500).send("Error processing event");
    }
  } else if (
    eventHash ===
    "0x006e8a49f8b8579e60450c0b095b7af769a48ccbf9c487c4bda1d5c7911a4cff"
  ) {
    try {
      const decodedCardID = ethers.utils.defaultAbiCoder.decode(
        ["uint256"],
        eventData.event.data.block.logs[0].topics[1]
      );
      const cardID = decodedCardID[0].toNumber().toString();

      const types = ["address", "uint256"];
      const decoded = ethers.utils.defaultAbiCoder.decode(
        types,
        eventData.event.data.block.logs[0].data
      );

      const initialOwner = decoded[0].toString();
      const initialOwnerShares = decoded[1].toNumber();

      const newIPOCard = await getCard(Number(cardID));

      console.log(initialOwner);
      console.log(initialOwnerShares);
      console.log(newIPOCard);
      console.log(newIPOCard.cardName.toString());
      console.log(newIPOCard.category.toString());
      console.log(newIPOCard.rarity);
      console.log(newIPOCard.frontImage.toString());
      console.log(newIPOCard.backImage.toString());
      console.log(newIPOCard.tradeStage);

      let rarity;

      if (Number(newIPOCard.rarity) === 0) {
        rarity = "COMMON";
      } else if (Number(newIPOCard.rarity) === 1) {
        rarity = "RARE";
      } else if (Number(newIPOCard.rarity) === 2) {
        rarity = "EPIC";
      } else if (Number(newIPOCard.rarity) === 3) {
        rarity = "LEGEND";
      } else {
        rarity = "COMMON";
      }

      const now = new Date();

      const price = await getPrice(Number(cardID));

      if (Number(newIPOCard.tradeStage) === 1) {
        const card = new CardModel({
          name: newIPOCard.cardName.toString(),
          photo: newIPOCard.frontImage.toString(),
          backPhoto: newIPOCard.backImage.toString(),
          uniqueId: cardID.toString(),
          rarity: rarity,
          ipoTime: now.toUTCString(),
          price: Number(price),
          category: newIPOCard.category.toString(),
          shares: 0,
          currentScore: 0,
          avgScore: 0,
          currentTournamentScore: 0,
          avgTournamentScore: 0,
          dayScore: 0,
        });
        await card.save();
      } else {
        const card = new CardModel({
          name: newIPOCard.cardName.toString(),
          photo: newIPOCard.frontImage.toString(),
          backPhoto: newIPOCard.backImage.toString(),
          uniqueId: cardID.toString(),
          rarity: rarity,
          ipoTime: now.toUTCString(),
          price: Number(price),
          category: "presale",
          shares: 0,
          currentScore: 0,
          avgScore: 0,
          currentTournamentScore: 0,
          avgTournamentScore: 0,
          dayScore: 0,
        });
        await card.save();
      }

      updateUsersWhenIPO(
        initialOwner,
        cardID.toString(),
        Number(initialOwnerShares)
      );
    } catch (error) {
      console.log(
        `Error when listening to IPOCard event for card and try to update for: `,
        error
      );
    }
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
