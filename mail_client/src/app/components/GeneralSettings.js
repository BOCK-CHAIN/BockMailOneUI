// my-email-frontend/app/components/GeneralSettings.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Plus, Edit, Trash2, X } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const SettingsSection = ({ title, description, children }) => (
  <div className="py-6 border-b border-gray-200 last:border-b-0">
    <div className="flex flex-col md:flex-row md:items-start md:gap-8">
      <div className="md:w-1/3 mb-2 md:mb-0">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="md:w-2/3">
        {children}
      </div>
    </div>
  </div>
);

// New Modal component for creating/editing signatures
const SignatureModal = ({ signature, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setName(signature?.name || '');
    setContent(signature?.content || '');
  }, [signature]);

  const handleSave = () => {
    onSave({ ...signature, name, content });
  };

  return (
    // --- THIS IS THE UPDATED LINE ---
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 animate-fade-in-down">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{signature?.id ? 'Edit signature' : 'Create new signature'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Signature name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <textarea
            placeholder="Signature content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          ></textarea>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
};

export default function GeneralSettings({ initialSettings, onSave,onSignatureAction }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const fileInputRef = useRef(null);
   // State for the signature modal
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingSignature, setEditingSignature] = useState(null);

  useEffect(() => {
    setSettings(initialSettings || {});
    if (initialSettings?.profile_picture_url) {
      setProfilePicPreview(`${BACKEND_URL}${initialSettings.profile_picture_url}`);
    } else {
      setProfilePicPreview(null);
    }
  }, [initialSettings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePicPreview(previewUrl);
      setProfilePicFile(file);
    }
  };

  const handleCreateSignature = () => {
    setEditingSignature(null); // Ensure we are creating, not editing
    setIsModalOpen(true);
  };

  const handleEditSignature = (signature) => {
    setEditingSignature(signature);
    setIsModalOpen(true);
  };

  const handleSaveSignature = (signatureData) => {
    // Pass action to parent (page.js) to handle API call
    if (signatureData.id) {
      onSignatureAction('update', signatureData);
    } else {
      onSignatureAction('create', signatureData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteSignature = (signatureId) => {
    if (window.confirm('Are you sure you want to delete this signature?')) {
      onSignatureAction('delete', { id: signatureId });
    }
  };

    const signatures = initialSettings?.signatures || [];

  const handleSave = () => {
    onSave(settings, profilePicFile);
  };

  const userInitial = initialSettings?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <div>
      {isModalOpen && (
        <SignatureModal
          signature={editingSignature}
          onSave={handleSaveSignature}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <h3 className="text-xl font-semibold mb-4 text-gray-800">General Settings</h3>
      
      <SettingsSection
        title="Maximum page size"
        description="The number of conversations to show per page."
      >
        <select
          // --- FIX 1: Use correct key 'max_page_size' ---
          value={settings.max_page_size || 50}
          onChange={(e) => handleSettingChange('max_page_size', parseInt(e.target.value))}
          className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </SettingsSection>

      <SettingsSection
        title="Undo Send"
        description="Set a cancellation period for sent messages."
      >
        <select
          // --- FIX 2: Use correct key 'undo_send_delay' ---
          value={settings.undo_send_delay || 5}
          onChange={(e) => handleSettingChange('undo_send_delay', parseInt(e.target.value))}
          className="block w-48 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value={5}>5 seconds</option>
          <option value={10}>10 seconds</option>
          <option value={20}>20 seconds</option>
          <option value={30}>30 seconds</option>
        </select>
      </SettingsSection>
      
      <SettingsSection
        title="Profile Picture"
        description="Change your profile picture."
      >
        <div className="flex items-center gap-4">
          <img 
            src={profilePicPreview || `https://placehold.co/96x96/E2E8F0/4A5568?text=${userInitial}`}
            alt="Profile Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/96x96/E2E8F0/4A5568?text=${userInitial}`}}
          />
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePicChange}
            accept="image/png, image/jpeg, image/gif"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Change
          </button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Signature"
        description="Appended at the end of all outgoing messages."
      >
        <div className="space-y-6">
          {/* Signature List */}
          <div className="space-y-2">
            {signatures.map(sig => (
              <div key={sig.id} className="p-3 bg-gray-50 rounded-md border flex justify-between items-center">
                <span className="font-medium text-gray-800">{sig.name}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditSignature(sig)} className="text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteSignature(sig.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleCreateSignature}
            className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-md hover:border-gray-400 hover:text-gray-800 transition-all"
          >
            <Plus size={18} />
            <span>Create new</span>
          </button>

          {/* Signature Defaults */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700">Signature defaults</h4>
            <div className="flex items-center gap-4">
              <label htmlFor="sig-new" className="w-40">For new emails use:</label>
              <select
                id="sig-new"
                value={settings.default_signature_new || 0}
                onChange={(e) => handleSettingChange('default_signature_new', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md"
              >
                <option value={0}>No Signature</option>
                {signatures.map(sig => <option key={sig.id} value={sig.id}>{sig.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label htmlFor="sig-reply" className="w-40">On reply/forward use:</label>
              <select
                id="sig-reply"
                value={settings.default_signature_reply || 0}
                onChange={(e) => handleSettingChange('default_signature_reply', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md"
              >
                <option value={0}>No Signature</option>
                {signatures.map(sig => <option key={sig.id} value={sig.id}>{sig.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      </SettingsSection>

      <div className="mt-8 flex justify-end">
        <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
        >
            <Save size={18} />
            <span>Save General Settings</span>
        </button>
      </div>
    </div>
  );
}
