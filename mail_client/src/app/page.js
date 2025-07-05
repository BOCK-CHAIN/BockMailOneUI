// my-email-frontend/app/page.js
'use client';

import { useState, useEffect, useMemo } from 'react';
import apiClient from './api/client';
import { useAuth } from './hooks/useAuth';

import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import EmailList from './components/EmailList';

import dynamic from 'next/dynamic';
const DynamicComposeForm = dynamic(() => import('./components/ComposeForm'), { ssr: false });


export default function Home() {
  const { isLoggedIn, userEmail, authMessage, login, register, logout, setAuthMessage } = useAuth();

  const [allInboxEmails, setAllInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox');
  const [activeInboxCategory, setActiveInboxCategory] = useState('Primary'); // Default to Primary
  const [appMessage, setAppMessage] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmails('inbox'); // Fetch all inbox emails
      fetchEmails('sent');
    } else {
      setAllInboxEmails([]);
      setSentEmails([]);
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

  const handleSendEmail = async (to, subject, bodyHtml, attachments) => {
    try {
      const formData = new FormData();
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('bodyHtml', bodyHtml);

      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      const res = await apiClient.post('/api/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAppMessage(res.data.message);
      fetchEmails('sent');
      setActiveTab('sent');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email!';
      setAppMessage(msg);
      console.error('Failed to send email:', err);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // This handler will be passed to EmailList
  const handleInboxCategoryChange = (category) => {
    setActiveInboxCategory(category);
    setActiveTab('inbox'); // Ensure inbox tab is active when a category is selected
  };

  // Memoized filtered inbox emails based on activeInboxCategory
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
      inboxCount={allInboxEmails.length} // Layout shows total inbox count
      sentCount={sentEmails.length}
    >
      {appMessage && <p className="mb-4 text-center text-green-600">{appMessage}</p>}

      {activeTab === 'compose' && (
        <DynamicComposeForm
          onSendEmail={handleSendEmail}
          message={appMessage}
        />
      )}

      {activeTab === 'inbox' && (
        <EmailList
          emails={filteredInboxEmails} // Pass filtered emails
          type="inbox"
          activeInboxCategory={activeInboxCategory} // Pass active category
          onInboxCategoryChange={handleInboxCategoryChange} // Pass handler
        />
      )}

      {activeTab === 'sent' && (
        <EmailList
          emails={sentEmails}
          type="sent"
        />
      )}
    </Layout>
  );
}