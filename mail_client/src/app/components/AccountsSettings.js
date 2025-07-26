// my-email-frontend/app/components/AccountsSettings.js
'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function AccountsSettings({ onChangePassword, appMessage }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // For local validation errors

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    // --- Client-side validation ---
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    // If validation passes, call the function from the parent (page.js)
    onChangePassword(currentPassword, newPassword);

    // Clear fields after submission attempt
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Accounts and Import</h3>
      <p className="text-sm text-gray-500 mb-6">Change password and other account settings.</p>

      <div className="bg-white rounded-md border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Change password</h4>
          
          {/* Display any error or success message */}
          {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
          {appMessage && !error && <p className="mb-4 text-sm text-green-600 bg-green-100 p-2 rounded-md">{appMessage}</p>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="current-password">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="new-password">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-password">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save size={18} />
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
    