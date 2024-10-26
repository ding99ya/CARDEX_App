import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import flagIcon from "./Flag.svg";
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

  const [openInventory, setOpenInventory] = useState(false);

  const [timeRemaining, setTimeRemaining] = useState("0d 00h 00m");

  const [inTournament, setInTournament] = useState(false);

  const [isUpdatingDeck, setIsUpdatingDeck] = useState(false);

  const [inventory, setInventory] = useState([]);
  const [userCards, setUserCards] = useState([]);
  const [userDeck1, setUserDeck1] = useState([]);
  const [userDeck2, setUserDeck2] = useState([]);
  const [userDeck3, setUserDeck3] = useState([]);
  const [userDeck4, setUserDeck4] = useState([]);
  const [userDeck5, setUserDeck5] = useState([]);
  const [modifiedDeck, setModifiedDeck] = useState([]);

  const [notification, setNotification] = useState(null);

  const [activeDeckTab, setActiveDeckTab] = useState("Deck1");

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

  const showNotification = (message) => {
    setNotification(message);
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
  };

  const deleteCardFromDeck = (newCard) => {
    setModifiedDeck((prevDeck) =>
      prevDeck.filter((card) => card.uniqueId !== newCard.uniqueId)
    );
  };

  const finishUpdatingDeck = () => {
    if (modifiedDeck.length != 5) {
      showNotification("Need five cards for the deck");
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
      showNotification("Can have only 1 legend and 1 epic card");
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
  };

  const cancelUpdatingDeck = () => {
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

          setUserCards(fetchedUserCards);
        } catch (error) {
          console.error(`Error fetching cards info`, error);
        }
      };

      fetchCardPosition();
    } else {
      hasMounted.current = true;
    }
  }, [inventory]);

  return (
    <div className="flex flex-col px-2 lg:px-0 lg:flex-row">
      <div className="w-full lg:w-1/4 bg-white border border-gray-300 rounded-3xl sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed">
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
      <div className="w-full lg:ml-[25%] lg:w-3/4 lg:px-4">
        <div className="flex border-b-0 mx-0 lg:mx-6 mt-2 mb-2">
          <button
            className={`py-2 px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
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
            className={`py-2 px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
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
            className={`py-2 px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
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
            className={`py-2 px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
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
            className={`py-2 px-4 mx-2 text-xs lg:text-base lg:mx-0 font-semibold w-full lg:w-auto ${
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
        <div className="grid grid-cols-5 lg:px-4">
          {Array.from({ length: 5 }).map((_, index) => {
            const item = modifiedDeck[index] || emptyDeck[index];
            console.log(index);

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

        {!openInventory && (
          <div className="px-4 flex justify-center w-full">
            <button
              className="bg-blue-400 justify-center text-white font-bold py-2 px-6 rounded-full transition duration-300 hover:bg-blue-500 mt-4 mb-2"
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
              className="bg-blue-400 justify-center text-white font-bold py-2 px-6 rounded-full transition duration-300 hover:bg-blue-500 mt-4 mb-2"
              onClick={() => finishUpdatingDeck()}
            >
              Finish
            </button>
            <button
              className="justify-centerfont-bold py-2 px-6 rounded-full border border-gray-300 transition duration-300 bg-white text-black hover:bg-gray-200 mt-4 mb-2"
              onClick={() => cancelUpdatingDeck()}
            >
              Cancel
            </button>
          </div>
        )}

        {openInventory && (
          <div>
            <div className="flex border-b-0 mb-2">
              <button className="py-2 px-4 font-semibold border-b-2 border-blue-500 text-blue-500">
                Inventory
              </button>
            </div>
            {userCards.length === 0 ? (
              <div>
                <div className="flex flex-col items-center">
                  <p className="text-lg mt-6">Empty Collectible Inventory</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 lg:px-4">
                {userCards.map((item) =>
                  item.category !== "presale" ? (
                    <div
                      className={`cursor-pointer ${
                        modifiedDeck.some(
                          (deckItem) => deckItem.uniqueId === item.uniqueId
                        )
                          ? "border-4 border-blue-200"
                          : "border border-gray-300"
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
                          <span className="text-sm font-helvetica">
                            Position:
                          </span>
                          <span className="text-sm font-helvetica">
                            {item.shares}
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
                          } w-full bg-blue-400 text-sm text-white font-bold px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white`}
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
      {notification && (
        <div className="fixed inset-0 flex justify-center items-center z-50">
          <Notification
            message={notification}
            onClose={handleNotificationClose}
          />
        </div>
      )}
    </div>
  );
}

export default TournamentDetails;
