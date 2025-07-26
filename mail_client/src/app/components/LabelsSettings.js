// my-email-frontend/app/components/LabelsSettings.js
'use client';

import React from 'react';

// A single row for a label setting
const LabelSettingRow = ({ labelName, status, onStatusChange }) => {
  const isShown = status === 'show';

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
      <span className="text-base text-gray-700">{labelName}</span>
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => onStatusChange('show')}
          className={isShown ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}
        >
          Show
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => onStatusChange('hide')}
          className={!isShown ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}
        >
          Hide
        </button>
      </div>
    </div>
  );
};

export default function LabelsSettings({ labelSettings, onLabelSettingsChange }) {
  
  const handleSettingChange = (labelKey, newStatus) => {
    onLabelSettingsChange({
      ...labelSettings,
      [labelKey]: newStatus,
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Labels</h3>
      <p className="text-sm text-gray-500 mb-6">Choose which labels appear in the main menu on the left.</p>

      <div className="bg-white rounded-md border border-gray-200 px-4">
        <LabelSettingRow
          labelName="Starred"
          status={labelSettings?.starred || 'show'}
          onStatusChange={(status) => handleSettingChange('starred', status)}
        />
        <LabelSettingRow
          labelName="Spam"
          status={labelSettings?.spam || 'show'}
          onStatusChange={(status) => handleSettingChange('spam', status)}
        />
        <LabelSettingRow
          labelName="Scheduled"
          status={labelSettings?.scheduled || 'show'}
          onStatusChange={(status) => handleSettingChange('scheduled', status)}
        />
        <LabelSettingRow
          labelName="Drafts"
          status={labelSettings?.drafts || 'show'}
          onStatusChange={(status) => handleSettingChange('drafts', status)}
        />
        <LabelSettingRow
          labelName="Sent"
          status={labelSettings?.sent || 'show'}
          onStatusChange={(status) => handleSettingChange('sent', status)}
        />
         <LabelSettingRow
          labelName="Trash"
          status={labelSettings?.trash || 'show'}
          onStatusChange={(status) => handleSettingChange('trash', status)}
        />
      </div>
    </div>
  );
}
