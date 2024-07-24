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
      <span
        onClick={() => handleBackClick()}
        className="cursor-pointer inline-block bg-white text-black px-4 py-2 font-semibold whitespace-nowrap"
      >
        &lt; Back
      </span>
      <table
        className="min-w-full bg-white border border-black rounded-xl overflow-hidden"
        style={{ borderCollapse: "separate", borderSpacing: 0 }}
      >
        <thead className="bg-gray-100 rounded-t-xl h-16">
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
              } ${index % 2 === 1 ? "bg-gray-100" : "bg-white"}`}
              onClick={() => handleUserClick(user)}
            >
              <td className="py-2 px-4 text-left">#{user.rank}</td>
              <td className="py-2 px-4 text-left">{user.userName}</td>
              <td className="py-2 px-4 text-center">{user.paperPoints} Pts</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardUser;
