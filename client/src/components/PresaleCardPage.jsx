import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import abi from "../CardexV1.json";
import axios from "axios";
import classNames from "classnames";
import { encodeFunctionData } from "viem";
import PresaleBuyModal from "./PresaleBuyModal.jsx";
import PresaleIneligibleModal from "./PresaleIneligibleModal.jsx";
import { useNavigation } from "./NavigationContext";
import PresaleCard from "./PresaleCard.png";
import ComingSoon from "./ComingSoon.png";
import "../index.css";

const ethers = require("ethers");
const { BigNumber } = require("bignumber.js");

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

// CardexV1 contract instance
const contract = new web3.eth.Contract(
  abi,
  process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR
);

function PresaleCardPage({ category }) {
  const { sendTransaction, user } = usePrivy();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();

  const { goBack } = useNavigation();

  // cardsResponse will be set to the response from backend
  // Once cardsResponse is set it will trigger fetching price, share holders, etc... and update cards array
  const [cardsResponse, setCardsResponse] = useState([]);

  const [isEligibleUser, setIsEligibleUser] = useState(false);

  const [userOwnedCards, setUserOwnedCards] = useState([]);

  // cards array includes info about a card, it will be used to render the page
  const [cards, setCards] = useState([]);

  const [canRegister, setCanRegister] = useState(false);
  const [canPresale, setCanPresale] = useState(false);

  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [currentBuyCardId, setCurrentBuyCardId] = useState("");
  const [currentBuyCardName, setCurrentBuyCardName] = useState("");
  const [currentBuyCardPhoto, setCurrentBuyCardPhoto] = useState("");

  const [openPresaleIneligibleModal, setOpenPresaleIneligibleModal] =
    useState(false);

  // hasMounted variable is used to ensure the useEffect relies on cardsResponse is only triggered once
  const hasMounted = useRef(false);

  const navigate = useNavigate();

  // function to add listener to Buy() event onchain so that Buy() event can trigger price, share holders update
  function addBuyListener() {
    const eventSubscription = contract.events.Buy({}, async (error, data) => {
      if (error) {
        console.log(error);
      } else {
        const cardID = data.returnValues[0];

        const index = cards.findIndex(
          (card) => card.uniqueId === cardID.toString()
        );

        if (index !== -1) {
          const q = Math.pow(
            cards[index].ipoSharesPrice / cards[index].initialSharesPrice,
            1 / cards[index].ipoShares
          );
          const currentHolders = data.returnValues[4];

          const a = cards[index].initialSharesPrice;
          const b = Math.pow(q, Number(currentHolders) + 1);
          const c = Math.pow(q, Number(currentHolders));
          const d = q - 1;

          const currentPrice = ((a * (b - c)) / d).toFixed(4);
          const currentTrend = getTrend(currentPrice, cards[index].lastPrice);

          setCards((prevCards) =>
            prevCards.map((card) =>
              card.uniqueId === cardID.toString()
                ? {
                    ...card,
                    price: currentPrice,
                    trend: currentTrend,
                    shares: Number(currentHolders),
                  }
                : card
            )
          );
        }
      }
    });

    return eventSubscription;
  }

  // function to add listener to Sell() event onchain so that Sell() event can trigger price, share holders update
  function addSellListener() {
    const eventSubscription = contract.events.Sell({}, async (error, data) => {
      if (error) {
        console.log(error);
      } else {
        const cardID = data.returnValues[0];

        const index = cards.findIndex(
          (card) => card.uniqueId === cardID.toString()
        );

        if (index !== -1) {
          const q = Math.pow(
            cards[index].ipoSharesPrice / cards[index].initialSharesPrice,
            1 / cards[index].ipoShares
          );
          const currentHolders = data.returnValues[4];

          const a = cards[index].initialSharesPrice;
          const b = Math.pow(q, Number(currentHolders) + 1);
          const c = Math.pow(q, Number(currentHolders));
          const d = q - 1;

          const currentPrice = ((a * (b - c)) / d).toFixed(4);
          const currentTrend = getTrend(currentPrice, cards[index].lastPrice);

          setCards((prevCards) =>
            prevCards.map((card) =>
              card.uniqueId === cardID.toString()
                ? {
                    ...card,
                    price: currentPrice,
                    trend: currentTrend,
                    shares: Number(currentHolders),
                  }
                : card
            )
          );
        }
      }
    });

    return eventSubscription;
  }

  const checkCanRegisterAndPresale = () => {
    const now = new Date();

    // Convert current time to US CST (Central Standard Time)
    const cstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );

    const currentDay = cstTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentHour = cstTime.getHours(); // Get the hour in CST

    // Check if today is Friday or Saturday and if the current time is after 2 PM for Friday
    if ((currentDay === 5 && currentHour >= 14) || currentDay === 6) {
      setCanRegister(true);
    } else {
      setCanRegister(false);
    }

    // Check if today is Sunday
    if (currentDay === 3) {
      setCanPresale(true);
    } else {
      setCanPresale(false);
    }
  };

  const checkEligibleUser = async () => {
    try {
      const presaleUserResponse = await axios.get(
        `/api/presaleusers/check-presaleuser/${embeddedWalletAddress}`
      );

      if (presaleUserResponse.data.exists) {
        console.log("You are eligible for presale!");
        setIsEligibleUser(true);
      } else {
        console.log("You are not eligible for presale!");
        setIsEligibleUser(false);
      }
    } catch (error) {
      console.error(`Error checking presale user:`, error);
    }
  };

  const checkUserShares = async () => {
    cardsResponse.map(async (card, index) => {
      const userOwnedShares = await fetchUserShares(card.uniqueId);
      console.log(userOwnedShares);
      if (Number(userOwnedShares) > 0) {
        console.log(`Own card ${card.uniqueId}`);
        setUserOwnedCards((prevOwnedCards) => [
          ...prevOwnedCards,
          card.uniqueId,
        ]);
      }
    });
  };

  useEffect(() => {
    setCards([]);
    window.scrollTo(0, 0);
    checkCanRegisterAndPresale();
  }, []);

  useEffect(() => {
    const fetchRegister = async () => {
      if (canRegister) {
        checkEligibleUser();
      }
    };
    fetchRegister();
  }, [canRegister]);

  useEffect(() => {
    const fetchPresale = async () => {
      if (canPresale) {
        try {
          const response = await axios.get(`/api/cards/category/${"presale"}`);

          setCardsResponse(response.data);
          setCards(response.data);
        } catch (error) {
          console.error(`Error fetching presale cards:`, error);
        }
      }
    };
    fetchPresale();
  }, [canPresale]);

  useEffect(() => {
    if (hasMounted.current) {
      checkEligibleUser();
      checkUserShares();
    } else {
      hasMounted.current = true;
    }
  }, [cardsResponse]);

  // Function to load current price for a specific card
  const loadCurrentPrice = async (cardId) => {
    const initialPrice = await contract.methods.getBuyPrice(cardId, 1).call();
    return initialPrice.toString();
  };

  // Function to load current shares being bought for a specific card
  const loadShareHolders = async (cardId) => {
    const shareHolders = await contract.methods.boughtShares(cardId).call();
    return shareHolders.toString();
  };

  // Function to calculate the cost to buy certain amount of shares
  const loadUserCost = async (shares) => {
    const userCost = await contract.methods
      .getBuyPriceAfterFee(Number(currentBuyCardId), shares)
      .call();
    return userCost.toString();
  };

  // Function to fetch user's current shares from blockchain
  const loadUserShares = async (cardId) => {
    const userShares = await contract.methods
      .sharesBalance(Number(cardId), embeddedWalletAddress)
      .call();
    return userShares.toString();
  };

  const fetchUserShares = async (cardId) => {
    try {
      const userShares = await loadUserShares(cardId);
      return userShares;
    } catch (error) {
      console.log(error);
    }
  };

  // A wrapper function to obtain the cost
  const fetchCost = async (shares) => {
    try {
      const userCost = await loadUserCost(shares);
      return userCost;
    } catch (error) {
      console.log(error);
    }
  };

  // Function to transfer current price to a format with 3 decimals (X.XXX ETH)
  // This method is not currently used because the price will be directly fetched from the web socket events
  // Keep it for potential future use
  const getPrice = async (cardId) => {
    const price = await loadCurrentPrice(cardId);
    const priceToBigNumber = ethers.BigNumber.from(price);
    const oneEther = ethers.BigNumber.from("1000000000000000000");
    const priceInETH = Number(priceToBigNumber.mul(1000).div(oneEther)) / 1000;

    return priceInETH;
  };

  // Function to get Up/Down trend of a card in percentage compared to the price from last day
  const getTrend = (currentPrice, lastPrice) => {
    const priceTrend = (((currentPrice - lastPrice) / lastPrice) * 100).toFixed(
      2
    );
    return priceTrend;
  };

  // Function to get shares being bought
  // This method is not currently used because the holders will be directly fetched from the web socket events
  // Keep it for potential future use
  const getHolders = async (cardId) => {
    const holders = await loadShareHolders(cardId);
    return holders;
  };

  const joinPresale = async () => {
    try {
      const fetchedLeaderboardData = await axios.get(
        `/api/leaderboard/${embeddedWalletAddress}`
      );
      if (
        fetchedLeaderboardData.data.currentPoints <
        parseInt(process.env.REACT_APP_PRESALE_POINTS)
      ) {
        // alert("Not enough points!");
        setOpenPresaleIneligibleModal(true);
        // return;
      } else {
        const updateLeaderboardResponse = await axios.patch(
          `/api/leaderboard/update`,
          {
            walletAddress: embeddedWalletAddress.toString(),
            currentPoints: parseInt(
              parseInt(fetchedLeaderboardData.data.currentPoints) -
                parseInt(process.env.REACT_APP_PRESALE_POINTS)
            ),
          }
        );

        const updatePresaleResponse = await axios.post(`/api/presaleusers`, {
          walletAddress: embeddedWalletAddress.toString(),
        });

        setIsEligibleUser(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to buy certain amount of shares
  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    const preSaleNonce = await contract.methods.preSaleNonce().call();

    const messageHash = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ["address", "uint256", "uint256", "uint256"],
        [
          embeddedWalletAddress.toString(),
          currentBuyCardId.toString(),
          shares.toString(),
          preSaleNonce.toString(),
        ]
      )
    );

    const { r, s, v } = web3.eth.accounts.sign(
      messageHash,
      process.env.REACT_APP_PRESALE_SIGNER_KEY
    );

    const data = encodeFunctionData({
      abi: abi,
      functionName: "buyPreSaleShares",
      args: [currentBuyCardId, parseInt(shares), v, r, s],
    });

    const transaction = {
      to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
      chainId: 84532,
      data: data,
      value: ethers.BigNumber.from(value).toHexString(),
    };

    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const txReceipt = await sendTransaction(transaction, buyUiConfig);
      setUserOwnedCards((prevOwnedCards) => [
        ...prevOwnedCards,
        currentBuyCardId.toString(),
      ]);
    } catch (error) {
      console.log(error);
    }

    setOpenBuyModal(false);
  };

  // Function to navigate to card detail page, pass the state so that card detail page can back to this page
  const handleCardClick = (card) => {
    navigate(`/cards/${card.uniqueId}`, {
      state: { from: location.pathname },
    });
  };

  const handleBackClick = () => {
    navigate(`/market`);
  };

  return (
    <div
      className={`min-h-screen px-10 ${
        cards.length === 0 ? "bg-white" : "bg-gray-100"
      }`}
    >
      <div className="flex flex-row items-center justify-between space-x-2 px-2 pt-2 lg:mx-12">
        <span
          // onClick={() => handleBackClick()}
          onClick={goBack}
          className="cursor-pointer inline-block text-black py-2 mt-3 mb-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
      </div>

      {cards.length === 0 ? (
        // Show the "Coming Soon" image when there are no cards
        <div className="flex flex-col justify-center items-center w-full mt-20 lg:mt-0">
          <img
            src={ComingSoon}
            alt="Coming Soon"
            className="w-full lg:w-1/2 h-auto mb-4"
          />
          {canRegister && (
            <button
              onClick={() => joinPresale()}
              className={classNames(
                "w-full lg:w-1/2 px-4 py-2 font-bold rounded-full",
                {
                  "bg-blue-400 text-white hover:bg-blue-500 hover:text-white":
                    !isEligibleUser,
                  "bg-blue-200 text-gray-200": isEligibleUser,
                }
              )}
              disabled={isEligibleUser}
            >
              {isEligibleUser
                ? "Already Join Presale"
                : `Join Presale with ${process.env.REACT_APP_PRESALE_POINTS} Pts`}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-10 sm:px-2">
          {cards.map((card, index) => (
            <div
              key={card.uniqueId}
              id={`card${card.uniqueId}`}
              className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg lg:shadow-md overflow-hidden transition duration-300 ease-in-out group"
              style={{
                borderTopLeftRadius: "1.25rem",
                borderBottomLeftRadius: "1.25rem",
                borderTopRightRadius: "1.25rem",
                borderBottomRightRadius: "1.25rem",
              }}
            >
              <div className="flex justify-center items-center relative">
                <img
                  src={PresaleCard}
                  alt={card.name}
                  className="w-1/2 object-contain mt-6 transition duration-300"
                  style={{ aspectRatio: "2 / 3" }}
                />
              </div>
              <div className="mt-2 mb-1 text-center px-4">
                <span
                  className="w-full font-helvetica-neue text-sm font-bold"
                  style={{
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    whiteSpace: "normal",
                  }}
                >
                  Presale
                </span>
              </div>

              <div className="p-2 text-center w-full">
                <div className="flex justify-end w-full px-2">
                  <span
                    className={`text-xs font-helvetica inline-block px-4 py-1 bg-sky-300 text-white font-bold rounded-full text-center`}
                  >
                    ???
                  </span>
                </div>
                <div className="flex justify-between w-full px-2 mt-1">
                  <span className="text-sm font-helvetica">Price:</span>
                  <span className="text-sm font-helvetica">? ETH</span>
                </div>
                <div className="flex justify-between w-full px-2 mt-1">
                  <span className="text-sm font-helvetica">Holders:</span>
                  <span className="text-sm font-helvetica">?</span>
                </div>
              </div>
              {isEligibleUser ? (
                <div className="flex justify-center items-center w-full relative">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setCurrentBuyCardId(card.uniqueId);
                      setCurrentBuyCardName("Unknown Presale");
                      setCurrentBuyCardPhoto(card.photo);
                      setOpenBuyModal(true);
                    }}
                    disabled={userOwnedCards.includes(card.uniqueId)}
                    className={`w-full font-bold px-4 py-2 mx-4 mb-2 rounded-full ${
                      userOwnedCards.includes(card.uniqueId)
                        ? "bg-blue-200 text-white"
                        : "bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                    }`}
                  >
                    {userOwnedCards.includes(card.uniqueId)
                      ? "Own 1/1"
                      : "Buy 1/1"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-center items-center w-full relative">
                  <button
                    disabled={true}
                    className="w-full bg-blue-200 text-white font-bold px-4 py-2 mx-4 mb-2 rounded-full"
                  >
                    Ineligible
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Buy Modal */}
      {openBuyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <PresaleBuyModal
            open={openBuyModal}
            onClose={() => {
              setOpenBuyModal(false);
              setCurrentBuyCardId("");
              setCurrentBuyCardName("");
              setCurrentBuyCardPhoto("");
            }}
            buy={buy}
            fetchCost={fetchCost}
            cardName={currentBuyCardName}
            cardPhoto={currentBuyCardPhoto}
            className="z-60"
          />
        </div>
      )}

      {/* Presale Ineligible Modal */}
      {openPresaleIneligibleModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <PresaleIneligibleModal
            open={openPresaleIneligibleModal}
            onClose={() => {
              setOpenPresaleIneligibleModal(false);
            }}
            className="z-60"
          />
        </div>
      )}
    </div>
  );
}

export default PresaleCardPage;
