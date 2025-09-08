import React, { useState } from 'react';
import { WalletContextProvider } from './contexts/WalletContext';
import { WalletConnectionNew } from './components/WalletConnectionNew';
import { TransactionInput } from './components/TransactionInput';
import { AIResult } from './components/AIResult';
import { TransactionHistory } from './components/TransactionHistory';
import { ContractStatus } from './components/ContractStatus';
import { useBlockchain } from './hooks/useBlockchain';
import type { AIProcessingResult } from './services/groqService';
import './App.css';

function AppContent() {
  const [aiResult, setAiResult] = useState<AIProcessingResult | null>(null);
  const [storing, setStoring] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get Groq API key from environment variables
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  // Blockchain integration
  const { 
    isInitialized, 
    loading: blockchainLoading, 
    error: blockchainError,
    initializeSummaryStore,
    storeTaggedSummary 
  } = useBlockchain();

  const handleProcessTransaction = (result: AIProcessingResult) => {
    setAiResult(result);
  };

  const handleStoreOnChain = async () => {
    if (!aiResult) return;
    
    setStoring(true);
    try {
      // Check if summary store is initialized
      if (!isInitialized) {
        await initializeSummaryStore();
      }
      
      // Store the transaction on blockchain
      const txSignature = await storeTaggedSummary(aiResult);
      
      alert(`Transaction stored successfully on Solana blockchain!\nTransaction ID: ${txSignature}`);
      setAiResult(null); // Clear result after successful storage
      
      // Trigger refresh of transaction history
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error storing on blockchain:', error);
      alert(`Failed to store transaction on blockchain: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setStoring(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Tagged Summaries</h1>
              <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>AI-powered campus transaction analysis on Solana</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             
              <WalletConnectionNew />
            </div>
          </div>
        </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Status Bar */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: groqApiKey ? '#10b981' : '#ef4444', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {groqApiKey ? 'AI Ready' : 'AI Not Configured'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '0.75rem', 
                height: '0.75rem', 
                backgroundColor: blockchainLoading ? '#f59e0b' : (isInitialized === null ? '#6b7280' : (isInitialized ? '#10b981' : '#ef4444')), 
                borderRadius: '50%' 
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {blockchainLoading ? 'Loading...' : (isInitialized === null ? 'Blockchain Unknown' : (isInitialized ? 'Blockchain Ready' : 'Blockchain Not Initialized'))}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Solana Devnet</span>
            </div>
          </div>
          {!groqApiKey && (
            <div style={{ 
              backgroundColor: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '0.375rem', 
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              color: '#92400e'
            }}>
              ⚠️ Set VITE_GROQ_API_KEY in your .env file
            </div>
          )}
        </div>

        {/* Contract Status */}
        <ContractStatus />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left Column - Transaction Analyzer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <TransactionInput 
              onProcessTransaction={handleProcessTransaction}
              groqApiKey={groqApiKey}
            />
            <AIResult 
              result={aiResult}
              onStoreOnChain={handleStoreOnChain}
              storing={storing}
            />
          </div>

          {/* Right Column - Transaction History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <TransactionHistory refreshTrigger={refreshTrigger} />
          </div>
        </div>
        </main>

        {/* Footer */}
        <footer style={{ backgroundColor: 'white', borderTop: '1px solid #e5e7eb', marginTop: '4rem' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1.5rem 1rem' }}>
            <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              <p style={{ margin: 0 }}>Built with React, Vite, and Solana</p>
              <p style={{ margin: '0.25rem 0 0 0' }}>AI powered by Groq's Llama 3.3 70B model</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;
