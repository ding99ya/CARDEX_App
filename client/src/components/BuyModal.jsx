import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber } from "ethers";
import classNames from "classnames";

const BuyModal = ({ open, onClose, buy, fetchCost, cardName, cardPhoto }) => {
  const [number, setNumber] = useState(1);
  const [cost, setCost] = useState(0);
  const [costInETH, setCostInETH] = useState(0);

  const buyUiConfig = {
    header: cardName,
    description: "Buy " + number.toString() + " shares",
    buttonText: "Buy",
    transactionInfo: {
      contractInfo: {
        imgUrl: cardPhoto,
      },
    },
  };

  const calculateCost = async () => {
    const costValue = await fetchCost(Number(number));
    if (costValue === undefined) {
      setCost(0);
      setCostInETH(0);

      return 0;
    } else {
      const costValueToBigNumber = BigNumber.from(costValue);
      const oneEther = BigNumber.from("1000000000000000000");
      const costInETH =
        Number(costValueToBigNumber.mul(1000).div(oneEther)) / 1000;
      setCost(costValue);
      setCostInETH(costInETH);

      return costValue.toString();
    }
  };

  const completeClose = () => {
    setNumber(1);
    onClose();
  };

  useEffect(() => {
    if (isNaN(number)) {
      setCost(0);
      setCostInETH(0);
    } else {
      try {
        calculateCost();
      } catch (error) {
        console.log(error);
      }
    }
  }, [number]);

  if (!open) return null;

  return (
    <div
      onClick={completeClose}
      className="fixed inset-0 bg-black bg-opacity-50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-md bg-white shadow-xl rounded-lg"
      >
        <div className="w-full">
          <div className="flex flex-col justify-center text-center mt-12 p-4 px-8">
            <div className="text-left mb-2">Buy {cardName}</div>
            <div className="flex justify-between items-center mt-12 mb-2">
              <span>Buy Amount</span>
              <span className="w-1/5">
                <input
                  className="border border-black w-full appearance-none"
                  type="number"
                  value={number}
                  min={1}
                  onChange={(e) => {
                    setNumber(parseInt(e.target.value));
                  }}
                />
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Cost: </span>
              <span>{costInETH} ETH</span>
            </div>
          </div>
          <div className="flex p-4">
            <button
              // className="w-full my-2 py-4 border border-purple-800 bg-purple-800 text-white"
              className={classNames("w-full my-2 py-4 border font-semibold", {
                "border-purple-800 bg-purple-800 text-white": !(
                  isNaN(number) || number === 0
                ),
                "border-gray-400 bg-gray-400 text-gray-700":
                  isNaN(number) || number === 0,
              })}
              disabled={isNaN(number) || number === 0}
              onClick={async () => {
                const buyCost = await calculateCost();
                buy(number, buyCost, buyUiConfig);
              }}
            >
              <span className="font-semibold">BUY</span>
            </button>
            <button
              className="bg-white text-purple-800"
              onClick={completeClose}
            >
              <span className="font-semibold">CANCEL</span>
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        /* Chrome, Safari, Edge, Opera */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        /* Firefox */
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default BuyModal;
