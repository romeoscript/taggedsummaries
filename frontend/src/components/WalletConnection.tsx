import React from 'react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnection: React.FC = () => {
  const { connected, publicKey, connecting, error, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection</h3>
      
      {!connected ? (
        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={connecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {connecting ? 'Connecting...' : 'Connect Phantom Wallet'}
          </button>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <p className="text-gray-600 text-sm">
            Connect your Phantom wallet to interact with the Tagged Summaries smart contract on Solana devnet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Connected</p>
              <p className="font-mono text-sm text-gray-900">
                {publicKey ? formatAddress(publicKey) : 'Unknown'}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
