import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import abi from "../CardexV1.json";
import axios from "axios";
import io from "socket.io-client";
import { encodeFunctionData } from "viem";
import BuyModal from "./BuyModal.jsx";
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

const socket = io("https://cardex-backend-api-6c90240ece64.herokuapp.com/");

function CardPage({ category }) {
  const { sendTransaction, user } = usePrivy();

  const location = useLocation();

  // cardsResponse will be set to the response from backend
  // Once cardsResponse is set it will trigger fetching price, share holders, etc... and update cards array
  const [cardsResponse, setCardsResponse] = useState([]);

  // cards array includes info about a card, it will be used to render the page
  const [cards, setCards] = useState([]);

  // selectedSort be used to determine which sort method is currently being used
  const [selectedSort, setSelectedSort] = useState("ipoTime" + false);

  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [currentBuyCardId, setCurrentBuyCardId] = useState("");
  const [currentBuyCardName, setCurrentBuyCardName] = useState("");
  const [currentBuyCardPhoto, setCurrentBuyCardPhoto] = useState("");

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

  function addWebSocketListener() {
    socket.on("cardUpdate", (updatedCard) => {
      const cardID = updatedCard.uniqueId;
      console.log(cardID);

      const index = cards.findIndex(
        (card) => card.uniqueId === cardID.toString()
      );
      console.log(index);

      if (index !== -1) {
        const currentHolders = Number(updatedCard.shares);
        console.log(currentHolders);

        const currentPrice = Number(updatedCard.price);
        console.log(currentPrice);
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

      // socket.on("connect", () => {
      //   console.log("Connected to WebSocket server");
      // });

      // socket.on("disconnect", () => {
      //   console.log("Disconnected from WebSocket server");
      // });
    });
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

  useEffect(() => {
    setCards([
      // Initialized cards array to make the HTML render to default format
      {
        name: "Card 1",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "1",
        price: 0,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 2",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "2",
        price: 0,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 3",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "3",
        price: 0,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 4",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "4",
        price: 0,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
    ]);

    window.scrollTo(0, 0);

    // Fetch cards array and render the cards name, image...etc
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/cards/category/${category}`);

        setCardsResponse(response.data);
        setCards(response.data);
      } catch (error) {
        console.error(`Error fetching ${category} cards:`, error);
      }
    };
    fetchData();
  }, []);

  // useEffect(() => {
  //   if (hasMounted.current) {
  //     // Add Buy/Sell event listener
  //     const buyEventSubscription = addBuyListener();
  //     const sellEventSubscription = addSellListener();

  //     return () => {
  //       buyEventSubscription.unsubscribe((error, success) => {
  //         if (success) {
  //           console.log("Buy event successfully unsubscribed!");
  //         }
  //       });
  //       sellEventSubscription.unsubscribe((error, success) => {
  //         if (success) {
  //           console.log("Sell event successfully unsubscribed!");
  //         }
  //       });
  //     };
  //   } else {
  //     hasMounted.current = true;
  //   }
  // }, [cardsResponse]);

  useEffect(() => {
    if (hasMounted.current) {
      // Add Buy/Sell event listener
      addWebSocketListener();
      console.log("Web Socket event added!");

      return () => {
        socket.off("cardUpdate");
        console.log("Event successfully unsubscribed!");
      };
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
  // This method is not currently used because the price will be fetched from backend and updated per calculations
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
  // This method is not currently used because the holders will be fetched from backend and updated per calculations
  // Keep it for potential future use
  const getHolders = async (cardId) => {
    const holders = await loadShareHolders(cardId);
    return holders;
  };

  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "buyShares",
      args: [currentBuyCardId, parseInt(shares)],
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

  // Function triggered when remove sort button is clicked, will reset the order based on card id
  const handleRemoveSort = () => {
    const sortedCards = [...cards].sort(
      (a, b) => Number(a.uniqueId) - Number(b.uniqueId)
    );
    setCards(sortedCards);
  };

  // Function to sort the cards based on certain rule
  function sortCards(by, ascending = true) {
    if (by === "none") {
      handleRemoveSort();
      setSelectedSort(null);
    } else {
      const sortedCards = [...cards].sort((a, b) => {
        if (by === "ipoTime") {
          return ascending
            ? new Date(a.ipoTime) - new Date(b.ipoTime)
            : new Date(b.ipoTime) - new Date(a.ipoTime);
        } else {
          return ascending ? a[by] - b[by] : b[by] - a[by];
        }
      });

      setCards(sortedCards);

      console.log("Latest" + false);
      console.log(by + ascending);
      setSelectedSort(by + ascending);
    }
  }

  const sortUpArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-black"
    >
      <polygon points="12,2 22,12 17,12 17,22 7,22 7,12 2,12" />
    </svg>
  );

  const sortDownArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-black"
    >
      <polygon points="12,22 2,12 7,12 7,2 17,2 17,12 22,12" />
    </svg>
  );

  const upArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-green-500"
    >
      <polygon points="12,2 22,12 17,12 17,22 7,22 7,12 2,12" />
    </svg>
  );

  const downArrow = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-4 h-4 text-red-500"
    >
      <polygon points="12,22 2,12 7,12 7,2 17,2 17,12 22,12" />
    </svg>
  );

  return (
    <div className="min-h-screen mx-auto bg-gray-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-end mb-2 space-x-2 lg:space-y-0 lg:space-x-4 p-2 lg:px-0 lg:ml-0 ml-10">
        <p className="text-base mt-4 font-semibold lg:mt-0">Sort by</p>
        <div className="flex flex-wrap items-center rounded-x1 overflow-hidden pr-10 mt-4 lg:mt-0">
          {[
            { label: "Latest", sortKey: "ipoTime", ascending: false },
            { label: "Price", sortKey: "price", ascending: false },
            { label: "Price", sortKey: "price", ascending: true },
            { label: "Trend", sortKey: "trend", ascending: false },
            { label: "Trend", sortKey: "trend", ascending: true },
            // { label: "Remove Sort", sortKey: "none" },
          ].map((button, index) => (
            <button
              key={index}
              className={`flex items-center px-2 py-1 ml-1 mr-1 mb-1 text-base rounded-full font-helvetica-neue text-black ${
                selectedSort === button.sortKey + button.ascending
                  ? "bg-gray-300"
                  : "bg-white hover:bg-gray-200"
              }`}
              onClick={() => sortCards(button.sortKey, button.ascending)}
            >
              <span className="flex items-center">
                {button.label}
                {button.label !== "Latest" &&
                  (button.ascending ? sortUpArrow : sortDownArrow)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-10 sm:px-2">
        {cards.map((card, index) => (
          <div
            key={card.uniqueId}
            id={`card${card.uniqueId}`}
            onClick={() => handleCardClick(card)}
            className="cursor-pointer bg-white mt-4 mb-4 mx-2 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
            style={{
              borderTopLeftRadius: "1.25rem",
              borderBottomLeftRadius: "1.25rem",
              borderTopRightRadius: "1.25rem",
              borderBottomRightRadius: "1.25rem",
            }}
          >
            <div className="flex justify-center items-center relative">
              <img
                src={card.photo}
                alt={card.name}
                className="w-1/2 object-contain mt-6 transition duration-300 group-hover:scale-105"
                style={{ aspectRatio: "2 / 3" }}
              />
            </div>
            <div className="mt-2 mb-1 text-left px-4">
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
                {card.name}
              </span>
            </div>

            <div className="p-2 text-center w-full">
              <div className="flex justify-end w-full px-2">
                <span
                  className={`text-xs font-helvetica inline-block px-4 py-1 ${
                    card.rarity === "RARE"
                      ? "bg-sky-300"
                      : card.rarity === "EPIC"
                      ? "bg-purple-300"
                      : card.rarity === "LEGEND"
                      ? "bg-amber-300"
                      : "bg-gray-400"
                  } text-white font-bold rounded-full text-center`}
                >
                  {card.rarity}
                </span>
              </div>
              <div className="flex justify-between w-full px-2 mt-1">
                <span className="text-sm font-helvetica">Price:</span>
                <span className="text-sm font-helvetica">{card.price} ETH</span>
              </div>
              <div className="flex justify-end items-center w-full px-2 mt-1">
                <span className="text-sm font-helvetica">{card.trend}%</span>
                {card.trend > 0 ? (
                  <span className="ml-2">{upArrow}</span>
                ) : (
                  <span className="ml-2">{downArrow}</span>
                )}
              </div>
              <div className="flex justify-between w-full px-2 mt-1">
                <span className="text-sm font-helvetica">Holders:</span>
                <span className="text-sm font-helvetica">{card.shares}</span>
              </div>
            </div>
            <div className="flex justify-center items-center w-full relative">
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentBuyCardId(card.uniqueId);
                  setCurrentBuyCardName(card.name);
                  setCurrentBuyCardPhoto(card.photo);
                  setOpenBuyModal(true);
                }}
                className="w-full bg-white text-black font-bold border-2 border-black px-4 py-2 mx-4 mb-2 rounded-full shadow hover:bg-black hover:text-white"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dark Overlay */}
      {/* {openBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50"></div>
      )} */}

      {/* Buy Modal */}
      {openBuyModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60">
          <BuyModal
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
    </div>
  );
}

export default CardPage;
