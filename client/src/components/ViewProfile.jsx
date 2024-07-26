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
    <div className="flex flex-col px-2 lg:px-0 lg:flex-row min-h-screen bg-gray-100">
      <div className="w-full lg:w-1/4 bg-white border border-black rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed">
        <span
          onClick={() => handleBackClick()}
          className="cursor-pointer inline-block bg-white text-black mt-2 ml-2 px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex items-center justify-between w-full mx-4">
          <div className="flex items-left space-x-2 mb-2">
            <span className="text-3xl text-black font-helvetica-neue font-semibold">
              {username}
            </span>
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
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-base font-semibold text-gray-500">
                Paper Points:
              </span>
              <span className="text-base font-semibold text-gray-500 pr-8">
                {leaderboardUser.paperPoints} Pts
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-base font-semibold text-gray-500">
                Inventory Worth:
              </span>
              <span className="text-base font-semibold text-gray-500 pr-8">
                {totalWorth} ETH
              </span>
            </div>
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-base font-semibold text-gray-500">
                Rank:
              </span>
              <span className="text-base font-semibold text-gray-500 pr-8">
                #{leaderboardUser.rank}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:ml-[25%] lg:w-3/4 lg:px-4">
        {userCards.length === 0 ? (
          // overflow-y-auto
          <div className="flex flex-col items-center">
            <p className="text-lg mt-6">Empty Collectible Inventory</p>
            {/* <p className="text-gray-600">
              You don’t have any collectibles yet.
            </p> */}
          </div>
        ) : (
          <div>
            {/* <div className="bg-white text-black flex justify-between items-center p-4 rounded-t-2xl">
              <span className="font-semibold text-xl">
                Inventory Worth: {totalWorth} ETH
              </span>
              <button
                onClick={() => claim()}
                className="bg-white text-black border-1 border-black font-semibold py-2 px-4 rounded-full hover:bg-black hover:text-white transition duration-300"
              >
                Claim for All
              </button>
            </div> */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:px-4">
              {userCards.map((item) =>
                item.category !== "presale" ? (
                  <div
                    className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
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
                ) : (
                  <div
                    className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg shadow-md overflow-hidden transition duration-300 ease-in-out hover:shadow-2xl hover:border-gray-500 group"
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
                      <div className="flex justify-between w-full px-2 mt-1">
                        <span className="text-sm font-helvetica">
                          Presale &nbsp;
                        </span>
                      </div>
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
