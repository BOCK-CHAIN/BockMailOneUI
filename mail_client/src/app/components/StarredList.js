// my-email-frontend/app/components/StarredList.js
'use client';

import React from 'react';
import { format } from 'date-fns';
import { Star, Mail, Send, FileText, Paperclip, Trash2 } from 'lucide-react'; // Import icons

export default function StarredList({ starredItems, onToggleStarred, onMoveToTrash }) {
  // Common class for action buttons to ensure consistent padding and size
  const actionButtonClass = "p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0";
  const actionIconSize = 18; // Consistent icon size for actions

  if (!starredItems || starredItems.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md mb-6 p-6 min-h-[300px]">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">No starred items found.</p>
          <p>Star important emails and drafts to see them here!</p>
        </div>
      </div>
    );
  }

  const getItemPreview = (item) => {
    switch (item.type) {
      case 'inbox':
        return `From: ${item.sender || 'Unknown'} - ${item.subject || '(No Subject)'}`;
      case 'sent':
        return `To: ${Array.isArray(item.recipients) ? item.recipients.join(', ') : item.recipients || 'Unknown'} - ${item.subject || '(No Subject)'}`;
      case 'draft':
        return `Draft: ${item.recipient_email ? `To: ${item.recipient_email}` : '(No Recipients)'} - ${item.subject || '(No Subject)'}`;
      default:
        return 'Unknown Item';
    }
  };

  const getItemIcon = (item) => {
    switch (item.type) {
      case 'inbox': return <Mail size={16} className="text-blue-500" />;
      case 'sent': return <Send size={16} className="text-green-500" />;
      case 'draft': return <FileText size={16} className="text-purple-500" />;
      default: return null;
    }
  };

  const getAttachmentIcon = (item) => {
    if (item.type === 'draft' && Array.isArray(item.attachments_info) && item.attachments_info.length > 0) {
      return <Paperclip size={14} className="text-gray-400" title="Has attachments" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow flex flex-col min-h-0">
      <div className="px-4 sm:px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Starred</h2>
        <p className="text-sm text-gray-600 mt-1">Your most important emails and drafts.</p>
      </div>
      <ul className="divide-y divide-gray-200 overflow-y-auto flex-grow">
        {starredItems.map((item) => (
          <li key={`${item.type}-${item.id}`} className="p-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-grow min-w-0">
                {/* Item Type & Preview */}
                <div className="flex items-center gap-2 mb-1">
                  {getItemIcon(item)}
                  <span className="font-semibold text-gray-700 capitalize text-sm sm:text-base">{item.type}</span>
                  <span className="text-sm sm:text-base text-gray-500 truncate min-w-0 flex-grow">
                    {getItemPreview(item)}
                  </span>
                  {getAttachmentIcon(item)}
                </div>
                {/* Body Preview */}
                <p className="text-sm text-gray-600 line-clamp-1 truncate min-w-0">
                  {item.plain_body || (item.body_html ? item.body_html.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '(No Body)')}
                </p>
                {/* Date */}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(item.last_saved_at || item.received_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4 self-end sm:self-center">
                {/* Star Button (to unstar) */}
                <button
                  onClick={() => onToggleStarred(item.type, item.id, item.is_starred, item.type === 'draft' ? null : item.type)}
                  className={`${actionButtonClass} text-yellow-500`}
                  title="Unstar"
                >
                  <Star size={actionIconSize} fill="currentColor" />
                </button>
                {/* Move to Trash Button */}
                <button
                  onClick={() => onMoveToTrash(item.type, item.id, item.type === 'draft' ? null : item.type)}
                  className={`${actionButtonClass} text-red-600 hover:bg-red-100`}
                  title="Move to Trash"
                >
                  <Trash2 size={actionIconSize} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
