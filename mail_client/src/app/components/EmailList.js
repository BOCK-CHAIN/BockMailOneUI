// my-email-frontend/app/components/EmailList.js
'use client'; // Ensure this is present for client-side interactivity

import React from 'react';
import { format } from 'date-fns'; // Import format from date-fns for date display
import { Inbox, Tag, Users, Trash2, Star } from 'lucide-react'; // Import Trash2 and Star icons

export default function EmailList({ emails, type, activeInboxCategory, onInboxCategoryChange, onMoveEmailToTrash, onToggleStarred }) {
  const isSent = type === 'sent';
  const title = isSent ? 'Sent Mail' : 'Inbox';

  const isInbox = type === 'inbox'; // Helper for conditional rendering

  const categories = [
    { name: 'Primary', icon: Inbox },
    { name: 'Promotions', icon: Tag },
    { name: 'Social', icon: Users },
    { name: 'all', label: 'All Mail' } // Added 'all' category for consistency
  ];

  const getCategoryName = (category) => {
    switch (category) {
      case 'Primary': return 'Primary';
      case 'Social': return 'Social';
      case 'Promotions': return 'Promotions';
      case 'Updates': return 'Updates'; // Ensure 'Updates' is handled if it's a possible category
      case 'all': return 'All Mail'; // Label for 'all' category
      default: return 'Other';
    }
  };

  const getSenderOrRecipient = (email) => {
    if (type === 'inbox') {
      return email.sender;
    } else if (type === 'sent') {
      return Array.isArray(email.recipients) ? email.recipients.join(', ') : email.recipients;
    }
    return '';
  };

  if (!emails || emails.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md mb-6 p-6 min-h-[300px]">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">No {type} emails found.</p>
          {type === 'inbox' && <p>Your inbox is empty. Time to relax!</p>}
          {type === 'sent' && <p>You haven't sent any emails yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow flex flex-col min-h-0"> {/* Added flex-grow, flex, flex-col, min-h-0 */}
      {/* Conditional Category Tabs for Inbox - ALWAYS RENDERED IF INBOX */}
      {isInbox && (
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0"> {/* Added flex-shrink-0 */}
          {categories.map((category) => {
            const Icon = category.icon; // Icon might be undefined for 'all'
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
                {Icon && <Icon size={18} />} {category.label || category.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Title (only if not inbox) */}
      {!isInbox && (
        <h2 className="text-2xl font-semibold border-b pb-4 mb-0 px-6 py-4 text-gray-800 bg-gray-50 flex-shrink-0"> {/* Added flex-shrink-0 */}
          {title}
        </h2>
      )}
      
      {/* Conditional rendering for email list or "No messages" */}
      {emails.length === 0 ? (
        <p className="text-gray-600 p-6">No messages in {isInbox ? getCategoryName(activeInboxCategory) : type} {type === 'sent' ? 'mail' : 'inbox'}.</p>
      ) : (
        <ul className="list-none p-0 divide-y divide-gray-200 overflow-y-auto flex-grow"> {/* Added overflow-y-auto flex-grow */}
          {emails.map((mail) => (
            <li
              key={mail.id}
              className="px-6 py-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> {/* Changed to flex-col sm:flex-row */}
                <div className="flex-grow min-w-0"> {/* Added min-w-0 */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-base whitespace-nowrap overflow-hidden text-ellipsis mr-2">
                      {isSent ? `To: ${getSenderOrRecipient(mail)}` : `From: ${getSenderOrRecipient(mail)}`}
                    </span>
                    {/* Date/Time Display - Moved inside content block to prevent wrapping issues */}
                    <span className="text-xs text-gray-400 ml-auto pl-2 flex-shrink-0">
                      {format(new Date(mail.received_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <span className="text-gray-800 text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis block"> {/* Added block */}
                    {mail.subject || '(No Subject)'}
                    {mail.plain_body && mail.plain_body.trim() !== '' && (
                      <span className="text-gray-600 font-normal ml-2">
                        - {mail.plain_body.substring(0, 100).replace(/\n/g, ' ').trim()}{mail.plain_body.length > 100 ? '...' : ''}
                      </span>
                    )}
                  </span>
                </div>
                {/* Action Buttons: Star and Delete */}
                <div className="flex-shrink-0 ml-0 sm:ml-4 mt-2 sm:mt-0 flex items-center gap-2 self-end sm:self-center"> {/* Adjusted margins and alignment */}
                  {/* Star Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarred(mail.id, mail.is_starred, type);
                    }}
                    className={`p-2 rounded-full ${mail.is_starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'} transition-colors`}
                    title={mail.is_starred ? 'Unstar' : 'Star'}
                  >
                    <Star size={18} fill={mail.is_starred ? 'currentColor' : 'none'} />
                  </button>
                  {/* Delete Button (Move to Trash) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveEmailToTrash(mail.id);
                    }}
                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    title="Move to Trash"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
