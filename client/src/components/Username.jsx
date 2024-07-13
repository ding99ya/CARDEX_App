import React, { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classNames from "classnames";
import UsernameNotification from "./UsernameNotification.jsx";
import "../index.css";

const Username = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [valid, setValid] = useState(false);
  const [notification, setNotification] = useState(null);

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
    if (ready && authenticated) {
      fetchUserAndNavigate();
    } else if (ready && !authenticated) {
      navigate("/login");
    }
  }, [ready, authenticated, user]);

  const handleUsernameChange = (e) => {
    const name = e.target.value;

    if (name.length >= 3 && name.length <= 10) {
      setValid(true);
    } else {
      setValid(false);
    }

    setUsername(name);
  };

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
    if (username.length >= 3 && username.length <= 10) {
      console.log("Username is valid!");
      try {
        const checkUserResponse = await axios.get(
          `/api/users/check-username/${username}`
        );

        if (checkUserResponse.data.exists) {
          showNotification("Username already exists!");
        } else {
          const leaderboardResponse = await axios.post("/api/leaderboard", {
            DID: user.id,
            walletAddress: user.wallet.address.toString(),
            userName: username,
            paperPoints: 101, // Update to 0 later, 101 for test to show the new user on leaderboard
          });

          const generatedCode = generateInviteCode();

          const inviteCodeResponse = await axios.patch(
            `/api/users/nameandcode`,
            {
              walletAddress: user.wallet.address.toString(),
              username: username.toString(),
              inviteCode: generatedCode,
            }
          );

          const now = new Date();

          const insertInviteCodeResponse = await axios.post(
            `/api/invitecodes`,
            {
              DID: user.id,
              code: generatedCode,
              createdAt: now.toUTCString(),
              lastUpdatedAt: now.toUTCString(),
              currentUsage: 0,
            }
          );

          navigate("/login/userdeposit");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setValid(false);
      console.log("Username is invalid!");
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
        {/* <h1 className="text-4xl mb-4 font-bold">INPUT YOUR USERNAME</h1> */}
        <p className="mb-8 font-helvetica-neue font-semibold text-xl">
          Input your username below, you can't change it later
        </p>
        <div className="flex justify-between items-center mt-4 mb-2">
          <span className="sm:w-3/5 mx-auto">
            <input
              className="text-base border-2 border-black bg-gray-100 w-full py-1 appearance-none rounded-xl text-center font-semibold"
              type="string"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Your Username"
            />
          </span>
        </div>
        <p className="mb-8">Username length must be in 3 to 10 characters.</p>
        <button
          className={classNames(
            "w-1/3 font-bold font-helvetica-neue border border-black px-2 py-2 rounded-full transition duration-300 ease-in-out",
            {
              "border border-black bg-white text-black hover:bg-black hover:text-white":
                !!valid,
              "border border-black bg-gray-200 text-black": !valid,
            }
          )}
          disabled={!valid}
          onClick={handleUsernameInput}
          type="button"
        >
          Continue
        </button>
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

export default Username;
