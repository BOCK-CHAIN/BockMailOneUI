// my-email-frontend/app/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from './api/client';
import { useAuth } from './hooks/useAuth';

import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import EmailList from './components/EmailList';
import DraftList from './components/DraftList';
import TrashList from './components/TrashList'; // NEW: Import TrashList

import dynamic from 'next/dynamic';
const DynamicComposeForm = dynamic(() => import('./components/ComposeForm'), { ssr: false });


export default function Home() {
  const { isLoggedIn, userEmail, authMessage, login, register, logout, setAuthMessage } = useAuth();

  const [allInboxEmails, setAllInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [activeInboxCategory, setActiveInboxCategory] = useState('Primary');
  const [appMessage, setAppMessage] = useState('');

  // States for compose window visibility and modes
  const [showComposeWindow, setShowComposeWindow] = useState(false);
  const [isComposeMinimized, setIsComposeMinimized] = useState(false);
  const [isComposeMaximized, setIsComposeMaximized] = useState(false);

  // STATES FOR DRAFTS
  const [drafts, setDrafts] = useState([]);
  const [selectedDraft, setSelectedDraft] = useState(null); // Holds the draft object being edited

  // NEW STATE FOR TRASH
  const [trashedItems, setTrashedItems] = useState([]);


  useEffect(() => {
    if (isLoggedIn) {
      fetchEmails('inbox');
      fetchEmails('sent');
      fetchDrafts();
      fetchTrashedItems(); // NEW: Fetch trashed items on login
    } else {
      setAllInboxEmails([]);
      setSentEmails([]);
      setDrafts([]);
      setTrashedItems([]); // NEW: Clear trashed items on logout
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (authMessage) {
      const timer = setTimeout(() => setAuthMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [authMessage, setAuthMessage]);

  useEffect(() => {
    if (appMessage) {
      const timer = setTimeout(() => setAppMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [appMessage]);

  const handleLogin = async (email, password) => {
    const result = await login(email, password);
    if (result.success) {
      setAppMessage("Login successful! Loading emails...");
    }
  };

  const handleRegister = async (name, email, password, confirmPassword) => {
    const result = await register(name, email, password, confirmPassword);
    if (result.success) {
      setAppMessage("Registration successful! You can now log in.");
    }
  };

  const fetchEmails = async (type) => {
    try {
      const res = await apiClient.get(`/api/emails?type=${type}`);
      if (type === 'inbox') {
        setAllInboxEmails(res.data);
      } else {
        setSentEmails(res.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} emails:`, err);
      setAppMessage(`Failed to fetch ${type} emails.`);
    }
  };

  // Fetch Drafts
  const fetchDrafts = async () => {
    try {
      const res = await apiClient.get('/api/drafts');
      setDrafts(res.data);
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
      setAppMessage('Failed to fetch drafts.');
    }
  };

  // NEW: Fetch Trashed Items
  const fetchTrashedItems = async () => {
    try {
      const res = await apiClient.get('/api/trash');
      setTrashedItems(res.data);
    } catch (err) {
      console.error('Failed to fetch trashed items:', err);
      setAppMessage('Failed to fetch trashed items.');
    }
  };

  // Handle sending an email (now accepts draftIdToClear)
  const handleSendEmail = async (to, subject, bodyHtml, attachments, scheduledAt = null, draftIdToClear = null) => {
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('bodyHtml', bodyHtml);
      
      // Append draftIdToClear if available
      if (draftIdToClear) {
        formData.append('draftIdToClear', draftIdToClear);
      }

      if (scheduledAt) {
        formData.append('scheduledAt', scheduledAt);
        setAppMessage(`Email scheduled for ${new Date(scheduledAt).toLocaleString()}.`);
      } else {
        setAppMessage("Sending email...");
      }

      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file.fileObject); // Use fileObject for actual upload
      });

      const res = await apiClient.post('/api/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (!scheduledAt) {
        setAppMessage(res.data.message);
      }
      fetchEmails('sent');
      fetchDrafts(); // Re-fetch drafts after sending (in case one was cleared)
      fetchTrashedItems(); // NEW: Re-fetch trashed items (if a draft was moved to trash)
      setActiveTab('sent');
      setShowComposeWindow(false);
      setIsComposeMinimized(false);
      setIsComposeMaximized(false);
      setSelectedDraft(null); // Clear selected draft after sending
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email!';
      setAppMessage(msg);
      console.error('Failed to send email:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'compose') {
      setShowComposeWindow(true);
      setIsComposeMinimized(false); // Ensure it's not minimized when opened
      setIsComposeMaximized(false); // Ensure it's not maximized when opened
      setSelectedDraft(null); // Clear selected draft when starting a new compose
    }
    // The compose window will now only close when its 'X' button is clicked,
    // or when an email is sent from it.
    
    if (tab === 'drafts') {
      fetchDrafts();
    } else if (tab === 'trash') { // NEW: Fetch trashed items when trash tab is opened
      fetchTrashedItems();
    }
  };

  // Toggle minimize state
  const handleMinimizeToggle = () => {
    setIsComposeMinimized(prev => !prev);
    if (isComposeMaximized) {
      setIsComposeMaximized(false);
    }
  };

  // Toggle maximize state
  const handleMaximizeToggle = () => {
    setIsComposeMaximized(prev => !prev);
    if (isComposeMinimized) {
      setIsComposeMinimized(false);
    }
  };

  // Function to minimize compose window, passed to Layout
  const handleMinimizeCompose = () => {
    if (showComposeWindow && !isComposeMinimized) {
      setIsComposeMinimized(true);
      setIsComposeMaximized(false);
    }
  };

  // Function to edit a draft
  const handleEditDraft = (draft) => {
    setSelectedDraft(draft);
    setShowComposeWindow(true);
    setIsComposeMinimized(false);
    setIsComposeMaximized(false);
    setActiveTab('compose'); // Set active tab to compose when editing a draft
  };

  // NEW: Function to move an email (inbox/sent) or draft to trash
  const handleMoveToTrash = async (itemType, itemId, emailType = null) => {
    try {
      if (itemType === 'draft') {
        await apiClient.post('/api/trash/draft', { draftId: itemId });
        setAppMessage('Draft moved to trash!');
        fetchDrafts(); // Re-fetch drafts to remove it from the list
        // If the trashed draft was the one being edited, close compose form
        if (selectedDraft && selectedDraft.id === itemId) {
          setShowComposeWindow(false);
          setSelectedDraft(null);
        }
      } else if (itemType === 'email') {
        if (!emailType) {
          console.error("emailType (sent/inbox) is required for moving email to trash.");
          setAppMessage("Error: Email type missing for trash.");
          return;
        }
        await apiClient.post('/api/trash/email', { emailId: itemId, emailType: emailType });
        setAppMessage('Email moved to trash!');
        fetchEmails('inbox'); // Re-fetch inbox and sent to remove it from there
        fetchEmails('sent');
      }
      fetchTrashedItems(); // Always re-fetch trash list
    } catch (err) {
      console.error(`Failed to move ${itemType} to trash:`, err);
      setAppMessage(`Failed to move ${itemType} to trash.`);
    }
  };

  // NEW: Function to permanently delete an item from trash
  const handlePermanentDelete = async (itemType, itemId, emailType = null) => {
    try {
      if (itemType === 'draft') {
        await apiClient.delete(`/api/trash/drafts/${itemId}`);
        setAppMessage('Draft permanently deleted!');
      } else if (itemType === 'email') {
        if (!emailType) {
          console.error("emailType (sent/inbox) is required for permanent email deletion.");
          setAppMessage("Error: Email type missing for permanent delete.");
          return;
        }
        await apiClient.delete(`/api/trash/emails/${itemId}?type=${emailType}`);
        setAppMessage('Email permanently deleted!');
      }
      fetchTrashedItems(); // Re-fetch trash list
    } catch (err) {
      console.error(`Failed to permanently delete ${itemType}:`, err);
      setAppMessage(`Failed to permanently delete ${itemType}.`);
    }
  };

  // NEW: Function to restore an item from trash
  const handleRestoreFromTrash = async (itemType, itemId, originalFolder = null) => {
    try {
      if (itemType === 'draft') {
        // For drafts, we can just save it again with is_trashed=FALSE
        // Or, if your backend has a dedicated restore endpoint, use that.
        // For now, we'll assume saving a draft automatically untrashes it.
        // Or, we can create a specific endpoint for restoring.
        // Let's make a dedicated restore endpoint for clarity.
        await apiClient.post('/api/trash/restore/draft', { draftId: itemId });
        setAppMessage('Draft restored from trash!');
        fetchDrafts(); // Re-fetch drafts to show it there
      } else if (itemType === 'email') {
        if (!originalFolder) {
          console.error("Original folder (sent/inbox) is required for restoring email.");
          setAppMessage("Error: Original folder missing for restore.");
          return;
        }
        await apiClient.post('/api/trash/restore/email', { emailId: itemId, originalFolder: originalFolder });
        setAppMessage('Email restored from trash!');
        fetchEmails('inbox'); // Re-fetch inbox and sent
        fetchEmails('sent');
      }
      fetchTrashedItems(); // Re-fetch trash list
    } catch (err) {
      console.error(`Failed to restore ${itemType} from trash:`, err);
      setAppMessage(`Failed to restore ${itemType} from trash.`);
    }
  };


  const handleInboxCategoryChange = (category) => {
    setActiveInboxCategory(category);
    setActiveTab('inbox');
  };

  const filteredInboxEmails = useMemo(() => {
    if (activeInboxCategory === 'all') {
      return allInboxEmails;
    }
    return allInboxEmails.filter(mail => (mail.category || 'Primary') === activeInboxCategory);
  }, [allInboxEmails, activeInboxCategory]);


  if (!isLoggedIn) {
    return (
      <AuthForm
        onLogin={handleLogin}
        onRegister={handleRegister}
        message={authMessage}
      />
    );
  }

  return (
    <Layout
      userEmail={userEmail}
      onLogout={logout}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      inboxCount={allInboxEmails.length}
      sentCount={sentEmails.length}
      onMinimizeCompose={handleMinimizeCompose}
    >
      {appMessage && <p className="mb-4 text-center text-green-600">{appMessage}</p>}

      {/* Conditionally render the floating ComposeForm */}
      {showComposeWindow && (
        <DynamicComposeForm
          onSendEmail={handleSendEmail}
          message={appMessage}
          onClose={() => { setShowComposeWindow(false); setIsComposeMinimized(false); setIsComposeMaximized(false); setSelectedDraft(null); }}
          onMinimizeToggle={handleMinimizeToggle}
          isMinimized={isComposeMinimized}
          onMaximizeToggle={handleMaximizeToggle}
          isMaximized={isComposeMaximized}
          initialDraft={selectedDraft}
          onDraftSaved={fetchDrafts}
          onMoveDraftToTrash={(draftIdToTrash) => { // NEW: Pass handler for ComposeForm's delete
            handleMoveToTrash('draft', draftIdToTrash);
            setShowComposeWindow(false); // Close compose form after moving to trash
            setSelectedDraft(null);
          }}
        />
      )}

      {activeTab === 'inbox' && (
        <EmailList
          emails={filteredInboxEmails}
          type="inbox"
          onMoveEmailToTrash={(emailId) => handleMoveToTrash('email', emailId, 'inbox')} // NEW: Pass handler
          activeInboxCategory={activeInboxCategory}
          onInboxCategoryChange={handleInboxCategoryChange}
        />
      )}

      {activeTab === 'sent' && (
        <EmailList
          emails={sentEmails}
          type="sent"
          onMoveEmailToTrash={(emailId) => handleMoveToTrash('email', emailId, 'sent')} // NEW: Pass handler
        />
      )}

      {activeTab === 'drafts' && (
        <DraftList
          drafts={drafts}
          onEditDraft={handleEditDraft}
          onDeleteDraft={(draftId) => handleMoveToTrash('draft', draftId)} // NEW: Use move to trash
        />
      )}

      {/* NEW: Render TrashList when activeTab is 'trash' */}
      {activeTab === 'trash' && (
        <TrashList
          trashedItems={trashedItems}
          onRestore={handleRestoreFromTrash}
          onPermanentDelete={handlePermanentDelete}
        />
      )}

      {/* Placeholder for other tabs if they don't have dedicated components yet */}
      {activeTab === 'scheduled' && <div className="text-center text-gray-600">Scheduled emails will appear here.</div>}
      {activeTab === 'spam' && <div className="text-center text-gray-600">Spam messages will appear here.</div>}
    </Layout>
  );
}
