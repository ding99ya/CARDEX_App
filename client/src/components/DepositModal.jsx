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
        <div className="max-w-full">
          <div className="flex flex-col justify-center text-center mt-4 px-4 lg:px-8 py-4">
            <div className="text-left text-xl font-bold mb-2">DEPOSIT</div>

            <div className="flex flex-col items-start space-y-2 mt-4">
              <p>Transfer ETH on Base network to </p>
              <p className="text-xs lg:text-sm">{embeddedWalletAddress}</p>
              {/* <span
                className="relative cursor-pointer"
                onMouseEnter={() => setDepositHover(true)}
                onMouseLeave={() => setDepositHover(false)}
                onClick={handleDepositCopy}
              >
                <img src={CopyIcon} alt="Copy" className="w-5 h-5" />
                {depositHover && !depositCopied && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded">
                    Copy
                  </span>
                )}
                {depositCopied && (
                  <span className="absolute left-0 top-6 bg-gray-700 text-white text-xs p-1 rounded">
                    Copied
                  </span>
                )}
              </span> */}
              <div className="w-full flex justify-center mt-2">
                <button
                  className="py-2 font-semibold rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
                  onClick={() => fundWallet(embeddedWalletAddress.toString())}
                >
                  <span className="font-semibold">Transfer From External</span>
                </button>
              </div>
              <div className="w-full flex justify-center">
                <p>or</p>
              </div>
              <div className="w-full flex justify-center">
                <p className="text-left text-base">
                  &nbsp;
                  <a
                    href="https://bridge.base.org/deposit"
                    className="text-blue-600"
                    style={{ textDecoration: "underline" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Bridge ETH to Base
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="flex p-2 px-4">
            <button
              className="w-1/3 py-4 bg-white border border-black text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white"
              onClick={onClose}
            >
              <span className="font-semibold">CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
