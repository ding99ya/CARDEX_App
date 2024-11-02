import React, { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import flagIcon from "./Flag.svg";
import { useNavigation } from "./NavigationContext.jsx";

function ViewTournament() {
  const { user } = usePrivy();
  const embeddedWalletAddress = user.wallet.address;

  const { goBack, navigateTo } = useNavigation();

  const Navigate = useNavigate();

  const [username, setUsername] = useState("");

  const [showSearchPlayers, setShowSearchPlayers] = useState(false);

  const [searchedPlayers, setSearchedPlayers] = useState([]);

  const [isScrollToTopVisible, setIsScrollToTopVisible] = useState(false);

  const [activeTab, setActiveTab] = useState("players");

  const [playersRank, setPlayersRank] = useState([]);

  const [cardsRank, setCardsRank] = useState([]);

  const [expandedRow, setExpandedRow] = useState(null);

  const [timeRemaining, setTimeRemaining] = useState("0d 00h 00m");

  const [inTournament, setInTournament] = useState(false);

  const [currentDeckRank, setCurrentDeckRank] = useState();
  const [currentDeckTotalScore, setCurrentDeckTotalScore] = useState();

  const [userDeck1, setUserDeck1] = useState([]);
  const [userDeck1Rank, setUserDeck1Rank] = useState();
  const [userDeck1TotalScore, setUserDeck1TotalScore] = useState();

  const [userDeck2, setUserDeck2] = useState([]);
  const [userDeck2Rank, setUserDeck2Rank] = useState();
  const [userDeck2TotalScore, setUserDeck2TotalScore] = useState();

  const [userDeck3, setUserDeck3] = useState([]);
  const [userDeck3Rank, setUserDeck3Rank] = useState();
  const [userDeck3TotalScore, setUserDeck3TotalScore] = useState();

  const [userDeck4, setUserDeck4] = useState([]);
  const [userDeck4Rank, setUserDeck4Rank] = useState();
  const [userDeck4TotalScore, setUserDeck4TotalScore] = useState();

  const [userDeck5, setUserDeck5] = useState([]);
  const [userDeck5Rank, setUserDeck5Rank] = useState();
  const [userDeck5TotalScore, setUserDeck5TotalScore] = useState();

  const [modifiedDeck, setModifiedDeck] = useState([]);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUsernameChange = (e) => {
    const name = e.target.value;
    setUsername(name);

    if (name === "") {
      setShowSearchPlayers(false);
      setSearchedPlayers([]);
    }
  };

  const handleSearchUser = async () => {
    if (username === "") {
      return;
    }

    try {
      const response = await axios.get(
        `/api/ctournament/players/${username.toString()}`
      );
      setSearchedPlayers(response.data);
    } catch (error) {
      console.error(
        `Error fetching user ${embeddedWalletAddress} card inventory`,
        error
      );
    }

    setShowSearchPlayers(true);
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get(`/api/sortTournamentCards`);
      setCardsRank(response.data);
    } catch (error) {
      console.error("Error fetching tournament data for cards", error);
    }
  };

  const handleCardClick = (card) => {
    navigateTo(`/cards/${card.uniqueId}`);
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

  const toggleRow = (index) => {
    setExpandedRow((prev) => (prev === index ? null : index));
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
    const fetchCardInfo = async () => {
      const response = await axios.get(
        `/api/ctournament/userDecks/${embeddedWalletAddress.toString()}`
      );

      if (response.data["1"]) {
        setUserDeck1(response.data["1"].deck);
        setUserDeck1Rank(response.data["1"].rank);
        setUserDeck1TotalScore(response.data["1"].totalTournamentScore);
        setModifiedDeck(response.data["1"].deck);
        setCurrentDeckRank(response.data["1"].rank);
        setCurrentDeckTotalScore(response.data["1"].totalTournamentScore);
      }

      if (response.data["2"]) {
        setUserDeck2(response.data["2"].deck);
        setUserDeck2Rank(response.data["2"].rank);
        setUserDeck2TotalScore(response.data["2"].totalTournamentScore);
      }

      if (response.data["3"]) {
        setUserDeck3(response.data["3"].deck);
        setUserDeck3Rank(response.data["3"].rank);
        setUserDeck3TotalScore(response.data["3"].totalTournamentScore);
      }

      if (response.data["4"]) {
        setUserDeck4(response.data["4"].deck);
        setUserDeck4Rank(response.data["4"].rank);
        setUserDeck4TotalScore(response.data["4"].totalTournamentScore);
      }

      if (response.data["5"]) {
        setUserDeck5(response.data["5"].deck);
        setUserDeck5Rank(response.data["5"].rank);
        setUserDeck5TotalScore(response.data["5"].totalTournamentScore);
      }
    };

    fetchCardInfo();
  }, []);

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

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("/api/sortTournamentDecks");
        setPlayersRank(response.data);
      } catch (error) {
        console.error("Error fetching rank data for players", error);
      }
    };
    fetchPlayers();
  }, []);

  return (
    <div className="flex flex-col px-2 lg:px-0 lg:flex-row overflow-hidden">
      <div className="w-full lg:w-1/4 bg-white rounded-3xl border border-gray-300 sm:container sm:mx-auto mt-4 lg:mx-4 lg:my-4 lg:fixed overflow-hidden">
        <div
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black mt-2 ml-2 px-4 py-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </div>
        <div className="items-center w-full mx-auto lg:mx-2">
          {/* Header */}
          <div className="flex justify-center items-center space-x-1 mb-4">
            <h3 className="text-3xl font-bold text-blue-400 mt-8 mb-2">
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
              if (activeDeckTab === "Deck1") {
                return;
              }
              setActiveDeckTab("Deck1");
              setModifiedDeck(userDeck1);
              setCurrentDeckRank(userDeck1Rank);
              setCurrentDeckTotalScore(userDeck1TotalScore);
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
              if (activeDeckTab === "Deck2") {
                return;
              }
              setActiveDeckTab("Deck2");
              setModifiedDeck(userDeck2);
              setCurrentDeckRank(userDeck2Rank);
              setCurrentDeckTotalScore(userDeck2TotalScore);
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
              if (activeDeckTab === "Deck3") {
                return;
              }
              setActiveDeckTab("Deck3");
              setModifiedDeck(userDeck3);
              setCurrentDeckRank(userDeck3Rank);
              setCurrentDeckTotalScore(userDeck3TotalScore);
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
              if (activeDeckTab === "Deck4") {
                return;
              }
              setActiveDeckTab("Deck4");
              setModifiedDeck(userDeck4);
              setCurrentDeckRank(userDeck4Rank);
              setCurrentDeckTotalScore(userDeck4TotalScore);
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
              if (activeDeckTab === "Deck5") {
                return;
              }
              setActiveDeckTab("Deck5");
              setModifiedDeck(userDeck5);
              setCurrentDeckRank(userDeck5Rank);
              setCurrentDeckTotalScore(userDeck5TotalScore);
            }}
          >
            Deck 5
          </button>
        </div>
        <div className="flex flex-row mx-2 lg:mx-6 mt-2 mb-2 justify-between lg:justify-end">
          <div className="lg:text-lg text-gray-400 font-semibold">
            Rank:{" "}
            {`#${currentDeckRank !== undefined ? currentDeckRank : "N/A"}`}
          </div>
          <div className="lg:text-lg text-gray-400 font-semibold lg:ml-4">
            Total Score:{" "}
            {`${
              currentDeckTotalScore !== undefined
                ? currentDeckTotalScore
                : "N/A"
            }`}
          </div>
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
                    <div
                      className={`flex items-center ${
                        modifiedDeck.length > index ? "block" : "invisible"
                      }`}
                    >
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

        <div className="flex border-b-0 mx-0 lg:mx-6 mb-2">
          <button
            className={`py-2 px-4 mx-10 lg:mx-0 font-semibold w-full lg:w-auto ${
              activeTab === "players"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("players")}
          >
            Players
          </button>
          <button
            className={`py-2 px-4 mx-10 lg:mx-0 font-semibold w-full lg:w-auto ${
              activeTab === "cards"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
            }`}
            onClick={() => {
              setActiveTab("cards");
              if (activeTab !== "cards") {
                fetchCards();
              }
            }}
          >
            Cards
          </button>
        </div>

        {activeTab === "players" && (
          <div class="rounded-xl bg-blue-100 mx-0 lg:mx-6">
            <div class="w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-white rounded-xl mt-3 mx-2 px-2 py-0 w-full">
                  <input
                    type="text"
                    placeholder="Search by username"
                    value={username}
                    onChange={handleUsernameChange}
                    className="bg-white outline-none flex-grow px-2 py-1 rounded-full w-full"
                  />
                  <svg
                    className="w-5 h-5 text-black cursor-pointer"
                    onClick={handleSearchUser}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m1.39-5.09A7.5 7.5 0 1110.5 3.5a7.5 7.5 0 017.5 7.5z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
            <table
              className="min-w-full rounded-xl p-2 bg-blue-100"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <tbody>
                {showSearchPlayers && searchedPlayers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4">
                      No corresponding players
                    </td>
                  </tr>
                ) : (
                  (showSearchPlayers ? searchedPlayers : playersRank).map(
                    (player, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`cursor-pointer h-16 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white ${
                            index === playersRank.length - 1
                              ? "rounded-b-xl"
                              : ""
                          }
                `}
                          onClick={() => toggleRow(index)}
                        >
                          <td
                            className={`py-4 px-3 text-left rounded-tl-xl rounded-bl-xl`}
                          >
                            <div className="flex items-center">
                              <span
                                className={`rounded-full px-2 text-center ${
                                  index === 0
                                    ? "text-yellow-300 font-semibold"
                                    : index === 1
                                    ? "text-slate-300 font-semibold"
                                    : index === 2
                                    ? "text-amber-600 font-semibold"
                                    : "text-black"
                                }`}
                              >{`#${
                                searchedPlayers.length > 0
                                  ? player.rank
                                  : index + 1
                              }`}</span>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-left">
                            <div className="flex items-start space-x-2">
                              <span
                                className="w-8 h-8 bg-center bg-cover rounded-full mr-1"
                                style={{
                                  backgroundImage:
                                    player.profilePhoto !== ""
                                      ? `url(${player.profilePhoto})`
                                      : `url(${PresaleCard})`,
                                }}
                              ></span>
                              <div className="flex flex-col">
                                <span
                                  className={`text-black font-helvetica-neue font-semibold mt-1`}
                                >
                                  {player.username}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center rounded-tr-xl rounded-br-xl">
                            <div className={`flex items-center`}>
                              <img
                                src={Score}
                                alt="Score"
                                className="w-5 h-5 mr-1"
                              />
                              <span className="font-open-sans text-sm">
                                {player.totalTournamentScore}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {expandedRow === index && (
                          <tr>
                            <td colSpan="3">
                              <div className="hidden lg:grid grid-cols-5 lg:px-4">
                                {player.deck.map((item, dIndex) => {
                                  return (
                                    <div
                                      key={dIndex}
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
                                          style={{
                                            zIndex: 10,
                                            aspectRatio: "2 / 3",
                                          }}
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
                                        <div className={`flex items-center`}>
                                          <img
                                            src={Score}
                                            alt="Score"
                                            className="w-5 h-5 mr-1"
                                          />
                                          <span className="font-open-sans text-sm">
                                            {item.currentTournamentScore}
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
                                style={{
                                  borderCollapse: "separate",
                                  borderSpacing: "0 10px",
                                }}
                              >
                                <tbody>
                                  {player.deck.map((item, dIndex) => {
                                    return (
                                      <tr
                                        key={dIndex}
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
                                          <div className={`flex items-center`}>
                                            <img
                                              src={Score}
                                              alt="Score"
                                              className="w-3 h-3"
                                            />
                                            <span className="font-open-sans text-sm">
                                              {item.currentTournamentScore}
                                            </span>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "cards" && (
          <div class="rounded-xl bg-blue-100 mx-0 lg:mx-6">
            {/* <div class="w-full">
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-white rounded-xl mt-3 mx-2 px-2 py-0 w-full">
                  <input
                    type="text"
                    placeholder="Search by card"
                    // value={cardname}
                    // onChange={handleCardnameChange}
                    className="bg-white outline-none flex-grow px-2 py-1 rounded-full w-full"
                  />
                  <svg
                    className="w-5 h-5 text-black cursor-pointer"
                    // onClick={handleSearchCard}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35m1.39-5.09A7.5 7.5 0 1110.5 3.5a7.5 7.5 0 017.5 7.5z"
                    ></path>
                  </svg>
                </div>
              </div>
            </div> */}
            <table
              className="min-w-full rounded-xl p-2 bg-blue-100"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <tbody>
                {cardsRank.map((card, index) =>
                  card.category !== "presale" ? (
                    <tr
                      key={card.uniqueId}
                      className={`cursor-pointer h-26 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white ${
                        index === cardsRank.length - 1 ? "rounded-b-xl" : ""
                      }
                    `}
                      onClick={() => handleCardClick(card)}
                    >
                      <td
                        className={`py-4 px-1 text-left rounded-tl-xl rounded-bl-xl`}
                      >
                        <div className="flex items-center">
                          <span
                            className={`rounded-full px-2 text-center ${
                              index === 0
                                ? "text-yellow-300 font-semibold"
                                : index === 1
                                ? "text-slate-300 font-semibold"
                                : index === 2
                                ? "text-amber-600 font-semibold"
                                : "text-black"
                            }`}
                          >{`#${Number(index) + 1}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-left">
                        <div className="flex items-center space-x-2">
                          <img
                            src={card.photo}
                            alt={card.name}
                            className="w-9 h-12 object-cover mr-1"
                          />
                          <div className="flex flex-col justify-center">
                            <span
                              className={`text-black font-helvetica-neue font-semibold`}
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
                              {card.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-center hidden lg:table-cell">
                        <span
                          className={`text-xs font-helvetica inline-block px-2 py-1 ${
                            card.rarity === "RARE"
                              ? "bg-sky-300"
                              : card.rarity === "EPIC"
                              ? "bg-purple-300"
                              : card.rarity === "LEGEND"
                              ? "bg-amber-300"
                              : "bg-gray-400"
                          } text-white font-semibold rounded-lg text-center`}
                        >
                          {card.rarity}
                        </span>
                      </td>
                      <td className="py-4 px-6 pr-12 lg:pr-8 text-left rounded-tr-xl rounded-br-xl">
                        <div className={"flex items-center"}>
                          <img
                            src={Score}
                            alt="Score"
                            className="w-5 h-5 mr-1"
                          />
                          <span className="font-open-sans text-sm">
                            {card.currentTournamentScore}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
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
    </div>
  );
}

export default ViewTournament;
