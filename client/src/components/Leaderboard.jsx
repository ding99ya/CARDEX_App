import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import GoldMedal from "./GoldMedal.svg";
import SilverMedal from "./SilverMedal.svg";
import BronzeMedal from "./BronzeMedal.svg";
import TwitterLogo from "./TwitterLogo.png";
import axios from "axios";

const Leaderboard = () => {
  // users is the variable containing all users info displayed in leaderboard
  const [users, setUsers] = useState([]);

  // username is used for search feature
  const [username, setUsername] = useState("");

  const [currentUsername, setCurrentUsername] = useState("");
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [currentUserPaperPoint, setCurrentUserPaperPoint] = useState(0);

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
        console.error("Error fetching leaderboard data", error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          `/api/leaderboard/${embeddedWalletAddress}`
        );
        setCurrentUsername(response.data.userName);
        setCurrentUserRank(response.data.rank);
        setCurrentUserPaperPoint(response.data.paperPoints);
      } catch (error) {
        console.error("Error fetching current user leaderboard data", error);
      }
    };

    fetchUsers();
    fetchCurrentUser();
  }, []);

  const handleUserClick = (user) => {
    navigate(`/users/${user.userName}`, {
      state: { from: location.pathname },
    });
  };

  const handleProfileClick = () => {
    navigate(`/profile`);
  };

  const handleUsernameChange = (e) => {
    const name = e.target.value;
    setUsername(name);
  };

  const handleSearchUser = () => {
    navigate(`/leaderboard/${username}`, {
      state: { from: location.pathname },
    });
  };

  const handleTwitterImageClick = (twitterURL) => {
    window.open(twitterURL, "_blank");
  };

  return (
    <div className="container mx-auto p-4">
      <div class="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="ml-auto flex items-center bg-gray-200 rounded-full px-2">
            <input
              type="text"
              placeholder="Search by username"
              value={username}
              onChange={handleUsernameChange}
              className="bg-gray-200 outline-none flex-grow px-2 py-1 rounded-full"
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

      <div class="w-full px-2 mb-4 border border-black rounded-xl">
        <div class="grid grid-cols-2 w-full">
          <div className="flex items-start space-x-2 mt-4 mb-6">
            <span
              className="w-12 h-12 bg-center bg-cover rounded-full mt-1"
              style={{
                backgroundImage: user.twitter
                  ? `url(${user.twitter.profilePictureUrl})`
                  : `url(${"https://pbs.twimg.com/profile_images/1647822798566424576/ZfLTwjSK_normal.jpg"})`,
              }}
            ></span>
            <div className="flex flex-col mt-1">
              <span className="text-xl text-black font-helvetica-neue font-semibold">
                {user.twitter.name}
              </span>
              <div
                className="flex items-center cursor-pointer rounded-full"
                onClick={() =>
                  handleTwitterImageClick(
                    "https://x.com/" + user.twitter.username
                  )
                }
              >
                <img src={TwitterLogo} alt="Twitter" className="w-3 h-3 mr-1" />
                <span className="text-gray-400 font-open-sans text-xs">
                  @{user.twitter.username}
                </span>
              </div>
            </div>
          </div>
          {/* <div className="flex items-center">
            <button
              onClick={handleProfileClick}
              className="bg-blue-400 text-white ml-8 px-4 py-2 font-semibold rounded-full hover:bg-blue-500 hover:text-white"
            >
              View Profile
            </button>
          </div> */}
          <div class="flex flex-col w-full justify-center">
            <div class="flex w-full justify-between items-center mb-2">
              <span class="font-open-sans text-base font-semibold ml-2">
                Rank
              </span>
              <span class="font-open-sans text-base font-semibold">
                #{currentUserRank}
              </span>
            </div>

            <div class="flex w-full justify-between items-center">
              <span class="font-open-sans text-base font-semibold ml-2">
                Points
              </span>
              <span class="font-open-sans text-base font-semibold">
                {currentUserPaperPoint} Pts
              </span>
            </div>
          </div>
        </div>
      </div>

      <table
        className="min-w-full bg-white border border-black rounded-xl overflow-hidden"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead className="bg-sky-100 rounded-t-xl h-16 text-gray-500 text-sm font-open-sans">
          <tr>
            <th className="py-2 px-4 text-left">Rank</th>
            <th className="py-2 px-4 text-left">User</th>
            <th className="py-2 px-4 text-center">Total Points</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.rank}
              className={`cursor-pointer h-14 text-sm font-open-sans ${
                index === users.length - 1 ? "rounded-b-xl" : ""
              } ${index % 2 === 1 ? "bg-gray-100" : "bg-white"}`}
              onClick={() => handleUserClick(user)}
            >
              <td className="py-2 px-4 text-left">
                <div className="flex items-center">
                  <span>#{user.rank}</span>
                  {index === 0 && (
                    <img
                      src={GoldMedal}
                      alt="Gold Medal"
                      className="w-6 h-6 ml-2"
                    />
                  )}
                  {index === 1 && (
                    <img
                      src={SilverMedal}
                      alt="Silver Medal"
                      className="w-6 h-6 ml-2"
                    />
                  )}
                  {index === 2 && (
                    <img
                      src={BronzeMedal}
                      alt="Bronze Medal"
                      className="w-6 h-6 ml-2"
                    />
                  )}
                </div>
              </td>
              <td className="py-2 px-4 text-left">
                <div className="flex items-center">
                  <img
                    src={user.profilePhoto}
                    alt={`${user.name}'s profile`}
                    className="w-6 h-6 rounded-full mr-1"
                  />
                  {user.name}
                </div>
              </td>
              <td className="py-2 px-4 text-center">{user.paperPoints} Pts</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
