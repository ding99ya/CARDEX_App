import React from "react";
import { useState, useEffect } from "react";
import { Contract, providers, BigNumber, utils } from "ethers";
import CopyIcon from "./Copy-Icon.jpg";

const DepositModal = ({ open, onClose, embeddedWalletAddress }) => {
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
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white shadow-xl rounded-3xl mx-4"
      >
        <div className="w-full">
          <div className="flex flex-col justify-start text-center mt-4 p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="text-left text-xl font-bold mb-2">DEPOSIT</div>

            <div className="flex flex-col items-start space-y-2 mt-4">
              <p>Transfer ETH on Base network to </p>
              <p>{embeddedWalletAddress}</p>
              <p className="text-left text-base mb-4">
                You can bridge ETH to Base on&nbsp;
                <a
                  href="https://bridge.base.org/deposit"
                  className="text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  official bridge here.
                </a>
              </p>
            </div>
          </div>
          <div className="flex p-4 sm:p-6 md:p-8 lg:p-10">
            <button
              className="w-1/3 py-4 bg-white border border-black text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition duration-300 ease-in-out"
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
