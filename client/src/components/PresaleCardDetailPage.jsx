import React, { useState, useEffect, useRef } from "react";
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
import "../index.css";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

function PresaleCardDetailPage() {
  const { sendTransaction, user } = usePrivy();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();

  const Navigate = useNavigate();

  // CardexV1 contract instance
  const contract = new web3.eth.Contract(
    abi,
    process.env.REACT_APP_CARDEXV1_CONTRACT_ADDR
  );

  const [isEligibleUser, setIsEligibleUser] = useState(false);

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

  const [userShares, setUserShares] = useState(0);

  const { uniqueId } = useParams();

  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [openSellModal, setOpenSellModal] = useState(false);

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

      return {
        ...prevCard,
        price: currentPrice,
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

  // Function to buy certain amount of shares
  const buy = async (shares, value, buyUiConfig) => {
    const preSaleNonce = await contract.methods.preSaleNonce().call();

    const messageHash = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ["address", "uint256", "uint256", "uint256"],
        [
          embeddedWalletAddress.toString(),
          uniqueId.toString(),
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
      args: [uniqueId, parseInt(shares), v, r, s],
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

    const checkEligibleUser = async () => {
      try {
        const presaleUserResponse = await axios.get(
          `/api/presaleusers/check-presaleuser/${embeddedWalletAddress}`
        );

        if (presaleUserResponse.data.exists) {
          setIsEligibleUser(true);
        } else {
          setIsEligibleUser(false);
        }
      } catch (error) {
        console.error(`Error checking presale user:`, error);
      }
    };

    checkEligibleUser();

    fetchUserShares();

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
  }, [uniqueId]);

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

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row justify-between items-start">
      <div className="w-full lg:w-1/2 mb-4 lg:mb-0 lg:mr-4">
        <span
          onClick={() => handleBackClick()}
          className="cursor-pointer inline-block bg-white text-black px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex justify-center items-center w-full">
          <img
            src={card.photo}
            alt={card.name}
            className="w-1/2 max-h-screen object-cover"
          />
        </div>
      </div>
      <div className="w-full lg:w-1/2">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">{card.name}</h2>

          <div className="text-center w-full">
            <div className="flex justify-between w-full">
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
              className={classNames(
                "w-1/2 px-4 py-2 font-bold border-2 border-black rounded-full shadow",
                {
                  "bg-white text-black hover:bg-black hover:text-white":
                    isEligibleUser,
                  "bg-gray-200 text-black": !isEligibleUser,
                }
              )}
              disabled={!isEligibleUser}
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
                "w-1/2 px-4 py-2 font-bold border-2 border-black rounded-full shadow",
                {
                  "bg-white text-black hover:bg-black hover:text-white": !(
                    userShares === 0 ||
                    card.shares === 0 ||
                    !isEligibleUser
                  ),
                  "bg-gray-200 text-black":
                    userShares === 0 || card.shares === 0 || !isEligibleUser,
                }
              )}
              disabled={
                userShares === 0 || card.shares === 0 || !isEligibleUser
              }
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default PresaleCardDetailPage;
