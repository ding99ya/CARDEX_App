import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useParams } from "react-router-dom";
import { encodeFunctionData } from "viem";
import { ethers } from "ethers";
import { Contract, providers, BigNumber } from "ethers";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import abi from "../PrizePool.json";
import axios from "axios";
import sortingIcon from "./Sorting.svg";
import { useNavigation } from "./NavigationContext";
import "../index.css";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

function PreviousTournament() {
  const { sendTransaction, user } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();

  const Navigate = useNavigate();

  const { goBack, navigateTo } = useNavigation();

  // CardexV1 prize pool contract
  const prizePoolContract = new web3.eth.Contract(
    abi,
    process.env.REACT_APP_CARDEXV1_PRIZE_POOL_ADDR
  );

  const [filterOptions, setFilterOptions] = useState([]);
  const [previousRewardsData, setPreviousRewardsData] = useState([]);

  // const [tournamentData, setTournamentData] = useState([
  //   {
  //     deckId: "1",
  //     rank: 3,
  //     ETHReward: 0.15,
  //     points: 260000,
  //     presalePoints: 6000,
  //   },
  //   {
  //     deckId: "2",
  //     rank: 2,
  //     ETHReward: 0.15,
  //     points: 275000,
  //     presalePoints: 6000,
  //   },
  //   {
  //     deckId: "3",
  //     rank: 7,
  //     ETHReward: 0.05,
  //     points: 200000,
  //     presalePoints: 5000,
  //   },
  // ]);

  const [tournamentData, setTournamentData] = useState([]);

  const [selectedFilter, setSelectedFilter] = useState({
    label: "Tournament",
    id: "0",
    claimedReward: true,
  });

  const [selectedFilterETHReward, setSelectedFilterETHReward] = useState(0);

  const [filterIsOpen, setFilterIsOpen] = useState(false);

  const handleFilterSelection = (option) => {
    setSelectedFilter(option);
    setTournamentData(previousRewardsData[option.id]);
    setSelectedFilterETHReward(
      Math.floor(
        previousRewardsData[option.id].reduce(
          (total, item) => total + item.ETHReward,
          0
        ) * 1000
      ) / 1000
    );
    setFilterIsOpen(false);
  };

  //   UI Configuration for Privy prompt when claiming fees
  const getClaimUiConfig = async () => {
    return {
      header: "Tournament Reward",
      description: "Claim " + selectedFilterETHReward + " ETH",
      //   transactionInfo: {
      //     contractInfo: {
      //       imgUrl: card.photo,
      //     },
      //   },
      buttonText: "Claim",
    };
  };

  //   Function to claim the accumulated fees for current card
  const claim = async () => {
    const nonce = await prizePoolContract.methods.nonce().call();
    const currentTournamentID = await prizePoolContract.methods
      .currentTournamentID()
      .call();

    const selectedFilterETHRewardInWei = ethers.utils.parseEther(
      selectedFilterETHReward.toString()
    );
    console.log(selectedFilterETHRewardInWei);

    const selectedFilterETHRewardInWeiString =
      selectedFilterETHRewardInWei.toString();
    console.log(selectedFilterETHRewardInWeiString);

    const messageHash = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ["address", "uint256", "uint256", "uint256"],
        [
          embeddedWalletAddress.toString(),
          currentTournamentID.toString(),
          selectedFilterETHRewardInWeiString,
          nonce.toString(),
        ]
      )
    );

    const { r, s, v } = web3.eth.accounts.sign(
      messageHash,
      process.env.REACT_APP_PRESALE_SIGNER_KEY
    );

    const data = encodeFunctionData({
      abi: abi,
      functionName: "claimTournamentReward",
      args: [currentTournamentID, selectedFilterETHRewardInWeiString, v, r, s],
    });

    const transaction = {
      to: process.env.REACT_APP_CARDEXV1_PRIZE_POOL_ADDR,
      chainId: 84532,
      data: data,
    };

    try {
      // The returned `txReceipt` has the type `TransactionReceipt`
      const claimUI = await getClaimUiConfig();
      const txReceipt = await sendTransaction(transaction, claimUI);

      await axios.post("/api/ptournament/setClaimedReward", {
        walletAddress: embeddedWalletAddress,
        tournamentId: currentTournamentID,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPreviousRewards = async () => {
      try {
        const response = await axios.get(
          `/api/ptournament/previousRewards/${embeddedWalletAddress}`
        );
        // const data = await response.json();
        const previousRewards = response.data.previousRewards;

        const options = [];
        const rewardsData = {};

        previousRewards.forEach((reward) => {
          options.unshift({
            label: `Tournament ${reward.tournamentId}`,
            id: reward.tournamentId.toString(),
            claimedReward: reward.claimedReward,
          });

          rewardsData[reward.tournamentId.toString()] = reward.rewards;
        });

        setFilterOptions(options);
        setPreviousRewardsData(rewardsData);
      } catch (error) {
        console.error("Error fetching previous rewards:", error);
      }
    };

    fetchPreviousRewards();
  }, []);

  //   if (!card) {
  //     return (
  //       <div
  //         style={{
  //           display: "flex",
  //           justifyContent: "center",
  //           alignItems: "center",
  //           height: "100vh",
  //         }}
  //       >
  //         <img
  //           src="/Loading.gif"
  //           alt="Loading..."
  //           style={{ marginTop: "-20vh" }}
  //         />
  //       </div>
  //     );
  //   }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row justify-between items-start relative">
      <div className="w-full lg:w-1/2 lg:mb-0 lg:mr-4">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black px-4 py-2 mb-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex items-center justify-between w-full border-2 border-gray-300 rounded-2xl p-6">
          <div className="relative inline-block text-left">
            <div className="font-semibold text-base mb-4">Select</div>
            <button
              onClick={() => setFilterIsOpen(!filterIsOpen)}
              className="inline-flex items-center justify-between w-[120px] lg:w-full px-2 py-1 text-xs lg:text-sm font-medium text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50 min-w-0"
            >
              <span className="flex items-center whitespace-nowrap">
                {selectedFilter.label}
              </span>
              <img src={sortingIcon} alt="Sort Icon" className="w-5 h-5 ml-1" />
            </button>
            {filterIsOpen && (
              <div className="absolute right-0 z-10 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                {filterOptions.map((option, index) => (
                  <div key={index} className="py-1">
                    <button
                      onClick={() => handleFilterSelection(option)}
                      className="flex items-center w-[120px] lg:w-full px-2 py-1 text-xs lg:text-sm text-black hover:bg-gray-100"
                    >
                      {option.label}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => claim()}
            className={`bg-blue-400 text-white text-sm font-semibold py-1 px-4 rounded-xl hover:bg-blue-500 hover:text-white transition duration-300 ${
              selectedFilter.id ===
                process.env.REACT_APP_LATEST_FINISHED_TOURNAMENT_ID.toString() &&
              selectedFilter.claimedReward === false &&
              selectedFilterETHReward > 0
                ? "visible"
                : "invisible"
            }`}
          >
            Claim Rewards
          </button>
        </div>
      </div>
      <div className="w-full lg:w-1/2 mt-4 lg:mt-12 relative">
        <div className="rounded-xl bg-blue-100">
          <div className="max-w-full">
            <table
              className="min-w-full rounded-xl p-2 bg-blue-100"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <thead className="text-blue-500 bg-white text-xs lg:text-sm font-open-sans">
                <tr>
                  <th className="py-2 px-4 text-center rounded-tl-xl rounded-bl-xl">
                    Deck
                  </th>
                  <th className="py-2 px-4 text-center">Rank</th>
                  <th className="py-2 px-4 text-center">ETH</th>
                  <th className="py-2 px-4 text-center">Points</th>
                  <th className="py-2 px-4 text-center rounded-tr-xl rounded-br-xl">
                    Stars
                  </th>
                </tr>
              </thead>
              <tbody>
                {tournamentData.length === 0 ? (
                  <tr className="text-xs lg:text-sm font-open-sans">
                    <td colSpan="5" className="py-2 text-center">
                      Not available
                    </td>
                  </tr>
                ) : (
                  tournamentData.map((deckData, index) => (
                    <tr
                      className={`cursor-pointer h-10 text-xs lg:text-sm rounded-t-xl rounded-b-xl bg-white ${
                        index === tournamentData.length - 1
                          ? "rounded-b-xl"
                          : ""
                      }`}
                    >
                      <td className="py-1 text-center rounded-tl-xl rounded-bl-xl">
                        {deckData.deckId}
                      </td>
                      <td className="py-1 text-center">{deckData.rank}</td>
                      <td className="py-1 text-center">{deckData.ETHReward}</td>
                      <td className="py-1 text-center">{deckData.points}</td>
                      <td className="py-1 text-center rounded-tr-xl rounded-br-xl">
                        {deckData.presalePoints}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviousTournament;
