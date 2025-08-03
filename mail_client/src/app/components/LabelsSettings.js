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
    // This function now calls a new onSave function to trigger a backend save
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
          status={labelSettings?.label_starred_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_starred_visibility', status)}
        />
        <LabelSettingRow
          labelName="Sent"
          status={labelSettings?.label_sent_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_sent_visibility', status)}
        />
        <LabelSettingRow
          labelName="Drafts"
          status={labelSettings?.label_drafts_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_drafts_visibility', status)}
        />
        <LabelSettingRow
          labelName="Scheduled"
          status={labelSettings?.label_scheduled_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_scheduled_visibility', status)}
        />
        <LabelSettingRow
          labelName="Spam"
          status={labelSettings?.label_spam_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_spam_visibility', status)}
        />
        <LabelSettingRow
          labelName="Trash"
          status={labelSettings?.label_trash_visibility || 'show'}
          onStatusChange={(status) => handleSettingChange('label_trash_visibility', status)}
        />
      </div>
    </div>
  );
}
