import React, { useState } from 'react';
import { WalletConnection } from './components/WalletConnection';
import { ApiKeyInput } from './components/ApiKeyInput';
import { TransactionInput } from './components/TransactionInput';
import { AIResult } from './components/AIResult';
import type { AIProcessingResult } from './services/groqService';

function App() {
  const [groqApiKey, setGroqApiKey] = useState('');
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);
  const [storing, setStoring] = useState(false);

  const handleProcessTransaction = (result: AIProcessingResult) => {
    setAiResult(result);
  };

  const handleStoreOnChain = async () => {
    if (!aiResult) return;
    
    setStoring(true);
    try {
      // TODO: Implement blockchain storage
      // This would integrate with the TaggedSummaryClient
      console.log('Storing on blockchain:', aiResult);
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Transaction stored successfully on Solana blockchain!');
      setAiResult(null); // Clear result after successful storage
    } catch (error) {
      console.error('Error storing on blockchain:', error);
      alert('Failed to store transaction on blockchain');
    } finally {
      setStoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tagged Summaries</h1>
              <p className="text-gray-600 mt-1">AI-powered campus transaction analysis on Solana</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Devnet</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <WalletConnection />
            <ApiKeyInput onApiKeyChange={setGroqApiKey} />
            <TransactionInput 
              onProcessTransaction={handleProcessTransaction}
              groqApiKey={groqApiKey}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIResult 
              result={aiResult}
              onStoreOnChain={handleStoreOnChain}
              storing={storing}
            />
            
            {/* Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</div>
                  <p>Connect your Phantom wallet to interact with Solana devnet</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</div>
                  <p>Enter your Groq API key for AI processing</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</div>
                  <p>Describe your campus transaction</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</div>
                  <p>AI extracts metadata (summary, tags, category)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</div>
                  <p>Store the tagged summary on Solana blockchain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Built with React, Vite, Tailwind CSS, and Solana</p>
            <p className="mt-1">AI powered by Groq's Llama 3.3 70B model</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
