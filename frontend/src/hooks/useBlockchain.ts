import { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { BlockchainService } from '../services/blockchainService';
import type { AIProcessingResult } from '../services/groqService';
import type { TaggedSummaries } from '../types/tagged_summaries';
import idl from '../idl/tagged_summaries.json';

export const useBlockchain = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create the program instance
  const program = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;

    const provider = new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
      { commitment: 'confirmed' }
    );

    return new Program<TaggedSummaries>(
      idl as TaggedSummaries,
      provider
    );
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  // Create blockchain service
  const blockchainService = useMemo(() => {
    if (!program) return null;
    
    return new BlockchainService(program);
  }, [program]);

  // Check if summary store is initialized
  useEffect(() => {
    const checkInitialization = async () => {
      if (!program || !publicKey) {
        setIsInitialized(null);
        return;
      }

      try {
        setLoading(true);
        
        const service = new BlockchainService(program);
        const initialized = await service.isSummaryStoreInitialized();
        setIsInitialized(initialized);
        setError(null);
      } catch (err) {
        console.error('Error checking initialization:', err);
        setError('Failed to check blockchain status');
        setIsInitialized(false);
      } finally {
        setLoading(false);
      }
    };

    checkInitialization();
  }, [program, publicKey, connection, signTransaction, signAllTransactions]);

  const initializeSummaryStore = async (): Promise<string> => {
    if (!blockchainService || !publicKey) {
      throw new Error('Wallet not connected');
    }

    // Prevent double initialization
    if (isInitialized === true) {
      console.log('Summary store already initialized, skipping...');
      return 'already-initialized';
    }

    // Prevent concurrent initialization
    if (loading) {
      console.log('Initialization already in progress, skipping...');
      return 'initialization-in-progress';
    }

    try {
      setLoading(true);
      setError(null);
      
      // Create a keypair for the authority (in a real app, this would be the program deployer)
      const authority = publicKey;
      
      const txSignature = await blockchainService.initializeSummaryStore(authority);
      setIsInitialized(true);
      return txSignature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const storeTaggedSummary = async (
    aiResult: AIProcessingResult,
    transactionHash?: string
  ): Promise<string> => {
    if (!blockchainService || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      setLoading(true);
      setError(null);
      
      const txSignature = await blockchainService.storeTaggedSummary(
        aiResult,
        transactionHash || '',
        publicKey
      );
      
      return txSignature;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to store transaction';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTaggedSummary = async (
    transactionHash: string,
    studentWallet: PublicKey
  ) => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available');
    }

    return await blockchainService.getTaggedSummary(transactionHash, studentWallet);
  };

  const getSummaryStore = async () => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available');
    }

    return await blockchainService.getSummaryStore();
  };

  const getStudentSummaries = async (studentWallet: PublicKey) => {
    if (!blockchainService) {
      throw new Error('Blockchain service not available');
    }

    return await blockchainService.getStudentSummaries(studentWallet);
  };

  return {
    program,
    blockchainService,
    isInitialized,
    loading,
    error,
    initializeSummaryStore,
    storeTaggedSummary,
    getTaggedSummary,
    getSummaryStore,
    getStudentSummaries,
  };
};
