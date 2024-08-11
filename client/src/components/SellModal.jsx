import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber } from "ethers";
import classNames from "classnames";

const SellModal = ({
  open,
  shareHolders,
  userShares,
  onClose,
  sell,
  fetchProfit,
  cardName,
  cardPhoto,
}) => {
  const [number, setNumber] = useState(0);
  const [profit, setProfit] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const sellUiConfig = {
    header: cardName,
    description: "Sell " + number.toString() + " shares",
    buttonText: "Sell",
    transactionInfo: {
      contractInfo: {
        imgUrl: cardPhoto,
      },
    },
  };

  const calculateProfit = async () => {
    const profitValue = await fetchProfit(Number(number));
    const profitValueToBigNumber = BigNumber.from(profitValue);
    const oneEther = BigNumber.from("1000000000000000000");
    const profitInETH =
      Number(profitValueToBigNumber.mul(1000).div(oneEther)) / 1000;
    setProfit(profitInETH);
  };

  useEffect(() => {
    if (initialized) {
      if (shareHolders > 0) {
        if (number <= shareHolders && number <= userShares && !isNaN(number)) {
          calculateProfit();
        } else {
          setProfit(0);
        }
      }
    } else {
      setInitialized(true);
    }
  }, [number]);

  const completeClose = () => {
    setNumber(0);
    onClose();
  };

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
        <div className="w-full">
          <div className="flex flex-col justify-center text-center mt-4 p-4 px-8">
            <div className="text-left text-xl font-bold mb-2">{cardName}</div>
            <div className="flex justify-between items-center mt-6 mb-4">
              <span className="text-base">Sell Amount</span>
              <span className="w-1/5">
                <input
                  className="text-base border-2 border-gray-300 bg-gray-100 w-full py-1 appearance-none rounded-xl text-center font-semibold"
                  type="number"
                  value={number}
                  min={0}
                  max={userShares > shareHolders ? shareHolders : userShares}
                  onChange={(e) => {
                    setNumber(parseInt(e.target.value));
                  }}
                />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base">Total Profit: </span>
              <span className="text-base font-semibold">
                {profit.toFixed(3)} ETH
              </span>
            </div>
          </div>
          <div className="flex justify-between space-x-2 px-8 py-2 items-stretch mb-4">
            <button
              className={classNames(
                "w-2/3 py-2 font-semibold rounded-full flex items-center justify-center",
                {
                  "bg-blue-400 text-white hover:bg-blue-500 hover:text-white":
                    !(
                      isNaN(number) ||
                      !(number <= shareHolders && number <= userShares) ||
                      number === 0
                    ),
                  "bg-blue-200 text-white":
                    isNaN(number) ||
                    !(number <= shareHolders && number <= userShares) ||
                    number === 0,
                }
              )}
              disabled={
                isNaN(number) ||
                !(number <= shareHolders && number <= userShares) ||
                number === 0
              }
              onClick={() => sell(number, sellUiConfig)}
            >
              <span className="font-semibold">Sell</span>
            </button>
            <button
              className="w-1/3 py-2 bg-white box-border border-2 border-black text-black rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-black"
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

export default SellModal;
