import { useState } from 'react';

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Your Mail Service</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
          {isRegistering ? 'Register' : 'Login'}
        </h2>

        {/* Name input - Only displayed if registering */}
        {isRegistering && (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {/* Email Prefix Input */}
        <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
          <input
            type="text"
            value={emailPrefix}
            onChange={(e) => setEmailPrefix(e.target.value)}
            placeholder="Email"
            required
            className="p-3 w-[70%] flex-grow rounded-l-md focus:outline-none"
          />
          <span className="p-3 bg-gray-100 text-gray-600 rounded-r-md border-l border-gray-300">
            @{APP_DOMAIN}
          </span>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Confirm Password input - Only displayed if registering */}
        {isRegistering && (
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <button type="submit" className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        
        {/* Toggle between Login and Register */}
        <button
          type="button"
          onClick={() => setIsRegistering(prev => !prev)}
          className="px-5 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mt-2"
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>
      {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
    </div>
  );
}