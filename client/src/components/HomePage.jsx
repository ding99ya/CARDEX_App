import React, { useEffect } from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { useWallets } from "@privy-io/react-auth";
import CardType from "./CardType";

function HomePage() {
  const navigate = useNavigate();

  const handleShopClick = (page) => () => {
    navigate(`${page}`);
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <div className="w-full m-0 p-0">
        <h1 className="text-4xl font-bold pt-10 pb-10 pl-20 text-left">
          Collection
        </h1>
      </div>
      <div className="w-full flex flex-col items-center space-y-10">
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
      </div>
    </div>
  );
}

export default HomePage;
