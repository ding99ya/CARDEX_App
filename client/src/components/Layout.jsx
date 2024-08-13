import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import "../index.css";

function Layout() {
  return (
    <div className="pl-0 pr-0 pt-4 pb-4 flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow mb-16 lg:mb-0 mt-12 lg:mt-24 overflow-auto">
        <Outlet />
      </main>

      {/* <footer>
        <div className="px-6 py-6">
          <p>&copy; CARDEX. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
  );
}

export default Layout;
