import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import abi from "../CardexV1.json";
import axios from "axios";
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

function CardPage({ category }) {
  const location = useLocation();

  // cardsResponse will be set to the response from backend
  // Once cardsResponse is set it will trigger fetching price, share holders, etc... and update cards array
  const [cardsResponse, setCardsResponse] = useState([]);

  // cards array includes info about a card, it will be used to render the page
  const [cards, setCards] = useState([]);

  // selectedSort be used to determine which sort method is currently being used
  const [selectedSort, setSelectedSort] = useState("ipoTime" + false);

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

  useEffect(() => {
    setCards([
      // Initialized cards array to make the HTML render to default format
      {
        name: "Card 1",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "1",
        price: 500000000000000,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 2",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "2",
        price: 500000000000000,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 3",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "3",
        price: 500000000000000,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
      {
        name: "Card 4",
        photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
        uniqueId: "4",
        price: 500000000000000,
        lastPrice: 0,
        trend: 0.0,
        shares: 0,
        category: "card",
      },
    ]);

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

  useEffect(() => {
    if (hasMounted.current) {
      // Add Buy/Sell event listener
      const buyEventSubscription = addBuyListener();
      const sellEventSubscription = addSellListener();

      return () => {
        buyEventSubscription.unsubscribe((error, success) => {
          if (success) {
            console.log("Buy event successfully unsubscribed!");
          }
        });
        sellEventSubscription.unsubscribe((error, success) => {
          if (success) {
            console.log("Sell event successfully unsubscribed!");
          }
        });
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

  return (
    <div className="mx-auto mt-8">
      <div className="flex items-center justify-end mb-8 space-x-2">
        <p className="text-xl font-semibold">Sort Items By</p>
        <div className="flex divide-x divide-gray-300 rounded-x1 overflow-hidden pr-10">
          {[
            { label: "Latest", sortKey: "ipoTime", ascending: false },
            { label: "Price High to Low", sortKey: "price", ascending: false },
            { label: "Price Low to High", sortKey: "price", ascending: true },
            { label: "Trend High to Low", sortKey: "trend", ascending: false },
            { label: "Trend Low to High", sortKey: "trend", ascending: true },
            // { label: "Remove Sort", sortKey: "none" },
          ].map((button, index) => (
            <button
              key={index}
              className={`px-6 py-2 transition duration-200 ease-in-out text-lg ${
                selectedSort === button.sortKey + button.ascending
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-transparent text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => sortCards(button.sortKey, button.ascending)}
              style={{
                borderTopLeftRadius: index === 0 ? "0.75rem" : "0",
                borderBottomLeftRadius: index === 0 ? "0.75rem" : "0",
                borderTopRightRadius: index === 4 ? "0.75rem" : "0",
                borderBottomRightRadius: index === 4 ? "0.75rem" : "0",
              }}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 px-10">
        {cards.map((card, index) => (
          <div
            key={card.uniqueId}
            id={`card${card.uniqueId}`}
            onClick={() => handleCardClick(card)}
            className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden border-2 border-black transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 hover:scale-105"
          >
            <div className="p-6 text-center">
              <h3 className="font-semibold text-xl md:text-2xl text-gray-800">
                {card.name}
              </h3>
            </div>
            <img
              src={card.photo}
              alt={card.name}
              className="w-full h-64 object-contain mb-2"
            />
            <div className="p-4 text-center w-full">
              <div className="flex justify-between w-full px-4">
                <span className="text-lg font-semibold text-gray-600">
                  Price:
                </span>
                <span className="text-lg font-semibold text-gray-600">
                  {card.price} ETH
                </span>
              </div>
              <div className="flex justify-end items-center w-full px-4 mt-2">
                <span className="text-lg font-semibold">{card.trend}%</span>
                {card.trend > 0 ? (
                  <span className="text-green-500 ml-2">&#x21E7;</span> // Up arrow
                ) : (
                  <span className="text-red-500 ml-2">&#x21E9;</span> // Down arrow
                )}
              </div>
              <div className="flex justify-between w-full px-4 mt-2">
                <span className="text-lg font-semibold text-gray-600">
                  Shares:
                </span>
                <span className="text-lg font-semibold text-gray-600">
                  {card.shares}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CardPage;
