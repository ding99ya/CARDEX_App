import React, { useState, useEffect } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";
import Notification from "./InviteCodeNotification.jsx";
import CardexWebsite from "./CardexWebsite.jpg";

const InviteCode = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const navigate = useNavigate();

  const [inviteCode, setInviteCode] = useState("");
  const [isValidCode, setIsValidCode] = useState(false);

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

  const handleInviteCodeChange = (e) => {
    const code = e.target.value;
    setInviteCode(code);
  };

  const handleInviteCodeInput = async () => {
    try {
      const response = await axios.get(
        `/api/invitecodes/${inviteCode.toString()}`
      );
      const previousTimestamp = response.data.lastUpdatedAt;
      const previousDate = new Date(previousTimestamp);
      const currentDate = new Date();

      const differenceInMilliseconds = currentDate - previousDate;
      const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);

      if (differenceInHours >= 24) {
        const updateInviteCodeResponse = await axios.patch(
          `/api/invitecodes/updatedandusage`,
          {
            code: inviteCode.toString(),
            lastUpdatedAt: currentDate.toUTCString(),
            currentUsage: 1,
          }
        );
        setIsValidCode(true);
      } else {
        if (response.data.currentUsage < 6) {
          const updateInviteCodeResponse = await axios.patch(
            `/api/invitecodes/updatedandusage`,
            {
              code: inviteCode.toString(),
              lastUpdatedAt: response.data.lastUpdatedAt,
              currentUsage: response.data.currentUsage + 1,
            }
          );
          setIsValidCode(true);
        } else {
          setIsValidCode(false);
          showNotification("Invite code has reached use limit today!");
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Code not found, handle the 404 error
        setIsValidCode(false);
        showNotification("Code is invalid!");
      } else {
        // Other errors (e.g., network errors, server errors)
        setIsValidCode(false);
        console.error("Error fetching code:", error.message);
        showNotification("Error when validating code");
      }
    }
  };

  useEffect(() => {
    const updateOrInsertUser = async () => {
      try {
        const userResponse = await axios.post(`/api/users`, {
          DID: user.id,
          walletAddress: user.wallet.address.toString(),
          username: "",
          invited: true,
          cardInventory: [],
        });
        navigate("/login/usertwitter");
      } catch (error) {
        console.log(error);
      }
    };

    if (isValidCode) {
      updateOrInsertUser();
    }
  }, [isValidCode]);

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 rounded-3xl">
      <div className="w-full max-w-[calc(100%-1rem)] sm:max-w-md bg-white p-10 rounded-3xl shadow-xl text-center">
        {/* <h1 className="text-4xl mb-4 font-bold">GOT AN INVITE CODE?</h1> */}
        <div className="flex justify-center items-center mb-8">
          <img src={CardexWebsite} alt="Cardex" className="h-14 w-auto" />
        </div>
        <p className="mt-4 mb-4 font-open-sans font-semibold text-base">
          CARDEX is in Beta. Get an invite code to enter.
        </p>
        <div className="w-full mb-8">
          <input
            className="text-base border-2 border-gray-300 bg-gray-100 w-full py-1 appearance-none rounded-xl text-center font-semibold"
            type="string"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            placeholder="Enter Your Invite Code"
          />
        </div>
        <button
          onClick={handleInviteCodeInput}
          className="w-full bg-blue-400 text-white font-bold font-helvetica-neue px-4 py-2 mb-2 rounded-full hover:bg-blue-500 hover:text-white transition duration-300 ease-in-out"
          type="button"
        >
          Continue
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-white text-black border-2 border-black font-bold font-helvetica-neue px-[calc(1rem-2px)] py-[calc(0.5rem-2px)] rounded-full hover:bg-gray-200 hover:text-black transition duration-300 ease-in-out"
          type="button"
        >
          Log Out
        </button>
        {/* <p className="underline cursor-pointer mb-4" onClick={handleLogout}>
          login
        </p> */}
      </div>
      {notification && (
        <div className="absolute inset-0 flex justify-center items-center">
          <Notification
            message={notification}
            onClose={handleNotificationClose}
          />
        </div>
      )}
    </div>
  );
};

export default InviteCode;
