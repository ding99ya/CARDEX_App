import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "./components/AuthContext";
import { base, baseSepolia, mainnet } from "viem/chains";
import { Buffer } from "buffer";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

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

serviceWorkerRegistration.register();

const firebaseConfig = {
  apiKey: "AIzaSyAzt0L-e0BHdgRTIUHYaxzOdhDxdb2FnSs",
  authDomain: "cardex-96b70.firebaseapp.com",
  projectId: "cardex-96b70",
  storageBucket: "cardex-96b70.appspot.com",
  messagingSenderId: "447559129333",
  appId: "1:447559129333:web:471fabe7db5855d57e8dbc",
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BKnjduM6elMnouX5rA_Qh0RsF5W3o6doc_4WaBV_PaRErnNdg6v_0bgphpdqhS9Y0_ZJg7HftVbWbuIf7lQPo4Q",
      });
      console.log("Notification permission granted. Token:", token);
      // You can subscribe to a topic here if needed
      // messaging.subscribeToTopic(token, 'all_users');
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
  }
};

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log("Message received in the foreground:", payload);
  const { title, body } = payload.notification;
  new Notification(title, { body });
});

// Request permission when the app loads
requestNotificationPermission();
