import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TwitterLogo from "./TwitterLogo.png";
import PresaleCard from "./PresaleCard.png";
import { useNavigation } from "./NavigationContext";
import axios from "axios";

const LeaderboardUser = () => {
  const { username } = useParams();

  // users is the variable containing all users info displayed in leaderboard
  const [users, setUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { goBack, navigateTo } = useNavigation();

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
    // navigate(`/users/${user.userName}`, {
    //   state: { from: location.pathname },
    // });
    navigateTo(`/users/${user.userName}`);
  };

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate("/leaderboard");
    }
  };

  const handleTwitterImageClick = (twitterURL) => {
    window.open(twitterURL, "_blank");
  };

  return (
    <div className="container mx-auto p-2">
      <span
        // onClick={() => handleBackClick()}
        onClick={goBack}
        className="cursor-pointer inline-block bg-white text-black px-4 py-2 font-semibold whitespace-nowrap"
      >
        &lt; Back
      </span>
      <table
        className="min-w-full rounded-xl p-2 bg-blue-100"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        <thead className="bg-white text-blue-500 text-xs lg:text-sm font-open-sans">
          <tr>
            <th className="py-2 px-4 text-left rounded-tl-xl rounded-bl-xl">
              Rank
            </th>
            <th className="py-2 px-4 text-left">User</th>
            <th className="py-2 px-4 text-center rounded-tr-xl rounded-br-xl">
              Points
            </th>
          </tr>
        </thead>
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
              <td className={`py-4 px-3 text-left rounded-tl-xl rounded-bl-xl`}>
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
                  {/* {index === 0 && (
                    <img
                      src={GoldMedal}
                      alt="Gold Medal"
                      className="w-6 h-6 ml-1"
                    />
                  )}
                  {index === 1 && (
                    <img
                      src={SilverMedal}
                      alt="Silver Medal"
                      className="w-6 h-6 ml-1"
                    />
                  )}
                  {index === 2 && (
                    <img
                      src={BronzeMedal}
                      alt="Bronze Medal"
                      className="w-6 h-6 ml-1"
                    />
                  )} */}
                </div>
              </td>
              <td className="py-4 px-3 text-left">
                {/* <div className="flex items-center">
                  <img
                    src={user.profilePhoto}
                    alt={`${user.name}'s profile`}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  {user.name}
                </div> */}

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
                          "https://x.com/" + user.userName
                        );
                      }}
                    >
                      <img
                        src={TwitterLogo}
                        alt="Twitter"
                        className="w-2 h-2 mr-1"
                      />
                      <span className="text-gray-400 font-open-sans text-xs">
                        @{user.userName}
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
  );
};

export default LeaderboardUser;
