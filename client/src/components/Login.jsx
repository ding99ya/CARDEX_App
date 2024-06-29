import React, { useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
        navigate("/homepage");
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
      <div className="flex justify-center items-center h-screen bg-blue-200">
        <div className="bg-white p-10 rounded-lg shadow-xl text-center">
          <h1 className="text-4xl mb-4 font-bold">CARDEX</h1>
          <p className="mb-8">RWA EXPERIMENTATION FOR YOUR COLLECTIBLE</p>
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Sign In
          </button>
          <div className="mt-4">
            <a
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;
