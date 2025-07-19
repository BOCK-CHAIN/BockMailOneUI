// my-email-frontend/app/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from './api/client';
import { useAuth } from './hooks/useAuth';

import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import EmailList from './components/EmailList';
import DraftList from './components/DraftList';
import TrashList from './components/TrashList';
import StarredList from './components/StarredList'; // NEW: Import StarredList

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
  const [selectedDraft, setSelectedDraft] = useState(null);

  // STATE FOR TRASH
  const [trashedItems, setTrashedItems] = useState([]);

  // NEW STATE FOR STARRED ITEMS
  const [starredItems, setStarredItems] = useState([]);


  useEffect(() => {
    if (isLoggedIn) {
      fetchEmails('inbox');
      fetchEmails('sent');
      fetchDrafts();
      fetchTrashedItems();
      fetchStarredItems(); // NEW: Fetch starred items on login
    } else {
      setAllInboxEmails([]);
      setSentEmails([]);
      setDrafts([]);
      setTrashedItems([]);
      setStarredItems([]); // NEW: Clear starred items on logout
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

  // Fetch Trashed Items
  const fetchTrashedItems = async () => {
    try {
      const res = await apiClient.get('/api/trash');
      setTrashedItems(res.data);
    } catch (err) {
      console.error('Failed to fetch trashed items:', err);
      setAppMessage('Failed to fetch trashed items.');
    }
  };

  // NEW: Fetch Starred Items
  const fetchStarredItems = async () => {
    try {
      const res = await apiClient.get('/api/starred');
      setStarredItems(res.data);
    } catch (err) {
      console.error('Failed to fetch starred items:', err);
      setAppMessage('Failed to fetch starred items.');
    }
  };

  // Handle sending an email (now accepts draftIdToClear)
  const handleSendEmail = async (to, subject, bodyHtml, attachments, scheduledAt = null, draftIdToClear = null) => {
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('bodyHtml', bodyHtml);
      
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
        formData.append(`attachments[${index}]`, file.fileObject);
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
      fetchDrafts();
      fetchTrashedItems();
      fetchStarredItems(); // NEW: Re-fetch starred items after sending (if a starred draft was sent)
      setActiveTab('sent');
      setShowComposeWindow(false);
      setIsComposeMinimized(false);
      setIsComposeMaximized(false);
      setSelectedDraft(null);
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
      setIsComposeMinimized(false);
      setIsComposeMaximized(false);
      setSelectedDraft(null);
    }
    
    if (tab === 'drafts') {
      fetchDrafts();
    } else if (tab === 'trash') {
      fetchTrashedItems();
    } else if (tab === 'starred') { // NEW: Fetch starred items when starred tab is opened
      fetchStarredItems();
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
    setActiveTab('compose');
  };

  // Function to move an email (inbox/sent) or draft to trash
  const handleMoveToTrash = async (itemType, itemId, emailType = null) => {
    try {
      if (itemType === 'draft') {
        await apiClient.post('/api/trash/draft', { draftId: itemId });
        setAppMessage('Draft moved to trash!');
        fetchDrafts();
        if (selectedDraft && selectedDraft.id === itemId) {
          setShowComposeWindow(false);
          setSelectedDraft(null);
        }
      } else if (itemType === 'inbox' || itemType === 'sent') {
        if (!emailType) {
          console.error("emailType (sent/inbox) is required for moving email to trash.");
          setAppMessage("Error: Email type missing for trash.");
          return;
        }
        await apiClient.post('/api/trash/email', { emailId: itemId, emailType: emailType });
        setAppMessage('Email moved to trash!');
        fetchEmails('inbox');
        fetchEmails('sent');
      }
      fetchTrashedItems();
      fetchStarredItems(); // NEW: Re-fetch starred items (if a starred item was trashed)
    } catch (err) {
      console.error(`Failed to move ${itemType} to trash:`, err);
      setAppMessage(`Failed to move ${itemType} to trash.`);
    }
  };

  // Function to permanently delete an item from trash
  const handlePermanentDelete = async (itemType, itemId, emailType = null) => {
    try {
      if (itemType === 'draft') {
        await apiClient.delete(`/api/trash/drafts/${itemId}`);
        setAppMessage('Draft permanently deleted!');
      } else if (itemType === 'inbox' || itemType === 'sent') {
        if (!emailType) {
          console.error("emailType (sent/inbox) is required for permanent email deletion.");
          setAppMessage("Error: Email type missing for permanent delete.");
          return;
        }
        await apiClient.delete(`/api/trash/emails/${itemId}?type=${emailType}`);
        setAppMessage('Email permanently deleted!');
      }
      fetchTrashedItems();
      fetchStarredItems(); // NEW: Re-fetch starred items (if a starred item was permanently deleted from trash)
    } catch (err) {
      console.error(`Failed to permanently delete ${itemType}:`, err);
      setAppMessage(`Failed to permanently delete ${itemType}.`);
    }
  };

  // Function to restore an item from trash
  const handleRestoreFromTrash = async (itemType, itemId, originalFolder = null) => {
    try {
      if (itemType === 'draft') {
        await apiClient.post('/api/trash/restore/draft', { draftId: itemId });
        setAppMessage('Draft restored from trash!');
        fetchDrafts();
      } else if (itemType === 'inbox' || itemType === 'sent') {
        console.log('Restoring email from trash...');
        if (!originalFolder) {
          console.error("Original folder (sent/inbox) is required for restoring email.");
          setAppMessage("Error: Original folder missing for restore.");
          return;
        }
        await apiClient.post('/api/trash/restore/email', { emailId: itemId, originalFolder: originalFolder });
        setAppMessage('Email restored from trash!');
        fetchEmails('inbox');
        fetchEmails('sent');
      }
      fetchTrashedItems();
      fetchStarredItems(); // NEW: Re-fetch starred items (if a starred item was restored)
    } catch (err) {
      console.error(`Failed to restore ${itemType} from trash:`, err);
      setAppMessage(`Failed to restore ${itemType} from trash.`);
    }
  };

  // NEW: Function to toggle starred status for any item type
  const handleToggleStarred = async (itemType, itemId, currentStarredStatus, emailType = null) => {
    try {
      const newStarredStatus = !currentStarredStatus;
      let result;

      if (itemType === 'draft') {
        result = await apiClient.patch('/api/starred/draft', { draftId: itemId, isStarred: newStarredStatus });
        setAppMessage(`Draft ${newStarredStatus ? 'starred' : 'unstarred'}!`);
        fetchDrafts(); // Re-fetch drafts to update their starred status
      } else if (itemType === 'inbox' || itemType === 'sent') {
        if (!emailType) {
          console.error("Email type (sent/inbox) is required for toggling starred status.");
          setAppMessage("Error: Email type missing for star toggle.");
          return;
        }
        result = await apiClient.patch('/api/starred/email', { emailId: itemId, emailType: emailType, isStarred: newStarredStatus });
        setAppMessage(`Email ${newStarredStatus ? 'starred' : 'unstarred'}!`);
        fetchEmails('inbox'); // Re-fetch emails to update their starred status
        fetchEmails('sent');
      } else {
        console.error("Invalid item type for toggling starred status.");
        setAppMessage("Error: Invalid item type for star toggle.");
        return;
      }
      fetchStarredItems(); // Always re-fetch starred items to update the starred list
    } catch (err) {
      console.error(`Failed to toggle starred status for ${itemType}:`, err);
      setAppMessage(`Failed to toggle starred status for ${itemType}.`);
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
          onMoveDraftToTrash={(draftIdToTrash) => {
            handleMoveToTrash('draft', draftIdToClear);
            setShowComposeWindow(false);
            setSelectedDraft(null);
          }}
          onToggleStarred={handleToggleStarred} // NEW: Pass star toggle handler
        />
      )}

      {activeTab === 'inbox' && (
        <EmailList
          emails={filteredInboxEmails}
          type="inbox"
          onMoveEmailToTrash={(emailId) => handleMoveToTrash('inbox', emailId, 'inbox')}
          onToggleStarred={(emailId, currentStarredStatus) => handleToggleStarred('inbox', emailId, currentStarredStatus, 'inbox')} // NEW: Pass star toggle handler
          activeInboxCategory={activeInboxCategory}
          onInboxCategoryChange={handleInboxCategoryChange}
        />
      )}

      {activeTab === 'sent' && (
        <EmailList
          emails={sentEmails}
          type="sent"
          onMoveEmailToTrash={(emailId) => handleMoveToTrash('sent', emailId, 'sent')}
          onToggleStarred={(emailId, currentStarredStatus) => handleToggleStarred('sent', emailId, currentStarredStatus, 'sent')} // NEW: Pass star toggle handler
        />
      )}

      {activeTab === 'drafts' && (
        <DraftList
          drafts={drafts}
          onEditDraft={handleEditDraft}
          onDeleteDraft={(draftId) => handleMoveToTrash('draft', draftId)}
          onToggleStarred={handleToggleStarred} // NEW: Pass star toggle handler
        />
      )}

      {activeTab === 'trash' && (
        <TrashList
          trashedItems={trashedItems}
          onRestore={handleRestoreFromTrash}
          onPermanentDelete={handlePermanentDelete}
        />
      )}

      {/* NEW: Render StarredList when activeTab is 'starred' */}
      {activeTab === 'starred' && (
        <StarredList
          starredItems={starredItems}
          onToggleStarred={handleToggleStarred} // Pass star toggle handler
          onMoveToTrash={handleMoveToTrash} // Allow moving starred items to trash
        />
      )}

      {activeTab === 'scheduled' && <div className="text-center text-gray-600">Scheduled emails will appear here.</div>}
      {activeTab === 'spam' && <div className="text-center text-gray-600">Spam messages will appear here.</div>}
    </Layout>
  );
}
