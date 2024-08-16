import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardPage from "./CardPage";
import PresaleCardPage from "./PresaleCardPage";
import Market from "./Market.jsx";
import Login from "./Login";
import InviteCode from "./InviteCode";
import Username from "./Username.jsx";
import UserLinkTwitter from "./UserLinkTwitter.jsx";
import UserDeposit from "./UserDeposit.jsx";
import Layout from "./Layout";
import NotFound from "./NotFound";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import Inventory from "./Inventory.jsx";
import ViewProfile from "./ViewProfile";
import CardDetailPage from "./CardDetailPage";
import PresaleCardDetailPage from "./PresaleCardDetailPage";
import NewPresaleCardPage from "./NewPresaleCardPage";
import LeaderboardUser from "./LeaderboardUser";
import ProtectedRoute from "./ProtectedRoute";
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/login/invite" element={<InviteCode />} />
        <Route path="/login/username" element={<Username />} />
        <Route path="/login/usertwitter" element={<UserLinkTwitter />} />
        <Route path="/login/userdeposit" element={<UserDeposit />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market/pokemon"
            element={
              <ProtectedRoute>
                <CardPage category="pokemon" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market/basketball"
            element={
              <ProtectedRoute>
                <CardPage category="basketball" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market/baseball"
            element={
              <ProtectedRoute>
                <CardPage category="baseball" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market/presale"
            element={
              <ProtectedRoute>
                <NewPresaleCardPage category="presale" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market"
            element={
              <ProtectedRoute>
                <Market />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards/:uniqueId"
            element={
              <ProtectedRoute>
                <CardDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/presalecards/:uniqueId"
            element={
              <ProtectedRoute>
                <PresaleCardDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:username"
            element={
              <ProtectedRoute>
                <ViewProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard/:username"
            element={
              <ProtectedRoute>
                <LeaderboardUser />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
