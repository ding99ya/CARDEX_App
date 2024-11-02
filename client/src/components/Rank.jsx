import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import GoldMedal from "./GoldMedal.svg";
import SilverMedal from "./SilverMedal.svg";
import BronzeMedal from "./BronzeMedal.svg";
import TwitterLogo from "./TwitterLogo.png";
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import { useNavigation } from "./NavigationContext";
import axios from "axios";

const Rank = () => {
  const { navigateTo } = useNavigation();

  // users is the variable containing all users info displayed in leaderboard
  const [users, setUsers] = useState([]);

  // cards is the variable containing all cards info displayed in leaderboard
  const [cards, setCards] = useState([]);

  // username is used for search feature
  const [username, setUsername] = useState("");

  // cardname is used for search feature
  const [cardname, setCardname] = useState("");

  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [totalUserPaperPoint, setTotalUserPaperPoint] = useState(0);
  const [currentUserPaperPoint, setCurrentUserPaperPoint] = useState(0);

  const [activeTab, setActiveTab] = useState("players");

  const { user } = usePrivy();
  const embeddedWalletAddress = user ? user.wallet.address : 0;

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/leaderboard");
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching leaderboard data for users", error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `/api/leaderboard/${embeddedWalletAddress}`
        );
        setCurrentUsername(response.data.userName);
        setCurrentUserRank(response.data.rank);
        setTotalUserPaperPoint(response.data.paperPoints);
        setCurrentUserPaperPoint(response.data.currentPoints);
      } catch (error) {
        console.error("Error fetching current user leaderboard data", error);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleUserClick = (user) => {
    // navigate(`/users/${user.userName}`, {
    //   state: { from: location.pathname },
    // });
    navigateTo(`/users/${user.userName}`);
  };

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const handleUsernameChange = (e) => {
    const name = e.target.value;
    setUsername(name);
  };

  const handleSearchUser = () => {
    // navigate(`/leaderboard/${username}`, {
    //   state: { from: location.pathname },
    // });
    if (username === "") {
      return;
    }
    navigateTo(`/leaderboard/${username}`);
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get(`/api/sortCards`);
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard data for cards", error);
    }
  };

  const handleCardClick = (card) => {
    navigateTo(`/cards/${card.uniqueId}`);
  };

  const handleCardnameChange = (e) => {
    const name = e.target.value;
    setCardname(name);
  };

  const handleSearchCard = () => {
    if (cardname === "") {
      return;
    }
    navigateTo(`/leaderboard/cards/${cardname}`);
  };

  const handleTwitterImageClick = (twitterURL) => {
    window.open(twitterURL, "_blank");
  };

  return (
    <div className="container mx-auto p-2">
      <div class="w-full px-2 mb-4 border border-gray-300 rounded-xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 w-full">
          <div class="flex w-full items-center justify-between">
            <div className="flex items-start space-x-2 my-4">
              <span
                className="w-12 h-12 bg-center bg-cover rounded-full mt-1"
                style={{
                  backgroundImage: user.twitter
                    ? `url(${user.twitter.profilePictureUrl})`
                    : `url(${PresaleCard})`,
                }}
              ></span>
              <div className="flex flex-col mt-1">
                <span
                  className={`text-xl text-black font-helvetica-neue font-semibold ${
                    !!user.twitter ? "mt-0" : "mt-2"
                  }`}
                >
                  {currentUsername}
                </span>
                <div
                  className={`flex items-center cursor-pointer rounded-full ${
                    !!user.twitter ? "block" : "hidden"
                  }`}
                  onClick={() =>
                    !!user.twitter &
                    handleTwitterImageClick(
                      "https://x.com/" + !!user.twitter
                        ? user.twitter.username
                        : ""
                    )
                  }
                >
                  <img
                    src={TwitterLogo}
                    alt="Twitter"
                    className="w-3 h-3 mr-1"
                  />
                  <span className="text-gray-400 font-open-sans text-xs">
                    @{!!user.twitter ? user.twitter.username : ""}
                  </span>
                </div>
              </div>
            </div>
            <span class="font-open-sans text-xl font-semibold text-black mr-2 mt-2">
              Rank #{currentUserRank}
            </span>
          </div>
          <div class="flex flex-col w-full justify-center border border-gray-300 rounded-xl my-4">
            <div class="flex w-full justify-between items-center">
              <span class="font-open-sans text-base text-gray-400 ml-4 mt-2 mb-2">
                Total Earned Card
              </span>
              <span class="font-open-sans text-xl text-black mr-4 mb-2">
                {totalUserPaperPoint} Pts
              </span>
            </div>

            <div class="flex w-full justify-between items-center">
              <span class="font-open-sans text-base text-gray-400 ml-4 mb-2">
                Current Card
              </span>
              <span class="font-open-sans text-xl text-black mr-4 mb-2">
                {currentUserPaperPoint} Pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b-0 mb-2">
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
        <div class="rounded-xl bg-blue-100">
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
            {/* <thead className="bg-white h-12 text-black text-sm rounded-t-xl rounded-b-xl">
            <tr>
              <th className="py-2 px-4 text-left rounded-tl-xl rounded-bl-xl">
                RANK
              </th>
              <th className="py-2 px-4 text-left">USER</th>
              <th className="py-2 px-4 text-center rounded-tr-xl rounded-br-xl">
                POINTS
              </th>
            </tr>
          </thead> */}
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user.rank}
                  className={`cursor-pointer h-16 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white ${
                    index === users.length - 1 ? "rounded-b-xl" : ""
                  }
              `}
                  onClick={() => handleUserClick(user)}
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
                      >{`#${user.rank}`}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-left">
                    <div className="flex items-start space-x-2">
                      <span
                        className="w-8 h-8 bg-center bg-cover rounded-full mr-1"
                        style={{
                          backgroundImage:
                            user.profilePhoto !== ""
                              ? `url(${user.profilePhoto})`
                              : `url(${PresaleCard})`,
                        }}
                      ></span>
                      <div className="flex flex-col">
                        <span
                          className={`text-black font-helvetica-neue font-semibold ${
                            user.name !== "" ? "mt-0" : "mt-1"
                          }`}
                        >
                          {user.userName}
                        </span>
                        <div
                          className={`flex items-center cursor-pointer rounded-full ${
                            user.name !== "" ? "block" : "hidden"
                          }`}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleTwitterImageClick(
                              "https://x.com/" + user.name
                            );
                          }}
                        >
                          <img
                            src={TwitterLogo}
                            alt="Twitter"
                            className="w-2 h-2 mr-1"
                          />
                          <span className="text-gray-400 font-open-sans text-xs">
                            @{user.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center rounded-tr-xl rounded-br-xl">
                    {user.paperPoints} Pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "cards" && (
        <div class="rounded-xl bg-blue-100">
          <div class="w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center bg-white rounded-xl mt-3 mx-2 px-2 py-0 w-full">
                <input
                  type="text"
                  placeholder="Search by card"
                  value={cardname}
                  onChange={handleCardnameChange}
                  className="bg-white outline-none flex-grow px-2 py-1 rounded-full w-full"
                />
                <svg
                  className="w-5 h-5 text-black cursor-pointer"
                  onClick={handleSearchCard}
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
              {cards.map((card, index) =>
                card.category !== "presale" ? (
                  <tr
                    key={card.uniqueId}
                    className={`cursor-pointer h-26 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white ${
                      index === cards.length - 1 ? "rounded-b-xl" : ""
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
                      <div className="flex items-start space-x-2">
                        {/* <span
                        className="w-9 h-12 border border-black bg-center bg-cover mr-1"
                        style={{
                          backgroundImage: `url(${card.photo})`,
                        }}
                      ></span> */}
                        <img
                          src={card.photo}
                          alt={card.name}
                          className="w-9 h-12 object-cover mr-1"
                        />
                        <div className="flex flex-col items-start">
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
                    <td className="py-4 px-3 text-center hidden lg:table-cell">
                      {card.price} ETH
                    </td>
                    <td className="py-4 px-6 pr-12 lg:pr-8 text-left rounded-tr-xl rounded-br-xl">
                      <div className={"flex items-center"}>
                        <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                        <span className="font-open-sans text-sm">
                          {card.currentScore}
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
  );
};

export default Rank;
