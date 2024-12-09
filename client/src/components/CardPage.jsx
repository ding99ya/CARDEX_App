import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import abi from "../CardexV1.json";
import axios from "axios";
import io from "socket.io-client";
import { encodeFunctionData } from "viem";
import BuyModal from "./BuyModal.jsx";
import sortingIcon from "./Sorting.svg";
import filterIcon from "./Filter.png";
import PresaleCard from "./PresaleCard.png";
import { useNavigation } from "./NavigationContext";
import Score from "./Score.png";
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

const socket = io("https://cardex-backend-api-97f9d94676f3.herokuapp.com/");

function CardPage({ category }) {
  const { sendTransaction, user } = usePrivy();
  const { wallets } = useWallets();

  const location = useLocation();

  const { goBack, navigateTo } = useNavigation();

  // cardsResponse will be set to the response from backend
  // Once cardsResponse is set it will trigger fetching price, share holders, etc... and update cards array
  const [cardsResponse, setCardsResponse] = useState([]);

  // cards array includes info about a card, it will be used to render the page
  const [cards, setCards] = useState([]);

  const [filteredCards, setFilteredCards] = useState([]);

  const [showSearchCards, setShowSearchCards] = useState(false);

  const [searchCards, setSearchCards] = useState([]);

  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  // selectedFilter be used to determine which filter method is currently being used
  const [selectedFilter, setSelectedFilter] = useState({
    label: "All",
  });

  // filterIsOpen is used to control if the filter list should be opened
  const [filterIsOpen, setFilterIsOpen] = useState(false);

  // selectedSort be used to determine which sort method is currently being used
  const [selectedSort, setSelectedSort] = useState({
    label: "Latest",
    sortKey: "ipoTime",
    ascending: false,
  });

  // sortIsOpen is used to control if the sort list should be opened
  const [sortIsOpen, setSortIsOpen] = useState(false);

  const [searchCardName, setSearchCardName] = useState("");

  // openBuyModal is used to control if the buy modal window be displayed
  const [openBuyModal, setOpenBuyModal] = useState(false);

  // These variables are to be updated when user select the card to buy
  const [currentBuyCardId, setCurrentBuyCardId] = useState("");
  const [currentBuyCardName, setCurrentBuyCardName] = useState("");
  const [currentBuyCardPhoto, setCurrentBuyCardPhoto] = useState("");

  // hasMounted variable is used to ensure the useEffect relies on cardsResponse is only triggered once
  const hasMounted = useRef(false);

  const navigate = useNavigate();

  // function to add listener to Buy() event onchain so that Buy() event can trigger price, share holders update
  // Depreciated because this page will now listen to the websocket events from backend and update the card info
  // Keep this for potential future use

  // function addBuyListener() {
  //   const eventSubscription = contract.events.Buy({}, async (error, data) => {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       const cardID = data.returnValues[0];

  //       const index = cards.findIndex(
  //         (card) => card.uniqueId === cardID.toString()
  //       );

  //       if (index !== -1) {
  //         const q = Math.pow(
  //           cards[index].ipoSharesPrice / cards[index].initialSharesPrice,
  //           1 / cards[index].ipoShares
  //         );
  //         const currentHolders = data.returnValues[4];

  //         const a = cards[index].initialSharesPrice;
  //         const b = Math.pow(q, Number(currentHolders) + 1);
  //         const c = Math.pow(q, Number(currentHolders));
  //         const d = q - 1;

  //         const currentPrice = ((a * (b - c)) / d).toFixed(4);
  //         const currentTrend = getTrend(currentPrice, cards[index].lastPrice);

  //         setCards((prevCards) =>
  //           prevCards.map((card) =>
  //             card.uniqueId === cardID.toString()
  //               ? {
  //                   ...card,
  //                   price: currentPrice,
  //                   trend: currentTrend,
  //                   shares: Number(currentHolders),
  //                 }
  //               : card
  //           )
  //         );
  //       }
  //     }
  //   });

  //   return eventSubscription;
  // }

  // function to listen to cardUpdate() event from backend and update cards info

  function addWebSocketListener() {
    socket.on("cardUpdate", (updatedCard) => {
      const cardID = updatedCard.uniqueId;

      const index = cards.findIndex(
        (card) => card.uniqueId === cardID.toString()
      );

      if (index !== -1) {
        const currentHolders = Number(updatedCard.shares);
        const currentPrice = Number(updatedCard.price);

        setCards((prevCards) =>
          prevCards.map((card) =>
            card.uniqueId === cardID.toString()
              ? {
                  ...card,
                  price: currentPrice,
                  shares: Number(currentHolders),
                }
              : card
          )
        );
      }

      const index1 = cardsResponse.findIndex(
        (card) => card.uniqueId === cardID.toString()
      );

      if (index1 !== -1) {
        const currentHolders = Number(updatedCard.shares);
        const currentPrice = Number(updatedCard.price);

        setCardsResponse((prevCards) =>
          prevCards.map((card) =>
            card.uniqueId === cardID.toString()
              ? {
                  ...card,
                  price: currentPrice,
                  shares: Number(currentHolders),
                }
              : card
          )
        );
      }

      const index2 = searchCards.findIndex(
        (card) => card.uniqueId === cardID.toString()
      );

      if (index2 !== -1) {
        const currentHolders = Number(updatedCard.shares);
        const currentPrice = Number(updatedCard.price);

        setSearchCards((prevCards) =>
          prevCards.map((card) =>
            card.uniqueId === cardID.toString()
              ? {
                  ...card,
                  price: currentPrice,
                  shares: Number(currentHolders),
                }
              : card
          )
        );
      }
    });
  }

  // function to add listener to Sell() event onchain so that Sell() event can trigger price, share holders update
  // Depreciated because this page will now listen to the websocket events from backend and update the card info
  // Keep this for potential future use

  // function addSellListener() {
  //   const eventSubscription = contract.events.Sell({}, async (error, data) => {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       const cardID = data.returnValues[0];

  //       const index = cards.findIndex(
  //         (card) => card.uniqueId === cardID.toString()
  //       );

  //       if (index !== -1) {
  //         const q = Math.pow(
  //           cards[index].ipoSharesPrice / cards[index].initialSharesPrice,
  //           1 / cards[index].ipoShares
  //         );
  //         const currentHolders = data.returnValues[4];

  //         const a = cards[index].initialSharesPrice;
  //         const b = Math.pow(q, Number(currentHolders) + 1);
  //         const c = Math.pow(q, Number(currentHolders));
  //         const d = q - 1;

  //         const currentPrice = ((a * (b - c)) / d).toFixed(4);
  //         const currentTrend = getTrend(currentPrice, cards[index].lastPrice);

  //         setCards((prevCards) =>
  //           prevCards.map((card) =>
  //             card.uniqueId === cardID.toString()
  //               ? {
  //                   ...card,
  //                   price: currentPrice,
  //                   trend: currentTrend,
  //                   shares: Number(currentHolders),
  //                 }
  //               : card
  //           )
  //         );
  //       }
  //     }
  //   });

  //   return eventSubscription;
  // }

  useEffect(() => {
    setCards([
      // Initialized cards array to make the HTML render to default format
      {
        name: "Card 1",
        photo: PresaleCard,
        uniqueId: "1",
        price: 0,
        shares: 0,
        category: "card",
        currentScore: 0,
      },
      {
        name: "Card 2",
        photo: PresaleCard,
        uniqueId: "2",
        price: 0,
        shares: 0,
        category: "card",
        currentScore: 0,
      },
      {
        name: "Card 3",
        photo: PresaleCard,
        uniqueId: "3",
        price: 0,
        shares: 0,
        category: "card",
        currentScore: 0,
      },
      {
        name: "Card 4",
        photo: PresaleCard,
        uniqueId: "4",
        price: 0,
        shares: 0,
        category: "card",
        currentScore: 0,
      },
      {
        name: "Card 5",
        photo: PresaleCard,
        uniqueId: "5",
        price: 0,
        shares: 0,
        category: "card",
        currentScore: 0,
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

  useEffect(() => {
    if (hasMounted.current) {
      // Add web socket event listener to be triggered when Trade event occurs
      addWebSocketListener();

      handleSortSelection({
        label: "Latest",
        sortKey: "ipoTime",
        ascending: false,
      });

      return () => {
        socket.off("cardUpdate");
      };
    } else {
      hasMounted.current = true;
    }
  }, [cardsResponse]);

  useEffect(() => {
    if (hasMounted.current) {
      const sortedCards = [...filteredCards].sort((a, b) => {
        if (selectedSort.sortKey === "ipoTime") {
          return new Date(b.ipoTime) - new Date(a.ipoTime);
        } else {
          return selectedSort.ascending
            ? a[selectedSort.sortKey] - b[selectedSort.sortKey]
            : b[selectedSort.sortKey] - a[selectedSort.sortKey];
        }
      });

      setCards(sortedCards);
    }
  }, [filteredCards]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

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
  // const getTrend = (currentPrice, lastPrice) => {
  //   const priceTrend = (((currentPrice - lastPrice) / lastPrice) * 100).toFixed(
  //     2
  //   );
  //   return priceTrend;
  // };

  // Function to get shares being bought
  // This method is not currently used because the holders will be directly fetched from the web socket events
  // Keep it for potential future use
  const getHolders = async (cardId) => {
    const holders = await loadShareHolders(cardId);
    return holders;
  };

  // If a hex string begins with "0x0..." the function will turn it to "0x..."
  // const removeLeadingZeroFromHex = (hexString) => {
  //   return "0x" + hexString.slice(2).replace(/^0+/, "");
  // };

  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    // const walletType = wallets[0].walletClientType;

    // if (walletType === "privy") {
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
    // } else {
    //   const provider = await wallets[0].getEthereumProvider();

    // const provider = new WalletConnectProvider({
    //   rpc: {
    //     84532: "https://sepolia.base.org",
    //   },
    //   chainId: 84532,
    // });

    // const provider = await EthereumProvider.init({
    //   projectId: "7038399f9dc465c8fde109e0b9a09230",
    //   chains: [84532],
    //   showQrModal: true,
    // });
    // await provider.enable();

    //   const currentChainId = await provider.request({ method: "eth_chainId" });
    //   const normalizedChainId = currentChainId.startsWith("0x")
    //     ? parseInt(currentChainId, 16) // Convert hex to decimal
    //     : parseInt(currentChainId);
    //   if (normalizedChainId !== 84532) {
    //     try {
    //       alert(`switching network`);
    //       await provider.request({
    //         method: "wallet_switchEthereumChain",
    //         params: [{ chainId: "0x14A34" }],
    //       });
    //     } catch (switchError) {
    //       if (switchError.code === 4902) {
    //         try {
    //           await provider.request({
    //             method: "wallet_addEthereumChain",
    //             params: [
    //               {
    //                 chainId: "0x14A34", // Base Sepolia testnet (chain ID 84532 in hex)
    //                 chainName: "Base Sepolia",
    //                 nativeCurrency: {
    //                   name: "ETH",
    //                   symbol: "ETH",
    //                   decimals: 18,
    //                 },
    //                 rpcUrls: ["https://sepolia.base.org"],
    //                 blockExplorerUrls: ["https://sepolia-explorer.base.org"],
    //               },
    //             ],
    //           });
    //         } catch (addError) {
    //           console.error(addError);
    //         }
    //       }
    //     }
    //   }

    //   const data = encodeFunctionData({
    //     abi: abi,
    //     functionName: "buyShares",
    //     args: [currentBuyCardId, parseInt(shares)],
    //   });
    //   try {
    //     const txHash = await provider.request({
    //       method: "eth_sendTransaction",
    //       params: [
    //         {
    //           from: wallets[0].address,
    //           to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
    //           value: removeLeadingZeroFromHex(
    //             ethers.BigNumber.from(value).toHexString()
    //           ),
    //           data: data,
    //           chainId: 84532,
    //         },
    //       ],
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    setOpenBuyModal(false);
  };

  // Function to navigate to card detail page, pass the state so that card detail page can back to this page
  // Deprecated
  // const handleCardClick = (card) => {
  //   navigate(`/cards/${card.uniqueId}`, {
  //     state: { from: location.pathname },
  //   });
  // };

  // Function to back to market page
  // Deprecated
  // const handleBackClick = () => {
  //   navigate(`/market`);
  // };

  // Function to filter the cards based on certain rule
  function filterCards(by) {
    if (by === "All") {
      setFilteredCards(cardsResponse);
      // setCards(cardsResponse);
    } else {
      const filteredCards = cardsResponse.filter((card) => {
        return card.rarity === by.toUpperCase();
      });

      // setCards(filteredCards);
      setFilteredCards(filteredCards);
    }
  }

  const handleFilterSelection = (option) => {
    setSelectedFilter(option);
    filterCards(option.label);
    setSearchCardName("");
    setSearchCards([]);
    setShowSearchCards(false);
    setFilterIsOpen(false);
  };

  const filterOptions = [
    { label: "All" },
    { label: "Rare" },
    { label: "Epic" },
    { label: "Legend" },
  ];

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
      setSelectedSort({ label: label, sortKey: by, ascending: ascending });
    }
  }

  const handleSortSelection = (option) => {
    setSelectedSort(option);
    sortCards(option.label, option.sortKey, option.ascending);
    setSearchCardName("");
    setSearchCards([]);
    setShowSearchCards(false);
    setSortIsOpen(false);
  };

  const sortOptions = [
    { label: "Latest", sortKey: "ipoTime", ascending: false },
    { label: "Price", sortKey: "price", ascending: false },
    { label: "Price", sortKey: "price", ascending: true },
    { label: "Score", sortKey: "currentScore", ascending: false },
    { label: "Score", sortKey: "currentScore", ascending: true },
    { label: "Supply", sortKey: "shares", ascending: true },
    { label: "Supply", sortKey: "shares", ascending: false },
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

  const handleSearchCardNameChange = (e) => {
    const name = e.target.value;
    setSearchCardName(name);

    if (name === "") {
      setShowSearchCards(false);
      setSearchCards([]);
    }
  };

  const handleSearchCard = () => {
    if (searchCardName === "") {
      setShowSearchCards(false);
      return;
    }
    const lowerSearch = searchCardName.toLowerCase();

    setSearchCards(
      cards.filter((card) => card.name.toLowerCase().includes(lowerSearch))
    );
    setShowSearchCards(true);
  };

  // Trend Up arrow
  // Deprecated
  // const upArrow = (
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     viewBox="0 0 24 24"
  //     fill="currentColor"
  //     className="w-4 h-4 text-green-500"
  //   >
  //     <polygon points="12,2 22,12 17,12 17,22 7,22 7,12 2,12" />
  //   </svg>
  // );

  // Trend Down arrow
  // Deprecated
  // const downArrow = (
  //   <svg
  //     xmlns="http://www.w3.org/2000/svg"
  //     viewBox="0 0 24 24"
  //     fill="currentColor"
  //     className="w-4 h-4 text-red-500"
  //   >
  //     <polygon points="12,22 2,12 7,12 7,2 17,2 17,12 22,12" />
  //   </svg>
  // );

  return (
    <div className="min-h-screen mx-auto bg-gray-100">
      {/* <div className="flex flex-col lg:flex-row items-center justify-between px-2 pt-2 mx-4 lg:mx-12 space-y-4 lg:space-y-0 lg:space-x-2">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block text-black py-2 mt-3 lg:mb-2 font-semibold whitespace-nowrap self-start lg:self-auto"
        >
          &lt; Back
        </span>
        <div className="flex items-center space-x-2 lg:space-x-4 self-end lg:self-auto">
          <div className="relative inline-block text-left">
            <button
              onClick={() => setFilterIsOpen(!filterIsOpen)}
              className="inline-flex items-center justify-between w-22 lg:w-full px-2 lg:px-4 py-1 text-xs lg:text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="flex items-center whitespace-nowrap">
                {selectedFilter.label}
              </span>
              <img
                src={sortingIcon}
                alt="Filter Icon"
                className="w-5 h-5 ml-1 mr-1"
              />
            </button>
            {filterIsOpen && (
              <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                {filterOptions.map((option, index) => (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => handleFilterSelection(option)}
                      className="flex items-center w-full px-2 lg:px-4 py-1 text-xs lg:text-sm text-black hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setSortIsOpen(!sortIsOpen)}
              className="inline-flex items-center justify-between w-22 lg:w-full px-2 lg:px-4 py-1 text-xs lg:text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span className="flex items-center whitespace-nowrap">
                {selectedSort.label}{" "}
                {selectedSort.label !== "Latest" &&
                  (selectedSort.ascending ? sortUpArrow : sortDownArrow)}
              </span>
              <img
                src={sortingIcon}
                alt="Sort Icon"
                className={"w-5 h-5 ml-1 mr-1"}
              />
            </button>
            {sortIsOpen && (
              <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                {sortOptions.map((option, index) => (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => handleSortSelection(option)}
                      className="flex items-center w-full px-2 lg:px-4 py-1 text-xs lg:text-sm text-black hover:bg-gray-100"
                    >
                      {option.label}{" "}
                      {option.label !== "Latest" &&
                        (option.ascending ? sortUpArrow : sortDownArrow)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div> */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-2 pt-2 mx-1 lg:mx-12 space-y-4 lg:space-y-0 lg:space-x-2">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block text-black py-2 mt-3 lg:mb-2 font-semibold whitespace-nowrap self-start lg:self-auto"
        >
          &lt; Back
        </span>

        <div className="flex items-center space-x-2 lg:space-x-4 self-end lg:self-auto w-full justify-end">
          <div className="flex items-center bg-white rounded-md px-2 py-1 w-full lg:w-[300px]">
            <input
              type="text"
              placeholder="Search"
              value={searchCardName}
              onChange={handleSearchCardNameChange}
              className="bg-white outline-none flex-grow px-2 py-1 rounded-md w-full text-xs lg:text-sm"
            />
            <svg
              className="w-4 h-4 text-black cursor-pointer"
              onClick={handleSearchCard}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m1.39-5.09A7.5 7.5 0 1110.5 3.5a7.5 7.5 0 017.5 7.5z"
              ></path>
            </svg>
          </div>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setFilterIsOpen(!filterIsOpen)}
              className="inline-flex items-center justify-between w-[86px] lg:w-full px-2 py-1 text-xs lg:text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-0"
            >
              <span className="flex items-center whitespace-nowrap">
                {selectedFilter.label}
              </span>
              <img
                src={filterIcon}
                alt="Filter Icon"
                className="w-5 h-5 ml-1"
              />
            </button>
            {filterIsOpen && (
              <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                {filterOptions.map((option, index) => (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => handleFilterSelection(option)}
                      className="flex items-center w-[86px] lg:w-full px-2 py-1 text-xs lg:text-sm text-black hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative inline-block text-left">
            <button
              onClick={() => setSortIsOpen(!sortIsOpen)}
              className="inline-flex items-center justify-between w-[90px] lg:w-full px-2 py-1 text-xs lg:text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-0"
            >
              <span className="flex items-center whitespace-nowrap">
                {selectedSort.label}{" "}
                {selectedSort.label !== "Latest" &&
                  (selectedSort.ascending ? sortUpArrow : sortDownArrow)}
              </span>
              <img src={sortingIcon} alt="Sort Icon" className="w-5 h-5 ml-1" />
            </button>
            {sortIsOpen && (
              <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                {sortOptions.map((option, index) => (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => handleSortSelection(option)}
                      className="flex items-center w-[90px] lg:w-full px-2 py-1 text-xs lg:text-sm text-black hover:bg-gray-100"
                    >
                      {option.label}{" "}
                      {option.label !== "Latest" &&
                        (option.ascending ? sortUpArrow : sortDownArrow)}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSearchCards ? (
        searchCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full">
            <p className="text-lg mt-6">No cards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-10 sm:px-2">
            {searchCards.map((card, index) => (
              <div
                key={card.uniqueId}
                id={`card${card.uniqueId}`}
                onClick={() => navigateTo(`/cards/${card.uniqueId}`)}
                className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg lg:shadow-md overflow-hidden transition duration-300 ease-in-out lg:hover:shadow-2xl hover:border-gray-500 group"
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
                  <div className="flex justify-between w-full px-2">
                    <div className={"flex items-center"}>
                      <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                      <span className="font-open-sans text-sm">
                        {Math.round(card.currentScore)}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-helvetica inline-block px-2 py-1 ${
                        card.rarity === "COMMON"
                          ? "bg-green-300"
                          : card.rarity === "RARE"
                          ? "bg-sky-300"
                          : card.rarity === "EPIC"
                          ? "bg-purple-300"
                          : card.rarity === "LEGEND"
                          ? "bg-amber-300"
                          : "bg-gray-400"
                      } text-white font-semibold rounded-lg text-center`}
                    >
                      {card.rarity}
                    </span>
                  </div>
                  <div className="flex justify-between w-full px-2 mt-1">
                    <span className="text-sm font-helvetica">Price:</span>
                    <span className="text-sm font-helvetica">
                      {card.price} ETH
                    </span>
                  </div>
                  {/* <div className="flex justify-end items-center w-full px-2 mt-1">
                <span className="text-sm font-helvetica">{card.trend}%</span>
                {card.trend > 0 ? (
                  <span className="ml-2">{upArrow}</span>
                ) : (
                  <span className="ml-2">{downArrow}</span>
                )}
              </div> */}
                  <div className="flex justify-between w-full px-2 mt-1">
                    <span className="text-sm font-helvetica">Supply:</span>
                    <span className="text-sm font-helvetica">
                      {Number(card.shares) + 10}
                    </span>
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
                    className="w-full bg-blue-400 text-sm text-white font-bold px-4 py-1 mx-4 mb-2 rounded-full hover:bg-blue-400 hover:text-white"
                  >
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-10 sm:px-2">
          {cards.map((card, index) => (
            <div
              key={card.uniqueId}
              id={`card${card.uniqueId}`}
              onClick={() => navigateTo(`/cards/${card.uniqueId}`)}
              className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg lg:shadow-md overflow-hidden transition duration-300 ease-in-out lg:hover:shadow-2xl hover:border-gray-500 group"
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
                <div className="flex justify-between w-full px-2">
                  <div className={"flex items-center"}>
                    <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                    <span className="font-open-sans text-sm">
                      {Math.round(card.currentScore)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-helvetica inline-block px-2 py-1 ${
                      card.rarity === "COMMON"
                        ? "bg-green-300"
                        : card.rarity === "RARE"
                        ? "bg-sky-300"
                        : card.rarity === "EPIC"
                        ? "bg-purple-300"
                        : card.rarity === "LEGEND"
                        ? "bg-amber-300"
                        : "bg-gray-400"
                    } text-white font-semibold rounded-lg text-center`}
                  >
                    {card.rarity}
                  </span>
                </div>
                <div className="flex justify-between w-full px-2 mt-1">
                  <span className="text-sm font-helvetica">Price:</span>
                  <span className="text-sm font-helvetica">
                    {card.price} ETH
                  </span>
                </div>
                {/* <div className="flex justify-end items-center w-full px-2 mt-1">
                <span className="text-sm font-helvetica">{card.trend}%</span>
                {card.trend > 0 ? (
                  <span className="ml-2">{upArrow}</span>
                ) : (
                  <span className="ml-2">{downArrow}</span>
                )}
              </div> */}
                <div className="flex justify-between w-full px-2 mt-1">
                  <span className="text-sm font-helvetica">Supply:</span>
                  <span className="text-sm font-helvetica">
                    {Number(card.shares) + 10}
                  </span>
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
                  className="w-full bg-blue-400 text-sm text-white font-bold px-4 py-1 mx-4 mb-2 rounded-full hover:bg-blue-400 hover:text-white"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      {isScrollToTopVisible && !openBuyModal && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 border-2 border-black bg-white text-black p-3 rounded-full focus:outline-none z-50"
        >
          ↑
        </button>
      )}
    </div>
  );
}

export default CardPage;
