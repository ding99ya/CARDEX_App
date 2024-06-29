import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const LeaderboardUser = () => {
  const { username } = useParams();

  // users is the variable containing all users info displayed in leaderboard
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `/api/leaderboard/containname/${username}`
        );
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

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate("/leaderboard");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => handleBackClick()}
        className="bg-blue-500 text-white px-4 py-2 rounded shadow"
      >
        Back
      </button>
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

export default LeaderboardUser;
