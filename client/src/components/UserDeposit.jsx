import React from "react";
import { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { Contract, providers, BigNumber, utils } from "ethers";
import CopyIcon from "./Copy-Icon.jpg";

const UserDeposit = () => {
  const navigate = useNavigate();
  const { ready, authenticated, login, user } = usePrivy();

  const [embeddedWalletAddress, setEmbeddedWalletAddress] = useState("");
  const [depositHover, setDepositHover] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      setEmbeddedWalletAddress(user.wallet.address);
    }
  }, [ready, authenticated, user]);

  const handleDepositCopy = () => {
    navigator.clipboard.writeText(embeddedWalletAddress).then(() => {
      setDepositCopied(true);
      setTimeout(() => setDepositCopied(false), 2000);
    });
  };

  const handleContinue = () => {
    navigate("/homepage");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-200">
      <div className="bg-white p-10 rounded-lg shadow-xl text-center">
        <div className="flex flex-col justify-start text-center mt-4 p-4 px-8">
          <div className="text-left mb-2">DEPOSIT ETH</div>
          <p className="text-left mt-8 mb-4">
            We suggest deposit some ETH to start trading collectible shares
          </p>
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
        <button
          onClick={handleContinue}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="button"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default UserDeposit;
