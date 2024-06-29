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
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex w-full max-w-md bg-white shadow-xl rounded-lg"
      >
        <div className="w-full">
          <div className="flex flex-col justify-start text-center mt-4 p-4 px-8">
            <div className="text-left mb-2">DEPOSIT</div>
            <p className="text-left mt-8 mb-4">
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
            <div className="flex items-left space-x-2">
              <span>{embeddedWalletAddress}</span>
              <span
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
              </span>
            </div>
          </div>
          <div className="flex p-4">
            <button className="bg-white text-purple-800" onClick={onClose}>
              <span className="font-semibold">CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
