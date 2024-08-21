import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import axios from "axios";
import { PrivyProvider } from "@privy-io/react-auth";
import { AuthProvider } from "./components/AuthContext";
import { base, baseSepolia, mainnet } from "viem/chains";
import { Buffer } from "buffer";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
window.Buffer = Buffer;

async function registerServiceWorkerAndSubscribe() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered successfully:", registration);

      requestNotificationPermission(registration);
    } catch (error) {
      console.error(
        "Error during service worker registration or push subscription:",
        error
      );
    }
  } else {
    console.log("Push notifications are not supported in this browser");
  }
}

async function subscribeToPushNotifications(registration) {
  try {
    let subscription = await registration.pushManager.getSubscription();
    console.log(subscription);
    if (subscription) {
      console.log("User already has a subscription");
      return subscription;
    }

    console.log("Subscribing...");
    const response = await axios.get("/api/vapidPublicKey");
    const vapidPublicKey = response.data;
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    await sendSubscriptionToServer(subscription);
    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
}

function requestNotificationPermission(registration) {
  console.log("Try to gain permission");
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      console.log("Check if granted");
      if (permission === "granted") {
        console.log("Already granted");
        subscribeToPushNotifications(registration);
      }
    });
  }
}

async function sendSubscriptionToServer(subscription) {
  try {
    const response = await axios.post("/api/subscribe", {
      subscription: subscription,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to save subscription on server:", error);
    throw error;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Call the function to register service worker and subscribe to push notifications
// registerServiceWorkerAndSubscribe();

serviceWorkerRegistration.register();

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
        logo: "/Cardex_logo.png",
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
