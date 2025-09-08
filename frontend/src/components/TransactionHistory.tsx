import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useBlockchain } from '../hooks/useBlockchain';
import type { AIProcessingResult } from '../services/groqService';

interface StoredTransaction {
  id: string;
  transactionHash: string;
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
  timestamp: number;
  studentWallet: string;
}

export const TransactionHistory: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { getStudentSummaries } = useBlockchain();
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const loadTransactions = async () => {
      if (connected && publicKey) {
        setLoading(true);
        try {
          // Load real transactions from blockchain
          const realTransactions = await getStudentSummaries(publicKey);
          setTransactions(realTransactions.map(tx => ({
            id: tx.id.toString(),
            transactionHash: tx.transactionHash,
            summary: tx.summary,
            tags: tx.tags,
            category: tx.category,
            confidenceScore: tx.confidenceScore,
            timestamp: tx.timestamp,
            studentWallet: tx.studentWallet.toString()
          })));
        } catch (error) {
          console.error('Error loading transactions:', error);
          // Set empty array on error - no fallback to mock data
          setTransactions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setTransactions([]);
      }
    };

    loadTransactions();
  }, [connected, publicKey]); // Removed getStudentSummaries from dependencies

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: { bg: string; text: string } } = {
      dining: { bg: '#dcfce7', text: '#166534' },
      academic: { bg: '#dbeafe', text: '#1e40af' },
      transportation: { bg: '#fef3c7', text: '#92400e' },
      entertainment: { bg: '#e9d5ff', text: '#6b21a8' },
      shopping: { bg: '#fce7f3', text: '#be185d' },
      services: { bg: '#e0e7ff', text: '#3730a3' },
      other: { bg: '#f3f4f6', text: '#374151' }
    };
    return colors[category] || colors.other;
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (!connected) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '1rem'
          }}>
            📜
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Transaction History</h3>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Connect your wallet to view your transaction history
          </p>
        </div>
      </div>
    );
  }

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
          📜
        </div>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Transaction History</h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Your tagged campus transactions</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            border: '2px solid #e5e7eb', 
            borderTop: '2px solid #2563eb', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            No blockchain transactions found. Process and store some transactions to see them here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transactions.map((tx) => {
            const categoryColors = getCategoryColor(tx.category);
            return (
              <div key={tx.id} style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '0.5rem', 
                padding: '1rem',
                transition: 'all 0.2s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827', margin: 0, flex: 1 }}>
                    {tx.summary}
                  </h4>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280',
                    marginLeft: '0.5rem'
                  }}>
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '500',
                    backgroundColor: categoryColors.bg,
                    color: categoryColors.text,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem'
                  }}>
                    {tx.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <div style={{ 
                      width: '0.5rem', 
                      height: '0.5rem', 
                      backgroundColor: getConfidenceColor(tx.confidenceScore), 
                      borderRadius: '50%' 
                    }}></div>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {tx.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {tx.tags.map((tag, index) => (
                    <span key={index} style={{ 
                      fontSize: '0.75rem', 
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      padding: '0.125rem 0.375rem',
                      borderRadius: '0.25rem'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
