import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [validWallet, setValidWallet] = useState(null);
  const [validInvited, setValidInvited] = useState(null);
  const [validUsername, setValidUsername] = useState(null);

  const { address, status } = useAccount();
  const { ready, authenticated, user } = usePrivy();
  // const { wallets } = useWallets();

  useEffect(() => {
    if (ready) {
      setIsReady(true);
      // const wallet = user.wallet.address;
      setValidWallet(user ? true : false);
    }
  }, [ready, user]);

  useEffect(() => {
    const validateInvitedAndUsername = async () => {
      if (validWallet) {
        try {
          const response = await axios.get(
            `/api/users/${user.wallet.address.toString()}`
          );

          setValidInvited(response.data.invited);

          setValidUsername(response.data.username.length > 0);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setValidInvited(false);
          setValidUsername(false);
        }
      }
    };

    validateInvitedAndUsername();
  }, [validWallet]);

  if (isReady && validWallet === false) {
    return <Navigate to="/login" replace />;
  }

  if (isReady && validInvited === false) {
    return <Navigate to="/login" replace />;
  }

  if (isReady && validUsername === false) {
    return <Navigate to="/login" replace />;
  }

  if (isReady && validWallet && validInvited && validUsername) {
    return children;
  }

  // return <div>Loading...</div>;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <img src="/Loading.gif" alt="Loading..." style={{ marginTop: "-20vh" }} />
    </div>
  );
};

export default ProtectedRoute;
