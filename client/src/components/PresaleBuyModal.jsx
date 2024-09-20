import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber } from "ethers";
import classNames from "classnames";

const PresaleBuyModal = ({
  open,
  onClose,
  buy,
  fetchCost,
  cardName,
  cardPhoto,
  currentShare,
}) => {
  const [number, setNumber] = useState(1);
  const [cost, setCost] = useState(0);
  const [costInETH, setCostInETH] = useState(0);
  const [hasShare, setHasShare] = useState(false);

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
      const costValueToBigNumber = BigNumber.from(costValue.toString());
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white shadow-xl rounded-3xl"
      >
        <div className="flex flex-col justify-center text-center mt-4 p-4 px-8">
          <div className="text-left text-xl font-bold mb-2">{cardName}</div>

          <div className="flex justify-between items-center mt-6 mb-4">
            <span className="text-base">Buy Amount</span>
            <span className="text-base font-semibold w-1/5 inline-flex items-center">
              <input
                className="text-base border-2 border-gray-300 bg-gray-100 w-full py-1 appearance-none rounded-xl text-center font-semibold"
                type="number"
                value={number}
                min={1}
                max={2}
                onChange={(e) => {
                  setNumber(parseInt(e.target.value));
                }}
              />
              <span className="ml-2">/&nbsp;2</span>
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-base">Total Cost </span>
            <span className="text-base font-semibold">
              {costInETH.toFixed(3)} ETH
            </span>
          </div>
          <div className="flex justify-between space-x-2 py-2 items-stretch mb-2">
            <button
              className={classNames(
                "w-2/3 py-2 font-semibold rounded-full flex items-center justify-center",
                {
                  "bg-blue-400 text-white hover:bg-blue-500 hover:text-white":
                    !(
                      isNaN(number) ||
                      number === 0 ||
                      number > 2 - currentShare
                    ),
                  "bg-blue-200 text-gray-200":
                    isNaN(number) || number === 0 || number > 2 - currentShare,
                }
              )}
              // disabled={hasShare}
              disabled={isNaN(number) || number > 2 - currentShare}
              onClick={async () => {
                const buyCost = await calculateCost();
                buy(number, buyCost, buyUiConfig);
              }}
            >
              <span className="font-semibold">Buy</span>
            </button>
            <button
              className="w-1/3 py-2 bg-white box-border border border-gray-300 text-black rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-black"
              onClick={completeClose}
            >
              <span className="font-semibold">Cancel</span>
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

export default PresaleBuyModal;
