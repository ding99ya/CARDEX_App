import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import abi from "../CardexV1.json";
import axios from "axios";
import { encodeFunctionData } from "viem";
import PresaleBuyModal from "./PresaleBuyModal.jsx";
import sortingIcon from "./Sorting.svg";
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

  // cardsResponse will be set to the response from backend
  // Once cardsResponse is set it will trigger fetching price, share holders, etc... and update cards array
  const [cardsResponse, setCardsResponse] = useState([]);

  const [isEligibleUser, setIsEligibleUser] = useState(false);

  const [userOwnedCards, setUserOwnedCards] = useState([]);

  // cards array includes info about a card, it will be used to render the page
  const [cards, setCards] = useState([]);

  // selectedSort be used to determine which sort method is currently being used
  const [selectedSort, setSelectedSort] = useState({
    label: "Latest",
    sortKey: "ipoTime",
    ascending: false,
  });
  const [sortIsOpen, setSortIsOpen] = useState(false);

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
        const response = await axios.get(`/api/cards/category/${"presale"}`);

        setCardsResponse(response.data);
        setCards(response.data);
      } catch (error) {
        console.error(`Error fetching presale cards:`, error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
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

      checkEligibleUser();

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

  // Function triggered when remove sort button is clicked, will reset the order based on card id
  const handleRemoveSort = () => {
    const sortedCards = [...cards].sort(
      (a, b) => Number(a.uniqueId) - Number(b.uniqueId)
    );
    setCards(sortedCards);
  };

  // Function to sort the cards based on certain rule
  function sortCards(label, by, ascending = true) {
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
      setSelectedSort({ label: label, sortkey: by, ascending: ascending });
    }
  }

  const handleSortSelection = (option) => {
    setSelectedSort(option);
    sortCards(option.label, option.sortKey, option.ascending);
    setSortIsOpen(false);
  };

  const sortOptions = [
    { label: "Latest", sortKey: "ipoTime", ascending: false },
    { label: "Price", sortKey: "price", ascending: false },
    { label: "Price", sortKey: "price", ascending: true },
    { label: "Holder", sortKey: "shares", ascending: false },
    { label: "Holder", sortKey: "shares", ascending: true },
  ];

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
      <div className="flex flex-row items-center justify-between space-x-2 px-2 pt-2 mx-4 lg:mx-12">
        <span
          onClick={() => handleBackClick()}
          className="cursor-pointer inline-block text-black py-2 mt-3 mb-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
      </div>

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
                src={card.photo}
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
    </div>
  );
}

export default PresaleCardPage;
