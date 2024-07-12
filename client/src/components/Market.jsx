import React, { useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { useWallets } from "@privy-io/react-auth";
import CardType from "./CardType";

function Market() {
  const navigate = useNavigate();

  const handleShopClick = (page) => {
    navigate(`${page}`);
  };

  return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div class="container mx-auto px-8 lg:px-0">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="w-full mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border-2 border-black"
            onClick={() => handleShopClick("/Market/Presale")}
          >
            <img
              src="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailone.jpg"
              alt="Presale"
              className="w-full h-56 object-cover"
            />

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">Presale</p>
              </div>
              <button
                className="bg-white text-black font-bold font-helvetica-neue border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
                onClick={() => handleShopClick("/Market/Presale")}
              >
                Trade
              </button>
            </div>
          </div>
          <div
            className="w-full mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border-2 border-black"
            onClick={() => handleShopClick("/Market/Pokemon")}
          >
            <img
              src="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailone.jpg"
              alt="Pokemon"
              className="w-full h-56 object-cover"
            />

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">Pokemon</p>
              </div>
              <button
                className="bg-white text-black font-bold font-helvetica-neue border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
                onClick={() => handleShopClick("/Market/Pokemon")}
              >
                Trade
              </button>
            </div>
          </div>
          <div
            className="w-full mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border-2 border-black"
            onClick={() => handleShopClick("/Market/Basketball")}
          >
            <img
              src="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailtwo.jpg"
              alt="Basketball"
              className="w-full h-56 object-cover"
            />

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">Basketball</p>
              </div>
              <button
                className="bg-white text-black font-bold font-helvetica-neue border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
                onClick={() => handleShopClick("/Market/Basketball")}
              >
                Trade
              </button>
            </div>
          </div>
          <div
            className="w-full mt-4 cursor-pointer bg-white rounded-3xl overflow-hidden hover:bg-gray-100 transition duration-300 ease-in-out border-2 border-black"
            onClick={() => handleShopClick("/Market/Baseball")}
          >
            <img
              src="https://cardsimage.s3.amazonaws.com/CardClassificationImage/detailthree.jpg"
              alt="Baseball"
              className="w-full h-56 object-cover"
            />

            <div className="p-4 flex justify-between items-end items-center font-helvetica-neue">
              <div>
                <p className="text-lg font-bold">Baseball</p>
              </div>
              <button
                className="bg-white text-black font-bold font-helvetica-neue border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
                onClick={() => handleShopClick("/Market/Baseball")}
              >
                Trade
              </button>
            </div>
          </div>
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
