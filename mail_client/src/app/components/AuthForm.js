// my-email-frontend/app/components/AuthForm.js
import { useState } from 'react';
import Image from 'next/image'

export default function AuthForm({ onLogin, onRegister, message }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const APP_DOMAIN = "bockrecruitment.site";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullEmail = `${emailPrefix}@${APP_DOMAIN}`;

    if (isRegistering) {
      await onRegister(name, fullEmail, password, confirmPassword);
    } else {
      await onLogin(fullEmail, password);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white font-sans"> {/* Changed bg-gray-100 to bg-white */}
      {/* Removed the H1 "Welcome to Your Mail Service" */}
      <div className="main flex flex-col bg-white rounded-lg shadow-xl w-96 border border-gray-200">
      <div className="purp flex h-[80%] bg-[#F6F0F8] gap-2 justify-center items-center p-10">
          <Image src={"/logo/bock_logo.svg"} width={50} height={50} alt={"Bock Logo"} className='animate-rotate360'></Image>
        <h2 className="text-xl font-bold text-gray-800 text-center"> {/* Adjusted font size and weight */}
        Welcome to Bock Mail {/* Changed 'Register' to 'Sign Up' */}
        </h2>
        </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 w-96 "> 
        {/* Name input - Only displayed if registering */}
        {isRegistering && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name" 
            required
            className="p-3 border-b-2 border-gray-300 focus:border-[#7D2A7E] focus:outline-none text-lg" // Changed border, focus, text size
          />
        )}

        {/* Email Prefix Input */}
        <div className="flex items-center border-b-2 border-gray-300 focus-within:border-[#7D2A7E]"> {/* Changed border style */}
          <input
            type="text"
            value={emailPrefix}
            onChange={(e) => setEmailPrefix(e.target.value)}
            placeholder="Email" // Changed placeholder
            required
            className="p-3 w-[70%] flex-grow focus:outline-none text-lg" // Adjusted padding and text size
          />
          <span className="p-3 text-black text-lg"> {/* Adjusted text size */}
            @{APP_DOMAIN}
          </span>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="p-3 border-b-2 border-gray-300 focus:border-[#7D2A7E] focus:outline-none text-lg" // Changed border, focus, text size
        />

        {/* Confirm Password input - Only displayed if registering */}
        {isRegistering && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="p-3 border-b-2 border-gray-300 focus:border-[#7D2A7E] focus:outline-none text-lg" // Changed border, focus, text size
          />
        )}

        <button type="submit" className="px-5 py-3 mt-4 bg-[#7D2A7E] text-white rounded-lg hover:bg-[#6a3c6b] focus:outline-none focus:ring-2 focus:ring-[#7D2A7E] focus:ring-offset-2 text-lg font-semibold"> {/* Adjusted padding, rounded, shadow, font */}
          {isRegistering ? 'Sign Up' : 'Login'}
        </button>
        
        {/* Toggle between Login and Sign Up as a text link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsRegistering(prev => !prev)}
            className="text-[#7D2A7E] hover:underline text-lg focus:outline-none" // Styled as a link
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
          </button>
        </div>
      </form>
      </div>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
  );
}