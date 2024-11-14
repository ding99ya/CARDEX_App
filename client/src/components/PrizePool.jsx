import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useLocation, useParams } from "react-router-dom";
import { encodeFunctionData } from "viem";
import { ethers } from "ethers";
import { Contract, providers, BigNumber } from "ethers";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import abi from "../PrizePool.json";
import axios from "axios";
import sortingIcon from "./Sorting.svg";
import { useNavigation } from "./NavigationContext";
import "../index.css";

// Alchemy configuration to fetch info from blockchain and set up info
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(process.env.REACT_APP_ALCHEMY_KEY);

function PrizePool() {
  const Navigate = useNavigate();

  const { goBack, navigateTo } = useNavigation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container mx-auto p-4 flex flex-col items-center relative">
      <div className="w-full mb-2">
        <span
          onClick={goBack}
          className="cursor-pointer inline-block bg-white text-black px-4 py-2 mb-2 font-semibold whitespace-nowrap"
        >
          &lt; Back
        </span>
      </div>
      <div className="w-full mt-2 relative">
        <div className="rounded-xl bg-blue-100">
          <div className="max-w-full">
            <table
              className="min-w-full rounded-xl p-2 bg-blue-100"
              style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}
            >
              <thead className="text-blue-500 bg-white text-xs lg:text-sm font-open-sans">
                <tr>
                  <th className="py-2 px-4 text-center rounded-tl-xl rounded-bl-xl">
                    Rank
                  </th>
                  <th className="py-2 px-4 text-center">ETH</th>
                  <th className="py-2 px-4 text-center">Points</th>
                  <th className="py-2 px-4 text-center rounded-tr-xl rounded-br-xl">
                    Stars
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  className={`cursor-pointer h-10 text-xs lg:text-sm rounded-t-xl rounded-b-xl bg-white`}
                >
                  <td className="py-1 text-center rounded-tl-xl rounded-bl-xl">
                    1-5
                  </td>
                  <td className="py-1 text-center">
                    {Math.floor(
                      ((3 *
                        Number(
                          process.env.REACT_APP_CURRENT_TOURNAMENT_ETH_REWARD
                        )) /
                        100) *
                        100
                    ) / 100}
                  </td>
                  <td className="py-1 text-center">
                    Linear from 290000 to 230000
                  </td>
                  <td className="py-1 text-center rounded-tr-xl rounded-br-xl">
                    6000
                  </td>
                </tr>
                <tr
                  className={`cursor-pointer h-10 text-xs lg:text-sm rounded-t-xl rounded-b-xl bg-white`}
                >
                  <td className="py-1 text-center rounded-tl-xl rounded-bl-xl">
                    6-10
                  </td>
                  <td className="py-1 text-center">
                    {Math.floor(
                      (Number(
                        process.env.REACT_APP_CURRENT_TOURNAMENT_ETH_REWARD
                      ) /
                        100) *
                        100
                    ) / 100}
                  </td>
                  <td className="py-1 text-center">
                    Linear from 215000 to 155000
                  </td>
                  <td className="py-1 text-center rounded-tr-xl rounded-br-xl">
                    5000
                  </td>
                </tr>
                <tr
                  className={`cursor-pointer h-10 text-xs lg:text-sm rounded-t-xl rounded-b-xl bg-white`}
                >
                  <td className="py-1 text-center rounded-tl-xl rounded-bl-xl">
                    11-55
                  </td>
                  <td className="py-1 text-center">
                    {Math.floor(
                      ((5 *
                        Number(
                          process.env.REACT_APP_CURRENT_TOURNAMENT_ETH_REWARD
                        )) /
                        900) *
                        100
                    ) / 100}
                  </td>
                  <td className="py-1 text-center">
                    Linear from 149000 to 105000
                  </td>
                  <td className="py-1 text-center rounded-tr-xl rounded-br-xl">
                    2500
                  </td>
                </tr>
                <tr
                  className={`cursor-pointer h-10 text-xs lg:text-sm rounded-t-xl rounded-b-xl bg-white`}
                >
                  <td className="py-1 text-center rounded-tl-xl rounded-bl-xl">
                    56-100
                  </td>
                  <td className="py-1 text-center">
                    {Math.floor(
                      (Number(
                        process.env.REACT_APP_CURRENT_TOURNAMENT_ETH_REWARD
                      ) /
                        300) *
                        100
                    ) / 100}
                  </td>
                  <td className="py-1 text-center">
                    Linear from 104000 to 60000
                  </td>
                  <td className="py-1 text-center rounded-tr-xl rounded-br-xl">
                    1500
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrizePool;
