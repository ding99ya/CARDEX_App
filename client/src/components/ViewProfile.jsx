import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import ETHSymbol from "./ETHSymbol.png";

import TwitterLogo from "./TwitterLogo.png";

function ViewProfile() {
  const location = useLocation();
  const { username } = useParams();

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  // Variables used to show twitter when user has linked the twitter account
  const [hasTwitter, setHasTwitter] = useState(false);
  const [twitterURL, setTwitterURL] = useState("");

  const [leaderboardUser, setLeaderboardUser] = useState({
    DID: "",
    walletAddress: "",
    username: "",
    rank: 0,
    paperPoints: 0,
  });
  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        const response = await axios.get(`/api/users/byname/${username}`);

        setInventory(response.data.cardInventory);

        // Determine if user has linked twitter account and if so, set twitter url
        const did = response.data.DID;
        const didUser = await axios.get(`api/user/${did}`);
        const didUserHasTwitter = didUser.data.linked_accounts.some(
          (account) => account.type === "twitter_oauth"
        );
        setHasTwitter(didUserHasTwitter);
        const didUserTwitter = didUser.data.linked_accounts.find(
          (account) => account.type === "twitter_oauth"
        );
        setTwitterURL(
          didUserHasTwitter ? "https://x.com/" + didUserTwitter.username : ""
        );

        const leaderboardResponse = await axios.get(
          `/api/leaderboard/byname/${username}`
        );
        setLeaderboardUser(leaderboardResponse.data);
      } catch (error) {
        console.error(`Error fetching user ${username} card inventory`, error);
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

  const handleTwitterImageClick = () => {
    window.open(twitterURL, "_blank");
  };

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      Navigate(location.state.from);
    } else {
      Navigate("/leaderboard");
    }
  };

  return (
    <div className="flex">
      <div className="w-1/4 p-4 border-r border-gray-300 fixed h-full">
        <button
          onClick={() => handleBackClick()}
          className="bg-blue-500 text-white px-4 py-2 rounded shadow"
        >
          Back
        </button>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-left space-x-2">
            <span className="text-gray-600">{username}</span>
            <span className="relative cursor-pointer">
              {hasTwitter ? (
                <img
                  src={TwitterLogo}
                  alt="Twitter"
                  className="w-5 h-5"
                  onClick={handleTwitterImageClick}
                />
              ) : null}
            </span>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-4">
            <div className="flex items-left text-lg">
              Inventory Total Worth: {totalWorth} ETH
              <img src={ETHSymbol} className="w-3 h-5 ml-2 mt-1" />
            </div>
            <div className="text-lg">
              Total Papers: {leaderboardUser.paperPoints}
            </div>
            <div className="text-lg">Rank #{leaderboardUser.rank}</div>
          </div>
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
    </div>
  );
}

export default ViewProfile;
