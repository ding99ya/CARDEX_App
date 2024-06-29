import React, { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Contract, providers, BigNumber } from "ethers";
import axios from "axios";
import CopyIcon from "./Copy-Icon.jpg";
import ETHSymbol from "./ETHSymbol.png";
import TwitterLogo from "./TwitterLogo.png";
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
  const {
    logout,
    exportWallet,
    sendTransaction,
    user,
    linkTwitter,
    unlinkTwitter,
  } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const embeddedWalletAddress = wallet === undefined ? 0 : wallet.address;
  const shortAddress = !!embeddedWalletAddress
    ? `${embeddedWalletAddress.slice(0, 6)}...${embeddedWalletAddress.slice(
        -4
      )}`
    : "0x0";

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

        const fetchedLeaderboardData = await axios.get(
          `/api/leaderboard/${embeddedWalletAddress}`
        );
        setCurrentUserPaperPoint(fetchedLeaderboardData.data.paperPoints);

        const balance = await web3.eth.getBalance(embeddedWalletAddress);
        const balanceToBigNumber = BigNumber.from(balance);
        const oneEther = BigNumber.from("1000000000000000000");
        const balanceInETH =
          Number(balanceToBigNumber.mul(1000).div(oneEther)) / 1000;
        setUserETHBalance(balanceInETH);
      } catch (error) {
        console.error(
          `Error fetching user ${embeddedWalletAddress} card inventory`,
          error
        );
      }
    };
    fetchUserPosition();
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

          const multiCardsResponse = await axios.post(`/api/cards/multiple`, {
            uniqueIds: userCardIds,
          });

          setUserCards(multiCardsResponse.data);

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

  return (
    <div className="flex">
      <div className="w-1/4 p-4 border-r border-gray-300 fixed h-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-left">
            <div className="flex items-left space-x-2">
              <span className="text-gray-600">{currentUsername}</span>
              <span
                className="relative cursor-pointer"
                onMouseEnter={() => setTwitterHover(true)}
                onMouseLeave={() => setTwitterHover(false)}
              >
                <img
                  onClick={linkOrUnlinkTwitter}
                  src={TwitterLogo}
                  alt="Twitter"
                  className="w-5 h-5"
                />
                {twitterHover && !twitterLinked && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded whitespace-nowrap">
                    Link Twitter
                  </span>
                )}
                {twitterHover && twitterLinked && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded whitespace-nowrap">
                    Unlink Twitter
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-left space-x-2">
              <span className="text-gray-600">{shortAddress}</span>
              <span
                className="relative cursor-pointer"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={handleCopy}
              >
                <img src={CopyIcon} alt="Copy" className="w-5 h-5" />
                {hover && !copied && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded">
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
          <button
            onClick={exportWallet}
            className="items-right bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            EXPORT KEY
          </button>
        </div>
        <div className="mt-6">
          <div className="mb-4">
            <div className="flex items-left text-lg">
              Inventory Total Worth: {totalWorth} ETH
              <img src={ETHSymbol} className="w-3 h-5 ml-2 mt-1" />
            </div>
            <div className="text-lg">Your Invite Code: {currentInviteCode}</div>
            <div className="text-lg">Total Papers: {currentUserPaperPoint}</div>
            <div className="flex items-left text-lg">
              Wallet Balance: {userETHBalance} ETH
              <img src={ETHSymbol} className="w-3 h-5 ml-2 mt-1" />
            </div>
          </div>
          <div className="flex space-x-2">
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
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLogout}
            className="items-center w-1/4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            LOG OUT
          </button>
        </div>
      </div>
      <div className="ml-[25%] w-3/4 p-4">
        {userCards.length === 0 ? (
          // overflow-y-auto
          <div className="flex flex-col items-center">
            <p className="text-lg">No Collectible Yet</p>
            <p className="text-gray-600">
              You don’t have any collectibles yet.
            </p>
          </div>
        ) : (
          <div>
            <div className="bg-blue-500 text-white flex justify-between items-center p-4 rounded-t-lg">
              <span className="font-semibold text-xl">
                Inventory Worth: {totalWorth} ETH
              </span>
              {/* <span className="text-lg">TOTAL WORTH 0 ETH</span> */}
              <button
                onClick={() => claim()}
                className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
              >
                Claim for All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userCards.map((item) =>
                item.category !== "presale" ? (
                  <div
                    className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden border-2 border-black transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 hover:scale-105"
                    key={item.uniqueId}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="p-6 text-center">
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-800">
                        {item.name}
                      </h3>
                    </div>
                    <div className="aspect-w-3 aspect-h-2 mb-4">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-contain mb-2"
                      />
                    </div>
                    <div className="p-4 text-center w-full">
                      <div className="flex justify-between w-full px-4">
                        <span className="text-lg font-semibold text-gray-600">
                          Price:
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {item.price} ETH
                        </span>
                      </div>
                      <div className="flex justify-end items-center w-full px-4 mt-2">
                        <span className="text-lg font-semibold">
                          {item.trend}%
                        </span>
                        {item.trend > 0 ? (
                          <span className="text-green-500 ml-2">&#x25B2;</span> // Up arrow
                        ) : (
                          <span className="text-red-500 ml-2">&#x25BC;</span> // Down arrow
                        )}
                      </div>
                      <div className="flex justify-between w-full px-4 mt-2">
                        <span className="text-lg font-semibold text-gray-600">
                          Position:
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {item.shares}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer bg-white rounded-lg shadow-md overflow-hidden border-2 border-black transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 hover:scale-105"
                    key={item.uniqueId}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="p-6 text-center">
                      <h3 className="font-semibold text-xl md:text-2xl text-gray-800">
                        {item.name}
                      </h3>
                    </div>
                    <div className="aspect-w-3 aspect-h-2 mb-4">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-full h-full object-contain mb-2"
                      />
                    </div>
                    <div className="p-4 text-center w-full">
                      <div className="flex justify-between w-full px-4">
                        <span className="text-lg font-semibold text-gray-600">
                          Price:
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {item.price} ETH
                        </span>
                      </div>
                      <div className="flex justify-between w-full px-4 mt-2">
                        <span className="text-lg font-semibold text-gray-600">
                          Position:
                        </span>
                        <span className="text-lg font-semibold text-gray-600">
                          {item.shares}
                        </span>
                      </div>
                    </div>
                  </div>
                )
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
