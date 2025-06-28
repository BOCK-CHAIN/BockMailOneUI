'use client';

import { useState, useEffect } from 'react';
import apiClient from './api/client';
import { useAuth } from './hooks/useAuth';

// Import Components
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import ComposeForm from './components/ComposeForm';
import EmailList from './components/EmailList';

export default function Home() {
  const { isLoggedIn, userEmail, authMessage, login, register, logout, setAuthMessage } = useAuth();

  const [inboxEmails, setInboxEmails] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'sent', 'compose'
  const [appMessage, setAppMessage] = useState(''); // Messages for email operations

  useEffect(() => {
    if (isLoggedIn) {
      // Pass token implicitly via apiClient interceptor now
      fetchEmails('inbox');
      fetchEmails('sent');
    } else {
      setInboxEmails([]);
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
        setInboxEmails(res.data);
      } else {
        setSentEmails(res.data);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type} emails:`, err);
      setAppMessage(`Failed to fetch ${type} emails.`);
    }
  };

  const handleSendEmail = async (to, subject, body) => {
    try {
      const res = await apiClient.post('/api/send-email', { to, subject, body });
      setAppMessage(res.data.message);
      fetchEmails('sent');
      setActiveTab('sent');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send email!';
      setAppMessage(msg);
      console.error('Failed to send email:', err);
    }
  };

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
      onTabChange={setActiveTab}
      inboxCount={inboxEmails.length}
      sentCount={sentEmails.length}
    >
      {appMessage && <p className="mb-4 text-center text-green-600">{appMessage}</p>}

      {activeTab === 'compose' && (
        <ComposeForm
          onSendEmail={handleSendEmail}
          message={appMessage}
        />
      )}

      {activeTab === 'inbox' && (
        <EmailList
          emails={inboxEmails}
          type="inbox"
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