import React from 'react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnection: React.FC = () => {
  const { connected, publicKey, connecting, error, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>Wallet Connection</h3>
      
      {!connected ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={connectWallet}
            disabled={connecting}
            style={{
              width: '100%',
              backgroundColor: connecting ? '#60a5fa' : '#2563eb',
              color: 'white',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: connecting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {connecting ? 'Connecting...' : 'Connect Phantom Wallet'}
          </button>
          
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem' }}>
              <p style={{ color: '#991b1b', fontSize: '0.875rem', margin: 0 }}>{error}</p>
            </div>
          )}
          
          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
            Connect your Phantom wallet to interact with the Tagged Summaries smart contract on Solana devnet.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Connected</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#111827', margin: 0 }}>
                {publicKey ? formatAddress(publicKey) : 'Unknown'}
              </p>
            </div>
            <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          </div>
          
          <button
            onClick={disconnectWallet}
            style={{
              width: '100%',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
