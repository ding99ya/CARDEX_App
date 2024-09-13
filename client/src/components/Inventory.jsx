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

  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        const response = await axios.get(
          `/api/users/${embeddedWalletAddress.toString()}`
        );

        setInventory(response.data.cardInventory);
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

  return (
    <div className="flex flex-col lg:flex-row px-2 lg:px-0 min-h-screen bg-gray-100">
      <div className="w-full lg:px-4">
        {userCards.length === 0 ? (
          <div>
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 mx-1 lg:mx-6">
              <span className="font-semibold text-sm">
                Inventory Worth: {totalWorth} ETH
              </span>
              <button
                onClick={() => claim()}
                className="bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-black hover:text-white transition duration-300"
              >
                Claim All
              </button>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg mt-6">Empty Collectible Inventory</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 mx-1 lg:mx-6">
              <span className="font-semibold text-sm">
                Inventory Worth: {totalWorth} ETH
              </span>
              <button
                onClick={() => claim()}
                className="bg-blue-400 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
              >
                Claim All
              </button>
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
                      <div className="flex justify-end w-full px-2">
                        <span
                          className={`text-xs font-helvetica inline-block px-4 py-1 ${
                            item.rarity === "RARE"
                              ? "bg-sky-300"
                              : item.rarity === "EPIC"
                              ? "bg-purple-300"
                              : item.rarity === "LEGEND"
                              ? "bg-amber-300"
                              : "bg-gray-400"
                          } text-white font-bold rounded-full text-center`}
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
                        <span className="text-sm font-helvetica">
                          Position:
                        </span>
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
