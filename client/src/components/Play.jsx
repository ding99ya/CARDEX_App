import React, { useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { useWallets } from "@privy-io/react-auth";
import { useNavigation } from "./NavigationContext";
import CardType from "./CardType";
import CardexPresale1 from "./CardexPresale1.png";
import CardexPresale2 from "./CardexPresale2.png";
import CardexPresale3 from "./CardexPresale3.png";
import CardexPokemon1 from "./CardexPokemon1.png";
import CardexPokemon2 from "./CardexPokemon2.png";
import CardexPokemon3 from "./CardexPokemon3.png";
import CardexSports1 from "./CardexSports1.png";
import CardexSports2 from "./CardexSports2.png";
import CardexPresaleExtension from "./CardexPresaleExtension.png";
import CardexPokemonExtension from "./CardexPokemonExtension.png";
import CardexSportsExtension from "./CardexSportsExtension.png";

function Play() {
  const navigate = useNavigate();

  const { navigateTo } = useNavigation();

  const handleShopClick = (page) => {
    navigate(`${page}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white flex items-center justify-center">
      <div class="container mx-auto px-2 lg:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out"
            // onClick={() => navigateTo("/Market/Pokemon")}
            style={{
              backgroundImage: `url(${CardexPokemonExtension})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]"></div>

            <div className="p-4 flex justify-center w-full">
              <button
                className="text-2xl text-white font-bold font-helvetica-neue px-4 py-1 rounded-full w-full max-w-xs text-center hover:bg-white hover:text-black transition duration-300 ease-in-out"
                onClick={() => navigateTo("/Market/Pokemon")}
              >
                POKEMON
              </button>
            </div> */}
            {/* Header */}
            <div className="flex justify-center items-center space-x-3 mb-4">
              <h1 className="text-4xl font-bold text-blue-900">Elite 22</h1>
              <img
                src="path-to-star-icon.png"
                alt="Star Icon"
                className="w-8 h-8"
              />
            </div>

            {/* Badges */}
            <div className="flex justify-center space-x-4 mb-4">
              <span className="bg-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                unlimited
              </span>
              <span className="bg-black text-white text-sm font-semibold px-4 py-1 rounded-full">
                unlimited 🌟
              </span>
            </div>

            {/* Timer */}
            <p className="text-blue-700 font-semibold mb-4">
              finishing in <span className="text-green-500">1d 12h 56m</span>
            </p>

            {/* Rewards */}
            <div className="flex items-center justify-evenly bg-white/70 rounded-lg p-3 mb-6">
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
            </div>

            {/* View Leaderboard Button */}
            <button className="bg-blue-900 text-white font-bold py-2 px-6 rounded-full transition duration-300 hover:bg-black mb-4">
              View Leaderboard
            </button>

            {/* Player Info */}
            <p className="text-blue-800 text-sm">
              16512 players registered (1380 in this league)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Play;
