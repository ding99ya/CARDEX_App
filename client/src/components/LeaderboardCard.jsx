import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TwitterLogo from "./TwitterLogo.png";
import PresaleCard from "./PresaleCard.png";
import Score from "./Score.png";
import { useNavigation } from "./NavigationContext";
import axios from "axios";

const LeaderboardCard = () => {
  const { name } = useParams();

  // cards is the variable containing all cards info displayed in leaderboard
  const [cards, setCards] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { goBack, navigateTo } = useNavigation();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/cards/searchName/${name}`);
        setCards(response.data);
      } catch (error) {
        console.error("Error fetching cards data", error);
      }
    };
    fetchCards();
  }, []);

  const handleCardClick = (card) => {
    navigateTo(`/cards/${card.uniqueId}`);
  };

  const handleBackClick = () => {
    if (location.state && location.state.from) {
      navigate(location.state.from);
    } else {
      navigate("/leaderboard");
    }
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
        className="min-w-full rounded-xl pl-4 pr-6 lg:px-4 py-2 bg-blue-100"
        style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
      >
        {/* <thead className="bg-white h-8 text-gray-500 text-sm font-open-sans rounded-t-xl rounded-b-xl">
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
          {cards.map((card, index) => (
            <tr
              key={card.uniqueId}
              className={`cursor-pointer h-26 text-sm font-open-sans rounded-t-xl rounded-b-xl bg-white ${
                index === cards.length - 1 ? "rounded-b-xl" : ""
              }
              `}
              onClick={() => handleCardClick(card)}
            >
              <td className={`py-4 px-1 text-left rounded-tl-xl rounded-bl-xl`}>
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
                    className="w-9 h-12 bg-center bg-cover mr-1"
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
                        width: "75%",
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
              <td className="py-4 px-6 text-left rounded-tr-xl rounded-br-xl">
                <div className={"flex items-center"}>
                  <img src={Score} alt="Score" className="w-5 h-5 mr-1" />
                  <span className="font-open-sans text-sm">
                    {card.currentScore}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardCard;
