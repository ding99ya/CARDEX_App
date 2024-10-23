import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import marketIcon from "./Market.svg";
import leaderboardIcon from "./Leaderboard.svg";
import profileIcon from "./Profile.svg";
import inventoryIcon from "./Inventory.svg";
import playIcon from "./Play.svg";
import CardexWebsite from "./CardexWebsite.jpg";
import Cardex from "./Cardex.jpg";
import { useNavigation } from "./NavigationContext";
import "../index.css";

function Header() {
  const { resetNavigation } = useNavigation();

  const location = useLocation();
  const [selectedButton, setSelectedButton] = useState("MARKET");
  const [headerText, setHeaderText] = useState("MARKET");

  useEffect(() => {
    const storedSelectedButton = localStorage.getItem("selectedButton");
    console.log(location.pathname);

    if (
      location.pathname === "/" ||
      location.pathname === "/market" ||
      location.pathname === "/Market"
    ) {
      setSelectedButton("MARKET");
    } else if (storedSelectedButton) {
      setSelectedButton(storedSelectedButton);
    }
  }, []);

  const handleButtonClick = (buttonText) => {
    setSelectedButton(buttonText);
    setHeaderText(buttonText);
    localStorage.setItem("selectedButton", buttonText);
    resetNavigation();
  };

  // const getHeaderText = (pathname) => {
  //   switch (pathname.toLowerCase()) {
  //     case "/market":
  //       return "MARKET";
  //     case "/leaderboard":
  //       return "LEADERBOARD";
  //     case "/inventory":
  //       return "INVENTORY";
  //     case "/profile":
  //       return "PROFILE";
  //     default:
  //       return null;
  //   }
  // };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white w-full hidden lg:block z-50">
        <div className="max-w-full w-full py-6 px-0 sm:px-0 lg:px-16 flex items-center justify-between">
          <Link
            to="/"
            className="ml-8"
            onClick={() => handleButtonClick("MARKET")}
          >
            <img src={CardexWebsite} alt="Cardex" className="h-12 w-auto" />
          </Link>

          <nav>
            <ul className="flex items-center space-x-10 ml-auto mr-10">
              <li>
                <Link
                  to="/Market"
                  onClick={() => handleButtonClick("MARKET")}
                  className={`text-blue-400 font-bold rounded-full px-8 py-3 border-2 border-blue-400 font-helvetica-neue ${
                    selectedButton === "MARKET"
                      ? "bg-blue-400 text-white"
                      : "bg-white text-blue-400 hover:bg-gray-100"
                  }`}
                >
                  MARKET
                </Link>
              </li>
              <li>
                <Link
                  to="/Rank"
                  onClick={() => handleButtonClick("RANK")}
                  className={`text-blue-400 font-bold rounded-full px-8 py-3 border-2 border-blue-400 font-helvetica-neue ${
                    selectedButton === "RANK"
                      ? "bg-blue-400 text-white"
                      : "bg-white text-blue-400 hover:bg-gray-100"
                  }`}
                >
                  RANK
                </Link>
              </li>
              <li>
                <Link
                  to="/Play"
                  onClick={() => handleButtonClick("PLAY")}
                  className={`text-blue-400 font-bold rounded-full px-8 py-3 border-2 border-blue-400 font-helvetica-neue ${
                    selectedButton === "PLAY"
                      ? "bg-blue-400 text-white"
                      : "bg-white text-blue-400 hover:bg-gray-100"
                  }`}
                >
                  PLAY
                </Link>
              </li>
              <li>
                <Link
                  to="/Profile"
                  onClick={() => handleButtonClick("PROFILE")}
                  className={`text-blue-400 font-bold rounded-full px-8 py-3 border-2 border-blue-400 font-helvetica-neue ${
                    selectedButton === "PROFILE"
                      ? "bg-blue-400 text-white"
                      : "bg-white text-blue-400 hover:bg-gray-100"
                  }`}
                >
                  PROFILE
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      {headerText && (
        <header className="fixed top-0 left-0 right-0 bg-white w-full block lg:hidden z-50">
          <div className="max-w-full w-full px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              <Link
                to="/"
                className="flex items-center h-full"
                onClick={() => handleButtonClick("MARKET")}
              >
                <img
                  src={CardexWebsite}
                  alt="Cardex"
                  className="h-8 w-auto my-auto"
                />
              </Link>
            </h1>

            {/* <div className="text-xl font-bold font-helvetica-neue">
              {headerText}
            </div> */}
            <button className="text-base font-bold px-4 py-1 rounded-xl border border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
              {headerText}
            </button>
          </div>
        </header>
      )}
      <footer className="fixed bottom-0 left-0 right-0 bg-white w-full lg:hidden z-50">
        <div className="max-w-full w-full">
          <nav>
            <ul className="flex justify-evenly w-full border-t border-t-gray-300">
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-0 ${
                  selectedButton === "MARKET"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Market"
                  onClick={() => handleButtonClick("MARKET")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={marketIcon}
                    alt="Market Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "MARKET"
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "MARKET"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    Market
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-0 ${
                  selectedButton === "RANK"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Rank"
                  onClick={() => handleButtonClick("RANK")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={leaderboardIcon}
                    alt="Leaderboard Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "RANK" ? "text-black" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "RANK"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    Rank
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-0 ${
                  selectedButton === "PLAY"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Play"
                  onClick={() => handleButtonClick("PLAY")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={playIcon}
                    alt="Play Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "PLAY" ? "text-black" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "PLAY"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    Play
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-0 ${
                  selectedButton === "INVENTORY"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Inventory"
                  onClick={() => handleButtonClick("INVENTORY")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={inventoryIcon}
                    alt="Inventory Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "INVENTORY"
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "INVENTORY"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    Inventory
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-0 ${
                  selectedButton === "PROFILE"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Profile"
                  onClick={() => handleButtonClick("PROFILE")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={profileIcon}
                    alt="Profile Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "PROFILE"
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "PROFILE"
                        ? "text-blue-400"
                        : "text-gray-400"
                    }`}
                  >
                    Profile
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
}

export default Header;
