import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "./components/AuthContext";
import { base, baseSepolia, mainnet } from "viem/chains";
import { Buffer } from "buffer";
window.Buffer = Buffer;

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <PrivyProvider
    appId={process.env.REACT_APP_PRIVY_APP_ID}
    config={{
      // Display email and wallet as login methods
      loginMethods: ["email", "sms"],
      // Customize Privy's appearance in your app
      appearance: {
        theme: "light",
        accentColor: "#676FFF",
        //logo: "https://your-logo-url",
      },
      // Create embedded wallets for users who don't have a wallet
      embeddedWallets: {
        createOnLogin: "users-without-wallets",
      },
      defaultChain: baseSepolia,
      supportedChains: [baseSepolia, base, mainnet],
    }}
  >
    <AuthProvider>
      <App />
    </AuthProvider>
  </PrivyProvider>
);
