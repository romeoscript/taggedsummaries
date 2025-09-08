import React, { useState } from 'react';
import { GroqAIService } from '../services/groqService';
import type { AIProcessingResult } from '../services/groqService';
// Removed hash utilities as hash UI was removed

interface TransactionInputProps {
  onProcessTransaction: (result: AIProcessingResult) => void;
  groqApiKey: string;
}

export const TransactionInput: React.FC<TransactionInputProps> = ({ 
  onProcessTransaction, 
  groqApiKey 
}) => {
  const [transactionData, setTransactionData] = useState('');
  // Removed transaction hash UI/state
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionData.trim()) {
      setError('Please enter transaction data');
      return;
    }

    if (!groqApiKey || !groqApiKey.trim()) {
      setError('Groq API key not found. Please set VITE_GROQ_API_KEY in your .env file');
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


  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ 
          width: '2rem', 
          height: '2rem', 
          backgroundColor: '#dbeafe', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1rem'
        }}>
          🤖
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>AI Transaction Analyzer</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Describe your campus transaction and get AI-powered insights</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="transaction" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            What did you buy or do on campus?
          </label>
          <textarea
            id="transaction"
            value={transactionData}
            onChange={(e) => setTransactionData(e.target.value)}
            placeholder="e.g., Bought lunch at the campus cafeteria for $12.50..."
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              resize: 'none',
              outline: 'none',
              fontSize: '0.875rem'
            }}
            rows={3}
            disabled={processing}
          />
        </div>

        {/* Removed transaction hash UI */}

        <button
          type="submit"
          disabled={processing || !transactionData.trim() || !groqApiKey || !groqApiKey.trim()}
          style={{
            width: '100%',
            backgroundColor: (processing || !transactionData.trim() || !groqApiKey || !groqApiKey.trim()) ? '#60a5fa' : '#2563eb',
            color: 'white',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: (processing || !transactionData.trim() || !groqApiKey.trim()) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {processing ? '🔄 Analyzing with AI...' : '🚀 Analyze Transaction'}
        </button>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <p style={{ color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}
      </form>

    </div>
  );
};
