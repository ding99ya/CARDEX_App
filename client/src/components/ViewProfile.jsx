import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ETHSymbol from "./ETHSymbol.png";
import TwitterLogo from "./TwitterLogo.png";
import PresaleCard from "./PresaleCard.png";
import Avatar from "./Avatar.png";
import sortingIcon from "./Sorting.svg";
import filterIcon from "./Filter.png";
import Score from "./Score.png";
import { useNavigation } from "./NavigationContext";

function ViewProfile() {
  const location = useLocation();
  const { goBack, navigateTo } = useNavigation();
  const { username } = useParams();

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  // Variables used to show twitter when user has linked the twitter account
  const [hasTwitter, setHasTwitter] = useState(false);
  const [twitterURL, setTwitterURL] = useState("");
  const [twitterName, setTwitterName] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [twitterProfilePhoto, setTwitterProfilePhoto] = useState("");

  const [leaderboardUser, setLeaderboardUser] = useState({
    DID: "",
    walletAddress: "",
    username: "",
    rank: 0,
    paperPoints: 0,
  });
  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userCardsCopy, setUserCardsCopy] = useState([]);
  const [filteredUserCards, setFilteredUserCards] = useState([]);
  const [totalWorth, setTotalWorth] = useState(0);

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
        setTwitterName(didUserHasTwitter ? didUserTwitter.name : "");
        setTwitterUsername(didUserHasTwitter ? didUserTwitter.username : "");
        setTwitterProfilePhoto(
          didUserHasTwitter ? didUserTwitter.profile_picture_url : ""
        );

        console.log(didUserTwitter);

        const leaderboardResponse = await axios.get(
          `/api/leaderboard/byname/${username}`
        );
        setLeaderboardUser(leaderboardResponse.data);
      } catch (error) {
        console.error(`Error fetching user ${username} card inventory`, error);
      }
    };
    fetchUserPosition();
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
          setUserCardsCopy(fetchedUserCards);

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

  // const handleCardClick = (card) => {
  //   if (card.category !== "presale") {
  //     Navigate(`/cards/${card.uniqueId}`, {
  //       state: { from: location.pathname },
  //     });
  //   } else {
  //     Navigate(`/presalecards/${card.uniqueId}`, {
  //       state: { from: location.pathname },
  //     });
  //   }
  // };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCardClick = (card) => {
    if (card.category !== "presale") {
      // Navigate(`/cards/${card.uniqueId}`, {
      //   state: { from: location.pathname },
      // });
      navigateTo(`/cards/${card.uniqueId}`);
    } else {
      // Navigate(`/presalecards/${card.uniqueId}`, {
      //   state: { from: location.pathname },
      // });
      navigateTo(`/presalecards/${card.uniqueId}`);
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

  return (
    <div className="flex flex-col px-2 lg:px-0 lg:flex-row min-h-screen bg-gray-100">
      <div className="w-full lg:w-1/4 bg-white border border-gray-300 rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed">
        <span
          // onClick={() => handleBackClick()}
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black mt-2 ml-2 px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="flex items-center justify-between w-full mx-4">
          <div className="flex items-start space-x-2 mb-2">
            <span
              className="w-12 h-12 bg-center bg-cover rounded-full mt-1"
              style={{
                backgroundImage: hasTwitter
                  ? `url(${twitterProfilePhoto})`
                  : `url(${Avatar})`,
              }}
            ></span>
            <div className="flex flex-col mt-1">
              <span
                className={`text-xl text-black font-helvetica-neue font-semibold ${
                  hasTwitter ? "mt-0" : "mt-2"
                }`}
              >
                {username}
              </span>
              <div
                className={`flex items-center cursor-pointer rounded-full ${
                  hasTwitter ? "block" : "hidden"
                }`}
                onClick={handleTwitterImageClick}
              >
                <img src={TwitterLogo} alt="Twitter" className="w-3 h-3 mr-1" />
                <span className="text-gray-400 font-open-sans text-xs">
                  @{twitterUsername}
                </span>
              </div>
            </div>
            {/* <span className="text-3xl text-black font-helvetica-neue font-semibold">
              {twitterName}
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
            </span> */}
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-4">
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Paper Points:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {leaderboardUser.paperPoints} Pts
              </span>
            </div>
            {/* <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-sm font-semibold text-gray-400">
                Inventory Worth:
              </span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                {totalWorth} ETH
              </span>
            </div> */}
            <div className="flex justify-between w-full mt-2 mx-4">
              <span className="text-sm font-semibold text-gray-400">Rank:</span>
              <span className="text-sm font-semibold text-gray-400 pr-8">
                #{leaderboardUser.rank}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full lg:ml-[25%] lg:w-3/4 lg:px-4">
        {userCards.length === 0 ? (
          // overflow-y-auto
          // <div className="flex flex-col items-center">
          //   <p className="text-lg mt-6">Empty Collectible Inventory</p>
          // </div>
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
              {userCards.map(
                (item) =>
                  item.category !== "presale" ? (
                    <div
                      className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg overflow-hidden transition duration-300 ease-in-out lg:hover:shadow-2xl hover:border-gray-500 group"
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
                              item.rarity === "COMMON"
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

export default ViewProfile;
