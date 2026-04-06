import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSideBar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSideBar={toggleSideBar} />
      <div className="flex-l flex flex-col overflow-hidden">
        <Header toggleSideBar={toggleSideBar} />
        <main className="flex-l overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
