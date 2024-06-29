import React from "react";
import { Link } from "react-router-dom";
import "../index.css";

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow w-full">
      <div className="max-w-full w-full py-6 px-0 sm:px-0 lg:px-8 flex items-center justify-between">
        <h1 className="text-6xl font-bold text-gray-900">
          <Link to="/" className="text-gray-900 hover:text-gray-700">
            CARDEX
          </Link>
        </h1>

        <nav>
          <ul className="flex items-center space-x-10 ml-auto mr-10">
            <li>
              <Link
                to="/Market"
                className="px-10 py-4 bg-blue-600 text-white rounded-full text-2xl leading-loose transition-colors hover:bg-blue-700"
              >
                MARKET
              </Link>
            </li>
            <li>
              <Link
                to="/Leaderboard"
                className="px-10 py-4 bg-blue-600 text-white rounded-full text-2xl leading-loose transition-colors hover:bg-blue-700"
              >
                LEADERBOARD
              </Link>
            </li>
            <li>
              <Link
                to="/Profile"
                className="px-10 py-4 bg-blue-600 text-white rounded-full text-2xl leading-loose transition-colors hover:bg-blue-700"
              >
                PROFILE
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
