import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber, utils } from "ethers";
import CopyIcon from "./Copy-Icon.jpg";

const DepositModal = ({ open, onClose, embeddedWalletAddress, fundWallet }) => {
  const [depositHover, setDepositHover] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);

  const handleDepositCopy = () => {
    navigator.clipboard.writeText(embeddedWalletAddress).then(() => {
      setDepositCopied(true);
      setTimeout(() => setDepositCopied(false), 2000);
    });
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
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white shadow-xl rounded-3xl"
      >
        <div className="w-full">
          <div className="flex flex-col justify-center text-center mt-2 px-4 lg:px-8 py-4">
            <div className="text-left text-xl font-bold mb-2">DEPOSIT</div>

            <div className="flex flex-col items-start space-y-2 mt-2">
              <p className="text-xs lg:text-sm">
                Transfer ETH on Base network to{" "}
              </p>
              <div className="flex items-center">
                <p className="text-xs lg:text-sm">{embeddedWalletAddress}</p>
                <span
                  className="relative cursor-pointer"
                  onMouseEnter={() => setDepositHover(true)}
                  onMouseLeave={() => setDepositHover(false)}
                  onClick={handleDepositCopy}
                >
                  <img src={CopyIcon} alt="Copy" className="w-5 h-5" />
                  {depositHover && !depositCopied && (
                    <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded hidden sm:block">
                      Copy
                    </span>
                  )}
                  {depositCopied && (
                    <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded">
                      Copied
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 mt-4 w-full max-w-xs mx-auto">
              <button
                className="w-full px-4 py-1 font-semibold rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                onClick={() => fundWallet(embeddedWalletAddress.toString())}
              >
                <span className="text-sm font-semibold">Transfer</span>
              </button>

              <div className="w-full flex justify-center mt-2">
                <button
                  className="w-full px-4 py-1 font-semibold rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                  onClick={() =>
                    window.open(
                      "https://bridge.base.org/deposit",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                >
                  <span className="text-sm font-semibold">Bridge</span>
                </button>
              </div>
              <div className="w-full flex justify-center mt-2">
                <button
                  className="w-full px-[calc(1rem-2px)] py-[calc(0.25rem-2px)] mb-4 border border-gray-300 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-100 hover:text-black"
                  onClick={onClose}
                >
                  <span className="text-sm">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
