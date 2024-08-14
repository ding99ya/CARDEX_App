import React, { useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardexWebsite from "./CardexWebsite.jpg";
import "../index.css";

const Login = () => {
  const { ready, authenticated, login, user } = usePrivy();
  const navigate = useNavigate();

  const fetchUserAndNavigate = async () => {
    try {
      const embeddedWalletAddress = user.wallet.address;

      const response = await axios.get(
        `/api/users/${embeddedWalletAddress.toString()}`
      );

      if (response.data.invited && response.data.username.length > 0) {
        navigate("/market");
      } else if (response.data.invited && response.data.username.length === 0) {
        navigate("/login/usertwitter");
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

  if (!ready) {
    return <div>Not Ready</div>;
  }

  if (ready && !authenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 rounded-3xl">
        <div className="w-full max-w-[calc(100%-2rem)] sm:max-w-md bg-white p-10 rounded-3xl shadow-xl text-center z-10">
          {/* <h4 className="text-4xl mb-4 font-helvetica-neue font-semibold">
            Welcome to CARDEX
          </h4> */}
          <div className="flex justify-center items-center mb-10">
            <img src={CardexWebsite} alt="Cardex" className="h-14 w-auto" />
          </div>
          {/* <p className="mb-8 font-open-sans font-bold text-2xl">
            Welcome to CARDEX
          </p> */}
          <p className="mb-8 font-open-sans font-bold text-base">
            RWA Experimentation for Luxury Collectible
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
