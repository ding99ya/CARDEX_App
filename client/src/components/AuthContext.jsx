import React, { createContext, useContext } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user, login, logout, authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const embeddedWalletAddress = wallet === undefined ? 0 : wallet.address;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authenticated,
        embeddedWalletAddress,
        ready,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
