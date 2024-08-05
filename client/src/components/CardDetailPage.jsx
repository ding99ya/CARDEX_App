import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useParams } from "react-router-dom";
import { encodeFunctionData } from "viem";
import { Contract, providers, BigNumber } from "ethers";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import abi from "../CardexV1.json";
import axios from "axios";
import BuyModal from "./BuyModal.jsx";
import SellModal from "./SellModal.jsx";
import io from "socket.io-client";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import "../index.css";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

const socket = io("https://cardex-backend-api-97f9d94676f3.herokuapp.com/");

function CardDetailPage() {
  const { sendTransaction, user } = usePrivy();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();

  const Navigate = useNavigate();

  // CardexV1 contract instance
  const contract = new web3.eth.Contract(
    abi,
    process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR
  );

  const [card, setCard] = useState({
    name: "card",
    photo: "https://cardsimage.s3.amazonaws.com/default/loading.jpg",
    uniqueId: "0",
    price: 0,
    category: "card",
    lastPrice: 0,
    shares: 0,
    initialSharesPrice: 0,
    ipoSharesPrice: 0,
    ipoShares: 0,
  });

  const [isFront, setIsFront] = useState(true);
  const [userShares, setUserShares] = useState(0);

  const { uniqueId } = useParams();

  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);

  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentpage] = useState(2);
  const [hasMore, setHasMore] = useState(true);

  const [holders, setHolders] = useState([]);

  const [activeTab, setActiveTab] = useState("activity");

  const fetchActivities = async () => {
    console.log("Fetching Activities...");
    const response = await axios.get(`/api/cardactivity/${uniqueId}`, {
      params: { page: currentPage, limit: 30 },
    });

    const data = response.data;
    setActivities((prevActivities) => [...prevActivities, ...response.data]);

    setCurrentpage(currentPage + 1);
    setHasMore(data.length === 30);
  };

  const formatTime = (time) => {
    const now = moment();
    const activityTime = moment(time);
    const diffInSeconds = now.diff(activityTime, "seconds");

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    }
  };

  const updateCard = (currentHolders) => {
    setCard((prevCard) => {
      const q = Math.pow(
        prevCard.ipoSharesPrice / prevCard.initialSharesPrice,
        1 / prevCard.ipoShares
      );

      const a = prevCard.initialSharesPrice;
      const b = Math.pow(q, Number(currentHolders) + 1);
      const c = Math.pow(q, Number(currentHolders));
      const d = q - 1;

      const currentPrice = ((a * (b - c)) / d).toFixed(4);

      const fetchedLastPrice = prevCard.lastPrice;
      const currentTrend = getTrend(currentPrice, fetchedLastPrice);

      return {
        ...prevCard,
        price: currentPrice,
        trend: currentTrend,
        shares: currentHolders,
      };
    });
  };

  // function to add listener to Buy() event onchain so that Buy() event can trigger price, share holders update
  function addBuyListener() {
    const eventSubscription = contract.events.Buy({}, async (error, data) => {
      if (error) {
        console.log(error);
      } else {
        const cardID = data.returnValues[0];

        // Update current card info
        if (uniqueId.toString() === cardID.toString()) {
          const currentHolders = Number(data.returnValues[4]);
          updateCard(currentHolders);

          // Update user's current balance
          const eventUser = data.returnValues[1];
          if (eventUser.toString() === embeddedWalletAddress.toString()) {
            fetchUserShares();
          }
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

        // Update current card info
        if (uniqueId.toString() === cardID.toString()) {
          const currentHolders = Number(data.returnValues[4]);
          updateCard(currentHolders);

          // Update user's current balance
          const eventUser = data.returnValues[1];
          if (eventUser.toString() === embeddedWalletAddress.toString()) {
            fetchUserShares();
          }
        }
      }
    });

    return eventSubscription;
  }

  function addWebSocketListener() {
    socket.on("cardUpdate", (updatedCard) => {
      const cardID = updatedCard.uniqueId;

      if (uniqueId.toString() === cardID.toString()) {
        setCard((prevCard) => {
          const currentHolders = Number(updatedCard.shares);
          const currentPrice = Number(updatedCard.price);
          const currentTrend = getTrend(currentPrice, prevCard.lastPrice);
          return {
            ...prevCard,
            price: currentPrice,
            trend: currentTrend,
            shares: currentHolders,
          };
        });
        fetchUserShares();
      }
    });
  }

  // Function to calculate the cost to buy certain amount of shares
  const loadUserCost = async (shares) => {
    const userCost = await contract.methods
      .getBuyPriceAfterFee(uniqueId, shares)
      .call();
    return userCost.toString();
  };

  // Function to calculate the profit when selling certain amount of shares
  const loadUserProfit = async (shares) => {
    const userProfit = await contract.methods
      .getSellPriceAfterFee(uniqueId, shares)
      .call();
    return userProfit.toString();
  };

  // Function to obtain the accumulated fee for the user
  const loadUserFee = async () => {
    const userFee = await contract.methods
      .getFee(uniqueId, embeddedWalletAddress)
      .call();
    return userFee.toString();
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

  // A wrapper function to obtain the profit
  const fetchProfit = async (shares) => {
    try {
      const userProfit = await loadUserProfit(shares);
      return userProfit;
    } catch (error) {
      console.log(error);
    }
  };

  // A wrapper function to obtain the fee
  const fetchFee = async () => {
    try {
      const userFee = await loadUserFee();
      return userFee;
    } catch (error) {
      console.log(error);
    }
  };

  // UI Configuration for Privy prompt when claiming fees
  const getClaimUiConfig = async () => {
    const userFee = await fetchFee();
    const userFeeToBigNumber = BigNumber.from(userFee);
    const oneEther = BigNumber.from("1000000000000000000");
    const userFeeInETH =
      Number(userFeeToBigNumber.mul(10000).div(oneEther)) / 10000;

    return {
      header: card.name,
      description: "Claim " + userFeeInETH + " ETH",
      transactionInfo: {
        contractInfo: {
          imgUrl: card.photo,
        },
      },
      buttonText: "Claim",
    };
  };

  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "buyShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
      chainId: 84532,
      data: data,
      value: BigNumber.from(value).toHexString(),
    };

    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const txReceipt = await sendTransaction(transaction, buyUiConfig);
    } catch (error) {
      console.log(error);
    }

    setOpenBuyModal(false);
  };

  // Function to sell certain amount of shares
  const sell = async (shares, sellUiConfig) => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "sellShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
      chainId: 84532,
      data: data,
    };
    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const txReceipt = await sendTransaction(transaction, sellUiConfig);
    } catch (error) {
      console.log(error);
    }

    setOpenSellModal(false);
  };

  // Function to claim the accumulated fees for current card
  const claim = async () => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "claim",
      args: [uniqueId],
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
  };

  // Function to fetch current card share price from blockchain
  const loadCurrentPrice = async () => {
    const initialPrice = await contract.methods.getBuyPrice(uniqueId, 1).call();
    return initialPrice.toString();
  };

  // Function to fetch current card share holders from blockchain
  const loadShareHolders = async () => {
    const shareHolders = await contract.methods.boughtShares(uniqueId).call();
    return shareHolders.toString();
  };

  // Function to fetch user's current shares from blockchain
  const loadUserShares = async () => {
    const userShares = await contract.methods
      .sharesBalance(uniqueId, embeddedWalletAddress)
      .call();
    return userShares.toString();
  };

  // Function to transfer current price to a format with 3 decimals (X.XXX ETH)
  // This method is not currently used because the price will be fetched from backend and updated per calculations
  // Keep it for potential future use
  const getPrice = async () => {
    const price = await loadCurrentPrice();
    const priceToBigNumber = BigNumber.from(price);
    const oneEther = BigNumber.from("1000000000000000000");
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
  const getHolders = async () => {
    const holders = await loadShareHolders();
    return holders;
  };

  const fetchUserShares = async () => {
    try {
      const shares = await loadUserShares();
      setUserShares(Number(shares));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch card with specific uniqueId
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`/api/cards/${uniqueId}`);
        const fetchedCard = response.data;

        setCard(fetchedCard);
      } catch (error) {
        console.error(`Error fetching ${uniqueId} card:`, error);
      }
    };
    fetchCardData();

    fetchUserShares();

    // const fetchCardActivity = async (page) => {
    //   try {
    //     const response = await axios.get(`/api/cardactivity/${uniqueId}`, {
    //       params: { page: page, limit: 10 },
    //     });
    //     console.log(response.data);
    //   } catch (error) {
    //     console.error(`Error fetching card activity:`, error);
    //   }
    // };
    // fetchCardActivity(2);

    const fetchCardHolder = async () => {
      try {
        const response = await axios.get(`/api/cardholders/${uniqueId}`);
        console.log(response.data);
        setHolders(response.data);
      } catch (error) {
        console.error(`Error fetching card holders:`, error);
      }
    };
    fetchCardHolder();

    const fetchInitialActivities = async () => {
      console.log("Fetching Initial Activities...");
      const response = await axios.get(`/api/cardactivity/${uniqueId}`, {
        params: { page: 1, limit: 30 },
      });
      setActivities(response.data);
      setHasMore(response.data.length === 30);
    };

    fetchInitialActivities();

    // const buyEventSubscription = addBuyListener();
    // const sellEventSubscription = addSellListener();
    addWebSocketListener();

    return () => {
      socket.off("cardUpdate");
      console.log("Event successfully unsubscribed!");
    };
  }, [uniqueId]);

  const handleNextClick = () => {
    setIsFront(false);
  };

  const handlePrevClick = () => {
    setIsFront(true);
  };

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      Navigate(location.state.from);
    } else {
      Navigate("/homepage");
    }
  };

  if (!card) {
    return <div>Loading...</div>;
  }

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
    <div className="container mx-auto p-4 flex flex-col lg:flex-row justify-between items-start">
      <div className="w-full lg:w-1/2 mb-4 lg:mb-0 lg:mr-4">
        <span
          onClick={() => handleBackClick()}
          className="cursor-pointer inline-block bg-white text-black px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex flex-col items-center w-full">
          <img
            src={isFront ? card.photo : card.backPhoto}
            alt={card.name}
            className="w-1/2 max-h-screen object-cover"
          />
          <div className="flex mt-4">
            <button
              onClick={handlePrevClick}
              className={`cursor-pointer inline-block px-4 py-2 font-semibold whitespace-nowrap ${
                isFront ? "text-gray-400" : "text-black"
              }`}
              disabled={isFront}
            >
              &lt;
            </button>
            <button
              onClick={handleNextClick}
              className={`cursor-pointer inline-block px-4 py-2 font-semibold whitespace-nowrap ${
                isFront ? "text-black" : "text-gray-400"
              }`}
              disabled={!isFront}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        <div className="p-2">
          <h2 className="text-2xl font-bold mb-4">{card.name}</h2>

          <div className="text-center w-full">
            <div className="flex justify-end w-full">
              <span
                className={`text-sm font-helvetica inline-block px-4 py-1 ${
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
            <div className="flex justify-between w-full mt-1">
              <span className="text-base font-helvetica">Price:</span>
              <span className="text-base font-helvetica">{card.price} ETH</span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-base font-helvetica">Holders:</span>
              <span className="text-base font-helvetica">{card.shares}</span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-base font-helvetica">Position:</span>
              <span className="text-base font-helvetica">{userShares}</span>
            </div>
          </div>

          <div className="flex justify-between items-center space-x-2 mt-4 mb-4">
            <button
              onClick={() => setOpenBuyModal(true)}
              className="w-1/3 bg-white text-black font-bold border-2 border-black px-4 py-2 rounded-full shadow hover:bg-black hover:text-white"
            >
              Buy
            </button>
            <BuyModal
              open={openBuyModal}
              onClose={() => setOpenBuyModal(false)}
              buy={buy}
              fetchCost={fetchCost}
              cardName={card.name}
              cardPhoto={card.photo}
            />
            <button
              onClick={() => setOpenSellModal(true)}
              className={classNames(
                "w-1/3 px-4 py-2 font-bold border-2 border-black rounded-full shadow",
                {
                  "bg-white text-black hover:bg-black hover:text-white": !(
                    userShares === 0 || card.shares === 0
                  ),
                  "bg-gray-200 text-black":
                    userShares === 0 || card.shares === 0,
                }
              )}
              disabled={userShares === 0 || card.shares === 0}
            >
              Sell
            </button>
            <SellModal
              open={openSellModal}
              shareHolders={card.shares}
              userShares={userShares}
              onClose={() => setOpenSellModal(false)}
              sell={sell}
              fetchProfit={fetchProfit}
              cardName={card.name}
              cardPhoto={card.photo}
            />
            <button
              onClick={() => claim()}
              className="w-1/3 bg-white text-black font-bold border-2 border-black px-4 py-2 rounded-full shadow hover:bg-black hover:text-white"
            >
              Claim
            </button>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex border-b">
            <button
              className={`py-2 px-4 font-semibold ${
                activeTab === "activity"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Activity
            </button>
            <button
              className={`py-2 px-4 font-semibold ${
                activeTab === "holders"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("holders")}
            >
              Holders
            </button>
          </div>

          {activeTab === "activity" && (
            <div>
              <InfiniteScroll
                dataLength={activities.length}
                next={fetchActivities}
                hasMore={hasMore}
                loader={<p>Loading...</p>}
              >
                <table
                  className="min-w-full bg-white border border-black rounded-xl overflow-hidden"
                  style={{ borderCollapse: "separate", borderSpacing: 0 }}
                >
                  <thead className="bg-sky-100 rounded-t-xl h-16">
                    <tr>
                      <th className="py-2 px-4 text-left">TIME</th>
                      <th className="py-2 px-4 text-left">QUANTITY</th>
                      <th className="py-2 px-4 text-center">TRADER</th>
                      <th className="py-2 px-4 text-center">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity, index) => (
                      <tr
                        className={`hover:border hover:border-black cursor-pointer h-12 ${
                          index === activities.length - 1 ? "rounded-b-xl" : ""
                        } ${index % 2 === 1 ? "bg-sky-100" : "bg-white"}`}
                        // onClick={() => handleUserClick(user)}
                      >
                        <td className="py-2 px-4 text-left">
                          <div className="flex items-center">
                            <span>{formatTime(activity.time)}</span>
                          </div>
                        </td>
                        <td
                          className={`py-2 px-4 text-left ${
                            activity.isBuy ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {activity.isBuy
                            ? `Buy ${activity.shares}`
                            : `Sell ${activity.shares}`}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <img
                              src={activity.profilePhoto}
                              alt={`${activity.name}'s profile`}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <span>{activity.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-center">
                          {activity.ethAmount} ETH
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InfiniteScroll>
            </div>
          )}

          {activeTab === "holders" && (
            <div>
              <table
                className="min-w-full bg-white border border-black rounded-xl overflow-hidden"
                style={{ borderCollapse: "separate", borderSpacing: 0 }}
              >
                <thead className="bg-sky-100 rounded-t-xl h-16">
                  <tr>
                    <th className="py-2 px-4 text-left">HOLDER</th>
                    <th className="py-2 px-4 text-center">POSITION</th>
                    <th className="py-2 px-4 text-center">WORTH</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => (
                    <tr
                      className={`hover:border hover:border-black cursor-pointer h-12 ${
                        index === activities.length - 1 ? "rounded-b-xl" : ""
                      } ${index % 2 === 1 ? "bg-sky-100" : "bg-white"}`}
                      // onClick={() => handleUserClick(user)}
                    >
                      <td className="py-2 px-4 text-left">
                        <div className="flex items-center">
                          <img
                            src={holder.profilePhoto}
                            alt={`${holder.name}'s profile`}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          {holder.name}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">
                        {holder.shares} shares
                      </td>
                      <td className="py-2 px-4 text-center">
                        {(Number(holder.shares) * Number(card.price)).toFixed(
                          4
                        )}{" "}
                        ETH
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CardDetailPage;
