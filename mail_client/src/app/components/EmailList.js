import React from 'react';

export default function EmailList({ emails, type }) {
  const isSent = type === 'sent';
  const title = isSent ? 'Sent Mail' : 'Inbox';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold border-b pb-4 mb-6 text-gray-800">{title}</h2>
      {emails.length === 0 ? (
        <p className="text-gray-600">No messages in {type} {type === 'sent' ? 'mail' : 'inbox'}.</p>
      ) : (
        <ul className="list-none p-0">
          {emails.map((mail) => (
            <li key={mail.id} className="bg-white border border-gray-200 p-4 mb-3 rounded-md shadow-sm">
              <strong className="text-blue-700">{isSent ? 'To:' : 'From:'}</strong> {isSent ? mail.recipients.join(', ') : mail.sender}<br />
              <strong className="text-gray-800">Subject:</strong> {mail.subject}<br />
              <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap">{mail.plain_body?.substring(0, 200) || 'No body content'}...</p>
              <small className="text-gray-500 text-xs">{new Date(mail.received_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}