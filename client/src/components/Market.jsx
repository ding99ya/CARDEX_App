import React, { useState, useEffect } from "react";
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

function Market() {
  const navigate = useNavigate();

  const { navigateTo } = useNavigation();

  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleShopClick = (page) => {
    navigate(`${page}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const checkSubscriptionStatus = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        console.log(!!subscription);
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscriptionStatus();
  }, []);

  return (
    <div className="bg-white flex items-center justify-center">
      <div class="container mx-auto px-2 lg:px-0">
        <div
          className={`bg-white text-blue-300 flex justify-between border border-blue-300 items-center rounded-xl p-2 mt-2 ${
            isSubscribed ? "hidden" : "block"
          }`}
        >
          <span className="text-sm text-blue-300 font-semibold">
            Enable Notifications to Stay Tuned
          </span>

          <button
            onClick={() => setIsSubscribed(true)}
            className="bg-blue-300 text-white text-sm font-semibold hover:bg-blue-400 hover:text-white transition duration-300 py-1 px-4 rounded-lg"
          >
            X
          </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border border-gray-300"
            onClick={() => navigateTo("/Market/Presale")}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              <img
                src={CardexPresaleExtension}
                alt="Presale"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">PRESALE</p>
              </div>
              <button
                className="bg-blue-400 text-white font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
                // onClick={() => handleShopClick("/Market/Presale")}
                onClick={() => navigateTo("/Market/Presale")}
              >
                COLLECT
              </button>
            </div>
          </div> */}
          <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out"
            onClick={() => navigateTo("/Market/Presale")}
            style={{
              backgroundImage: `url(${CardexPresaleExtension})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              {/* Image div removed since the background image is now on the parent div */}
            </div>

            <div className="p-4 flex justify-center w-full">
              {/* Text div removed */}
              <button
                className="text-2xl text-white font-bold font-helvetica-neue px-4 py-1 rounded-full w-full max-w-xs text-center hover:bg-white hover:text-black transition duration-300 ease-in-out"
                onClick={() => navigateTo("/Market/Presale")}
              >
                PRESALE
              </button>
            </div>
          </div>
          {/* <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out"
            // onClick={() => handleShopClick("/Market/Pokemon")}
            onClick={() => navigateTo("/Market/Pokemon")}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              <img
                src={CardexPokemon3}
                alt="Pokemon"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">POKEMON</p>
              </div>
              <button
                className="bg-blue-400 text-white font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
                // onClick={() => handleShopClick("/Market/Pokemon")}
                onClick={() => navigateTo("/Market/Pokemon")}
              >
                COLLECT
              </button>
            </div>
          </div> */}
          <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out"
            onClick={() => navigateTo("/Market/Pokemon")}
            style={{
              backgroundImage: `url(${CardexPokemonExtension})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              {/* Image div removed since the background image is now on the parent div */}
            </div>

            <div className="p-4 flex justify-center w-full">
              {/* Text div removed */}
              <button
                className="text-2xl text-white font-bold font-helvetica-neue px-4 py-1 rounded-full w-full max-w-xs text-center hover:bg-white hover:text-black transition duration-300 ease-in-out"
                onClick={() => navigateTo("/Market/Pokemon")}
              >
                POKEMON
              </button>
            </div>
          </div>
          {/* <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border border-gray-300"
            // onClick={() => handleShopClick("/Market/Basketball")}
            onClick={() => navigateTo("/Market/Basketball")}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              <img
                src={CardexSports2}
                alt="Basketball"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">BASKETBALL</p>
              </div>
              <button
                className="bg-blue-400 text-white font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
                // onClick={() => handleShopClick("/Market/Basketball")}
                onClick={() => navigateTo("/Market/Basketball")}
              >
                COLLECT
              </button>
            </div>
          </div> */}
          <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out"
            onClick={() => navigateTo("/Market/Sports")}
            style={{
              backgroundImage: `url(${CardexSportsExtension})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              {/* Image div removed since the background image is now on the parent div */}
            </div>

            <div className="p-4 flex justify-center items-center w-full">
              {/* Text div removed */}
              <button
                className="text-2xl text-white font-bold font-helvetica-neue px-4 py-1 rounded-full w-full max-w-xs text-center hover:bg-white hover:text-black transition duration-300 ease-in-out"
                onClick={() => navigateTo("/Market/Sports")}
              >
                SPORTS
              </button>
            </div>
          </div>
          {/* <div
            className="w-full mt-2 lg:mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border border-gray-300"
            // onClick={() => handleShopClick("/Market/Baseball")}
            onClick={() => navigateTo("/Market/Baseball")}
          >
            <div className="relative w-full pb-[50.0%] lg:pb-[50.0%]">
              <img
                src={CardexSports2}
                alt="Baseball"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">BASEBALL</p>
              </div>
              <button
                className="bg-blue-400 text-white font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
                // onClick={() => handleShopClick("/Market/Baseball")}
                onClick={() => navigateTo("/Market/Baseball")}
              >
                COLLECT
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="w-full flex flex-col items-center space-y-10">
        <CardType
          title="PRESALE"
          handleShopClick={handleShopClick("/Market/Presale")}
          bgImage="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailone.jpg"
        />
        <CardType
          title="POKEMON CARDS"
          handleShopClick={handleShopClick("/Market/Pokemon")}
          bgImage="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailone.jpg"
        />
        <CardType
          title="BASKETBALL CARDS"
          handleShopClick={handleShopClick("/Market/Basketball")}
          bgImage="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailtwo.jpg"
        />
        <CardType
          title="BASEBALL CARDS"
          handleShopClick={handleShopClick("/Market/Baseball")}
          bgImage="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailthree.jpg"
        />
      </div> */
}

export default Market;
