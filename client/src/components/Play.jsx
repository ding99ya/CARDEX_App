import React, { useState, useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { useWallets } from "@privy-io/react-auth";
import { useNavigation } from "./NavigationContext";
import flagIcon from "./Flag.svg";

function Play() {
  const navigate = useNavigate();

  const { navigateTo } = useNavigation();

  const [timeRemaining, setTimeRemaining] = useState("0d 00h 00m");

  const [inTournament, setInTournament] = useState(false);

  const checkInTournament = () => {
    const now = new Date();

    // Convert current time to US CST (Central Standard Time)
    const cstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );

    const currentDay = cstTime.getDay(); // 0 is Sunday, 6 is Saturday
    const currentHour = cstTime.getHours(); // Get the hour in CST

    // Need to adjust the day and hours in production
    // Check if today is Sunday
    if (
      (currentDay === 1 && currentHour >= 9) ||
      currentDay === 2 ||
      currentDay === 3 ||
      (currentDay === 4 && currentHour <= 9)
    ) {
      setInTournament(true);
    } else {
      setInTournament(false);
    }
  };

  const getCSTTime = () => {
    const now = new Date();
    return new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );
  };

  // Helper function to get the next occurrence of a specific day and time
  const getNextOccurrence = (dayOfWeek, hour) => {
    const now = getCSTTime();
    const result = new Date(now);

    // Calculate how many days to add to get to the next occurrence
    const daysToAdd = (dayOfWeek + 7 - now.getDay()) % 7;
    result.setDate(now.getDate() + daysToAdd);
    result.setHours(hour, 0, 0, 0); // Set hour, minutes, seconds, and milliseconds to 0

    // If the time is already in the past today, move to the next week's occurrence
    if (result <= now) {
      result.setDate(result.getDate() + 7);
    }
    return result;
  };

  // Calculate if the tournament is ongoing and return the remaining time string
  const calculateTime = () => {
    const now = new Date();

    const cstTime = new Date(
      now.toLocaleString("en-US", { timeZone: "America/Chicago" })
    );

    const currentDay = cstTime.getDay();
    const currentHour = cstTime.getHours();

    const tournamentStart = getNextOccurrence(1, 9); // Monday 9 AM
    const tournamentEnd = getNextOccurrence(4, 9); // Thursday 9 AM

    let target;
    let message;

    if (
      (currentDay === 1 && currentHour >= 9) ||
      currentDay === 2 ||
      currentDay === 3 ||
      (currentDay === 4 && currentHour <= 9)
    ) {
      // Tournament is ongoing
      target = tournamentEnd;
      message = "finishing in";
    } else {
      // Tournament hasn't started yet
      target = tournamentStart;
      message = "starting in";
    }

    const timeDiff = target - now; // Time difference in milliseconds

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${message} ${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    checkInTournament();
    setTimeRemaining(calculateTime());
  }, []);

  // Update the countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white flex items-center justify-center">
      <div class="container mx-auto px-2 lg:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-xl border-2 border-blue-300 overflow-hidden transition duration-300 ease-in-out"
            onClick={() => navigateTo("/Play/Tournaments/1")}
            // style={{
            //   backgroundImage: `url(${CardexPokemonExtension})`,
            //   backgroundSize: "cover",
            //   backgroundPosition: "center",
            // }}
          >
            {/* Header */}
            <div className="flex justify-center items-center space-x-3 mb-4">
              <h3 className="text-4xl font-bold text-blue-400 mt-8 mb-2">
                Tournament #1
              </h3>
              <img
                src={flagIcon}
                alt="Flag Icon"
                className="mt-8 mb-2 w-8 h-8"
              />
            </div>

            {/* Badges */}
            <div className="flex justify-center space-x-4 mb-4">
              <span className="bg-amber-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
                1 Legend Max
              </span>
              <span className="bg-purple-300 text-white text-xs font-semibold px-2 py-1 rounded-full">
                1 Epic Max
              </span>
            </div>

            {/* Timer */}
            <div className="px-4 flex justify-center w-full">
              <p className="text-blue-400 justify-center font-semibold mb-4">
                {timeRemaining}
              </p>
            </div>

            {/* Rewards */}
            {/* <div className="flex items-center justify-evenly bg-white/70 rounded-lg p-3 mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-blue-800">70000</span>
                <img
                  src="path-to-b-icon.png"
                  alt="B Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="w-px h-6 bg-gray-300"></div>

              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-blue-800">10</span>
                <img
                  src="path-to-eth-icon.png"
                  alt="ETH Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="w-px h-6 bg-gray-300"></div>

              <img
                src="path-to-card-icon.png"
                alt="Card Icon"
                className="w-6 h-6"
              />

              <div className="w-px h-6 bg-gray-300"></div>

              <img src="path-to-f-icon.png" alt="F Icon" className="w-6 h-6" />

              <div className="w-px h-6 bg-gray-300"></div>

              <img
                src="path-to-halo-icon.png"
                alt="Halo Icon"
                className="w-6 h-6"
              />
            </div> */}

            {/* View Leaderboard Button */}
            <div className="px-4 flex justify-center w-full">
              <button className="bg-blue-400 justify-center text-white font-bold py-2 px-6 rounded-full transition duration-300 hover:bg-blue-500 mb-10">
                {inTournament ? "View Tournament" : "Submit Deck"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Play;
