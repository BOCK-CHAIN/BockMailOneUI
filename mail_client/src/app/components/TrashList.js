// my-email-frontend/app/components/TrashList.js
'use client';

import React from 'react';
import { format } from 'date-fns';
import { Undo2, Trash2, Mail, Send, FileText, Paperclip } from 'lucide-react'; // Icons for restore, permanent delete, email types

export default function TrashList({ trashedItems, onRestore, onPermanentDelete }) {
  // Common class for action buttons to ensure consistent padding and size
  const actionButtonClass = "p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors flex-shrink-0";
  const actionIconSize = 18; // Consistent icon size for actions

  if (!trashedItems || trashedItems.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-white rounded-lg shadow-md mb-6 p-6 min-h-[300px]">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold mb-2">Your trash is empty.</p>
          <p>Items you delete will appear here.</p>
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
    // For sent/inbox items, we might check original `attachments` field if stored
    // For now, only checking draft attachments_info
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow flex flex-col min-h-0">
      <div className="px-4 sm:px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Trash</h2>
        <p className="text-sm text-gray-600 mt-1">Items in trash will be permanently deleted after 30 days.</p>
      </div>
      <ul className="divide-y divide-gray-200 overflow-y-auto flex-grow">
        {trashedItems.map((item) => (
          <li key={`${item.type}-${item.id}`} className="p-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-grow min-w-0"> {/* min-w-0 for flex items to prevent overflow */}
                {/* Item Type & Preview */}
                <div className="flex items-center gap-2 mb-1">
                  {getItemIcon(item)}
                  <span className="font-semibold text-gray-700 capitalize text-sm sm:text-base">{item.type}</span>
                  <span className="text-sm sm:text-base text-gray-500 truncate min-w-0 flex-grow"> {/* flex-grow added */}
                    {getItemPreview(item)}
                  </span>
                  {getAttachmentIcon(item)}
                </div>
                {/* Body Preview */}
                <p className="text-sm text-gray-600 line-clamp-1 truncate min-w-0">
                  {item.plain_body || (item.body_html ? item.body_html.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '(No Body)')}
                </p>
                {/* Trashed Date */}
                <p className="text-xs text-gray-400 mt-1">
                  Trashed: {format(new Date(item.last_saved_at || item.received_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex-shrink-0 flex items-center gap-2 mt-2 sm:mt-0 ml-0 sm:ml-4 self-end sm:self-center">
                {/* Restore Button */}
                <button
                  onClick={() => onRestore(item.type, item.id, item.folder)}
                  className={`${actionButtonClass} text-blue-600 hover:bg-blue-100`}
                  title="Restore"
                >
                  <Undo2 size={actionIconSize} />
                </button>
                {/* Permanent Delete Button */}
                <button
                  onClick={() => onPermanentDelete(item.type, item.id, item.type === 'email' ? item.folder : null)}
                  className={`${actionButtonClass} text-red-600 hover:bg-red-100`}
                  title="Delete Permanently"
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
