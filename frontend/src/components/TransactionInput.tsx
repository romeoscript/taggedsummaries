import React, { useState } from 'react';
import { GroqAIService, AIProcessingResult } from '../services/groqService';

interface TransactionInputProps {
  onProcessTransaction: (result: AIProcessingResult) => void;
  groqApiKey: string;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({ 
  onProcessTransaction, 
  groqApiKey 
}) => {
  const [transactionData, setTransactionData] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionData.trim()) {
      setError('Please enter transaction data');
      return;
    }

    if (!groqApiKey.trim()) {
      setError('Please enter your Groq API key');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const groqService = new GroqAIService(groqApiKey);
      const result = await groqService.extractMetadata(transactionData);
      onProcessTransaction(result);
      setTransactionData(''); // Clear input after successful processing
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process transaction');
    } finally {
      setProcessing(false);
    }
  };

  const exampleTransactions = [
    "Student meal purchase at campus cafeteria - $12.50 for lunch combo",
    "Book purchase at campus bookstore - $45.00 for Chemistry textbook",
    "Bus pass renewal - $25.00 for monthly student transit",
    "Coffee at campus Starbucks - $4.75 for grande latte",
    "Movie ticket at campus theater - $8.50 for student discount"
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Campus Transaction</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="transaction" className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Description
          </label>
          <textarea
            id="transaction"
            value={transactionData}
            onChange={(e) => setTransactionData(e.target.value)}
            placeholder="Enter your campus transaction details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={processing}
          />
        </div>

        <button
          type="submit"
          disabled={processing || !transactionData.trim() || !groqApiKey.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          {processing ? 'Processing with AI...' : 'Extract Metadata'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </form>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Example Transactions:</h4>
        <div className="space-y-2">
          {exampleTransactions.map((example, index) => (
            <button
              key={index}
              onClick={() => setTransactionData(example)}
              className="block w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors duration-200"
              disabled={processing}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
