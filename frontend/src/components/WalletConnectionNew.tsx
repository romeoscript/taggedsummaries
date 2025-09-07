import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletConnectionNew: React.FC = () => {
  const { connected, publicKey } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', padding: '1rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>Wallet Connection</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {connected ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Connected</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#111827', margin: 0 }}>
                {publicKey ? formatAddress(publicKey.toString()) : 'Unknown'}
              </p>
            </div>
            <div style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 0.75rem 0' }}>
              Connect your wallet to interact with the Tagged Summaries smart contract on Solana devnet.
            </p>
          </div>
        )}
        
        <WalletMultiButton 
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        />
      </div>
    </div>
  );
};
