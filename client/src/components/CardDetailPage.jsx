import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount, useSendTransaction } from "wagmi";
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
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import { useNavigation } from "./NavigationContext";
import Plotly from "plotly.js-dist";
import "../index.css";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ABSTRACT_ALCHEMY_KEY);

const socket = io("https://cardex-backend-api-97f9d94676f3.herokuapp.com/");

function CardDetailPage() {
  // const { sendTransaction, user } = usePrivy();
  const { user } = usePrivy();
  const { sendTransaction, isPending } = useSendTransaction();
  const { address, status } = useAccount();
  const { wallets } = useWallets();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();

  const Navigate = useNavigate();

  const { goBack, navigateTo } = useNavigation();

  const plotContainerRef = useRef(null);

  const plotContainerRef2 = useRef(null);

  const plotContainerRef3 = useRef(null);

  // CardexV1 contract instance
  const contract = new web3.eth.Contract(
    abi,
    process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR
  );

  const [card, setCard] = useState({
    name: "card",
    photo: PresaleCard,
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
  const [locked, setLocked] = useState(0);

  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const [activeTab, setActiveTab] = useState("activity");

  const fetchActivities = async () => {
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

  // function to update card
  // deprecated
  // const updateCard = (currentHolders) => {
  //   setCard((prevCard) => {
  //     const q = Math.pow(
  //       prevCard.ipoSharesPrice / prevCard.initialSharesPrice,
  //       1 / prevCard.ipoShares
  //     );

  //     const a = prevCard.initialSharesPrice;
  //     const b = Math.pow(q, Number(currentHolders) + 1);
  //     const c = Math.pow(q, Number(currentHolders));
  //     const d = q - 1;

  //     const currentPrice = ((a * (b - c)) / d).toFixed(4);

  //     const fetchedLastPrice = prevCard.lastPrice;
  //     const currentTrend = getTrend(currentPrice, fetchedLastPrice);

  //     return {
  //       ...prevCard,
  //       price: currentPrice,
  //       trend: currentTrend,
  //       shares: currentHolders,
  //     };
  //   });
  // };

  // function to add listener to Buy() event onchain so that Buy() event can trigger price, share holders update
  // Deprecated
  // function addBuyListener() {
  //   const eventSubscription = contract.events.Buy({}, async (error, data) => {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       const cardID = data.returnValues[0];

  //       // Update current card info
  //       if (uniqueId.toString() === cardID.toString()) {
  //         const currentHolders = Number(data.returnValues[4]);
  //         updateCard(currentHolders);

  //         // Update user's current balance
  //         const eventUser = data.returnValues[1];
  //         if (eventUser.toString() === embeddedWalletAddress.toString()) {
  //           fetchUserShares();
  //         }
  //       }
  //     }
  //   });

  //   return eventSubscription;
  // }

  // function to add listener to Sell() event onchain so that Sell() event can trigger price, share holders update
  // Deprecated
  // function addSellListener() {
  //   const eventSubscription = contract.events.Sell({}, async (error, data) => {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       const cardID = data.returnValues[0];

  //       // Update current card info
  //       if (uniqueId.toString() === cardID.toString()) {
  //         const currentHolders = Number(data.returnValues[4]);
  //         updateCard(currentHolders);

  //         // Update user's current balance
  //         const eventUser = data.returnValues[1];
  //         if (eventUser.toString() === embeddedWalletAddress.toString()) {
  //           fetchUserShares();
  //         }
  //       }
  //     }
  //   });

  //   return eventSubscription;
  // }

  function addWebSocketListener() {
    socket.on("cardUpdate", (updatedCard) => {
      const cardID = updatedCard.uniqueId;

      if (uniqueId.toString() === cardID.toString()) {
        setCard((prevCard) => {
          const currentHolders = Number(updatedCard.shares);
          const currentPrice = Number(updatedCard.price);
          return {
            ...prevCard,
            price: currentPrice,
            shares: currentHolders,
          };
        });

        fetchUserShares();

        const fetchFirstActivity = async () => {
          try {
            const response = await axios.get(`/api/cardactivity/${uniqueId}`, {
              params: { page: 1, limit: 1 },
            });
            setActivities((prevActivities) => [
              response.data[0],
              ...prevActivities,
            ]);
            console.log("update activity");
          } catch (error) {
            console.error(error);
          }
        };

        const fetchCardHolders = async () => {
          try {
            const response = await axios.get(`/api/cardholders/${uniqueId}`);
            setHolders(response.data);
          } catch (error) {
            console.error(error);
          }
        };

        setTimeout(() => {
          fetchFirstActivity();
        }, 2000);

        setTimeout(() => {
          fetchCardHolders();
        }, 3000);
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

  // const removeLeadingZeroFromHex = (hexString) => {
  //   return "0x" + hexString.slice(2).replace(/^0+/, "");
  // };

  // Function to buy certain amount of shares on Abstract Testnet
  const buyOnAbstract = async (shares, value) => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "buyShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR,
      chainId: 11124,
      data: data,
      value: BigNumber.from(value).toHexString(),
    };

    try {
      await sendTransaction(transaction);
      alert("Success buy");
    } catch (error) {
      alert(error);
      console.log(error);
    }

    setOpenBuyModal(false);
  };

  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    // const walletType = wallets[0].walletClientType;

    // if (walletType === "privy") {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "buyShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR,
      chainId: 11124,
      data: data,
      value: BigNumber.from(value).toHexString(),
    };

    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const txReceipt = await sendTransaction(transaction, buyUiConfig);
    } catch (error) {
      console.log(error);
    }
    // } else {
    //   const provider = await wallets[0].getEthereumProvider();
    //   const data = encodeFunctionData({
    //     abi: abi,
    //     functionName: "buyShares",
    //     args: [uniqueId, parseInt(shares)],
    //   });
    //   try {
    //     const txHash = await provider.request({
    //       method: "eth_sendTransaction",
    //       params: [
    //         {
    //           from: wallets[0].address,
    //           to: process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR,
    //           value: removeLeadingZeroFromHex(
    //             BigNumber.from(value).toHexString()
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

  // Function to sell certain amount of shares on Abstract Testnet
  const sellOnAbstract = async (shares) => {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "sellShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR,
      chainId: 11124,
      data: data,
    };
    try {
      sendTransaction(transaction);
    } catch (error) {
      console.log(error);
    }

    setOpenSellModal(false);
  };

  // Function to sell certain amount of shares
  const sell = async (shares, sellUiConfig) => {
    // const walletType = wallets[0].walletClientType;

    // if (walletType === "privy") {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "sellShares",
      args: [uniqueId, parseInt(shares)],
    });

    const transaction = {
      to: process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR,
      chainId: 11124,
      data: data,
    };
    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const txReceipt = await sendTransaction(transaction, sellUiConfig);
    } catch (error) {
      console.log(error);
    }
    // } else {
    //   const provider = await wallets[0].getEthereumProvider();
    //   const data = encodeFunctionData({
    //     abi: abi,
    //     functionName: "sellShares",
    //     args: [uniqueId, parseInt(shares)],
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

    setOpenSellModal(false);
  };

  // Function to claim the accumulated fees for current card
  const claim = async () => {
    // const walletType = wallets[0].walletClientType;

    // if (walletType === "privy") {
    const data = encodeFunctionData({
      abi: abi,
      functionName: "claim",
      args: [uniqueId],
    });

    const transaction = {
      to: process.env.REACT_APP_ABSTRACT_CARDEXV1_CONTRACT_ADDR,
      chainId: 11124,
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
    //   const data = encodeFunctionData({
    //     abi: abi,
    //     functionName: "claim",
    //     args: [uniqueId],
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
      .sharesBalance(uniqueId, address)
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

    console.log("User:", user);

    console.log("Address:", address);

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

    const fetchLocked = async () => {
      const now = new Date();

      const cstTime = new Date(
        now.toLocaleString("en-US", { timeZone: "America/Chicago" })
      );

      const currentDay = cstTime.getDay();
      const currentHour = cstTime.getHours();

      if (
        (currentDay === 4 && currentHour >= 12) ||
        currentDay === 5 ||
        currentDay === 6 ||
        (currentDay === 0 && currentHour < 12)
      ) {
        setLocked(0);
      } else {
        try {
          const response = await axios.get(`/api/ctournament/lockedCount`, {
            params: {
              walletAddress: address,
              uniqueId: uniqueId,
            },
          });

          setLocked(Number(response.data));
        } catch (error) {
          console.error(
            `Error fetching locked number for card${uniqueId}:`,
            error
          );
        }
      }
    };
    fetchLocked();

    // const fetchCardHolder = async () => {
    //   try {
    //     const response = await axios.get(`/api/cardholders/${uniqueId}`);
    //     setHolders(response.data);
    //   } catch (error) {
    //     console.error(`Error fetching card holders:`, error);
    //   }
    // };
    // fetchCardHolder();

    const fetchInitialActivities = async () => {
      const response = await axios.get(`/api/cardactivity/${uniqueId}`, {
        params: { page: 1, limit: 30 },
      });
      setActivities(response.data);
      setHasMore(response.data.length === 30);
    };

    fetchInitialActivities();

    addWebSocketListener();

    return () => {
      socket.off("cardUpdate");
    };
  }, [uniqueId]);

  useEffect(() => {
    if (activeTab === "holders" && holders.length === 0) {
      const fetchCardHolder = async () => {
        try {
          const response = await axios.get(`/api/cardholders/${uniqueId}`);
          setHolders(response.data);
        } catch (error) {
          console.error(`Error fetching card holders:`, error);
        }
      };

      fetchCardHolder();

      return;
    } else if (activeTab === "price" && plotContainerRef.current) {
      const fetchCardPriceHistory = async () => {
        try {
          const response = await axios.get(`/api/prices/${uniqueId}`);
          console.log(response.data);

          const prices = response.data.priceHistory.map((item) => item.price);
          const times = response.data.priceHistory.map((item) => item.time);

          const data = [
            {
              x: times,
              y: prices,
              type: "scatter",
              mode: "lines",
              line: { color: "#60A5FA", shape: "spline", smoothing: 0.3 },
              hovertemplate: "Price: %{y} ETH<extra></extra>",
            },
          ];

          const layout = {
            // title: "My Custom Plot",
            // xaxis: { title: "X Axis" },
            // yaxis: { title: "Y Axis" },
            margin: {
              l: 40,
              r: 20,
              t: 0,
              b: 40,
            },
            yaxis: {
              range: [0, null],
              fixedrange: true,
            },
            xaxis: {
              // type: "date",
              // tickformat: "%b-%d",
              fixedrange: true,
            },
            hovermode: "x",
            hoverdistance: 100,
          };

          Plotly.newPlot(plotContainerRef.current, data, layout, {
            displayModeBar: false,
            // staticPlot: true,
            scrollZoom: false,
          });
        } catch (error) {
          console.error(`Error fetching card price history:`, error);
        }
      };

      fetchCardPriceHistory();

      return;
    } else if (activeTab === "rank" && plotContainerRef2.current) {
      const fetchCardRankHistory = async () => {
        try {
          const response = await axios.get(`/api/historyRanks/${uniqueId}`);
          console.log(response.data);

          const ranks = response.data.historyRank.map((item) => item.rank);
          const times = response.data.historyRank.map((item) => item.time);

          const data = [
            {
              x: times,
              y: ranks,
              type: "scatter",
              mode: "lines",
              line: { color: "#60A5FA" },
              hovertemplate: "Rank: %{y}<extra></extra>",
            },
          ];

          const layout = {
            // title: "My Custom Plot",
            // xaxis: { title: "X Axis" },
            // yaxis: { title: "Y Axis" },
            xaxis: {
              type: "date",
              tickformat: "%b-%d",
              // type: "category",
              fixedrange: true,
            },
            yaxis: {
              range: [0, null],
              fixedrange: true,
            },
            margin: {
              l: 40,
              r: 20,
              t: 0,
              b: 40,
            },
            hovermode: "x",
            hoverdistance: 100,
          };

          Plotly.newPlot(plotContainerRef2.current, data, layout, {
            displayModeBar: false,
            scrollZoom: false,
          });
        } catch (error) {
          console.error(`Error fetching card rank history:`, error);
        }
      };

      fetchCardRankHistory();

      return;
    } else if (activeTab === "score" && plotContainerRef3.current) {
      const fetchCardScoreHistory = async () => {
        try {
          const response = await axios.get(`/api/historyScores/${uniqueId}`);
          console.log(response.data);

          const scores = response.data.historyScore.map((item) => item.score);
          const times = response.data.historyScore.map((item) => item.time);

          const data = [
            {
              x: times,
              y: scores,
              type: "scatter",
              mode: "lines",
              line: { color: "#60A5FA", shape: "spline", smoothing: 0.3 },
              hovertemplate: "Score: %{y}<extra></extra>",
            },
          ];

          const layout = {
            // title: "My Custom Plot",
            // xaxis: { title: "X Axis" },
            // yaxis: { title: "Y Axis" },
            xaxis: {
              // type: "category",
              type: "date",
              tickformat: "%b-%d",
              fixedrange: true,
            },
            yaxis: {
              range: [0, null],
              fixedrange: true,
            },
            margin: {
              l: 40,
              r: 20,
              t: 0,
              b: 40,
            },
            hovermode: "x",
            hoverdistance: 100,
          };

          Plotly.newPlot(plotContainerRef3.current, data, layout, {
            displayModeBar: false,
            scrollZoom: false,
          });
        } catch (error) {
          console.error(`Error fetching card score history:`, error);
        }
      };

      fetchCardScoreHistory();

      return;
    }
  }, [activeTab]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 600) {
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

  const handleNextClick = () => {
    setIsFront(false);
  };

  const handlePrevClick = () => {
    setIsFront(true);
  };

  const handleUserClick = (username) => {
    Navigate(`/users/${username}`, {
      state: { from: location.pathname },
    });
  };

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      Navigate(location.state.from);
    } else {
      Navigate("/market");
    }
  };

  if (!card) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img
          src="/Loading.gif"
          alt="Loading..."
          style={{ marginTop: "-20vh" }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row justify-between items-start relative">
      <div className="w-full lg:w-1/2 lg:mb-0 lg:mr-4">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black px-4 py-2 mb-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex flex-col items-center w-full border-2 border-b border-gray-300 rounded-t-3xl lg:border-b-2 lg:rounded-3xl p-6">
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
      <div className="w-full lg:w-1/2 lg:mt-12 relative">
        <div className="p-4 lg:p-6 border-2 border-l-gray-300 border-r-gray-300 border-b-gray-300 lg:border-t-gray-300 rounded-b-3xl lg:rounded-3xl">
          <h2 className="text-xl lg:text-2xl font-bold mb-4">{card.name}</h2>

          <div className="text-center w-full">
            <div className="flex justify-between w-full mb-2">
              <div className={"flex items-center"}>
                <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                <span className="font-open-sans text-base">
                  {Math.round(card.currentScore)}
                </span>
              </div>
              <span
                className={`text-sm font-helvetica inline-block px-4 py-1 ${
                  card.rarity === "COMMON"
                    ? "bg-green-300"
                    : card.rarity === "RARE"
                    ? "bg-sky-300"
                    : card.rarity === "EPIC"
                    ? "bg-purple-300"
                    : card.rarity === "LEGEND"
                    ? "bg-amber-300"
                    : "bg-gray-400"
                } text-white font-bold rounded-lg text-center`}
              >
                {card.rarity}
              </span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-sm font-semibold font-helvetica">
                Price:
              </span>
              <span className="text-sm font-semibold font-helvetica">
                {card.price} ETH
              </span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-sm font-semibold font-helvetica">
                Supply:
              </span>
              <span className="text-sm font-semibold font-helvetica">
                {Number(card.shares) + 10}
              </span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-sm font-semibold font-helvetica">Own:</span>
              <span className="text-sm font-semibold font-helvetica">
                {userShares}
              </span>
            </div>
            <div className="flex justify-between w-full mt-1">
              <span className="text-sm font-semibold font-helvetica">
                Locked:
              </span>
              <span className="text-sm font-semibold font-helvetica">
                {locked}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center space-x-2 mt-4 mb-2">
            <button
              onClick={() => setOpenBuyModal(true)}
              className="w-1/2 bg-blue-400 text-sm text-white font-bold px-4 py-2 rounded-full  hover:bg-blue-500 hover:text-white"
            >
              Buy
            </button>
            <button
              onClick={() => setOpenSellModal(true)}
              className={classNames(
                "w-1/2 px-4 py-2 text-sm rounded-full border border-gray-300 px-[calc(1rem-2px)] py-[calc(0.5rem-1px)]",
                {
                  "bg-white text-black hover:bg-gray-200": !(
                    userShares === 0 ||
                    card.shares === 0 ||
                    userShares <= locked
                  ),
                  "bg-white text-gray-200":
                    userShares === 0 ||
                    card.shares === 0 ||
                    userShares <= locked,
                }
              )}
              disabled={
                userShares === 0 || card.shares === 0 || userShares <= locked
              }
            >
              Sell
            </button>

            {/* <button
              onClick={() => claim()}
              className="w-1/3 bg-white text-sm text-black border border-gray-300 px-[calc(1rem-2px)] py-[calc(0.5rem-1px)] rounded-full hover:bg-gray-200 hover:text-black"
            >
              Claim
            </button> */}
          </div>
        </div>

        <div className="mt-8 relative z-0">
          <div className="flex border-b-0 mb-2">
            <button
              className={`py-2 px-4 font-semibold text-sm ${
                activeTab === "activity"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              Tx
            </button>
            <button
              className={`py-2 px-4 font-semibold text-sm ${
                activeTab === "holders"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("holders")}
            >
              Holders
            </button>
            <button
              className={`py-2 px-4 font-semibold text-sm ${
                activeTab === "price"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("price")}
            >
              Price
            </button>
            <button
              className={`py-2 px-4 font-semibold text-sm ${
                activeTab === "score"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("score")}
            >
              Score
            </button>
            <button
              className={`py-2 px-4 font-semibold text-sm ${
                activeTab === "rank"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab("rank")}
            >
              Rank
            </button>
          </div>

          {activeTab === "activity" && (
            <div className="relative max-w-full z-0">
              <InfiniteScroll
                dataLength={activities.length}
                next={fetchActivities}
                hasMore={hasMore}
                loader={<p>Loading...</p>}
              >
                <table
                  className="min-w-full bg-white border border-gray-300 rounded-xl overflow-hidden"
                  style={{ borderCollapse: "separate", borderSpacing: 0 }}
                >
                  <thead className="bg-gray-100 rounded-t-xl h-12 text-gray-500 text-xs lg:text-sm font-open-sans">
                    <tr>
                      <th className="py-2 px-4 text-left">Time</th>
                      <th className="py-2 px-4 text-left">Trader</th>
                      <th className="py-2 px-4 text-center">Qty</th>
                      <th className="py-2 px-4 text-center">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length === 0 ? (
                      <tr className="h-10 text-xs lg:text-sm font-open-sans">
                        <td colSpan="4" className="py-2 text-center">
                          No Activities
                        </td>
                      </tr>
                    ) : (
                      activities.map((activity, index) => (
                        <tr
                          className={`cursor-pointer h-10 text-xs lg:text-sm font-open-sans ${
                            index === activities.length - 1
                              ? "rounded-b-xl"
                              : ""
                          } ${index % 2 === 1 ? "bg-gray-100" : "bg-white"}`}
                          onClick={() =>
                            navigateTo(`/users/${activity.username}`)
                          }
                        >
                          <td className="py-2 pl-4 text-left">
                            <div className="flex items-center">
                              <span>{formatTime(activity.time)}</span>
                            </div>
                          </td>
                          <td className="py-2 pl-4 text-left">
                            {/* <div className="flex items-center justify-start"> */}
                            {/* <img
                                src={activity.profilePhoto}
                                alt={`${activity.name}'s profile`}
                                className="w-6 h-6 rounded-full mr-2"
                              /> */}
                            <span>{activity.username}</span>
                            {/* </div> */}
                          </td>
                          <td
                            className={`py-2 text-center ${
                              activity.isBuy ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {activity.isBuy
                              ? `Buy ${activity.shares}`
                              : `Sell ${activity.shares}`}
                          </td>
                          <td className="py-2 text-center">
                            {activity.ethAmount} ETH
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </InfiniteScroll>
            </div>
          )}

          {activeTab === "holders" && (
            <div className="max-w-full">
              <table
                className="min-w-full bg-white border border-gray-300 rounded-xl overflow-hidden"
                style={{ borderCollapse: "separate", borderSpacing: 0 }}
              >
                <thead className="bg-gray-100 rounded-t-xl h-12 text-gray-500 text-xs lg:text-sm font-open-sans">
                  <tr>
                    <th className="py-2 px-4 text-left">Holder</th>
                    <th className="py-2 px-4 text-center">Position</th>
                    <th className="py-2 px-4 text-center">Worth</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.length === 0 ? (
                    <tr className="h-10 text-xs lg:text-sm font-open-sans">
                      <td colSpan="4" className="py-2 text-center">
                        No Holders
                      </td>
                    </tr>
                  ) : (
                    holders.map((holder, index) => (
                      <tr
                        className={`cursor-pointer h-10 text-xs lg:text-sm font-open-sans ${
                          index === activities.length - 1 ? "rounded-b-xl" : ""
                        } ${index % 2 === 1 ? "bg-gray-100" : "bg-white"}`}
                        onClick={() => navigateTo(`/users/${holder.username}`)}
                      >
                        <td className="py-2 pl-4 text-left">
                          <div className="flex items-center">
                            {/* <img
                              src={holder.profilePhoto}
                              alt={`${holder.name}'s profile`}
                              className="w-6 h-6 rounded-full mr-2"
                            /> */}
                            {holder.username}
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          {holder.shares} shares
                        </td>
                        <td className="py-2 text-center">
                          {(Number(holder.shares) * Number(card.price)).toFixed(
                            4
                          )}{" "}
                          ETH
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "price" && (
            <div class="flex justify-center overflow-hidden mt-4">
              <div
                ref={plotContainerRef}
                className="w-[200%] lg:w-[140%] h-[200px] max-w-screen-lg"
              ></div>
            </div>
          )}

          {activeTab === "rank" && (
            <div class="flex justify-center overflow-hidden mt-4">
              <div
                ref={plotContainerRef2}
                className="w-[200%] lg:w-[140%] h-[200px] max-w-screen-lg"
              ></div>
            </div>
          )}

          {activeTab === "score" && (
            <div class="flex justify-center overflow-hidden mt-4">
              <div
                ref={plotContainerRef3}
                className="w-[200%] lg:w-[140%] h-[200px] max-w-screen-lg"
              ></div>
            </div>
          )}
        </div>
      </div>

      <BuyModal
        open={openBuyModal}
        onClose={() => setOpenBuyModal(false)}
        buy={buyOnAbstract}
        fetchCost={fetchCost}
        cardName={card.name}
        cardPhoto={card.photo}
      />
      <SellModal
        open={openSellModal}
        shareHolders={card.shares}
        userShares={userShares}
        lockedShares={locked}
        onClose={() => setOpenSellModal(false)}
        sell={sellOnAbstract}
        fetchProfit={fetchProfit}
        cardName={card.name}
        cardPhoto={card.photo}
      />

      {isScrollToTopVisible && !openBuyModal && !openSellModal && (
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

export default CardDetailPage;
