import React, { useEffect, useState, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardexWebsite from "./CardexWebsite.jpg";
import OnboardBg from "./OnboardBg.png";
import "../index.css";

const Waitlist = () => {
  const { ready, authenticated, login, user } = usePrivy();
  const navigate = useNavigate();

  const [waitlistUsers, setWaitlistUsers] = useState(0);

  const [fetched, setFetched] = useState(false);

  const hasMounted = useRef(false);

  //   useEffect(() => {
  //     if (ready && authenticated && user) {
  //       fetchUserAndNavigate();
  //     }
  //   }, [user]);

  useEffect(() => {
    const fetchWaitlistUsers = async () => {
      try {
        const response = await axios.get(`/api/waitlistUsers/total`);
        setWaitlistUsers(Number(response.data));
        setFetched(true);
      } catch (error) {
        console.error("Error fetching waitlist users:", error.message);
      }
    };
    fetchWaitlistUsers();
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      const addWaitlistUser = async () => {
        try {
          await axios.post(`/api/waitlistUsers`, {
            DID: user.id,
            twitterName: user.twitter.name,
            twitterHandle: user.twitter.username,
            twitterProfile: user.twitter.profilePictureUrl,
          });
        } catch (error) {
          console.error("Error add waitlist users:", error.message);
        }
      };

      if (!!user && !!user.twitter) {
        addWaitlistUser();
      }
    } else {
      hasMounted.current = true;
    }
  }, [authenticated]);

  const handleLogin = () => {
    try {
      login();
    } catch (error) {
      console.error("Failed to log in", error);
    }
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
      <div className="w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white p-10 rounded-3xl shadow-xl text-center z-10">
        <div className="flex justify-center items-center mb-4">
          <img src={CardexWebsite} alt="Cardex" className="h-14 w-auto" />
        </div>
        <p className="mb-4 font-semibold text-gray-300 text-base">
          High End Trading Card Fantasy Game
        </p>
        {/* <p className="mb-4 font-semibold text-gray-300 text-base">
          Go Higher, Go Viral
        </p> */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLogin}
            className={`w-2/3 bg-blue-400 text-white font-bold font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out ${
              ready && authenticated && !!user.twitter ? "hidden" : "block"
            }`}
            type="button"
          >
            Join in Waitlist
          </button>
          <button
            className={`w-2/3 bg-white text-blue-400 font-bold font-helvetica-neue px-4 py-2 rounded-full border border-blue-300 ${
              ready && authenticated && !!user.twitter ? "block" : "hidden"
            }`}
            type="button"
          >
            Already in Waitlist
          </button>
        </div>
        <div className="flex justify-center items-center mt-2">
          <p
            style={{
              animation: "pulse-scale 0.5s infinite",
            }}
            className="text-base font-semibold text-blue-300"
          >
            {fetched
              ? `${Number(waitlistUsers) + 325} users already in!`
              : "--- users already in"}
          </p>

          <style>
            {`@keyframes pulse-scale {0%, 100% {transform: scale(1);} 50% {transform: scale(1.2);}}
            `}
          </style>
        </div>
        {/* <div className="mt-4">
            <a href="/privacy-policy" className="text-black underline text-sm">
              Privacy Policy
            </a>
          </div> */}
      </div>
    </div>
  );
};

export default Waitlist;
