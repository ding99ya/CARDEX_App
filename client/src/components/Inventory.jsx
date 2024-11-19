import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Contract, providers, BigNumber } from "ethers";
import axios from "axios";
import CopyIcon from "./Copy-Icon.jpg";
import ETHSymbol from "./ETHSymbol.png";
import Wallet from "./Wallet.jpg";
import TwitterLogo from "./TwitterLogo.png";
import DepositModal from "./DepositModal.jsx";
import WithdrawModal from "./WithdrawModal.jsx";
import sortingIcon from "./Sorting.svg";
import filterIcon from "./Filter.png";
import Score from "./Score.png";
import abi from "../CardexV1.json";
import { useNavigation } from "./NavigationContext";
import { encodeFunctionData } from "viem";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

// CardexV1 contract instance
const contract = new web3.eth.Contract(
  abi,
  process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR
);

function Inventory() {
  const location = useLocation();

  const { navigateTo } = useNavigation();

  const { fundWallet } = useFundWallet();

  const {
    logout,
    exportWallet,
    sendTransaction,
    user,
    linkTwitter,
    unlinkTwitter,
  } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWalletAddress = user ? user.wallet.address : 0;
  const walletType = user ? wallets[0].walletClientType : "";

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  const [loadInventory, setLoadInventory] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userCardsCopy, setUserCardsCopy] = useState([]);
  const [filteredUserCards, setFilteredUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState({
    label: "All",
  });

  const [filterIsOpen, setFilterIsOpen] = useState(false);

  const [sortIsOpen, setSortIsOpen] = useState(false);

  const [selectedSort, setSelectedSort] = useState({
    label: "Price",
    sortKey: "price",
    ascending: false,
  });

  function filterCards(by) {
    if (by === "All") {
      setFilteredUserCards(userCardsCopy);
    } else {
      const filteredCards = userCardsCopy.filter((card) => {
        return card.rarity === by.toUpperCase();
      });

      setFilteredUserCards(filteredCards);
    }
  }

  const handleFilterSelection = (option) => {
    setSelectedFilter(option);
    filterCards(option.label);
    setFilterIsOpen(false);
  };

  const filterOptions = [
    { label: "All" },
    { label: "Rare" },
    { label: "Epic" },
    { label: "Legend" },
  ];

  function sortCards(label, by, ascending = true) {
    const sortedCards = [...userCards].sort((a, b) => {
      return ascending ? a[by] - b[by] : b[by] - a[by];
    });

    setUserCards(sortedCards);
    setSelectedSort({ label: label, sortKey: by, ascending: ascending });
  }

  const handleSortSelection = (option) => {
    setSelectedSort(option);
    sortCards(option.label, option.sortKey, option.ascending);
    setSortIsOpen(false);
  };

  const sortOptions = [
    { label: "Price", sortKey: "price", ascending: false },
    { label: "Price", sortKey: "price", ascending: true },
    { label: "Score", sortKey: "currentScore", ascending: false },
    { label: "Score", sortKey: "currentScore", ascending: true },
    { label: "Own", sortKey: "shares", ascending: true },
    { label: "Own", sortKey: "shares", ascending: false },
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

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        setLoadInventory(true);
        const response = await axios.get(
          `/api/users/${embeddedWalletAddress.toString()}`
        );

        setInventory(response.data.cardInventory);
        setLoadInventory(false);
      } catch (error) {
        console.error(
          `Error fetching user ${embeddedWalletAddress} card inventory`,
          error
        );
      }
    };
    fetchUserPosition();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      const fetchCardPosition = async () => {
        try {
          const userCardIds = inventory.map((card) => card.uniqueId.toString());

          const sharesMap = inventory.reduce((map, item) => {
            map[item.uniqueId] = item.shares;
            return map;
          }, {});

          const multiCardsResponse = await axios.post(`/api/cards/multiple`, {
            uniqueIds: userCardIds,
          });

          const fetchedUserCards = multiCardsResponse.data.map((item) => ({
            ...item,
            shares:
              sharesMap[item.uniqueId] !== undefined
                ? sharesMap[item.uniqueId]
                : item.shares,
          }));

          setUserCards(fetchedUserCards);
          setUserCardsCopy(fetchedUserCards);

          // Create a lookup object for cards
          const cardLookup = multiCardsResponse.data.reduce((acc, card) => {
            acc[card.uniqueId] = card.price;
            return acc;
          }, {});

          // Calculate the sum
          const worth = inventory.reduce((sum, item) => {
            const price = cardLookup[item.uniqueId];
            return sum + item.shares * price;
          }, 0);

          setTotalWorth(Number(worth).toFixed(3));
        } catch (error) {
          console.error(`Error fetching cards info`, error);
        }
      };
      fetchCardPosition();
    } else {
      hasMounted.current = true;
    }
  }, [inventory]);

  useEffect(() => {
    if (hasMounted.current) {
      handleSortSelection({
        label: "Price",
        sortKey: "price",
        ascending: false,
      });
    }
  }, [userCardsCopy]);

  useEffect(() => {
    if (hasMounted.current) {
      const sortedCards = [...filteredUserCards].sort((a, b) => {
        return selectedSort.ascending
          ? a[selectedSort.sortKey] - b[selectedSort.sortKey]
          : b[selectedSort.sortKey] - a[selectedSort.sortKey];
      });

      setUserCards(sortedCards);
    }
  }, [filteredUserCards]);

  const handleCardClick = (card) => {
    if (card.category !== "presale") {
      navigateTo(`/cards/${card.uniqueId}`);
    } else {
      navigateTo(`/presalecards/${card.uniqueId}`);
    }
  };

  // Function to obtain the accumulated fee for the user
  const batchLoadUserFee = async () => {
    const uniqueIds = userCards.map((card) => Number(card.uniqueId));
    console.log(uniqueIds);
    const userFee = await contract.methods
      .batchGetFee(uniqueIds, embeddedWalletAddress)
      .call();
    return userFee.toString();
  };

  // A wrapper function to obtain the fee
  const batchFetchFee = async () => {
    try {
      const userFee = await batchLoadUserFee();
      return userFee;
    } catch (error) {
      console.log(error);
    }
  };

  // UI Configuration for Privy prompt when claiming fees
  const getClaimUiConfig = async () => {
    const userFee = await batchFetchFee();
    const userFeeToBigNumber = BigNumber.from(userFee);
    const oneEther = BigNumber.from("1000000000000000000");
    const userFeeInETH =
      Number(userFeeToBigNumber.mul(10000).div(oneEther)) / 10000;

    return {
      // header: card.name,
      description: "Claim " + userFeeInETH + " ETH",
      // transactionInfo: {
      //   contractInfo: {
      //     imgUrl: card.photo,
      //   },
      // },
      buttonText: "Claim",
    };
  };

  // Function to claim the accumulated fees for current card
  const claim = async () => {
    // if (walletType === "privy") {
    const uniqueIds = userCards.map((card) => Number(card.uniqueId));
    const data = encodeFunctionData({
      abi: abi,
      functionName: "batchClaim",
      args: [uniqueIds],
    });

    const transaction = {
      to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
      chainId: 84532,
      data: data,
    };

    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const claimUI = await getClaimUiConfig();
      const txReceipt = await sendTransaction(transaction, claimUI);
    } catch (error) {
      console.log(error);
    }
    // } else {
    //   const provider = await wallets[0].getEthereumProvider();
    //   const uniqueIds = userCards.map((card) => Number(card.uniqueId));
    //   const data = encodeFunctionData({
    //     abi: abi,
    //     functionName: "batchClaim",
    //     args: [uniqueIds],
    //   });
    //   try {
    //     const txHash = await provider.request({
    //       method: "eth_sendTransaction",
    //       params: [
    //         {
    //           from: wallets[0].address,
    //           to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
    //           data: data,
    //           chainId: 84532,
    //         },
    //       ],
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
  };

  if (loadInventory) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img src="/Loading.gif" alt="Loading..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-2 lg:px-0 min-h-screen bg-gray-100">
      <div className="w-full lg:px-4">
        {userCards.length === 0 ? (
          <div>
            <div className="bg-white text-black flex justify-start items-center p-4 rounded-2xl mt-4 mx-1 lg:mx-6">
              <span className="font-semibold flex flex-col">
                <span className="text-xs">Inventory Worth:</span>
                <span className="text-base">{totalWorth} ETH</span>
              </span>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg mt-6">Empty Collectible Inventory</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 mx-1 lg:mx-6">
              <span className="font-semibold flex flex-col">
                <span className="text-xs">Inventory Worth:</span>
                <span className="text-base">{totalWorth} ETH</span>
              </span>
              <div className="items-center">
                <div className="relative inline-block text-left mr-2">
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
                    <div className="absolute right-0 z-50 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
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
                    <img
                      src={sortingIcon}
                      alt="Sort Icon"
                      className="w-5 h-5 ml-1"
                    />
                  </button>
                  {sortIsOpen && (
                    <div className="absolute right-0 z-50 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-4">
              {userCards.map((item) =>
                item.category !== "presale" ? (
                  <div
                    className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg overflow-hidden transition duration-300 ease-in-out lg:hover:shadow-2xl group"
                    key={item.uniqueId}
                    onClick={() => handleCardClick(item)}
                    style={{
                      borderTopLeftRadius: "1.25rem",
                      borderBottomLeftRadius: "1.25rem",
                      borderTopRightRadius: "1.25rem",
                      borderBottomRightRadius: "1.25rem",
                    }}
                  >
                    <div className="flex justify-center items-center relative">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-1/2 object-contain mt-6 transition duration-300 group-hover:scale-105 relative"
                        style={{ zIndex: 10, aspectRatio: "2 / 3" }}
                      />
                    </div>
                    <div className="p-2 text-left px-4">
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
                        {item.name}
                      </span>
                    </div>
                    <div className="p-2 text-center w-full">
                      <div className="flex justify-between w-full px-2">
                        <div className={"flex items-center"}>
                          <img
                            src={Score}
                            alt="Score"
                            className="w-5 h-5 mr-1"
                          />
                          <span className="font-open-sans text-sm">
                            {Math.round(item.currentScore)}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-helvetica inline-block px-2 py-1 ${
                            item.rarity === "RARE"
                              ? "bg-sky-300"
                              : item.rarity === "EPIC"
                              ? "bg-purple-300"
                              : item.rarity === "LEGEND"
                              ? "bg-amber-300"
                              : "bg-gray-400"
                          } text-white font-bold rounded-lg text-center`}
                        >
                          {item.rarity}
                        </span>
                      </div>
                      <div className="flex justify-between w-full px-2 mt-1">
                        <span className="text-sm font-helvetica">Price:</span>
                        <span className="text-sm font-helvetica">
                          {item.price} ETH
                        </span>
                      </div>
                      {/* <div className="flex justify-end items-center w-full px-2 mt-1">
                        <span className="text-sm font-helvetica">
                          {item.trend}%
                        </span>
                        {item.trend > 0 ? (
                          <span className="ml-2">{upArrow}</span>
                        ) : (
                          <span className="ml-2">{downArrow}</span>
                        )}
                      </div> */}
                      <div className="flex justify-between w-full px-2 mt-1">
                        <span className="text-sm font-helvetica">Own:</span>
                        <span className="text-sm font-helvetica">
                          {item.shares}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Inventory;
