import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Contract, providers, BigNumber } from "ethers";
import axios from "axios";
import CopyIcon from "./Copy-Icon.jpg";
import Wallet from "./Wallet.jpg";
import TwitterLogo from "./TwitterLogo.png";
import NotificationOn from "./NotificationOn.png";
import NotificationOff from "./NotificationOff.png";
import sortingIcon from "./Sorting.svg";
import filterIcon from "./Filter.png";
import Score from "./Score.png";
import PresaleCard from "./PresaleCard.png";
import DepositModal from "./DepositModal.jsx";
import WithdrawModal from "./WithdrawModal.jsx";
import SubscribeModal from "./SubscribeModal.jsx";
import UnsubscribeModal from "./UnsubscribeModal.jsx";
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

function Profile() {
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
  const shortAddress = !!embeddedWalletAddress
    ? `${embeddedWalletAddress.slice(0, 6)}...${embeddedWalletAddress.slice(
        -4
      )}`
    : "0x0";
  const twitterProfilePhoto = user
    ? !!user.twitter
      ? user.twitter.profilePictureUrl
      : ""
    : "";
  const twitterName = user ? (!!user.twitter ? user.twitter.name : "") : "";
  const twitterUsername = user
    ? !!user.twitter
      ? user.twitter.username
      : ""
    : "";

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    Navigate("/login");
  };

  const [currentInviteCode, setCurrentInviteCode] = useState("");
  const [currentInviteCodeUsage, setCurrentInviteCodeUsage] = useState(0);
  const [currentUsername, setCurrentUsername] = useState("");
  const [totalUserPaperPoint, setTotalUserPaperPoint] = useState(0);
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
  const [userCardsCopy, setUserCardsCopy] = useState([]);
  const [filteredUserCards, setFilteredUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);
  const [userETHBalance, setUserETHBalance] = useState(0);

  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

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

  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);
  const [openUnsubscribeModal, setOpenUnsubscribeModal] = useState(false);

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        const response = await axios.get(
          `/api/users/${embeddedWalletAddress.toString()}`
        );

        setCurrentInviteCode(response.data.inviteCode);
        setCurrentUsername(response.data.username);
        setInventory(response.data.cardInventory);
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
        setTotalUserPaperPoint(fetchedLeaderboardData.data.paperPoints);
        setCurrentUserPaperPoint(fetchedLeaderboardData.data.currentPoints);
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
      const fetchInviteCodeUsage = async () => {
        try {
          const response = await axios.get(
            `/api/invitecodes/${currentInviteCode.toString()}`
          );
          setCurrentInviteCodeUsage(response.data.totalUsage);
        } catch (error) {
          console.error("Error fetching invite code usage:", error);
        }
      };
      fetchInviteCodeUsage();

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

          // Calculate the total worth
          const worth = inventory.reduce((sum, item) => {
            const price = cardLookup[item.uniqueId];
            return sum + item.shares * price;
          }, 0);

          setTotalWorth(Number(worth).toFixed(3));
        } catch (error) {
          console.error(`Error fetching cards info`, error);
        }
      };

      const mediaQuery = window.matchMedia("(min-width: 1024px)");
      const isLargeScreen = mediaQuery.matches;

      if (isLargeScreen) {
        fetchCardPosition();
      }
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

  useEffect(() => {
    if (hasMounted.current) {
      const updateLeaderboardNameAndProfile = async () => {
        const updateLeaderboardResponse = await axios.patch(
          `/api/leaderboard/nameandprofilephoto`,
          {
            walletAddress: user.wallet.address.toString(),
            name: !!user.twitter ? user.twitter.username.toString() : "",
            profilePhoto: !!user.twitter
              ? user.twitter.profilePictureUrl.toString()
              : "",
          }
        );
      };
      updateLeaderboardNameAndProfile();
    }
  }, [twitterLinked]);

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

  const handleCardClick = (card) => {
    if (card.category !== "presale") {
      navigateTo(`/cards/${card.uniqueId}`);
    } else {
      navigateTo(`/presalecards/${card.uniqueId}`);
    }
  };

  const handleTwitterImageClick = (twitterURL) => {
    window.open(twitterURL, "_blank");
  };

  const linkOrUnlinkTwitter = async () => {
    if (!user.twitter) {
      linkTwitter();
      setTwitterLinked(true);
    } else if (!!user.twitter) {
      await unlinkTwitter(user.twitter.subject);
      setTwitterLinked(false);
    }
  };

  // const removeLeadingZeroFromHex = (hexString) => {
  //   return "0x" + hexString.slice(2).replace(/^0+/, "");
  // };

  const transfer = async (
    destinationAddress,
    transferAmount,
    transferUiConfig
  ) => {
    // if (walletType === "privy") {
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
    // } else {
    //   const provider = await wallets[0].getEthereumProvider();
    //   try {
    //     const txHash = await provider.request({
    //       method: "eth_sendTransaction",
    //       params: [
    //         {
    //           from: wallets[0].address,
    //           to: destinationAddress,
    //           value: removeLeadingZeroFromHex(
    //             BigNumber.from(transferAmount).toHexString()
    //           ),
    //           chainId: 84532,
    //         },
    //       ],
    //     });
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    // The returned `txReceipt` has the type `TransactionReceipt`
    setOpenWithdrawModal(false);
  };

  // Function to obtain the accumulated fee for the user
  const batchLoadUserFee = async () => {
    const uniqueIds = userCards.map((card) => Number(card.uniqueId));
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
        const vapidPublicKey = response.data;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      } else {
        console.log("Using existing subscription");
      }

      // Send the subscription to the server
      await axios.post("/api/subscribe", {
        subscription: subscription,
      });
      setIsSubscribed(true);
      // alert("You have successfully subscribed to notifications!");
      setOpenSubscribeModal(true);
    } catch (error) {
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
        // alert("You have successfully unsubscribed from notifications.");
        setOpenUnsubscribeModal(true);
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

  return (
    <div className="flex flex-col lg:flex-row px-2 lg:px-0 min-h-screen bg-white lg:bg-gray-100">
      <div className="w-full lg:w-1/4 p-4 bg-white border border-gray-300 rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col">
            <div className="flex items-start space-x-2 mb-2">
              <span
                className="w-12 h-12 bg-center bg-cover rounded-full mt-1"
                style={{
                  backgroundImage: twitterLinked
                    ? `url(${twitterProfilePhoto})`
                    : `url(${PresaleCard})`,
                }}
              ></span>
              <div className="flex flex-col mt-1">
                <span
                  className={`text-xl text-black font-helvetica-neue font-semibold ${
                    twitterLinked ? "mt-0" : "mt-2"
                  }`}
                >
                  {currentUsername}
                </span>
                <div
                  className={`flex items-center cursor-pointer rounded-full ${
                    twitterLinked ? "block" : "hidden"
                  }`}
                  onClick={() =>
                    twitterLinked &
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
              <span className="text-sm font-semibold text-gray-400">
                {shortAddress}
              </span>
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
              onClick={linkOrUnlinkTwitter}
              className={`text-xs font-semibold text-gray-400 transition-colors duration-200 ease-in-out mt-1 flex items-center space-x-2`}
            >
              <img
                src={TwitterLogo}
                alt={twitterLinked ? "Unlink" : "Link"}
                className="w-3 h-3 mr-1"
              />
              {twitterLinked ? "Unlink" : "Link"}
            </button>
            <button
              onClick={toggleSubscription}
              className={`rounded-full text-xs font-semibold text-gray-400 transition-colors duration-200 ease-in-out mt-2 flex items-center space-x-2`}
            >
              <img
                src={isSubscribed ? NotificationOff : NotificationOn}
                alt={isSubscribed ? "Turn Off" : "Turn On"}
                className="w-4 h-4 mr-1"
              />
              {isSubscribed ? "Turn Off" : "Turn On"}
            </button>

            {walletType === "privy" && (
              <span
                onClick={exportWallet}
                className="cursor-pointer text-sm text-blue-600 mt-3"
                style={{ textDecoration: "underline" }}
              >
                Export Key
              </span>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col items-left mb-4 border border-gray-300 rounded-3xl bg-white">
            <div className="flex items-left space-x-2 mb-2 mx-4">
              <span className="relative mt-2">
                <img src={Wallet} alt="Wallet" className="w-8 h-8" />
              </span>
              <span className="text-md text-black font-semibold mt-3">
                Card Points
              </span>
            </div>
            <div className="flex justify-between w-full mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Invite Code:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {currentInviteCode}
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Total Referal:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {currentInviteCodeUsage}
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Total Earned Card:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {totalUserPaperPoint} Pts
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4 mb-4">
              <span className="text-sm font-semibold text-gray-400">
                Current Card:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {currentUserPaperPoint} Pts
              </span>
            </div>
            {/* <div className="flex justify-between w-full mt-2 mx-4 mb-4">
              <span className="text-base font-semibold text-gray-400">
                Inventory Worth:
              </span>
              <span className="text-base font-semibold text-gray-400 pr-8">
                {totalWorth} ETH
              </span>
            </div> */}
          </div>
          <div className="flex flex-col items-left border border-gray-300 rounded-3xl bg-white">
            <div className="flex items-left space-x-2 mb-2 mx-4">
              <span className="relative mt-2">
                <img src={Wallet} alt="Wallet" className="w-8 h-8" />
              </span>
              <span className="text-md text-black font-semibold mt-3">
                Wallet
              </span>
            </div>
            <div className="flex justify-between w-full mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Balance:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {userETHBalance} ETH
              </span>
            </div>
            <div className="flex justify-between items-center space-x-2 mt-4 mx-4">
              <button
                onClick={() => setOpenDepositModal(true)}
                className="w-1/2 bg-blue-400 text-white font-semibold items-center px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white text-sm"
              >
                Deposit
              </button>
              <button
                onClick={() => setOpenWithdrawModal(true)}
                className="w-1/2 bg-white text-black font-semibold items-center border border-gray-300 px-[calc(1rem-2px)] py-[calc(0.5rem-1px)] rounded-full hover:bg-gray-200 hover:text-black text-sm"
              >
                Withdraw
              </button>
            </div>
            <div className="flex justify-center my-4 mx-4">
              <button
                onClick={handleLogout}
                className="w-full bg-white border border-gray-300 text-black px-4 py-1 rounded-full text-sm"
              >
                LOG OUT
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-full lg:ml-[25%] lg:w-3/4 lg:px-4">
        {userCards.length === 0 ? (
          <div>
            <div className="bg-white text-black flex justify-start items-center p-4 rounded-2xl mt-4 lg:mx-6">
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
            <div className="bg-white text-black flex justify-between items-center p-4 rounded-2xl mt-4 lg:mx-6">
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

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-4">
              {userCards.map((item) =>
                item.category !== "presale" ? (
                  <div
                    className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
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

      {/* Dark Overlay */}
      {openDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60"></div>
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
          className="z-60"
        />
      )}

      {/* Dark Overlay */}
      {openWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60"></div>
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
          className="z-60"
        />
      )}

      {/* Dark Overlay */}
      {openSubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60"></div>
      )}

      {/* Withdraw Modal */}
      {openSubscribeModal && (
        <SubscribeModal
          open={openSubscribeModal}
          onClose={() => {
            setOpenSubscribeModal(false);
          }}
          className="z-60"
        />
      )}

      {/* Dark Overlay */}
      {openUnsubscribeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60"></div>
      )}

      {/* Withdraw Modal */}
      {openUnsubscribeModal && (
        <UnsubscribeModal
          open={openUnsubscribeModal}
          onClose={() => {
            setOpenUnsubscribeModal(false);
          }}
          className="z-60"
        />
      )}

      {isScrollToTopVisible && (
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

export default Profile;
