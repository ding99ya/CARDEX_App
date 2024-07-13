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
  const [shortAddress, setShortAddress] = useState("");
  const [depositHover, setDepositHover] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);

  useEffect(() => {
    if (ready && authenticated) {
      setEmbeddedWalletAddress(user.wallet.address);
      setShortAddress(
        !!user.wallet.address
          ? `${user.wallet.address.slice(0, 10)}...${user.wallet.address.slice(
              -8
            )}`
          : "0x0"
      );
    }
  }, [ready, authenticated, user]);

  const handleDepositCopy = () => {
    navigator.clipboard.writeText(embeddedWalletAddress).then(() => {
      setDepositCopied(true);
      setTimeout(() => setDepositCopied(false), 2000);
    });
  };

  const handleContinue = () => {
    navigate("/market");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 rounded-10xl">
      <div className="bg-white p-2 mx-5 rounded-lg shadow-xl text-center">
        <div className="px-2 py-4">
          <p className="font-helvetica-neue font-semibold text-lg mt-4 mb-4">
            We suggest deposit some ETH to start trading collectible shares
          </p>
          <p className="text-left mt-2 mb-4">
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
          <div className="flex">
            <span className="text-sm">{shortAddress}</span>
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
          className="w-1/3 bg-white text-black font-bold font-helvetica-neue border border-black px-2 py-2 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
          type="button"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default UserDeposit;
