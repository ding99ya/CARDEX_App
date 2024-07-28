import React, { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import UsernameNotification from "./UsernameNotification.jsx";
import "../index.css";

const UserLinkTwitter = () => {
  const { ready, authenticated, logout, linkTwitter, user } = usePrivy();
  const navigate = useNavigate();

  //   const [username, setUsername] = useState("");
  //   const [valid, setValid] = useState(false);
  const [notification, setNotification] = useState(null);

  const userTwitter = user ? user.twitter : "";

  const showNotification = (message) => {
    setNotification(message);
  };

  const handleNotificationClose = () => {
    setNotification(null);
  };

  const fetchUserAndNavigate = async () => {
    try {
      if (!user) {
        navigate("/login");
      }
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
    if (ready && authenticated) {
      fetchUserAndNavigate();
    } else if (ready && !authenticated) {
      navigate("/login");
    }
  }, [ready, authenticated, user]);

  //   const handleUsernameChange = (e) => {
  //     const name = e.target.value;

  //     if (name.length >= 3 && name.length <= 10) {
  //       setValid(true);
  //     } else {
  //       setValid(false);
  //     }

  //     setUsername(name);
  //   };

  const generateInviteCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let inviteCode = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      inviteCode += characters[randomIndex];
    }
    return inviteCode;
  };

  const handleUsernameInput = async (e) => {
    e.preventDefault();
    if (!!user.twitter) {
      console.log("User Twitter is Linked!");
      try {
        const leaderboardResponse = await axios.post("/api/leaderboard", {
          DID: user.id,
          walletAddress: user.wallet.address.toString(),
          name: user.twitter.name,
          userName: user.twitter.username,
          profilePhoto: user.twitter.profilePictureUrl,
          paperPoints: 101, // Update to 0 later, 101 for test to show the new user on leaderboard
        });

        const generatedCode = generateInviteCode();

        const inviteCodeResponse = await axios.patch(`/api/users/nameandcode`, {
          walletAddress: user.wallet.address.toString(),
          username: user.twitter.username,
          inviteCode: generatedCode,
        });

        const now = new Date();

        const insertInviteCodeResponse = await axios.post(`/api/invitecodes`, {
          DID: user.id,
          code: generatedCode,
          createdAt: now.toUTCString(),
          lastUpdatedAt: now.toUTCString(),
          currentUsage: 0,
        });

        navigate("/login/userdeposit");
      } catch (error) {
        console.log(error);
      }
    } else {
      showNotification("User Twitter is not Linked!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!ready) {
    return <div>Not Ready</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 rounded-10xl">
      <div className="bg-white p-4 mx-5 rounded-lg shadow-xl text-center">
        <p className="mb-8 font-helvetica-neue font-semibold text-xl">
          Create your Account by Linking Twitter
        </p>
        <p
          className={
            !!userTwitter ? `mb-8 font-helvetica-neue text-lg` : `hidden`
          }
        >
          Twitter Linked, click "Continue"
        </p>
        <div>
          <button
            className={classNames(
              "font-bold font-helvetica-neue border border-black bg-white text-black hover:bg-black hover:text-white px-2 py-2 rounded-full transition duration-300 ease-in-out mb-4",
              { hidden: !!userTwitter }
            )}
            onClick={linkTwitter}
            type="button"
          >
            Link Twitter
          </button>
        </div>
        <div>
          <button
            className={classNames(
              "w-1/3 font-bold font-helvetica-neue border border-black px-2 py-2 rounded-full transition duration-300 ease-in-out",
              {
                "border border-black bg-white text-black hover:bg-black hover:text-white":
                  !!userTwitter,
                "border border-black bg-gray-200 text-black": !userTwitter,
              }
            )}
            disabled={!userTwitter}
            onClick={handleUsernameInput}
            type="button"
          >
            Continue
          </button>
        </div>
        <p className="underline cursor-pointer" onClick={handleLogout}>
          login
        </p>
      </div>
      {notification && (
        <div className="absolute inset-0 flex justify-center items-center">
          <UsernameNotification
            message={notification}
            onClose={handleNotificationClose}
          />
        </div>
      )}
    </div>
  );
};

export default UserLinkTwitter;
