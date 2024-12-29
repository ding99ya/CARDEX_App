import React from "react";
import { useState, useEffect } from "react";
import { usePrivy, useWallets, useFundWallet } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Contract, providers, BigNumber, utils } from "ethers";
import CopyIcon from "./Copy-Icon.jpg";
import CardexWebsite from "./CardexWebsite.jpg";
import OnboardBg from "./OnboardBg.png";

const UserDeposit = () => {
  const navigate = useNavigate();
  const { fundWallet } = useFundWallet();
  const { ready, authenticated, login, user } = usePrivy();
  const { address, status } = useAccount();

  const [embeddedWalletAddress, setEmbeddedWalletAddress] = useState("");
  const [shortAddress, setShortAddress] = useState("");
  const [depositHover, setDepositHover] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);

  useEffect(() => {
    if (ready && authenticated && address) {
      setEmbeddedWalletAddress(address);
      setShortAddress(
        !!address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "0x0"
      );
    }
  }, [ready, authenticated, user, address]);

  const handleDepositCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setDepositCopied(true);
      setTimeout(() => setDepositCopied(false), 2000);
    });
  };

  const handleContinue = () => {
    navigate("/market");
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      style={{
        backgroundImage: `url(${OnboardBg})`,
        backgroundSize: "cover", // Make sure the background covers the entire div
        backgroundPosition: "center", // Center the background image
      }}
    >
      <div className="w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white p-4 rounded-3xl shadow-xl text-center">
        <div className="flex justify-center items-center mb-8">
          <img src={CardexWebsite} alt="Cardex" className="h-14 w-auto" />
        </div>
        <p className="mb-4 font-semibold text-gray-400 text-base">
          Deposit some ETH to start trading collectible shares
        </p>
        {/* <div className="flex">
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
          </div> */}
        <div className="flex flex-col items-start space-y-2 mt-4">
          <p className="text-gray-400">Transfer ETH on Base network to </p>
          <div className="flex items-center">
            <p className="text-xs lg:text-sm text-gray-400">{address}</p>
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
          {/* <div className="w-full flex justify-center mt-2">
            <button
              className="px-4 py-2 bg-white border border-black text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white"
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
          </div> */}
        </div>
        <div className="flex flex-col items-center space-y-2 mt-4 w-full max-w-xs mx-auto">
          <button
            className="w-full px-4 py-2 font-semibold rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
            onClick={() => fundWallet(address.toString())}
          >
            <span className="font-semibold">Transfer</span>
          </button>
          <div className="w-full flex justify-center mt-2">
            <button
              className="w-full px-4 py-2 font-semibold rounded-full flex items-center justify-center bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
              onClick={() =>
                window.open(
                  "https://bridge.base.org/deposit",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <span className="font-semibold">Bridge</span>
            </button>
          </div>
          <div className="w-full flex justify-center mt-2">
            <button
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-full flex items-center justify-center bg-white text-black hover:bg-gray-100 hover:text-black"
              onClick={handleContinue}
            >
              <span className="">Continue</span>
            </button>
          </div>
        </div>
      </div>
      {/* <button
        onClick={handleContinue}
        className="w-1/3 bg-white text-black font-bold font-helvetica-neue border border-black px-2 py-2 mb-4 rounded-full hover:bg-black hover:text-white transition duration-300 ease-in-out"
        type="button"
      >
        Continue
      </button> */}
    </div>
  );
};

export default UserDeposit;
