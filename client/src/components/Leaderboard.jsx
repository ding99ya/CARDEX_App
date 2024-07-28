import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useLocation, useNavigate } from "react-router-dom";
import GoldMedal from "./GoldMedal.svg";
import SilverMedal from "./SilverMedal.svg";
import BronzeMedal from "./BronzeMedal.svg";
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

  const handleUsernameChange = (e) => {
    const name = e.target.value;
    setUsername(name);
  };

  const handleSearchUser = () => {
    navigate(`/leaderboard/${username}`, {
      state: { from: location.pathname },
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div class="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="ml-auto flex items-center bg-gray-200 rounded-full shadow-md px-2">
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

      <div class="w-full px-4 mb-4 border border-black rounded-xl">
        <div className="flex items-left space-x-2 mt-4 mb-6">
          <span
            className="w-10 h-10 bg-center bg-cover rounded-full"
            style={{
              backgroundImage: user.twitter
                ? `url(${user.twitter.profilePictureUrl})`
                : `url(${"https://pbs.twimg.com/profile_images/1647822798566424576/ZfLTwjSK_normal.jpg"})`,
            }}
          ></span>
          <span className="text-2xl text-black font-helvetica-neue font-semibold">
            {user.twitter.name}
          </span>
        </div>
        <div class="flex w-full">
          <div class="flex w-1/2 justify-between items-center mb-4">
            <span class="font-semibold text-base">Your Rank</span>
            <span class="text-base font-semibold mr-8">#{currentUserRank}</span>
          </div>

          <div class="flex w-1/2 justify-between items-center mb-4">
            <span class="font-semibold text-base ml-8">Your Points</span>
            <span class="text-base font-semibold">
              {currentUserPaperPoint} Pts
            </span>
          </div>
        </div>
      </div>

      <table
        className="min-w-full bg-white border border-black rounded-xl overflow-hidden"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead className="bg-sky-100 rounded-t-xl h-16">
          <tr>
            <th className="py-2 px-4 text-left">RANK</th>
            <th className="py-2 px-4 text-left">USER</th>
            <th className="py-2 px-4 text-center">TOTAL POINTS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.rank}
              className={`hover:border hover:border-black cursor-pointer h-12 ${
                index === users.length - 1 ? "rounded-b-xl" : ""
              } ${index % 2 === 1 ? "bg-sky-100" : "bg-white"}`}
              onClick={() => handleUserClick(user)}
            >
              <td className="py-2 px-4 text-left">
                <div className="flex items-center">
                  <span>#{user.rank}</span>
                  {index === 0 && (
                    <img
                      src={GoldMedal}
                      alt="Gold Medal"
                      className="w-4 h-4 ml-2"
                    />
                  )}
                  {index === 1 && (
                    <img
                      src={SilverMedal}
                      alt="Silver Medal"
                      className="w-4 h-4 ml-2"
                    />
                  )}
                  {index === 2 && (
                    <img
                      src={BronzeMedal}
                      alt="Bronze Medal"
                      className="w-4 h-4 ml-2"
                    />
                  )}
                </div>
              </td>
              <td className="py-2 px-4 text-left">
                <div className="flex items-center">
                  <img
                    src={user.profilePhoto}
                    alt={`${user.name}'s profile`}
                    className="w-6 h-6 rounded-full mr-2"
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
