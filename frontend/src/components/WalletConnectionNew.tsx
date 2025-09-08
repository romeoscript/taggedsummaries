import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletConnectionNew: React.FC = () => {
  const { connected, publicKey } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {connected ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {publicKey ? formatAddress(publicKey.toString()) : 'Connected'}
          </span>
        </div>
      ) : null}
      
      <WalletMultiButton 
        style={{
          backgroundColor: connected ? '#10b981' : '#2563eb',
          color: 'white',
          fontWeight: '500',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          fontSize: '0.875rem'
        }}
      />
    </div>
  );
};
