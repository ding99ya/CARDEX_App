import React, { useEffect, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardexWebsite from "./CardexWebsite.jpg";
import OnboardBg from "./OnboardBg.png";
import "../index.css";

const Login = () => {
  const { ready, authenticated, login, user } = usePrivy();
  const navigate = useNavigate();

  const [promptVisible, setPromptVisible] = useState(false);

  const fetchUserAndNavigate = async () => {
    try {
      const embeddedWalletAddress = user.wallet.address;

      const response = await axios.get(
        `/api/users/${embeddedWalletAddress.toString()}`
      );

      if (response.data.invited && response.data.username.length > 0) {
        navigate("/market");
      } else if (response.data.invited && response.data.username.length === 0) {
        navigate("/login/username");
      } else if (!response.data.invited) {
        navigate("/login/invite");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // User not found, handle the 404 error
        navigate("/login/invite");
      } else {
        // Other errors (e.g., network errors, server errors)
        console.error("Error fetching user:", error.message);
      }
    }
  };

  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
  }

  function isInStandaloneMode() {
    return "standalone" in window.navigator && window.navigator.standalone;
  }

  useEffect(() => {
    // Check if the user is on iOS Safari and hasn't installed the PWA yet
    if (isIOS() && !isInStandaloneMode()) {
      setPromptVisible(true);
    } else {
      console.log("This device not in iOS");
    }
  }, []);

  useEffect(() => {
    if (ready && authenticated && user) {
      fetchUserAndNavigate();
    }
  }, [user]);

  const handleLogin = () => {
    try {
      login();
    } catch (error) {
      console.error("Failed to log in", error);
    }
  };

  if (promptVisible) {
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
            <img src={CardexWebsite} alt="Cardex" className="h-10 w-auto" />
          </div>

          <p className="mb-4 font-open-sans font-bold text-lg text-left">
            Install Cardex on Home Screen
          </p>

          <p className="mb-2 font-open-sans text-sm text-left">
            To install the app, you need to add this website to your home
            screen.
          </p>

          <p className="mb-2 font-open-sans text-sm text-left">
            In your Safari browser menu, tap the Share icon and choose Add to
            Home Screen in the options.
          </p>
          <p className="mb-2 font-open-sans text-sm text-left">
            Then open Cardex app on your home screen.
          </p>
        </div>
      </div>
    );
  }

  if (!promptVisible && !ready) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <img src="/Loading.gif" alt="Loading..." />
      </div>
    );
  }

  if (!promptVisible && ready && !authenticated) {
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
          {/* <h4 className="text-4xl mb-4 font-helvetica-neue font-semibold">
            Welcome to CARDEX
          </h4> */}
          <div className="flex justify-center items-center mb-6">
            <img src={CardexWebsite} alt="Cardex" className="h-14 w-auto" />
          </div>
          {/* <p className="mb-8 font-open-sans font-bold text-2xl">
            Welcome to CARDEX
          </p> */}
          <p className="mb-1 font-semibold text-gray-400 text-base">
            Trading Card Launchpad
          </p>
          <p className="mb-1 text-gray-400 text-base">X</p>
          <p className="mb-6 font-semibold text-gray-400 text-base">
            Fantasy Style Game
          </p>
          <button
            onClick={handleLogin}
            className="w-2/3 bg-blue-400 text-white font-bold font-helvetica-neue px-4 py-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
            type="button"
          >
            Sign In
          </button>
          {/* <div className="mt-4">
            <a href="/privacy-policy" className="text-black underline text-sm">
              Privacy Policy
            </a>
          </div> */}
        </div>
      </div>
    );
  }

  return null;
};

export default Login;
