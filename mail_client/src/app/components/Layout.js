import React from 'react';
import Head from 'next/head';

export default function Layout({ userEmail, onLogout, activeTab, onTabChange, inboxCount, sentCount, children }) {
  return (
    <div className="flex min-h-screen w-full bg-white shadow-lg">
      <Head>
        <title>My Mail</title>
      </Head>
      {/* Sidebar */}
      <div className="w-56 bg-gray-800 text-white p-5 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-center mb-5 text-white">My Mail</h2>
        <button
          onClick={() => onTabChange('compose')}
          className={`px-4 py-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${activeTab === 'compose' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Compose
        </button>
        <button
          onClick={() => onTabChange('inbox')}
          className={`px-4 py-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${activeTab === 'inbox' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Inbox ({inboxCount})
        </button>
        <button
          onClick={() => onTabChange('sent')}
          className={`px-4 py-3 text-left rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 ${activeTab === 'sent' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          Sent ({sentCount})
        </button>
        <button onClick={onLogout} className="mt-auto px-4 py-3 bg-red-600 text-left rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
          Logout
        </button>
        <p className="mt-5 pt-3 text-sm opacity-80 border-t border-gray-700">Logged in as: {userEmail}</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow p-5 bg-gray-50">
        {children} {/* This is where the active tab content will be rendered */}
      </div>
    </div>
  );
}