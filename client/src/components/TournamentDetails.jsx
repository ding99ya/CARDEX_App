import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import flagIcon from "./Flag.svg";
import sortingIcon from "./Sorting.svg";
import filterIcon from "./Filter.png";
import Notification from "./UpdateDeckNotification.jsx";
import { useNavigation } from "./NavigationContext";

function TournamentDetails() {
  const { user } = usePrivy();
  const embeddedWalletAddress = user.wallet.address;

  const location = useLocation();
  const { goBack, navigateTo } = useNavigation();
  const { username } = useParams();

  const hasMounted = useRef(false);
  const Navigate = useNavigate();

  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const [openInventory, setOpenInventory] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState("0d 00h 00m");

  const [inTournament, setInTournament] = useState(false);

  const [isUpdatingDeck, setIsUpdatingDeck] = useState(false);

  const [updatingDeckAlert, setUpdatingDeckAlert] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userCardsCopy, setUserCardsCopy] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);

  const [userDeck1, setUserDeck1] = useState([]);
  const [userDeck2, setUserDeck2] = useState([]);
  const [userDeck3, setUserDeck3] = useState([]);
  const [userDeck4, setUserDeck4] = useState([]);
  const [userDeck5, setUserDeck5] = useState([]);
  const [modifiedDeck, setModifiedDeck] = useState([]);

  const [notification, setNotification] = useState(null);

  const [activeDeckTab, setActiveDeckTab] = useState("Deck1");

  const [cardUsage, setCardUsage] = useState({});

  // selectedFilter be used to determine which filter method is currently being used
  const [selectedFilter, setSelectedFilter] = useState({
    label: "All",
  });

  // filterIsOpen is used to control if the filter list should be opened
  const [filterIsOpen, setFilterIsOpen] = useState(false);

  // selectedSort be used to determine which sort method is currently being used
  const [selectedSort, setSelectedSort] = useState({
    label: "Score",
    sortKey: "currentScore",
    ascending: false,
  });

  // sortIsOpen is used to control if the sort list should be opened
  const [sortIsOpen, setSortIsOpen] = useState(false);

  const [emptyDeck, setEmptyDeck] = useState([
    {
      name: "",
      photo: PresaleCard,
      uniqueId: "1",
    },
    {
      name: "",
      photo: PresaleCard,
      uniqueId: "2",
    },
    {
      name: "",
      photo: PresaleCard,
      uniqueId: "3",
    },
    {
      name: "",
      photo: PresaleCard,
      uniqueId: "4",
    },
    {
      name: "",
      photo: PresaleCard,
      uniqueId: "5",
    },
  ]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const showNotification = (message, alert) => {
    setNotification(message);
    setUpdatingDeckAlert(alert);
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const checkInTournament = () => {
    const now = new Date();

    // Convert current time to US CST (Central Standard Time)
    const cstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );

    const currentDay = cstTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentHour = cstTime.getHours(); // Get the hour in CST

    // Need to adjust the day and hours in production
    // Check if today is Sunday
    if (
      (currentDay === 1 && currentHour >= 9) ||
      currentDay === 2 ||
      currentDay === 3 ||
      (currentDay === 4 && currentHour <= 9)
    ) {
      setInTournament(true);
    } else {
      setInTournament(false);
    }
  };

  const getCSTTime = () => {
    const now = new Date();
    return new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );
  };

  // Helper function to get the next occurrence of a specific day and time
  const getNextOccurrence = (dayOfWeek, hour) => {
    const now = getCSTTime();
    const result = new Date(now);

    // Calculate how many days to add to get to the next occurrence
    const daysToAdd = (dayOfWeek + 7 - now.getDay()) % 7;
    result.setDate(now.getDate() + daysToAdd);
    result.setHours(hour, 0, 0, 0); // Set hour, minutes, seconds, and milliseconds to 0

    // If the time is already in the past today, move to the next week's occurrence
    if (result <= now) {
      result.setDate(result.getDate() + 7);
    }
    return result;
  };

  // Calculate if the tournament is ongoing and return the remaining time string
  const calculateTime = () => {
    const now = new Date();

    const cstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );

    const currentDay = cstTime.getDay();
    const currentHour = cstTime.getHours();

    const tournamentStart = getNextOccurrence(1, 9); // Monday 9 AM
    const tournamentEnd = getNextOccurrence(4, 9); // Thursday 9 AM

    let target;
    let message;

    if (
      (currentDay === 1 && currentHour >= 9) ||
      currentDay === 2 ||
      currentDay === 3 ||
      (currentDay === 4 && currentHour <= 9)
    ) {
      // Tournament is ongoing
      target = tournamentEnd;
      message = "finishing in";
    } else {
      // Tournament hasn't started yet
      target = tournamentStart;
      message = "starting in";
    }

    const timeDiff = target - now; // Time difference in milliseconds

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${message} ${days}d ${hours}h ${minutes}m`;
  };

  const addCardToDeck = (newCard) => {
    const isCardInDeck = modifiedDeck.some(
      (deckItem) => deckItem.uniqueId === newCard.uniqueId
    );

    if (isCardInDeck) {
      return;
    }

    if (cardUsage[newCard.uniqueId].available <= 0) {
      return;
    }

    if (modifiedDeck.length < 5) {
      setModifiedDeck((prevDeck) => [
        ...prevDeck,
        {
          name: newCard.name,
          uniqueId: newCard.uniqueId,
          photo: newCard.photo,
          currentScore: 0,
          rarity: newCard.rarity,
        },
      ]);
    }

    cardUsage[newCard.uniqueId].locked = cardUsage[newCard.uniqueId].locked + 1;
    cardUsage[newCard.uniqueId].available =
      cardUsage[newCard.uniqueId].available - 1;
  };

  const deleteCardFromDeck = (newCard) => {
    setModifiedDeck((prevDeck) =>
      prevDeck.filter((card) => card.uniqueId !== newCard.uniqueId)
    );
    cardUsage[newCard.uniqueId].locked = cardUsage[newCard.uniqueId].locked - 1;
    cardUsage[newCard.uniqueId].available =
      cardUsage[newCard.uniqueId].available + 1;
  };

  const finishUpdatingDeck = () => {
    if (modifiedDeck.length != 5) {
      showNotification("Need five cards for the deck", true);
      return;
    }

    const rarityCount = modifiedDeck.reduce(
      (acc, card) => {
        if (card.rarity === "LEGEND") acc.legend += 1;
        if (card.rarity === "EPIC") acc.epic += 1;
        return acc;
      },
      { legend: 0, epic: 0 }
    );

    if (rarityCount.legend > 1 || rarityCount.epic > 1) {
      showNotification("Can have only 1 legend and 1 epic card", true);
      return;
    }

    if (activeDeckTab === "Deck1") {
      setUserDeck1(modifiedDeck);
    } else if (activeDeckTab === "Deck2") {
      setUserDeck2(modifiedDeck);
    } else if (activeDeckTab === "Deck3") {
      setUserDeck3(modifiedDeck);
    } else if (activeDeckTab === "Deck4") {
      setUserDeck4(modifiedDeck);
    } else if (activeDeckTab === "Deck5") {
      setUserDeck5(modifiedDeck);
    }

    setOpenInventory(false);
    setIsUpdatingDeck(false);

    showNotification("Deck updated", false);
  };

  const cancelUpdatingDeck = () => {
    modifiedDeck.forEach((card) => {
      cardUsage[card.uniqueId].locked = cardUsage[card.uniqueId].locked - 1;
      cardUsage[card.uniqueId].available =
        cardUsage[card.uniqueId].available + 1;
    });

    if (activeDeckTab === "Deck1") {
      setModifiedDeck(userDeck1);
    } else if (activeDeckTab === "Deck2") {
      setModifiedDeck(userDeck2);
    } else if (activeDeckTab === "Deck3") {
      setModifiedDeck(userDeck3);
    } else if (activeDeckTab === "Deck4") {
      setModifiedDeck(userDeck4);
    } else if (activeDeckTab === "Deck5") {
      setModifiedDeck(userDeck5);
    }
    setOpenInventory(false);
    setIsUpdatingDeck(false);
  };

  function filterCards(by) {
    if (by === "All") {
      setFilteredCards(userCardsCopy);
    } else {
      const filteredCards = userCardsCopy.filter((card) => {
        return card.rarity === by.toUpperCase();
      });

      setFilteredCards(filteredCards);
    }
  }

  const handleFilterSelection = (option) => {
    setSelectedFilter(option);
    filterCards(option.label);
    setFilterIsOpen(false);
  };

  function sortCards(label, by, ascending = true) {
    const sortedCards = [...userCards].sort((a, b) => {
      if (by === "ipoTime") {
        return ascending
          ? new Date(a.ipoTime) - new Date(b.ipoTime)
          : new Date(b.ipoTime) - new Date(a.ipoTime);
      } else {
        return ascending ? a[by] - b[by] : b[by] - a[by];
      }
    });

    setUserCards(sortedCards);
    setSelectedSort({ label: label, sortKey: by, ascending: ascending });
  }

  const handleSortSelection = (option) => {
    setSelectedSort(option);
    sortCards(option.label, option.sortKey, option.ascending);
    setSortIsOpen(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    checkInTournament();
    setTimeRemaining(calculateTime());
  }, []);

  // Update the countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch users positions (card ids and corresponding shares)
    const fetchUserPosition = async () => {
      try {
        const response = await axios.get(
          `/api/users/${embeddedWalletAddress.toString()}`
        );
        setInventory(response.data.cardInventory);
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

          const sortedCards = [...fetchedUserCards].sort((a, b) => {
            return b["currentScore"] - a["currentScore"];
          });

          setUserCards(sortedCards);
          setUserCardsCopy(sortedCards);
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
    const calculateCardAvailability = () => {
      if (userCards.length > 0) {
        // Loop through each deck array to count locked cards
        userDeck1.forEach((card) => {
          if (cardUsage[card.uniqueId]) {
            cardUsage[card.uniqueId].locked += 1;
          } else {
            cardUsage[card.uniqueId] = { available: 0, locked: 1 };
          }
        });

        userDeck2.forEach((card) => {
          if (cardUsage[card.uniqueId]) {
            cardUsage[card.uniqueId].locked += 1;
          } else {
            cardUsage[card.uniqueId] = { available: 0, locked: 1 };
          }
        });

        userDeck3.forEach((card) => {
          if (cardUsage[card.uniqueId]) {
            cardUsage[card.uniqueId].locked += 1;
          } else {
            cardUsage[card.uniqueId] = { available: 0, locked: 1 };
          }
        });

        userDeck4.forEach((card) => {
          if (cardUsage[card.uniqueId]) {
            cardUsage[card.uniqueId].locked += 1;
          } else {
            cardUsage[card.uniqueId] = { available: 0, locked: 1 };
          }
        });
        userDeck5.forEach((card) => {
          if (cardUsage[card.uniqueId]) {
            cardUsage[card.uniqueId].locked += 1;
          } else {
            cardUsage[card.uniqueId] = { available: 0, locked: 1 };
          }
        });

        // Loop through userCards to set available counts based on 'shares' value
        userCards.forEach((userCard) => {
          const lockedCount = cardUsage[userCard.uniqueId]?.locked || 0;
          const availableCount = userCard.shares - lockedCount;

          cardUsage[userCard.uniqueId] = {
            available: availableCount,
            locked: lockedCount,
          };
        });
      }
    };

    calculateCardAvailability();
  }, [userCardsCopy]);

  useEffect(() => {
    if (hasMounted.current) {
      const sortedCards = [...filteredCards].sort((a, b) => {
        if (selectedSort.sortKey === "ipoTime") {
          return new Date(b.ipoTime) - new Date(a.ipoTime);
        } else {
          return selectedSort.ascending
            ? a[selectedSort.sortKey] - b[selectedSort.sortKey]
            : b[selectedSort.sortKey] - a[selectedSort.sortKey];
        }
      });

      setUserCards(sortedCards);
    }
  }, [filteredCards]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsScrollToTopVisible(true);
      } else {
        setIsScrollToTopVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const filterOptions = [
    { label: "All" },
    { label: "Rare" },
    { label: "Epic" },
    { label: "Legend" },
  ];

  const sortOptions = [
    { label: "Score", sortKey: "currentScore", ascending: false },
    { label: "Score", sortKey: "currentScore", ascending: true },
    { label: "Latest", sortKey: "ipoTime", ascending: false },
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
    <div className="flex flex-col px-2 lg:px-0 lg:flex-row overflow-hidden">
      <div className="w-full lg:w-1/4 bg-white border border-gray-300 rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed overflow-hidden">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black mt-2 ml-2 px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
        <div className="justify-items-center items-center w-full mx-4">
          {/* Header */}
          <div className="flex justify-center items-center space-x-3 mb-4">
            <h3 className="text-4xl font-bold text-blue-400 mt-8 mb-2">
              Tournament #1
            </h3>
            <img src={flagIcon} alt="Flag Icon" className="mt-8 mb-2 w-8 h-8" />
          </div>

          {/* Badges */}
          <div className="flex justify-center space-x-4 mb-4">
            <span className="bg-amber-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
              1 Legend Max
            </span>
            <span className="bg-purple-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
              1 Epic Max
            </span>
          </div>

          {/* Timer */}
          <div className="px-4 flex justify-center w-full">
            <p className="text-blue-400 justify-center font-semibold mb-4">
              {timeRemaining}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full lg:ml-[25%] lg:w-3/4 lg:px-4 overflow-hidden">
        <div className="flex border-b-0 mx-0 lg:mx-6 mt-2 mb-2">
          <button
            className={`py-2 px-2 lg:px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
              activeDeckTab === "Deck1"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (isUpdatingDeck) {
                return;
              }
              setActiveDeckTab("Deck1");
              setModifiedDeck(userDeck1);
            }}
          >
            Deck 1
          </button>
          <button
            className={`py-2 lg:px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
              activeDeckTab === "Deck2"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (isUpdatingDeck) {
                return;
              }
              setActiveDeckTab("Deck2");
              setModifiedDeck(userDeck2);
            }}
          >
            Deck 2
          </button>
          <button
            className={`py-2 px-2 lg:px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
              activeDeckTab === "Deck3"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (isUpdatingDeck) {
                return;
              }
              setActiveDeckTab("Deck3");
              setModifiedDeck(userDeck3);
            }}
          >
            Deck 3
          </button>
          <button
            className={`py-2 px-2 lg:px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
              activeDeckTab === "Deck4"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (isUpdatingDeck) {
                return;
              }
              setActiveDeckTab("Deck4");
              setModifiedDeck(userDeck4);
            }}
          >
            Deck 4
          </button>
          <button
            className={`py-2 px-2 lg:px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
              activeDeckTab === "Deck5"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              if (isUpdatingDeck) {
                return;
              }
              setActiveDeckTab("Deck5");
              setModifiedDeck(userDeck5);
            }}
          >
            Deck 5
          </button>
        </div>
        <div className="hidden lg:grid grid-cols-5 lg:px-4">
          {Array.from({ length: 5 }).map((_, index) => {
            const item = modifiedDeck[index] || emptyDeck[index];

            return (
              <div
                key={index}
                className="cursor-pointer bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg overflow-hidden transition duration-300 ease-in-out group border-2 border-blue-200"
                style={{
                  borderTopLeftRadius: "1.25rem",
                  borderBottomLeftRadius: "1.25rem",
                  borderTopRightRadius: "1.25rem",
                  borderBottomRightRadius: "1.25rem",
                }}
              >
                <div className="flex justify-center items-center">
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="w-1/2 object-contain mt-6 transition duration-300"
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
                <div className="flex justify-between w-full px-2 mb-2">
                  <div
                    className={`flex items-center ${
                      modifiedDeck.length > index ? "block" : "invisible"
                    }`}
                  >
                    <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                    <span className="font-open-sans text-sm">0</span>
                  </div>
                  <span
                    className={`text-xs font-helvetica inline-block px-2 py-1 ${
                      item.rarity === "RARE"
                        ? "bg-sky-300"
                        : item.rarity === "EPIC"
                        ? "bg-purple-300"
                        : item.rarity === "LEGEND"
                        ? "bg-amber-300"
                        : "bg-white"
                    } text-white font-bold rounded-lg text-center`}
                  >
                    {item.rarity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <table
          className="min-w-full rounded-xl p-2 bg-blue-100 lg:hidden"
          style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
        >
          <tbody>
            {Array.from({ length: 5 }).map((_, index) => {
              const item = modifiedDeck[index] || emptyDeck[index];

              return (
                <tr
                  key={index}
                  className={`cursor-pointer h-26 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white`}
                >
                  <td className="py-4 px-2 text-left rounded-tl-xl rounded-bl-xl">
                    <div className="flex items-center space-x-2">
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-9 h-12 object-cover mr-1"
                      />
                      <div className="flex flex-col justify-center">
                        <span
                          className={`text-black font-helvetica-neue font-semibold text-xs`}
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
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center rounded-tr-xl rounded-br-xl">
                    <span
                      className={`text-xs font-helvetica inline-block px-2 py-1 mb-1 ${
                        item.rarity === "RARE"
                          ? "bg-sky-300"
                          : item.rarity === "EPIC"
                          ? "bg-purple-300"
                          : item.rarity === "LEGEND"
                          ? "bg-amber-300"
                          : "bg-white"
                      } text-white font-semibold rounded-lg text-center`}
                    >
                      {item.rarity}
                    </span>
                    <div className={"flex items-center"}>
                      <img src={Score} alt="Score" className="w-3 h-3" />
                      <span className="font-open-sans text-sm">0</span>
                    </div>
                  </td>
                  {/* <td className="py-4 px-2 text-center rounded-tr-xl rounded-br-xl border border-black">
                    <div className={"flex items-center"}>
                      <img src={Score} alt="Score" className="w-3 h-3" />
                      <span className="font-open-sans text-sm">0</span>
                    </div>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>

        {!openInventory && (
          <div className="px-4 flex justify-center w-full">
            <button
              className="bg-blue-400 justify-center text-white font-bold py-1 px-4 rounded-full transition duration-300 hover:bg-blue-500 mt-4 mb-2"
              onClick={() => {
                setOpenInventory(true);
                setIsUpdatingDeck(true);
              }}
            >
              Submit/Update Deck
            </button>
          </div>
        )}

        {openInventory && (
          <div className="px-4 flex justify-between items-center">
            <button
              className="bg-blue-400 justify-center text-white font-bold py-1 px-4 rounded-full transition duration-300 hover:bg-blue-500 mt-4 mb-2"
              onClick={() => finishUpdatingDeck()}
            >
              Finish
            </button>
            <button
              className="justify-centerfont-bold py-1 px-4 rounded-full border border-gray-300 transition duration-300 bg-white text-black hover:bg-gray-200 mt-4 mb-2"
              onClick={() => cancelUpdatingDeck()}
            >
              Cancel
            </button>
          </div>
        )}

        {openInventory && (
          <div>
            <div className="flex border-b-0 mb-2 mx-0 lg:mx-6">
              <button className="py-2 px-4 font-semibold border-b-2 border-blue-500 text-blue-500">
                Inventory
              </button>
            </div>
            <div className="flex items-center space-x-2 px-2 lg:px-8 lg:space-x-4 self-end lg:self-auto w-full justify-end">
              <div className="relative inline-block text-left">
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
            {userCards.length === 0 ? (
              <div>
                <div className="flex flex-col items-center">
                  <p className="text-lg mt-6">Empty Collectible Inventory</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:px-4">
                {userCards.map((item) =>
                  item.category !== "presale" ? (
                    <div
                      className={`cursor-pointer ${
                        modifiedDeck.some(
                          (deckItem) => deckItem.uniqueId === item.uniqueId
                        )
                          ? "border-4 border-blue-200"
                          : "border border-gray-200"
                      } bg-white mt-4 mb-2 mx-1 lg:mx-2 rounded-lg overflow-hidden transition duration-300 ease-in-out lg:hover:shadow-2xl group`}
                      key={item.uniqueId}
                      onClick={() => addCardToDeck(item)}
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
                          className="w-2/3 lg:w-1/2 object-contain mt-6 transition duration-300 group-hover:scale-105 relative"
                          style={{ zIndex: 10, aspectRatio: "2 / 3" }}
                        />
                      </div>
                      <div className="p-2 text-left px-4">
                        <span
                          className="w-full font-helvetica-neue text-xs lg:text-sm font-bold"
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
                              className="w-3 h-3 lg:w-5 lg:h-5 lg:mr-1"
                            />
                            <span className="font-open-sans text-xs lg:text-sm">
                              {item.currentScore}
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
                          <span className="text-xs lg:text-sm font-helvetica">
                            Available:
                          </span>
                          <span className="text-xs lg:text-sm font-helvetica">
                            {cardUsage[item.uniqueId].available}
                          </span>
                        </div>
                        <div className="flex justify-between w-full px-2 mt-1">
                          <span className="text-xs lg:text-sm font-helvetica">
                            Locked:
                          </span>
                          <span className="text-xs lg:text-sm font-helvetica">
                            {cardUsage[item.uniqueId].locked}
                          </span>
                        </div>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteCardFromDeck(item);
                          }}
                          className={`${
                            modifiedDeck.some(
                              (deckItem) => deckItem.uniqueId === item.uniqueId
                            )
                              ? "block"
                              : "invisible"
                          } w-full bg-blue-400 text-sm text-white font-bold px-4 py-1 rounded-full hover:bg-blue-500 hover:text-white`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {isScrollToTopVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-4 border border-black bg-white text-black p-3 rounded-full focus:outline-none z-50"
        >
          ↑
        </button>
      )}
      {notification && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <Notification
            message={notification}
            alert={updatingDeckAlert}
            onClose={handleNotificationClose}
          />
        </div>
      )}
    </div>
  );
}

export default TournamentDetails;
