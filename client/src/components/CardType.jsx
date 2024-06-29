import React from "react";

function CardType({ title, handleShopClick, bgImage }) {
  const bgImageStyle = {
    backgroundImage: `url('${bgImage}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    width: "100%",
    height: "30vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={bgImageStyle} onClick={handleShopClick}>
      <div
        className="p-6 bg-white shadow-lg rounded-lg opacity-80"
        style={{ marginTop: "5%" }}
      >
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      </div>
      <button
        style={{ marginTop: "auto", marginBottom: "3%" }}
        className="px-10 py-4 bg-blue-600 text-white rounded-full text-lg leading-loose hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Shop
      </button>
    </div>
  );
}

export default CardType;
