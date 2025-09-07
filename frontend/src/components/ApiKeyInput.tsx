import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load API key from localStorage if available
    const savedKey = localStorage.getItem('groq-api-key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeyChange(savedKey);
    }
  }, [onApiKeyChange]);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    onApiKeyChange(value);
    
    // Save to localStorage
    if (value.trim()) {
      localStorage.setItem('groq-api-key', value);
    } else {
      localStorage.removeItem('groq-api-key');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Groq API Configuration</h3>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
            Groq API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter your Groq API key..."
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showKey ? (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">Get your Groq API Key</h4>
              <div className="mt-1 text-sm text-blue-700">
                <p>1. Visit <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline">console.groq.com/keys</a></p>
                <p>2. Create a new API key</p>
                <p>3. Copy and paste it above</p>
              </div>
            </div>
          </div>
        </div>

        {apiKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">API Key configured</p>
                <p className="text-sm text-green-700">Ready to process transactions with AI</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
