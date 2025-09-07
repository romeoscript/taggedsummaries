import { useState, useEffect } from 'react';

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    connecting: false,
    error: null
  });

  const connectWallet = async () => {
    setWalletState(prev => ({ ...prev, connecting: true, error: null }));
    
    try {
      // Check if Phantom wallet is available
      if (!window.solana || !window.solana.isPhantom) {
        throw new Error('Phantom wallet not found. Please install Phantom wallet from https://phantom.app');
      }

      // Connect to wallet
      const response = await window.solana.connect();
      
      setWalletState({
        connected: true,
        publicKey: response.publicKey.toString(),
        connecting: false,
        error: null
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana && window.solana.disconnect) {
        await window.solana.disconnect();
      }
      setWalletState({
        connected: false,
        publicKey: null,
        connecting: false,
        error: null
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  useEffect(() => {
    // Check if wallet is available and already connected
    if (window.solana) {
      if (window.solana.isConnected && window.solana.publicKey) {
        setWalletState(prev => ({
          ...prev,
          connected: true,
          publicKey: window.solana.publicKey.toString()
        }));
      }

      // Listen for wallet events
      const handleAccountChange = (publicKey: any) => {
        if (publicKey) {
          setWalletState(prev => ({
            ...prev,
            connected: true,
            publicKey: publicKey.toString()
          }));
        } else {
          setWalletState({
            connected: false,
            publicKey: null,
            connecting: false,
            error: null
          });
        }
      };

      window.solana.on('accountChanged', handleAccountChange);

      return () => {
        if (window.solana && window.solana.removeListener) {
          window.solana.removeListener('accountChanged', handleAccountChange);
        }
      };
    } else {
      // Wallet not available
      setWalletState(prev => ({
        ...prev,
        error: 'Phantom wallet not detected. Please install Phantom wallet from https://phantom.app'
      }));
    }
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      isConnected?: boolean;
      publicKey?: any;
      connect: () => Promise<{ publicKey: any }>;
      disconnect: () => Promise<void>;
      on: (event: string, callback: (data: any) => void) => void;
      removeListener: (event: string, callback: (data: any) => void) => void;
    };
  }
}
