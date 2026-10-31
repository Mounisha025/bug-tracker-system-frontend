import { useState } from "react";

import Sidebar from "../components/sidebar/Sidebar";

import Navbar from "../components/navbar/Navbar";

const AppLayout = ({
  children,
}) => {

  const [sidebarOpen,
    setSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Navbar */}
        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {children}

        </main>

      </div>

    </div>
  );
};

export default AppLayout;