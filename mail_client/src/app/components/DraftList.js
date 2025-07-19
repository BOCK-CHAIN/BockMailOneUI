// my-email-frontend/app/components/DraftList.js
'use client';

import React from 'react';
import { format } from 'date-fns'; // For date formatting
import { Edit, Trash2, Paperclip, Star } from 'lucide-react'; // Import Star icon

export default function DraftList({ drafts, onEditDraft, onDeleteDraft, onToggleStarred }) { // Added onToggleStarred prop
  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg font-semibold mb-2">No drafts found.</p>
        <p>Start composing a new email to save a draft!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Drafts</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {drafts.map((draft) => (
          <li key={draft.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <div className="flex-grow cursor-pointer" onClick={() => onEditDraft(draft)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-700">Draft</span>
                  <span className="text-sm text-gray-500 truncate">
                    {draft.recipient_email ? `To: ${draft.recipient_email}` : '(No Recipients)'}
                  </span>
                  {/* Check if attachments_info is an array and has items */}
                  {Array.isArray(draft.attachments_info) && draft.attachments_info.length > 0 && (
                    <Paperclip size={14} className="text-gray-400" title="Has attachments" />
                  )}
                </div>
                <p className="text-gray-800 font-medium mb-1 truncate">
                  {draft.subject || '(No Subject)'}
                </p>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {/* Display a snippet of the body, strip HTML tags for cleaner preview */}
                  {draft.body_html ? draft.body_html.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '(Empty Draft)'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last saved: {format(new Date(draft.last_saved_at), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 ml-4">
                {/* NEW: Star Button */}
                <button
                  onClick={(e) => { // Stop propagation to prevent editing the draft when starring
                    e.stopPropagation();
                    onToggleStarred('draft', draft.id, draft.is_starred); // Pass 'draft' as itemType
                  }}
                  className={`p-2 rounded-full ${draft.is_starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'} transition-colors`}
                  title={draft.is_starred ? 'Unstar Draft' : 'Star Draft'}
                >
                  <Star size={18} fill={draft.is_starred ? 'currentColor' : 'none'} />
                </button>
                {/* Edit Button */}
                <button
                  onClick={() => onEditDraft(draft)}
                  className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Edit Draft"
                >
                  <Edit size={18} />
                </button>
                {/* Delete Button */}
                <button
                  onClick={() => onDeleteDraft(draft.id)}
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
    </div>
  );
}
