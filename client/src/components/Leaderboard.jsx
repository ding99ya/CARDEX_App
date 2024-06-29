import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Leaderboard = () => {
  // users is the variable containing all users info displayed in leaderboard
  const [users, setUsers] = useState([]);

  // username is used for search feature
  const [username, setUsername] = useState("");

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
    fetchUsers();
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <div className="flex items-center bg-gray-200 rounded-full shadow-md p-2">
          <input
            type="text"
            placeholder="Search by username"
            value={username}
            onChange={handleUsernameChange}
            className="bg-gray-200 outline-none flex-grow px-4 py-2 rounded-full"
          />
          <svg
            className="w-6 h-6 text-gray-600 cursor-pointer"
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

      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-2 px-4 text-left">RANK</th>
            <th className="py-2 px-4 text-left">USER</th>
            <th className="py-2 px-4 text-left">TOTAL PAPER POINTS</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.rank}
              className="hover:bg-gray-100 cursor-pointer hover:border hover:border-black"
              onClick={() => handleUserClick(user)}
            >
              <td className="py-2 px-4">#{user.rank}</td>
              <td className="py-2 px-4">{user.userName}</td>
              <td className="py-2 px-4 text-right">{user.paperPoints}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
