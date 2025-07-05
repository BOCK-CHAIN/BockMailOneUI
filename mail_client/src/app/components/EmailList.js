// my-email-frontend/app/components/EmailList.js
import React from 'react';
import { Inbox, Tag, Users } from 'lucide-react'; // Import icons

export default function EmailList({ emails, type, activeInboxCategory, onInboxCategoryChange }) { // Added new props
  const isSent = type === 'sent';
  const title = isSent ? 'Sent Mail' : 'Inbox';

  const isInbox = type === 'inbox'; // Helper for conditional rendering

  const categories = [
    { name: 'Primary', icon: Inbox },
    { name: 'Promotions', icon: Tag },
    { name: 'Social', icon: Users },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
      {/* Conditional Category Tabs for Inbox */}
      {isInbox && (
        <div className="flex border-b border-gray-200 bg-gray-50">
          {categories.map((category) => {
            const Icon = category.icon; // Get the icon component
            return (
              <button
                key={category.name}
                onClick={() => onInboxCategoryChange(category.name)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium text-gray-700 relative
                            hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:z-10
                            ${activeInboxCategory === category.name
                              ? 'text-purple-700 border-b-2 border-purple-700 font-semibold'
                              : 'text-gray-700'
                            }`}
              >
                <Icon size={18} /> {category.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Title (only if not inbox, or as a secondary title) */}
      {!isInbox && (
        <h2 className="text-2xl font-semibold border-b pb-4 mb-0 px-6 py-4 text-gray-800 bg-gray-50">
          {title}
        </h2>
      )}
      
      {emails.length === 0 ? (
        <p className="text-gray-600 p-6">No messages in {isInbox ? activeInboxCategory : type} {type === 'sent' ? 'mail' : 'inbox'}.</p>
      ) : (
        <ul className="list-none p-0 divide-y divide-gray-200">
          {emails.map((mail) => (
            <li
              key={mail.id}
              className="px-6 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex justify-between items-center">
                <div className="flex-grow flex items-baseline overflow-hidden">
                  <span className="font-semibold text-gray-900 text-base whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                    {isSent ? `To: ${mail.recipients.join(', ')}` : `From: ${mail.sender}`}
                  </span>
                  <span className="text-gray-800 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {mail.subject || '(No Subject)'}
                    {mail.plain_body && mail.plain_body.trim() !== '' && (
                      <span className="text-gray-600 font-normal ml-2">
                        - {mail.plain_body.substring(0, 100).replace(/\n/g, ' ').trim()}{mail.plain_body.length > 100 ? '...' : ''}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}