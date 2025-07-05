// my-email-frontend/app/components/ComposeForm.js
'use client'; // Mark as client component

import { useState, useRef, useCallback, useEffect } from 'react';
import { FaPaperclip, FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaLink, FaUndo, FaRedo, FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify, FaImage, FaTrash } from 'react-icons/fa';
import { HexColorPicker } from 'react-colorful'; // For color picker UI

export default function ComposeForm({ onSendEmail, message }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null); // For email attachments

  const editorRef = useRef(null); // Ref for the contenteditable div
  const [bodyHtml, setBodyHtml] = useState(''); // State to hold HTML content

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000'); // Default text color

  const imageInputRef = useRef(null); // Ref for hidden image file input

  // Function to execute editor commands
  const execCommand = useCallback((command, value = null) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      // Manually update the state to reflect changes (important for submit)
      setBodyHtml(editorRef.current.innerHTML);
      editorRef.current.focus(); // Keep focus on editor
    }
  }, []);

  // Sync editor content with state on input/change
  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setBodyHtml(editorRef.current.innerHTML);
    }
  }, []);

  // Initialize content on first render or when message prop changes
  useEffect(() => {
    if (editorRef.current && !message) { // Only clear if no initial message
      editorRef.current.innerHTML = '';
      setBodyHtml('');
    } else if (editorRef.current && message) {
      editorRef.current.innerHTML = message; // Or however you want to load content
      setBodyHtml(message);
    }
  }, [message]);


  // Handle file selection for email attachments
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...selectedFiles]);
    e.target.value = null; // Clear input
  };

  // Remove a selected attachment
  const removeAttachment = (indexToRemove) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Link functionality
  const setLink = useCallback(() => {
    const url = prompt('Enter the URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  // Image insertion from system
  const addImage = useCallback(() => {
    imageInputRef.current.click(); // Trigger the hidden image file input
  }, []);

  const handleImageFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        execCommand('insertImage', reader.result); // Insert Base64 image
        e.target.value = null; // Clear input
      };
      reader.readAsDataURL(file); // Read file as Base64 Data URL
    }
  }, [execCommand]);

  // Font Size implementation (using size 1-7, requires CSS mapping)
  const fontSizes = [
    { label: 'Small', value: '1' },
    { label: 'Normal', value: '3' }, // Default size for execCommand
    { label: 'Medium', value: '4' },
    { label: 'Large', value: '5' },
    { label: 'X-Large', value: '6' },
    { label: 'XX-Large', value: '7' },
  ];

  const handleFontSizeChange = useCallback((e) => {
    execCommand('fontSize', e.target.value);
  }, [execCommand]);

  // Font Family implementation
  const fontFamilies = [
    { label: 'Arial', value: 'Arial' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Verdana', value: 'Verdana' },
    { label: 'Tahoma', value: 'Tahoma' },
  ];

  const handleFontFamilyChange = useCallback((e) => {
    execCommand('fontName', e.target.value);
  }, [execCommand]);

  // Text Color implementation
  const handleTextColorChange = useCallback((color) => {
    setCurrentColor(color);
    execCommand('foreColor', color);
  }, [execCommand]);

  // Clear formatting (basic attempt)
  const clearFormatting = useCallback(() => {
    execCommand('removeFormat');
  }, [execCommand]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const recipients = [to];
    if (showCc && cc) {
      recipients.push(cc);
    }
    if (showBcc && bcc) {
      recipients.push(bcc);
    }

    await onSendEmail(recipients.join(','), subject, bodyHtml, attachments);

    // Clear form fields after sending
    setTo('');
    setSubject('');
    setCc('');
    setBcc('');
    setShowCc(false);
    setShowBcc(false);
    setAttachments([]);
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setBodyHtml('');
      editorRef.current.focus();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200 rounded-t-lg">
        <h2 className="text-xl font-semibold text-gray-800">New Message</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-0">
        {/* Recipients (To) field with CC/BCC buttons */}
        <div className="flex items-center border-b border-gray-300 focus-within:border-blue-500">
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Recipients"
            required
            className="py-3 flex-grow focus:outline-none text-lg"
          />
          <div className="flex gap-2 ml-2">
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cc
              </button>
            )}
            {!showBcc && (
              <button
                type="button"
                onClick={() => setShowBcc(true)}
                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Bcc
              </button>
            )}
          </div>
        </div>

        {/* CC field - Conditionally rendered */}
        {showCc && (
          <input
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Cc"
            className="py-3 border-b border-gray-300 focus:border-blue-500 focus:outline-none text-lg"
          />
        )}

        {/* BCC field - Conditionally rendered */}
        {showBcc && (
          <input
            type="email"
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            placeholder="Bcc"
            className="py-3 border-b border-gray-300 focus:border-blue-500 focus:outline-none text-lg"
          />
        )}

        {/* Subject field */}
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          required
          className="py-3 border-b border-gray-300 focus:border-blue-500 focus:outline-none text-lg mt-0"
        />
        
        {/* Contenteditable Editor */}
        <div className="mt-5 flex flex-col flex-grow border-b border-gray-300 focus-within:border-blue-500 rounded-b-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
            {/* Undo/Redo (execCommand sometimes buggy with these) */}
            <button
              type="button"
              onClick={() => execCommand('undo')}
              className="p-2 rounded hover:bg-gray-200"
              title="Undo"
            >
              <FaUndo />
            </button>
            <button
              type="button"
              onClick={() => execCommand('redo')}
              className="p-2 rounded hover:bg-gray-200"
              title="Redo"
            >
              <FaRedo />
            </button>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Font Family Dropdown */}
            <select
              onChange={handleFontFamilyChange}
              className="p-2 rounded border bg-white hover:bg-gray-200 text-sm"
              title="Font Family"
            >
              <option value="">Font Family</option>
              {fontFamilies.map(font => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Font Size Dropdown */}
            <select
              onChange={handleFontSizeChange}
              className="p-2 rounded border bg-white hover:bg-gray-200 text-sm"
              title="Font Size"
            >
              <option value="">Font Size</option>
              {fontSizes.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </select>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Headings - execCommand does not have direct heading support. */}
            {/* We will skip dedicated heading buttons as it's complex with execCommand. */}
            {/* User can use font size for similar effect if needed. */}

            {/* Inline Styles */}
            <button
              type="button"
              onClick={() => execCommand('bold')}
              className="p-2 rounded hover:bg-gray-200"
              title="Bold"
            >
              <FaBold />
            </button>
            <button
              type="button"
              onClick={() => execCommand('italic')}
              className="p-2 rounded hover:bg-gray-200"
              title="Italic"
            >
              <FaItalic />
            </button>
            <button
              type="button"
              onClick={() => execCommand('underline')}
              className="p-2 rounded hover:bg-gray-200"
              title="Underline"
            >
              <FaUnderline />
            </button>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Lists */}
            <button
              type="button"
              onClick={() => execCommand('insertUnorderedList')}
              className="p-2 rounded hover:bg-gray-200"
              title="Bullet List"
            >
              <FaListUl />
            </button>
            <button
              type="button"
              onClick={() => execCommand('insertOrderedList')}
              className="p-2 rounded hover:bg-gray-200"
              title="Numbered List"
            >
              <FaListOl />
            </button>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Text Alignment */}
            <button
              type="button"
              onClick={() => execCommand('justifyLeft')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Left"
            >
              <FaAlignLeft />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyCenter')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Center"
            >
              <FaAlignCenter />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyRight')}
              className="p-2 rounded hover:bg-gray-200"
              title="Align Right"
            >
              <FaAlignRight />
            </button>
            <button
              type="button"
              onClick={() => execCommand('justifyFull')}
              className="p-2 rounded hover:bg-gray-200"
              title="Justify"
            >
              <FaAlignJustify />
            </button>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Link */}
            <button
              type="button"
              onClick={setLink}
              className="p-2 rounded hover:bg-gray-200"
              title="Insert Link"
            >
              <FaLink />
            </button>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Text Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={`p-2 rounded hover:bg-gray-200`}
                title="Text Color"
              >
                <span style={{ color: currentColor }}>A</span>
              </button>
              {showColorPicker && (
                <div className="absolute z-10 mt-2 p-2 bg-white border rounded shadow-lg">
                  <HexColorPicker
                    color={currentColor}
                    onChange={handleTextColorChange}
                  />
                  <button
                    onClick={() => {
                      execCommand('foreColor', '#000000'); // Reset to black
                      setCurrentColor('#000000');
                      setShowColorPicker(false);
                    }}
                    className="mt-2 w-full text-sm text-center text-blue-600 hover:underline"
                  >
                    Reset Color
                  </button>
                </div>
              )}
            </div>
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Image Button - Triggers hidden file input */}
            <button
              type="button"
              onClick={addImage}
              className="p-2 rounded hover:bg-gray-200"
              title="Insert Image from System"
            >
              <FaImage />
            </button>
            {/* Hidden file input for image uploads */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="border-l border-gray-300 mx-1 h-6"></div>

            {/* Clear Formatting */}
            <button
              type="button"
              onClick={clearFormatting}
              className="p-2 rounded hover:bg-gray-200"
              title="Clear Formatting"
            >
              <FaTrash />
            </button>
          </div>

          {/* Contenteditable Div */}
          <div
            ref={editorRef}
            contentEditable="true"
            onInput={handleEditorInput}
            className="editor-content min-h-[200px] p-3 text-lg focus:outline-none"
            role="textbox"
            aria-multiline="true"
            suppressContentEditableWarning={true} // To suppress React warning
          >
            {/* Placeholder will be handled by JavaScript or CSS pseudo-elements if desired */}
            <p>Compose your email...</p>
          </div>
        </div>

        {/* Send Button, Message, and Attachment Button */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <button type="submit" className="px-6 py-3 bg-[#7D2A7E] text-white rounded-md hover:bg-[#6d476d] focus:outline-none focus:ring-2 focus:ring-offset-2 font-semibold text-lg">
              Send
            </button>
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="p-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              title="Attach files"
            >
              <FaPaperclip className="text-xl" />
            </button>
            {/* Hidden file input for email attachments */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </div>

          {/* Display selected attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 ml-4">
              {attachments.map((file, index) => (
                <span key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {file.name}
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="ml-2 text-blue-800 hover:text-blue-600"
                    title="Remove attachment"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}

          {message && <p className="ml-4 text-green-600 text-sm">{message}</p>}
        </div>
      </form>
    </div>
  );
}