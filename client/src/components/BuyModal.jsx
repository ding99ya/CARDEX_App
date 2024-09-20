import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber } from "ethers";
import classNames from "classnames";

const BuyModal = ({ open, onClose, buy, fetchCost, cardName, cardPhoto }) => {
  const [number, setNumber] = useState(1);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [cost, setCost] = useState(0);
  const [costInETH, setCostInETH] = useState(0);

  const percentageOptions = [0, 2.5, 5.0, 7.5];

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

  const updateCostWithPercentage = (baseCost, percentage) => {
    const baseCostBN = BigNumber.from(baseCost.toString());
    const percentageBN = BigNumber.from(Math.floor(percentage * 100)); // Convert percentage to basis points

    const additionalCost = baseCostBN.mul(percentageBN).div(10000); // Divide by 10000 for basis points
    const totalCost = baseCostBN.add(additionalCost);

    console.log("Base Cost:", baseCostBN.toString());
    console.log("Additional Cost:", additionalCost.toString());
    console.log("Total Cost:", totalCost.toString());

    return totalCost.toString();
  };

  const calculateCost = async () => {
    const baseCostValue = await fetchCost(Number(number));
    console.log("original base cost:", baseCostValue.toString());
    if (baseCostValue === undefined) {
      setCost(0);
      setCostInETH(0);
      return 0;
    } else {
      console.log(selectedPercentage);
      const totalCostValue = updateCostWithPercentage(
        baseCostValue.toString(),
        selectedPercentage
      );

      const totalCostValueToBigNumber = BigNumber.from(totalCostValue);
      const oneEther = BigNumber.from("1000000000000000000");
      const totalCostInETH =
        Number(totalCostValueToBigNumber.mul(1000).div(oneEther)) / 1000;
      setCost(totalCostValue);
      setCostInETH(totalCostInETH);

      return totalCostValue.toString();
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
  }, [number, selectedPercentage]);

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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white shadow-xl rounded-3xl"
      >
        <div className="max-w-full">
          <div className="flex flex-col justify-center text-center mt-2 p-4 px-8">
            <div className="text-left text-md font-bold mb-2">{cardName}</div>

            <div className="flex justify-between items-center mt-6 mb-2">
              <span className="text-sm">Buy Amount</span>
              <span className="w-1/5">
                <input
                  className="text-sm border-2 border-gray-300 bg-gray-100 w-full py-1 appearance-none rounded-xl text-center font-semibold"
                  type="number"
                  value={number}
                  min={1}
                  onChange={(e) => {
                    setNumber(parseInt(e.target.value));
                  }}
                />
              </span>
            </div>
            <div className="mb-4">
              <span className="text-sm block mb-2 text-left">Slippage</span>
              <div className="flex border-2 border-gray-300 rounded-xl overflow-hidden w-full">
                {percentageOptions.map((percentage, index) => (
                  <button
                    key={percentage}
                    className={`flex-1 py-1 text-sm font-semibold ${
                      selectedPercentage === percentage
                        ? "bg-blue-400 text-white border-black"
                        : "bg-white text-black hover:bg-gray-100"
                    } ${index !== 0 ? "border-l border-gray-300" : ""}`}
                    onClick={() => {
                      setSelectedPercentage(percentage);
                    }}
                  >
                    {percentage.toFixed(1)}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Cost </span>
              <span className="text-sm font-semibold">
                {costInETH.toFixed(3)} ETH
              </span>
            </div>
          </div>
          <div className="flex justify-between space-x-2 px-8 py-2 items-stretch mb-4">
            <button
              className={classNames(
                "w-2/3 py-2 font-semibold rounded-full flex items-center justify-center",
                {
                  "bg-blue-400 text-white hover:bg-blue-500 hover:text-white":
                    !(isNaN(number) || number === 0),
                  "bg-blue-200 text-gray-200": isNaN(number) || number === 0,
                }
              )}
              disabled={isNaN(number) || number === 0}
              onClick={async () => {
                const buyCost = await calculateCost();
                console.log(buyCost);
                buy(number, buyCost, buyUiConfig);
              }}
            >
              <span className="text-xs font-semibold">Buy</span>
            </button>
            <button
              className="w-1/3 py-2 bg-white box-border border border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-black"
              onClick={completeClose}
            >
              <span className="text-xs">Cancel</span>
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
