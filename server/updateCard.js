const { Contract, providers, BigNumber } = require("ethers");
const abi = require("./CardexV1.json");
const axios = require("axios");

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyKey = process.env.ALCHEMY_KEY;
const web3 = createAlchemyWeb3(alchemyKey);

// CardexV1 address on Base Sepolia
const CONTRACT_ADDR = process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR;

// CardexV1 contract instance
const contract = new web3.eth.Contract(abi, CONTRACT_ADDR);

// Define the card schema
const cardSchema = new mongoose.Schema({
  name: String,
  photo: String,
  backPhoto: String,
  uniqueId: { type: String, unique: true },
  rarity: String,
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

// Create the model
const Card = mongoose.model("Card", cardSchema);

// Define the price history schema
const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  time: { type: String, required: true },
});

// Define the prices schema
const pricesSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  priceHistory: { type: [priceHistorySchema], required: true },
});

// Create the model for the prices collection
const prices = mongoose.model("prices", pricesSchema);

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

// Define the holders schema
const holderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  shares: { type: Number, required: true },
});

// Define the cardHolders schema
const cardHolderSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  holders: { type: [holderSchema], required: true },
});

// Create the model for the card holders collection
const cardHolders = mongoose.model("cardHolders", cardHolderSchema);

// Define the activities schemas
const activitySchema = new mongoose.Schema({
  time: { type: Date, required: true },
  username: { type: String, required: true },
  isBuy: { type: Boolean, require: true },
  shares: { type: Number, required: true },
  ethAmount: { type: Number, required: true },
});

// Define the cardActivity schema
const cardActivitySchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  activity: { type: [activitySchema], required: true },
});

// Create the model for the card activities collection
const CardActivity = mongoose.model("cardActivity", cardActivitySchema);

// Function to update the info for a specific card including latest price, trend and share holders
const updateCard = async (uniqueId, newPrice, newShares) => {
  try {
    // find the card with specific uniqueId and then update it
    await Card.updateOne(
      { uniqueId: uniqueId },
      { $set: { price: newPrice, shares: newShares } }
    );

    console.log(`Card ${uniqueId} info updated`);
  } catch (err) {
    console.error(`Error updating Card ${uniqueId} info with error:  `, err);
  }
};

// Function to update the info for a specific card including different scores
const updateCardScore = async (uniqueId, shares) => {
  try {
    // find the card with specific uniqueId
    const card = await Card.findOne({ uniqueId: uniqueId });

    const cardIPOTime = new Date(card.ipoTime);
    const currentTime = new Date();

    // In production need to calculate after 3 days price stable period
    // if (currentTime - cardIPOTime > 3 * 24 * 1000 * 60 * 60) {
    let deltaScore;

    if (card.rarity === "RARE") {
      deltaScore = 6 * shares;
    } else if (card.rarity === "EPIC") {
      deltaScore = 16 * shares;
    } else if (card.rarity === "LEGEND") {
      deltaScore = 36 * shares;
    }

    const newDayScore = card.dayScore + deltaScore;

    const largestDayScoreCard = await Card.findOne()
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

    // Convert current time to US CST (Central Standard Time)
    // const cstTime = new Date(
    //   currentTime.toLocaleString("en-US", { timeZone: "America/Chicago" })
    // );

    // const currentDay = cstTime.getDay(); // 0 is Sunday, 6 is Saturday
    // const currentHour = cstTime.getHours(); // Get the hour in CST

    // let newCurrentTournamentScore = card.currentTournamentScore;

    // if (
    //   (currentDay > 0 && currentDay < 4) ||
    //   (currentDay === 4 && currentHour < 12)
    // ) {
    // const tournamentStartDays = currentDay - 1;

    // newCurrentTournamentScore = Number(
    //   (card.avgTournamentScore * tournamentStartDays + newDailyScore) /
    //     (tournamentStartDays + 1)
    // ).toFixed(2);
    // }

    await Card.updateOne(
      { uniqueId: uniqueId },
      {
        $set: {
          currentScore: newCurrentScore,
          dayScore: newDayScore,
        },
      }
    );
    // }

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

// Function to update or create a price history
const updateOrCreatePrice = async (uniqueId, newPrice, newTime) => {
  try {
    const existingDocument = await prices.findOne({ uniqueId });

    if (existingDocument) {
      // If the document exists, update the priceHistory
      existingDocument.priceHistory.push({ price: newPrice, time: newTime });

      // Check if priceHistory length exceeds 100
      // if (existingDocument.priceHistory.length > 100) {
      //   // Remove excess elements from the beginning
      //   existingDocument.priceHistory.splice(
      //     0,
      //     existingDocument.priceHistory.length - 100
      //   );
      // }

      await existingDocument.save();
      console.log(`Updated priceHistory for Card ${uniqueId}`);
    } else {
      // If the document does not exist, create a new one
      const newDocument = new prices({
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

// Function to update or create a card holder
const updateOrCreateCardHolder = async (uniqueId, username, shares) => {
  try {
    const existingCardHolder = await cardHolders.findOne({ uniqueId });

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
      const newCardHolder = new cardHolders({
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

// Function to determine if to update card holders and card activities
const updateCardHoldersAndActivity = async (
  walletAddress,
  uniqueId,
  shares,
  isBuy,
  deltaShares,
  ethAmount
) => {
  try {
    const user = await users.findOne({ walletAddress });

    if (user && user.DID !== "0") {
      // const privyUrl = `https://auth.privy.io/api/v1/users/${user.DID}`;

      // const response = await axios.get(privyUrl, {
      //   headers: {
      //     Authorization: `Basic ${btoa(
      //       process.env.PRIVY_APP_ID + ":" + process.env.PRIVY_APP_SECRET
      //     )}`,
      //     "privy-app-id": process.env.PRIVY_APP_ID,
      //   },
      // });
      // const userTwitter = response.data.linked_accounts.find(
      //   (account) => account.type === "twitter_oauth"
      // );
      // const name = userTwitter.name;
      const username = user.username;
      // const profilePhoto = userTwitter.profile_picture_url;
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
      // const name = walletAddress.slice(0, 6);
      const username = walletAddress.slice(0, 6);
      // const profilePhoto =
      //   "https://cardsimage.s3.amazonaws.com/default/loading.jpg";
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

// Function to update or create a card activity
const updateOrCreateCardActivity = async (
  uniqueId,
  time,
  username,
  isBuy,
  shares,
  ethAmount
) => {
  try {
    const existingCardActivity = await CardActivity.findOne({ uniqueId });

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
      const newCardActivity = new CardActivity({
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

// Function to add the card shares to initial owner inventory
const updateUsersWhenIPO = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await users.findOne({ walletAddress });

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

// Note: update user related may be separated from card update in production
// Function to update a user's card inventory when buy
const updateUsersWhenBuy = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await users.findOne({ walletAddress });

    // if (!user) {
    //   // walletAddress doesn't exist in db but is buying, need to create a new record
    //   const newUser = new users({
    //     DID: "0",
    //     walletAddress: walletAddress,
    //     username: "BT",
    //     invited: false,
    //     inviteCode: "",
    //     cardInventory: [{ uniqueId: uniqueId, shares: shares }],
    //   });
    //   await newUser.save();
    //   console.log("User created successfully for Buy event: ", newUser);
    // } else {
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

// Note: update user related may be separated from card update in production
// Function to update a user's card inventory when sell
const updateUsersWhenSell = async (walletAddress, uniqueId, shares) => {
  try {
    // Find the user document corresponding to the walletAddress
    const user = await users.findOne({ walletAddress });

    // if (!user) {
    //   // walletAddress doesn't exist in db but is selling, need to create a new record
    //   const newUser = new users({
    //     DID: "0",
    //     walletAddress: walletAddress,
    //     username: "BT",
    //     invited: false,
    //     inviteCode: "",
    //     cardInventory: [{ uniqueId: uniqueId, shares: shares }],
    //   });
    //   await newUser.save();
    //   console.log("User created successfully for Sell event: ", newUser);
    // } else {
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
  const priceToBigNumber = BigNumber.from(price);
  const oneEther = BigNumber.from("1000000000000000000");
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

// function to add listener to IPOCard() event onchain so that IPOCard() event can trigger update for cards, prices and users
function addCardIPOListener() {
  console.log("Card IPO Listener Started");
  contract.events.IPOCard({}, async (error, data) => {
    if (error) {
      console.log(`Error when listening to IPO Card event: `, error);
    } else {
      try {
        const cardID = data.returnValues[0];

        const initialOwner = data.returnValues[1];

        const initialOwnerShares = data.returnValues[2];

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
          const card = new Card({
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
          const card = new Card({
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
}

// function to add listener to Trade() event onchain so that Trade() event can trigger update for cards, prices and users
function addTradeListener() {
  console.log("Trade Listener Started");
  contract.events.Trade({}, async (error, data) => {
    if (error) {
      console.log(`Error when listening to Trade event: `, error);
    } else {
      try {
        const cardID = data.returnValues[0];

        const trader = data.returnValues[1];

        const isBuy = data.returnValues[2];

        const deltaShares = data.returnValues[3];

        const ethAmount = data.returnValues[4];
        const ethAmountToBigNumber = BigNumber.from(ethAmount);
        const oneEther = BigNumber.from("1000000000000000000");
        const ethAmountInETH =
          Number(ethAmountToBigNumber.mul(10000).div(oneEther)) / 10000;

        const currentPrice = await getPrice(Number(cardID));

        const currentShareHolders = await getHolders(Number(cardID));

        // const card = await Card.findOne(
        //   { uniqueId: cardID.toString() },
        //   "lastPrice"
        // );

        updateCard(
          cardID.toString(),
          Number(currentPrice),
          Number(currentShareHolders)
        );

        const currentTime = new Date();

        updateOrCreatePrice(
          cardID.toString(),
          Number(currentPrice),
          formatDate(currentTime)
        );

        updateCardScore(cardID.toString(), Number(deltaShares));

        const currentTraderShares = await loadUserShares(
          Number(cardID),
          trader
        );

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
      } catch (error) {
        console.log(
          `Error when listening to Trade event for card and try to update for: `,
          error
        );
      }
    }
  });
}

// function to add listener to Buy() event onchain so that Buy() event can trigger update for cards, prices and users
function addBuyListener() {
  console.log("Buy Listener Started");
  contract.events.Buy({}, async (error, data) => {
    if (error) {
      console.log(`Error when listening to Buy event: `, error);
    } else {
      try {
        const cardID = data.returnValues[0];

        const buyer = data.returnValues[1];

        const currentPrice = await getPrice(Number(cardID));

        const currentShareHolders = await getHolders(Number(cardID));

        const card = await Card.findOne(
          { uniqueId: cardID.toString() },
          "lastPrice"
        );

        updateCard(
          cardID.toString(),
          Number(currentPrice),
          Number(currentShareHolders)
        );

        const currentTime = new Date();

        updateOrCreatePrice(
          cardID.toString(),
          Number(currentPrice),
          formatDate(currentTime)
        );

        const currentBuyerShares = await loadUserShares(Number(cardID), buyer);

        updateUsersWhenBuy(
          buyer.toString(),
          cardID.toString(),
          Number(currentBuyerShares)
        );
      } catch (error) {
        console.log(
          `Error when listening to Buy event and try to update: `,
          error
        );
      }
    }
  });
}

// function to add listener to Sell() event onchain so that Sell() event can trigger update for cards, prices and users
function addSellListener() {
  console.log("Sell Listener Started");
  contract.events.Sell({}, async (error, data) => {
    if (error) {
      console.log(`Error when listening to Sell event: `, error);
    } else {
      try {
        const cardID = data.returnValues[0];

        const seller = data.returnValues[1];

        const currentPrice = await getPrice(Number(cardID.toString()));

        const currentShareHolders = await getHolders(Number(cardID.toString()));

        const card = await Card.findOne(
          { uniqueId: cardID.toString() },
          "lastPrice"
        );

        updateCard(
          cardID.toString(),
          Number(currentPrice),
          Number(currentShareHolders)
        );

        const currentTime = new Date();

        updateOrCreatePrice(
          cardID.toString(),
          Number(currentPrice),
          formatDate(currentTime)
        );

        const currentSellerShares = await loadUserShares(
          Number(cardID),
          seller
        );

        updateUsersWhenSell(
          seller.toString(),
          cardID.toString(),
          Number(currentSellerShares)
        );
      } catch (error) {
        console.log(
          `Error when listening to Sell event and try to update: `,
          error
        );
      }
    }
  });
}

// addBuyListener();
// addSellListener();

addCardIPOListener();

addTradeListener();

// TODO: Need to also create card and update/create user inventory for IPOCard event
