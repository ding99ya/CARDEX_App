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
import NotificationOn from "./NotificationOn.png";
import NotificationOff from "./NotificationOff.png";
import DepositModal from "./DepositModal.jsx";
import WithdrawModal from "./WithdrawModal.jsx";
import abi from "../CardexV1.json";
import { encodeFunctionData } from "viem";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

// CardexV1 contract instance
const contract = new web3.eth.Contract(
  abi,
  process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR
);

function Profile() {
  const location = useLocation();

  const { fundWallet } = useFundWallet();

  const {
    logout,
    exportWallet,
    sendTransaction,
    user,
    linkTwitter,
    unlinkTwitter,
  } = usePrivy();
  const embeddedWalletAddress = user ? user.wallet.address : 0;
  const shortAddress = !!embeddedWalletAddress
    ? `${embeddedWalletAddress.slice(0, 6)}...${embeddedWalletAddress.slice(
        -4
      )}`
    : "0x0";
  const twitterProfilePhoto = user
    ? user.twitter.profilePictureUrl
    : "https://pbs.twimg.com/profile_images/1647822798566424576/ZfLTwjSK_normal.jpg";
  const twitterName = user ? user.twitter.name : "";
  const twitterUsername = user ? user.twitter.username : "";

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    Navigate("/login");
  };

  const [currentInviteCode, setCurrentInviteCode] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserPaperPoint, setCurrentUserPaperPoint] = useState(0);

  const [hover, setHover] = useState(false);
  const [copied, setCopied] = useState(false);

  const [twitterHover, setTwitterHover] = useState(false);
  const [twitterLinked, setTwitterLinked] = useState(
    !!user ? !!user.twitter : false
  );

  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(embeddedWalletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);
  const [userETHBalance, setUserETHBalance] = useState(0);

  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        const response = await axios.get(
          `/api/users/${embeddedWalletAddress.toString()}`
        );

        setInventory(response.data.cardInventory);
        setCurrentUsername(response.data.username);
        setCurrentInviteCode(response.data.inviteCode);

        // const fetchedLeaderboardData = await axios.get(
        //   `/api/leaderboard/${embeddedWalletAddress}`
        // );
        // setCurrentUserPaperPoint(fetchedLeaderboardData.data.paperPoints);

        // const balance = await web3.eth.getBalance(embeddedWalletAddress);
        // const balanceToBigNumber = BigNumber.from(balance);
        // const oneEther = BigNumber.from("1000000000000000000");
        // const balanceInETH =
        //   Number(balanceToBigNumber.mul(1000).div(oneEther)) / 1000;
        // setUserETHBalance(balanceInETH);
      } catch (error) {
        console.error(
          `Error fetching user ${embeddedWalletAddress} card inventory`,
          error
        );
      }
    };
    fetchUserPosition();

    const fetchUserLeaderboard = async () => {
      try {
        const fetchedLeaderboardData = await axios.get(
          `/api/leaderboard/${embeddedWalletAddress}`
        );
        setCurrentUserPaperPoint(fetchedLeaderboardData.data.paperPoints);
      } catch (error) {
        console.error(
          `Error fetching user ${embeddedWalletAddress} leaderboard`,
          error
        );
      }
    };
    fetchUserLeaderboard();

    const fetchUserWalletBalance = async () => {
      try {
        const balance = await web3.eth.getBalance(embeddedWalletAddress);
        const balanceToBigNumber = BigNumber.from(balance);
        const oneEther = BigNumber.from("1000000000000000000");
        const balanceInETH =
          Number(balanceToBigNumber.mul(1000).div(oneEther)) / 1000;
        setUserETHBalance(balanceInETH);
      } catch (error) {
        console.error(
          `Error fetching user ${embeddedWalletAddress} wallet balance`,
          error
        );
      }
    };
    fetchUserWalletBalance();

    const checkSubscriptionStatus = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscriptionStatus();

    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      const fetchCardPosition = async () => {
        // let worth = 0;

        try {
          // const cardPosition = await Promise.all(
          //   inventory.map(async (card) => {
          //     const response = await axios.get(`/api/cards/${card.uniqueId}`);
          //     const fetchedCard = response.data;
          //     fetchedCard.shares = card.shares;

          //     worth += fetchedCard.price * card.shares;
          //     return fetchedCard;
          //   })
          // );

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
      Navigate(`/cards/${card.uniqueId}`, {
        state: { from: location.pathname },
      });
    } else {
      Navigate(`/presalecards/${card.uniqueId}`, {
        state: { from: location.pathname },
      });
    }
  };

  const handleTwitterImageClick = (twitterURL) => {
    window.open(twitterURL, "_blank");
  };

  const linkOrUnlinkTwitter = () => {
    if (!user.twitter) {
      linkTwitter();
      setTwitterLinked(true);
    } else if (!!user.twitter) {
      unlinkTwitter(user.twitter.subject);
      setTwitterLinked(false);
    }
  };

  const transfer = async (
    destinationAddress,
    transferAmount,
    transferUiConfig
  ) => {
    const transaction = {
      to: destinationAddress,
      chainId: 84532,
      value: BigNumber.from(transferAmount).toHexString(),
    };

    try {
      const txReceipt = await sendTransaction(transaction, transferUiConfig);
      const balance = await web3.eth.getBalance(embeddedWalletAddress);
      const balanceToBigNumber = BigNumber.from(balance);
      const oneEther = BigNumber.from("1000000000000000000");
      const balanceInETH =
        Number(balanceToBigNumber.mul(1000).div(oneEther)) / 1000;
      setUserETHBalance(balanceInETH);
    } catch (error) {
      console.log(error);
    }
    // The returned `txReceipt` has the type `TransactionReceipt`
    setOpenWithdrawModal(false);
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
  };

  // const subscribe = async () => {
  //   try {
  //     const registration = await navigator.serviceWorker.ready;
  //     const response = await axios.get("/api/vapidPublicKey");
  //     console.log("Got vapid key");
  //     const vapidPublicKey = response.data;
  //     const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  //     const subscription = await registration.pushManager.subscribe({
  //       userVisibleOnly: true,
  //       applicationServerKey: convertedVapidKey,
  //     });
  //     console.log("Successfully got subscription");

  //     await axios.post("/api/subscribe", {
  //       subscription: subscription,
  //     });
  //     setIsSubscribed(true);
  //     alert("You have successfully subscribed to notifications!");
  //   } catch (error) {
  //     console.error("Error subscribing to notifications:", error);
  //     alert("Failed to subscribe to notifications. Please try again.");
  //   }
  // };

  const subscribe = async () => {
    try {
      // Check if the browser supports push notifications
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Push notifications are not supported in this browser.");
        return;
      }

      // Check the current permission state
      let permission = Notification.permission;
      if (permission === "denied") {
        alert("Please enable notification permission in device settings");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      // If permission is not granted, or there's no existing subscription, request permission
      if (permission === "default" || !subscription) {
        permission = await Notification.requestPermission();
        if (permission !== "granted") {
          alert("Please enable notification permission in device settings");
          return;
        }
      }

      // If there's no existing subscription, create one
      if (!subscription) {
        const response = await axios.get("/api/vapidPublicKey");
        console.log("Got vapid key");
        const vapidPublicKey = response.data;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
        console.log("Successfully created new subscription");
      } else {
        console.log("Using existing subscription");
      }

      // Send the subscription to the server
      await axios.post("/api/subscribe", {
        subscription: subscription,
      });
      setIsSubscribed(true);
      alert("You have successfully subscribed to notifications!");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
      alert("Failed to subscribe to notifications. Please try again.");
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.post("/api/unsubscribe", subscription);
        setIsSubscribed(false);
        alert("You have successfully unsubscribed from notifications.");
      }
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      alert("Failed to unsubscribe from notifications. Please try again.");
    }
  };

  const toggleSubscription = () => {
    if (isSubscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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
    <div className="flex flex-col lg:flex-row px-2 lg:px-0 min-h-screen bg-white lg:bg-gray-100">
      <div className="w-full lg:w-1/4 p-4 bg-white border border-gray-300 rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-start space-x-2 mb-2">
              <span
                className="w-12 h-12 bg-center bg-cover rounded-full mt-1"
                style={{
                  backgroundImage: `url(${twitterProfilePhoto})`,
                }}
              ></span>
              <div className="flex flex-col mt-1">
                <span className="text-xl text-black font-helvetica-neue font-semibold">
                  {twitterName}
                </span>
                <div
                  className="flex items-center cursor-pointer rounded-full"
                  onClick={() =>
                    handleTwitterImageClick("https://x.com/" + twitterUsername)
                  }
                >
                  <img
                    src={TwitterLogo}
                    alt="Twitter"
                    className="w-3 h-3 mr-1"
                  />
                  <span className="text-gray-400 font-open-sans text-xs">
                    @{twitterUsername}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm">{shortAddress}</span>
              <span
                className="relative cursor-pointer"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleCopy}
              >
                <img src={CopyIcon} alt="Copy" className="w-5 h-5" />
                {hover && !copied && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded hidden sm:block">
                    Copy
                  </span>
                )}
                {copied && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded">
                    Copied
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center">
            <button
              onClick={toggleSubscription}
              className={`py-1 rounded-full text-sm font-semibold text-gray-500 transition-colors duration-200 ease-in-out mt-2 flex items-center space-x-2`}
            >
              <img
                src={isSubscribed ? NotificationOff : NotificationOn}
                alt={isSubscribed ? "Turn Off" : "Turn On"}
                className="w-5 h-5 mr-1"
              />
              {isSubscribed ? "Turn Off" : "Turn On"}
            </button>

            <span
              onClick={exportWallet}
              className="cursor-pointer text-sm text-blue-600 mt-5"
              style={{ textDecoration: "underline" }}
            >
              Export Key
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4 border border-gray-300 rounded-3xl bg-gray-100">
            {/* <div className="flex items-left text-xl font-semibold">
              Inventory Worth: {totalWorth} ETH
              <img src={ETHSymbol} className="w-3 h-5 ml-2 mt-1" />
            </div> */}
            <div className="flex justify-between w-full mt-4 mx-4">
              <span className="text-base font-semibold text-gray-400">
                Invite Code:
              </span>
              <span className="text-base font-semibold text-gray-400 pr-8">
                {currentInviteCode}
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-base font-semibold text-gray-400">
                Paper Points:
              </span>
              <span className="text-base font-semibold text-gray-400 pr-8">
                {currentUserPaperPoint} Pts
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4 mb-4">
              <span className="text-base font-semibold text-gray-400">
                Inventory Worth:
              </span>
              <span className="text-base font-semibold text-gray-400 pr-8">
                {totalWorth} ETH
              </span>
            </div>
            {/* <div className="flex justify-center my-2 mx-4">
              <button
                onClick={() => claim()}
                className="w-full bg-white text-black border-2 border-black font-semibold py-2 px-4 mt-2 mb-2 rounded-full hover:bg-black hover:text-white transition duration-300"
              >
                Claim for All
              </button>
            </div> */}
            {/* <div className="text-lg">Your Invite Code: {currentInviteCode}</div>
            <div className="text-lg">Total Papers: {currentUserPaperPoint}</div> */}
            {/* <div className="flex items-left text-lg">
              Wallet Balance: {userETHBalance} ETH
              <img src={ETHSymbol} className="w-3 h-5 ml-2 mt-1" />
            </div> */}
          </div>
          <div className="flex flex-col items-left border border-gray-300 rounded-3xl bg-white">
            <div className="flex items-left space-x-2 mb-2 mx-4">
              <span className="relative mt-2">
                <img src={Wallet} alt="Wallet" className="w-10 h-10" />
              </span>
              <span className="text-xl text-black font-semibold mt-4">
                Wallet
              </span>
            </div>
            <div className="flex justify-between w-full mx-4">
              <span className="text-base font-semibold text-gray-500">
                Balance:
              </span>
              <span className="text-base font-semibold text-gray-500 pr-8">
                {userETHBalance} ETH
              </span>
            </div>
            <div className="flex justify-between items-center space-x-2 mt-4 mx-4">
              <button
                onClick={() => setOpenDepositModal(true)}
                className="w-1/2 bg-blue-400 text-white font-semibold items-center px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white"
              >
                Deposit
              </button>
              <button
                onClick={() => setOpenWithdrawModal(true)}
                className="w-1/2 bg-white text-black font-semibold items-center border border-gray-300 px-[calc(1rem-2px)] py-[calc(0.5rem-2px)] rounded-full hover:bg-gray-200 hover:text-black"
              >
                Withdraw
              </button>
            </div>
            <div className="flex justify-center my-4 mx-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white font-semibold px-4 py-2 rounded-full"
              >
                LOG OUT
              </button>
            </div>
          </div>
          {/* <div className="flex space-x-2">
            <button
              onClick={() => setOpenDepositModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Deposit
            </button>
            <button
              onClick={() => setOpenWithdrawModal(true)}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Withdraw
            </button>
          </div> */}
        </div>
        {/* <div className="flex justify-center mt-4">
          <button
            onClick={handleLogout}
            className="items-center w-1/4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            LOG OUT
          </button>
        </div> */}
      </div>
      <div className="hidden lg:block w-full lg:ml-[25%] lg:w-3/4 lg:px-4">
        {userCards.length === 0 ? (
          <div>
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 lg:mx-6">
              <span className="font-semibold text-base">
                Inventory Worth: {totalWorth} ETH
              </span>
              <button
                onClick={() => claim()}
                className="bg-blue-400 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
              >
                Claim for All
              </button>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-lg mt-6">Empty Collectible Inventory</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 lg:mx-6">
              <span className="font-semibold text-base">
                Inventory Worth: {totalWorth} ETH
              </span>
              <button
                onClick={() => claim()}
                className="bg-blue-400 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-500 hover:text-white transition duration-300"
              >
                Claim for All
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-4">
              {userCards.map(
                (item) =>
                  item.category !== "presale" ? (
                    <div
                      className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg lg:shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
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
                // (
                //   <div
                //     className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
                //     key={item.uniqueId}
                //     onClick={() => handleCardClick(item)}
                //     style={{
                //       borderTopLeftRadius: "1.25rem",
                //       borderBottomLeftRadius: "1.25rem",
                //       borderTopRightRadius: "1.25rem",
                //       borderBottomRightRadius: "1.25rem",
                //     }}
                //   >
                //     <div className="flex justify-center items-center relative">
                //       <img
                //         src={item.photo}
                //         alt={item.name}
                //         className="w-1/2 object-contain mt-6 transition duration-300 group-hover:scale-105 relative"
                //         style={{ zIndex: 10, aspectRatio: "2 / 3" }}
                //       />
                //     </div>
                //     <div className="p-2 text-left px-4">
                //       <span
                //         className="w-full font-helvetica-neue text-sm font-bold"
                //         style={{
                //           display: "-webkit-box",
                //           WebkitBoxOrient: "vertical",
                //           WebkitLineClamp: 2,
                //           overflow: "hidden",
                //           textOverflow: "ellipsis",
                //           width: "100%",
                //           whiteSpace: "normal",
                //         }}
                //       >
                //         {item.name}
                //       </span>
                //     </div>
                //     <div className="p-2 text-center w-full">
                //       <div className="flex justify-end w-full px-2">
                //         <span
                //           className={`text-xs font-helvetica inline-block px-4 py-1 ${
                //             item.rarity === "RARE"
                //               ? "bg-sky-300"
                //               : item.rarity === "EPIC"
                //               ? "bg-purple-300"
                //               : item.rarity === "LEGEND"
                //               ? "bg-amber-300"
                //               : "bg-gray-400"
                //           } text-white font-bold rounded-full text-center`}
                //         >
                //           {item.rarity}
                //         </span>
                //       </div>
                //       <div className="flex justify-between w-full px-2 mt-1">
                //         <span className="text-sm font-helvetica">Price:</span>
                //         <span className="text-sm font-helvetica">
                //           {item.price} ETH
                //         </span>
                //       </div>
                //       <div className="flex justify-between w-full px-2 mt-1">
                //         <span className="text-sm font-helvetica">
                //           Presale &nbsp;
                //         </span>
                //       </div>
                //       <div className="flex justify-between w-full px-2 mt-1">
                //         <span className="text-sm font-helvetica">
                //           Position:
                //         </span>
                //         <span className="text-sm font-helvetica">
                //           {item.shares}
                //         </span>
                //       </div>
                //     </div>
                //   </div>
                // )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dark Overlay */}
      {openDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      {/* Deposit Modal */}
      {openDepositModal && (
        <DepositModal
          open={openDepositModal}
          onClose={() => {
            setOpenDepositModal(false);
          }}
          embeddedWalletAddress={embeddedWalletAddress}
          fundWallet={fundWallet}
          className="z-50"
        />
      )}

      {/* Dark Overlay */}
      {openWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
      )}

      {/* Withdraw Modal */}
      {openWithdrawModal && (
        <WithdrawModal
          open={openWithdrawModal}
          onClose={() => {
            setOpenWithdrawModal(false);
          }}
          transfer={transfer}
          userBalance={Number(userETHBalance)}
          className="z-50"
        />
      )}
    </div>
  );
}

export default Profile;
