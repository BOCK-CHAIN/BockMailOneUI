// my-email-frontend/app/components/ComposeForm.js
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperclip, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaUndo, FaRedo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaImage, FaTrash } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful';
import { Minus, Maximize2, Minimize2, X, Clock } from 'lucide-react';
import apiClient from '../api/client';

export default function ComposeForm({ onSendEmail, message, onClose, isMinimized, onMinimizeToggle, isMaximized, onMaximizeToggle, initialDraft, onDraftSaved, onMoveDraftToTrash, userSettings }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const editorRef = useRef(null);
  const [bodyHtml, setBodyHtml] = useState('');

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const colorPickerButtonRef = useRef(null);

  const imageInputRef = useRef(null);

  const [showScheduleOptions, setShowScheduleOptions] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const scheduleButtonRef = useRef(null);

  const [draftId, setDraftId] = useState(null);

  const execCommand = useCallback((command, value = null) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      setBodyHtml(editorRef.current.innerHTML);
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        editorRef.current.focus();
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        editorRef.current.focus();
      }
    }
  }, []);

  // --- NEW: Function to append signature using innerHTML ---
  const appendSignature = (signatureContent) => {
    if (!editorRef.current || !signatureContent) return;

    const signatureHtml = `<br><br>-- <br>${signatureContent.replace(/\n/g, '<br>')}`;
    const initialContent = signatureHtml;
    
    editorRef.current.innerHTML = initialContent;
    setBodyHtml(initialContent);

    // Place the cursor at the beginning of the editor
    const range = document.createRange();
    const sel = window.getSelection();
    if (editorRef.current.firstChild) {
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  // Effect to load initial draft content or apply signature for new compose
  useEffect(() => {
    if (initialDraft) {
      setDraftId(initialDraft.id);
      setTo(initialDraft.recipient_email || '');
      setSubject(initialDraft.subject || '');
      const draftBody = initialDraft.body_html || '';
      setBodyHtml(draftBody);
      if (editorRef.current) {
        editorRef.current.innerHTML = draftBody;
      }
      setAttachments(initialDraft.attachments_info ? JSON.parse(initialDraft.attachments_info).map(att => ({ name: att.name, size: att.size, fileObject: null })) : []);
      
      setShowCc(false);
      setCc('');
      setShowBcc(false);
      setBcc('');

    } else {
      // Logic for a new email
      setDraftId(null);
      setTo('');
      setSubject('');
      setCc('');
      setBcc('');
      setShowCc(false);
      setShowBcc(false);
      setAttachments([]);
      setScheduledDateTime('');

      // --- NEW: Find and apply the default signature for new emails ---
      const signatures = userSettings?.signatures || [];
      const defaultSigId = userSettings?.default_signature_new;
      const defaultSignature = signatures.find(sig => sig.id === defaultSigId);

      if (defaultSignature) {
        appendSignature(defaultSignature.content);
      } else {
        // If no default signature, ensure the editor is empty
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        setBodyHtml('');
      }
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, [initialDraft, userSettings]); // Depend on userSettings

  // Auto-save draft effect with debounce
  useEffect(() => {
    const autoSave = async () => {
      const hasContent = to || subject || bodyHtml || attachments.length > 0;
      if (hasContent || draftId) {
        try {
          const attachmentsInfoForSave = attachments.map(att => ({ name: att.name, size: att.size }));

          const payload = {
            id: draftId,
            recipient_email: to,
            subject: subject,
            body_html: bodyHtml,
            attachments_info: attachmentsInfoForSave,
          };
          const res = await apiClient.post('/api/drafts', payload);
          setDraftId(res.data.draftId);
          onDraftSaved();
        } catch (error) {
          console.error('Failed to auto-save draft:', error);
        }
      }
    };

    const handler = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [to, subject, bodyHtml, attachments, draftId, onDraftSaved]);


  // Close schedule options if clicked outside
  useEffect(() => {
    const handleClickOutsideSchedule = (event) => {
      if (scheduleButtonRef.current && !scheduleButtonRef.current.contains(event.target)) {
        setShowScheduleOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSchedule);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSchedule);
    };
  }, []);

  // Close color picker if clicked outside
  useEffect(() => {
    const handleClickOutsideColorPicker = (event) => {
      if (colorPickerButtonRef.current && !colorPickerButtonRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideColorPicker);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideColorPicker);
    };
  }, []);


  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...selectedFiles.map(file => ({ name: file.originalname || file.name, size: file.size, fileObject: file }))]);
    e.target.value = null;
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveCc = () => {
    setCc('');
    setShowCc(false);
  };

  const handleRemoveBcc = () => {
    setBcc('');
    setShowBcc(false);
  };

  const setLink = useCallback(() => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const addImage = useCallback(() => {
    imageInputRef.current.click();
  }, []);

  const handleImageFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        execCommand('insertImage', reader.result);
        e.target.value = null;
      };
      reader.readAsDataURL(file);
    }
  }, [execCommand]);

  const fontSizes = [
    { label: 'Small', value: '1' }, { label: 'Normal', value: '3' },
    { label: 'Medium', value: '4' }, { label: 'Large', value: '5' },
    { label: 'X-Large', value: '6' }, { label: 'XX-Large', value: '7' },
  ];

  const handleFontSizeChange = useCallback((e) => {
    execCommand('fontSize', e.target.value);
  }, [execCommand]);

  const fontFamilies = [
    { label: 'Arial', value: 'Arial' }, { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' }, { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' }, { label: 'Tahoma', value: 'Tahoma' },
  ];

  const handleFontFamilyChange = useCallback((e) => {
    execCommand('fontName', e.target.value);
  }, [execCommand]);

  const handleTextColorChange = useCallback((color) => {
    setCurrentColor(color);
    execCommand('foreColor', color);
  }, [execCommand]);

  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
  }, [execCommand]);

  const getScheduledTime = (type) => {
    const now = new Date();
    let targetDate = new Date(now);

    if (type === 'tomorrowMorning') {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(8, 0, 0, 0);
    } else if (type === 'tomorrowAfternoon') {
      targetDate.setDate(now.getDate() + 1);
      targetDate.setHours(13, 0, 0, 0);
    } else if (type === 'nextMondayMorning') {
      const dayOfWeek = now.getDay();
      const daysUntilMonday = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
      targetDate.setDate(now.getDate() + daysUntilMonday);
      targetDate.setHours(8, 0, 0, 0);
    }
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleScheduleSend = async (scheduleType) => {
    let finalScheduledAt = null;
    if (scheduleType === 'custom') {
      finalScheduledAt = scheduledDateTime;
      if (!finalScheduledAt) {
        console.warn('Please select a custom date and time.');
        return;
      }
    } else {
      finalScheduledAt = getScheduledTime(scheduleType);
    }

    await handleSubmit(new Event('submit'), finalScheduledAt);
    setShowScheduleOptions(false);
  };

  const handleSubmit = async (e, scheduledAt = null) => {
    e.preventDefault();

    const recipients = [to];
    if (showCc && cc) {
      recipients.push(cc);
    }
    if (showBcc && bcc) {
      recipients.push(bcc);
    }

    const filesToUpload = attachments.filter(att => att.fileObject);

    // Get the latest HTML from the editor ref before sending
    const currentBodyHtml = editorRef.current ? editorRef.current.innerHTML : bodyHtml;

    await onSendEmail(recipients.join(','), subject, currentBodyHtml, filesToUpload, scheduledAt, draftId);

    setTo('');
    setSubject('');
    setCc('');
    setBcc('');
    setShowCc(false);
    setShowBcc(false);
    setAttachments([]);
    setScheduledDateTime('');
    setDraftId(null);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setBodyHtml('');
      editorRef.current.focus();
    }
  };

  const handleDiscardButtonAction = () => {
    if (draftId) {
      onMoveDraftToTrash(draftId);
    } else {
      onClose();
    }
  };


  let windowClasses = `fixed bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ease-in-out`;
  const windowStyles = {};

  if (isMinimized) {
    windowClasses += ' w-80 h-10 bottom-0 right-20';
  } else if (isMaximized) {
    windowClasses += ' top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] md:w-[800px] md:h-[600px]';
  } else {
    windowClasses += ' bottom-4 right-4 w-full md:w-[600px] lg:w-[700px] h-auto max-h-[90vh]';
  }

  windowStyles.minWidth = isMinimized ? '320px' : '300px';
  windowStyles.minHeight = isMinimized ? '40px' : '200px';
  windowStyles.zIndex = 1000;


  return (
    <div
      className={windowClasses}
      style={windowStyles}
    >
      <div
        className="flex items-center justify-between bg-gray-200 px-4 py-2 cursor-default"
      >
        <h2 className="text-base font-semibold text-gray-800">New Message</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMinimizeToggle}
            className="p-1 rounded hover:bg-gray-300 text-gray-700"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            type="button"
            onClick={onMaximizeToggle}
            className="p-1 rounded hover:bg-gray-300 text-gray-700"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-red-200 text-red-600"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <form onSubmit={(e) => handleSubmit(e, null)} className="relative flex flex-col flex-grow p-4 gap-0 overflow-hidden">
          <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipients"
              required
              className="py-2 flex-grow focus:outline-none text-base"
            />
            <div className="flex gap-1 ml-2">
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Bcc
                </button>
              )}
            </div>
          </div>

          {showCc && (
            <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cc"
                className="py-2 flex-grow focus:outline-none text-base"
              />
              <button
                type="button"
                onClick={handleRemoveCc}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                title="Remove Cc"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {showBcc && (
            <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="Bcc"
                className="py-2 flex-grow focus:outline-none text-base"
              />
              <button
                type="button"
                onClick={handleRemoveBcc}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full"
                title="Remove Bcc"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            required
            className="py-2 border-b border-gray-300 focus:border-blue-500 focus:outline-none text-base mt-0"
          />
          
          <div className=" flex flex-col flex-grow border-b border-gray-300 rounded-b-lg overflow-hidden mt-3">
            <div className="flex flex-wrap gap-1 p-1 border-b border-gray-200 bg-gray-50">
              <button type="button" onClick={() => execCommand('undo')} className="p-1 rounded hover:bg-gray-200" title="Undo"><FaUndo size={14} /></button>
              <button type="button" onClick={() => execCommand('redo')} className="p-1 rounded hover:bg-gray-200" title="Redo"><FaRedo size={14} /></button>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <select onChange={handleFontFamilyChange} className="p-1 rounded border bg-white hover:bg-gray-200 text-xs" title="Font Family">
                <option value="">Font Family</option>
                {fontFamilies.map(font => (<option key={font.value} value={font.value}>{font.label}</option>))}
              </select>
              <select onChange={handleFontSizeChange} className="p-1 rounded border bg-white hover:bg-gray-200 text-xs" title="Font Size">
                <option value="">Font Size</option>
                {fontSizes.map(size => (<option key={size.value} value={size.value}>{size.label}</option>))}
              </select>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={() => execCommand('bold')} className="p-1 rounded hover:bg-gray-200" title="Bold"><FaBold size={14} /></button>
              <button type="button" onClick={() => execCommand('italic')} className="p-1 rounded hover:bg-gray-200" title="Italic"><FaItalic size={14} /></button>
              <button type="button" onClick={() => execCommand('underline')} className="p-1 rounded hover:bg-gray-200" title="Underline"><FaUnderline size={14} /></button>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1 rounded hover:bg-gray-200" title="Bullet List"><FaListUl size={14} /></button>
              <button type="button" onClick={() => execCommand('insertOrderedList')} className="p-1 rounded hover:bg-gray-200" title="Numbered List"><FaListOl size={14} /></button>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1 rounded hover:bg-gray-200" title="Align Left"><FaAlignLeft size={14} /></button>
              <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1 rounded hover:bg-gray-200" title="Align Center"><FaAlignCenter size={14} /></button>
              <button type="button" onClick={() => execCommand('justifyRight')} className="p-1 rounded hover:bg-gray-200" title="Align Right"><FaAlignRight size={14} /></button>
              <button type="button" onClick={() => execCommand('justifyFull')} className="p-1 rounded hover:bg-gray-200" title="Justify"><FaAlignJustify size={14} /></button>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={setLink} className="p-1 rounded hover:bg-gray-200" title="Insert Link"><FaLink size={14} /></button>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <div className="" ref={colorPickerButtonRef}>
                <button type="button" onClick={() => setShowColorPicker(!showColorPicker)} className={`p-1 rounded hover:bg-gray-200`} title="Text Color">
                  <span style={{ color: currentColor, fontSize: '14px' }}>A</span>
                </button>
                {showColorPicker && (
                  <div className="absolute z-50 top-35 right-10 mt-2 p-2 bg-white border rounded shadow-lg">
                    <HexColorPicker color={currentColor} onChange={handleTextColorChange} />
                    <button onClick={() => { execCommand('foreColor', '#000000'); setCurrentColor('#000000'); setShowColorPicker(false); }} className="mt-2 w-full text-xs text-center text-blue-600 hover:underline">Reset Color</button>
                  </div>
                )}
              </div>
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={addImage} className="p-1 rounded hover:bg-gray-200" title="Insert Image from System"><FaImage size={14} /></button>
              <input type="file" ref={imageInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
              <div className="border-l border-gray-300 mx-1 h-5"></div>

              <button type="button" onClick={clearFormatting} className="p-1 rounded hover:bg-gray-200" title="Clear Formatting"><FaTrash size={14} /></button>
            </div>

            <div
              ref={editorRef}
              contentEditable="true"
              onInput={handleEditorInput}
              className="editor-content flex-grow p-3 text-base focus:outline-none overflow-y-auto"
              role="textbox"
              aria-multiline="true"
              suppressContentEditableWarning={true}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                onClick={(e) => handleSubmit(e, null)}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-sm"
              >
                Send
              </button>

              <div className="relative" ref={scheduleButtonRef}>
                <button
                  type="button"
                  onClick={() => setShowScheduleOptions(!showScheduleOptions)}
                  className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  title="Schedule Send"
                >
                  <Clock size={18} />
                </button>

                {showScheduleOptions && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-xl py-2 z-20 border border-gray-200">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Schedule Send
                    </div>
                    <button
                      type="button"
                      onClick={() => handleScheduleSend('tomorrowMorning')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Tomorrow morning</span>
                      <span className="text-gray-500 text-xs">8:00 AM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleSend('tomorrowAfternoon')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Tomorrow afternoon</span>
                      <span className="text-gray-500 text-xs">1:00 PM</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScheduleSend('nextMondayMorning')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Next Monday morning</span>
                      <span className="text-gray-500 text-xs">8:00 AM</span>
                    </button>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-2">
                      <label htmlFor="custom-datetime" className="block text-xs text-gray-500 mb-1">Pick date & time</label>
                      <input
                        type="datetime-local"
                        id="custom-datetime"
                        value={scheduledDateTime}
                        onChange={(e) => setScheduledDateTime(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleScheduleSend('custom')}
                        className="mt-2 w-full bg-blue-500 text-white py-1 rounded-md hover:bg-blue-600 text-sm"
                      >
                        Schedule Send
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                title="Attach files"
              >
                <FaPaperclip size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardButtonAction}
                className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                title="Discard Draft"
              >
                <FaTrash size={18} />
              </button>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-4">
                {attachments.map((file, index) => (
                  <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {file.name}
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-1 text-blue-800 hover:text-blue-600"
                      title="Remove attachment"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
