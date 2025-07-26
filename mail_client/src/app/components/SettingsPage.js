// my-email-frontend/app/components/SettingsPage.js
'use client';

import React, { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import LabelsSettings from './LabelsSettings';
import AccountsSettings from './AccountsSettings';

export default function SettingsPage({ initialSettings, onSave, appMessage, onSignatureAction, labelSettings,
  onLabelSettingsChange, onChangePassword  }) {
  // State to manage which settings tab is currently active
  const [activeSection, setActiveSection] = useState('General');
  
  // Define the settings categories for the top navigation tabs
  const settingsCategories = [
    { name: 'General', label: 'General', disabled: false },
    { name: 'Labels', label: 'Labels', disabled: false },
    { name: 'AccountsAndImport', label: 'Accounts and Import', disabled: false },
    { name: 'FiltersAndBlockedAddresses', label: 'Filters and Blocked', disabled: true },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm flex-grow flex flex-col min-h-0">
      {/* Settings Header */}
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {settingsCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => !category.disabled && setActiveSection(category.name)}
            disabled={category.disabled}
            className={`px-4 py-3 text-sm font-medium relative
                        hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:z-10
                        ${activeSection === category.name
                          ? 'text-purple-700 border-b-2 border-purple-700 font-semibold'
                          : 'text-gray-700'
                        }
                        ${category.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Settings Content Area */}
      <div className="p-6 flex-grow overflow-y-auto">
        {/* Display success/error messages from the parent */}
        {appMessage && <p className="mb-4 text-center text-green-600 bg-green-100 p-3 rounded-md border border-green-200">{appMessage}</p>}

        {/* Render content based on activeSection */}
        {activeSection === 'General' && (
          <GeneralSettings
            initialSettings={initialSettings}
            onSave={onSave} // Pass the onSave function directly down
            onSignatureAction={onSignatureAction}
          />
        )}
        {activeSection === 'Labels' && (
          <LabelsSettings
            labelSettings={labelSettings}
            onLabelSettingsChange={onLabelSettingsChange}
          />
        )}   
        {activeSection === 'AccountsAndImport' && (
          <AccountsSettings
            onChangePassword={onChangePassword}
            appMessage={appMessage} // Pass the message for feedback
          />
        )} 
      </div>
    </div>
  );
}
