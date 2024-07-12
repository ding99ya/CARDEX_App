import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber, utils } from "ethers";
import classNames from "classnames";

const WithdrawModal = ({ open, onClose, transfer, userBalance }) => {
  const [destinationAddress, setDestinationAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [isValidAddress, setIsValidAddress] = useState(false);

  const transferUiConfig = {
    header: "Transfer",
    description:
      "Transfer " +
      transferAmount.toString() +
      " to " +
      destinationAddress.toString(),
    buttonText: "Transfer",
  };

  const handleDestinationAddressChange = (e) => {
    const address = e.target.value;
    setDestinationAddress(address);
    setIsValidAddress(utils.isAddress(address));
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-md bg-white shadow-xl rounded-3xl"
      >
        <div className="w-full">
          <div className="flex flex-col justify-center text-center mt-4 p-4 px-8">
            <div className="text-left text-xl font-bold mb-2">WITHDRAW</div>
            <div className="flex justify-between items-center mt-8 mb-2">
              <span className="text-base mt-2">Address</span>
              <span className="w-4/5">
                <input
                  className="text-base border border-black bg-gray-100 w-full py-1 appearance-none rounded-xl text-left pl-4 mt-2"
                  type="string"
                  value={destinationAddress}
                  onChange={handleDestinationAddressChange}
                  placeholder="Enter Address"
                />
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base mt-2">Amount</span>
              <span className="w-4/5">
                <input
                  className="text-base border border-black bg-gray-100 w-full py-1 appearance-none rounded-xl text-left pl-4 mt-2"
                  type="number"
                  value={transferAmount === 0 ? "" : transferAmount}
                  min={0}
                  max={userBalance}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTransferAmount(value === "" ? 0 : value);
                  }}
                  placeholder="Enter Amount"
                />
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 mb-2">
              Current Balance: {userBalance} ETH
            </div>
          </div>
          <div className="flex justify-between space-x-2 p-4 px-8 items-stretch mb-2">
            <button
              className={classNames(
                "w-2/3 py-4 font-semibold rounded-full flex items-center justify-center",
                {
                  "border border-black bg-white text-black hover:bg-black hover:text-white":
                    !(
                      !isValidAddress ||
                      transferAmount === "" ||
                      transferAmount > userBalance
                    ),
                  "border border-black bg-gray-200 text-black":
                    !isValidAddress ||
                    transferAmount === "" ||
                    transferAmount > userBalance,
                }
              )}
              disabled={
                !isValidAddress ||
                transferAmount === "" ||
                transferAmount > userBalance
              }
              onClick={() =>
                transfer(
                  destinationAddress.toString(),
                  utils.parseEther(transferAmount.toString()),
                  transferUiConfig
                )
              }
            >
              <span className="font-semibold">TRANSFER</span>
            </button>
            <button
              className="w-1/3 py-4 bg-white border border-black text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white"
              onClick={onClose}
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

export default WithdrawModal;
