import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import marketIcon from "./Market.svg";
import leaderboardIcon from "./Leaderboard.svg";
import profileIcon from "./Profile.svg";
import inventoryIcon from "./Inventory.svg";
import CardexWebsite from "./CardexWebsite.jpg";
import Cardex from "./Cardex.jpg";
import "../index.css";

function Header() {
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
          <h1 className="text-6xl font-bold text-gray-900">
            <Link
              to="/"
              className="ml-8 text-gray-900 hover:text-gray-700"
              onClick={() => handleButtonClick("MARKET")}
            >
              CARDEX
            </Link>
          </h1>

          <nav>
            <ul className="flex items-center space-x-10 ml-auto mr-10">
              <li>
                <Link
                  to="/Market"
                  onClick={() => handleButtonClick("MARKET")}
                  className={`text-black font-bold rounded-full px-8 py-3 border-2 border-black font-helvetica-neue ${
                    selectedButton === "MARKET"
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-200"
                  }`}
                >
                  MARKET
                </Link>
              </li>
              <li>
                <Link
                  to="/Leaderboard"
                  onClick={() => handleButtonClick("LEADERBOARD")}
                  className={`text-black font-bold rounded-full px-8 py-3 border-2 border-black font-helvetica-neue ${
                    selectedButton === "LEADERBOARD"
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-200"
                  }`}
                >
                  LEADERBOARD
                </Link>
              </li>
              <li>
                <Link
                  to="/Profile"
                  onClick={() => handleButtonClick("PROFILE")}
                  className={`text-black font-bold rounded-full px-8 py-3 border-2 border-black font-helvetica-neue ${
                    selectedButton === "PROFILE"
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-200"
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
              <Link to="/" className="flex items-center h-full">
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
            <button className="text-xl font-bold px-4 py-1 rounded-full border-2 border-black shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
              {headerText}
            </button>
          </div>
        </header>
      )}
      <footer className="fixed bottom-0 left-0 right-0 bg-white w-full lg:hidden z-50">
        <div className="max-w-full w-full">
          <nav>
            <ul className="flex justify-between w-full border-t border-t-black">
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-4 ${
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
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  >
                    MARKET
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-4 ${
                  selectedButton === "LEADERBOARD"
                    ? "border-blue-400"
                    : "border-transparent"
                }`}
              >
                <Link
                  to="/Leaderboard"
                  onClick={() => handleButtonClick("LEADERBOARD")}
                  className="flex flex-col items-center w-full h-full text-black font-bold"
                >
                  <img
                    src={leaderboardIcon}
                    alt="Leaderboard Icon"
                    className={`w-6 h-6 mb-2 ${
                      selectedButton === "LEADERBOARD"
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`font-helvetica text-xs ${
                      selectedButton === "LEADERBOARD"
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  >
                    LEADERBOARD
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-4 ${
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
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  >
                    INVENTORY
                  </span>
                </Link>
              </li>
              <li
                className={`flex-1 flex flex-col items-center px-2 py-2 border-b-4 ${
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
                        ? "text-black"
                        : "text-gray-400"
                    }`}
                  >
                    PROFILE
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
