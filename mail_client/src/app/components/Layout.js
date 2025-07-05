// my-email-frontend/app/components/Layout.js
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Pencil, Inbox, SendHorizontal, LogOut, User } from "lucide-react"; // Removed Tag, Users icons

export default function Layout({
  userEmail,
  onLogout,
  activeTab,
  onTabChange,
  inboxCount, // Still pass total inbox count for sidebar
  sentCount,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#F6F0F8]">
      <Head>
        <title>My Mail</title>
      </Head>

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 top-0 left-0 h-full md:h-auto w-64 md:w-56 bg-[#F6F0F8] p-4
          transition-transform duration-300 ease-in-out
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 justify-center pb-4 border-b border-gray-300">
          <Image
            src="/logo/bock_logo.svg"
            width={40}
            height={40}
            alt="Bock Logo"
            className="animate-rotate360"
          />
          <h2 className="text-xl font-bold text-gray-800">Bock Mail</h2>
        </div>
        
        {/* Sidebar Buttons */}
        <nav className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              onTabChange("compose");
              setSidebarOpen(false);
            }}
            className={`px-8 py-4 w-[60%] text-left rounded-2xl text-sm font-medium transition-all focus:outline-none focus:ring-2  ${
              activeTab === "compose"
                ? "bg-purple-600 text-white"
                : "bg-[#812d81] text-white  hover:shadow-2xl hover:scale-[1.02] "
            }`}
          >
            <div className="logo flex justify-center items-center gap-2">
              <p>
                <Pencil width={20} height={20} />
              </p>
              <p>Compose</p>
            </div>
          </button>

          {/* Inbox Button (no categories here) */}
          <button
            onClick={() => {
              onTabChange("inbox");
              setSidebarOpen(false);
            }}
            className={`px-4 py-2 text-left rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
              activeTab === "inbox"
                ? "bg-purple-600 text-white"
                : "bg-[#7D2A7E] text-white hover:bg-[#5f3860]"
            }`}
          >
            <div className="logo flex justify-center items-center gap-2">
              <p>
                <Inbox size={20} />
              </p>
              <p>Inbox ({inboxCount})</p>
            </div>
          </button>

          <button
            onClick={() => {
              onTabChange("sent");
              setSidebarOpen(false);
            }}
            className={`px-4 py-2 text-left rounded-md text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
              activeTab === "sent"
                ? "bg-purple-600 text-white"
                : "bg-[#7D2A7E] text-white hover:bg-[#5f3860]"
            }`}
          >
            <div className="logo flex justify-center items-center gap-2">
              <p>
                <SendHorizontal width={20} height={20} />
              </p>
              <p>Sent ({sentCount})</p>
            </div>
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col ">
        {/* Mobile Topbar */}
        <div className="md:hidden flex items-center justify-between gap-2 px-4 py-3 bg-[#F6F0F8] shadow">
          {/* Left Side - Menu & Search */}
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center w-full bg-white px-3 py-1 rounded-md border border-gray-300">
              <svg
                className="h-4 w-4 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="w-full text-sm outline-none"
              />
            </div>
          </div>

          {/* Profile on Right (Mobile) */}
          <div className="ml-3 relative" ref={profileDropdownRef}>
            <button
              onClick={toggleProfileDropdown}
              className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-semibold uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="User Profile"
            >
              {userEmail?.charAt(0) || "U"}
            </button>
            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-40 animate-fade-in-down">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="break-words">{userEmail}</span>
                </div>
                <button
                  onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-grow p-6 bg-[#F6F0F8]">
          {/* Topbar inside main content (Desktop) */}
          <div className="flex items-center justify-between mb-6">
            {/* Search Bar */}
            <div className="max-md:hidden flex items-center w-full max-w-md bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-300">
              <svg
                className="h-5 w-5 text-gray-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search mail"
                className="w-full focus:outline-none text-sm"
              />
            </div>

            {/* Profile Section (Desktop) */}
            <div className="flex items-center gap-3 ml-4 max-md:hidden relative" ref={profileDropdownRef}>
              <button
                onClick={toggleProfileDropdown}
                className="w-9 h-9 rounded-full bg-purple-700 text-white flex items-center justify-center font-semibold uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="User Profile"
              >
                {userEmail?.charAt(0) || "U"}
              </button>
              {showProfileDropdown && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-lg shadow-xl py-2 z-40 animate-fade-in-down">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="break-words">{userEmail}</span>
                  </div>
                  <button
                    onClick={() => { onLogout(); setShowProfileDropdown(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actual Page Children */}
          {children}
        </main>
      </div>
    </div>
  );
}