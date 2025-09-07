import React, { useState } from 'react';
import { GroqAIService } from '../services/groqService';
import type { AIProcessingResult } from '../services/groqService';

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
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>Process Campus Transaction</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label htmlFor="transaction" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Transaction Description
          </label>
          <textarea
            id="transaction"
            value={transactionData}
            onChange={(e) => setTransactionData(e.target.value)}
            placeholder="Enter your campus transaction details..."
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

        <button
          type="submit"
          disabled={processing || !transactionData.trim() || !groqApiKey.trim()}
          style={{
            width: '100%',
            backgroundColor: (processing || !transactionData.trim() || !groqApiKey.trim()) ? '#60a5fa' : '#2563eb',
            color: 'white',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: (processing || !transactionData.trim() || !groqApiKey.trim()) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {processing ? 'Processing with AI...' : 'Extract Metadata'}
        </button>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem' }}>
            <p style={{ color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          </div>
        )}
      </form>

      <div style={{ marginTop: '1.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Example Transactions:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {exampleTransactions.map((example, index) => (
            <button
              key={index}
              onClick={() => setTransactionData(example)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: '#6b7280',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: processing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              disabled={processing}
              onMouseEnter={(e) => {
                if (!processing) {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseLeave={(e) => {
                if (!processing) {
                  e.currentTarget.style.color = '#6b7280';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
