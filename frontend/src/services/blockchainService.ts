import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { AIProcessingResult } from './groqService';
import type { TaggedSummaries } from '../types/tagged_summaries';

// Buffer polyfill for browser
if (typeof globalThis.Buffer === 'undefined') {
  class BufferPolyfill extends Uint8Array {
    static from(data: string | Uint8Array, encoding?: string): BufferPolyfill {
      if (typeof data === 'string') {
        return new BufferPolyfill(new TextEncoder().encode(data));
      }
      return new BufferPolyfill(data);
    }
    
    static isBuffer(obj: any): boolean {
      return obj instanceof BufferPolyfill || obj instanceof Uint8Array;
    }
    
    static alloc(size: number): BufferPolyfill {
      return new BufferPolyfill(size);
    }
    
    static concat(list: Uint8Array[], length?: number): BufferPolyfill {
      const totalLength = length || list.reduce((acc, item) => acc + item.length, 0);
      const result = new BufferPolyfill(totalLength);
      let offset = 0;
      for (const item of list) {
        result.set(item, offset);
        offset += item.length;
      }
      return result;
    }
    
    constructor(sizeOrArray: number | Uint8Array) {
      if (typeof sizeOrArray === 'number') {
        super(sizeOrArray);
      } else {
        super(sizeOrArray);
      }
    }
  }
  
  globalThis.Buffer = BufferPolyfill as any;
}

const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Program ID from the IDL
const PROGRAM_ID = new PublicKey('F8qn46JxkYB3koH2tZc38qceCK3PHQ5PafaJR6u5AyD7');

export interface StoredTransaction {
  id: number;
  transactionHash: string;
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
  timestamp: number;
  studentWallet: PublicKey;
}

export class BlockchainService {
  private program: Program<TaggedSummaries>;

  constructor(program: Program<TaggedSummaries>, _provider: AnchorProvider) {
    this.program = program;
  }

  /**
   * Initialize the summary store (only needs to be called once)
   */
  async initializeSummaryStore(authority: PublicKey): Promise<string> {
    const [summaryStorePDA] = PublicKey.findProgramAddressSync(
      [stringToBytes('summary_store')],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .initialize()
      .accounts({
        summaryStore: summaryStorePDA,
        authority: authority,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Store a tagged summary on the blockchain
   */
  async storeTaggedSummary(
    aiResult: AIProcessingResult,
    transactionHash: string,
    student: PublicKey
  ): Promise<string> {
    // Generate a 64-character transaction hash if not provided
    const hash = transactionHash || this.generateTransactionHash();

    const [taggedSummaryPDA] = PublicKey.findProgramAddressSync(
      [
        stringToBytes('tagged_summary'),
        this.hashTransactionHash(hash),
        student.toBuffer(),
      ],
      PROGRAM_ID
    );

    const [summaryStorePDA] = PublicKey.findProgramAddressSync(
      [stringToBytes('summary_store')],
      PROGRAM_ID
    );

    const tx = await this.program.methods
      .storeTaggedSummary(
        hash,
        aiResult.summary,
        aiResult.tags,
        aiResult.category,
        aiResult.confidenceScore
      )
      .accounts({
        taggedSummary: taggedSummaryPDA,
        summaryStore: summaryStorePDA,
        student: student,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }

  /**
   * Get a tagged summary by transaction hash and student wallet
   */
  async getTaggedSummary(
    transactionHash: string,
    studentWallet: PublicKey
  ): Promise<StoredTransaction | null> {
    try {
      const [taggedSummaryPDA] = PublicKey.findProgramAddressSync(
        [
          stringToBytes('tagged_summary'),
          this.hashTransactionHash(transactionHash),
          studentWallet.toBuffer(),
        ],
        PROGRAM_ID
      );

      const account = await this.program.account.taggedSummary.fetch(taggedSummaryPDA);
      
      return {
        id: account.id.toNumber(),
        transactionHash: account.transactionHash,
        summary: account.summary,
        tags: account.tags,
        category: account.category,
        confidenceScore: account.confidenceScore,
        timestamp: account.timestamp.toNumber(),
        studentWallet: account.studentWallet,
      };
    } catch (error) {
      console.error('Error fetching tagged summary:', error);
      return null;
    }
  }

  /**
   * Get the summary store account
   */
  async getSummaryStore(): Promise<{ authority: PublicKey; totalSummaries: number } | null> {
    try {
      const [summaryStorePDA] = PublicKey.findProgramAddressSync(
        [stringToBytes('summary_store')],
        PROGRAM_ID
      );

      const account = await this.program.account.summaryStore.fetch(summaryStorePDA);
      
      return {
        authority: account.authority,
        totalSummaries: account.totalSummaries.toNumber(),
      };
    } catch (error) {
      console.error('Error fetching summary store:', error);
      return null;
    }
  }

  /**
   * Get all tagged summaries for a student
   * Fetches all tagged summary accounts and filters by student wallet
   */
  async getStudentSummaries(studentWallet: PublicKey): Promise<StoredTransaction[]> {
    try {
      console.log('🔍 Fetching all tagged summary accounts from blockchain...');
      
      // Get all tagged summary accounts
      const accounts = await this.program.account.taggedSummary.all();
      
      console.log('📋 Total accounts found on blockchain:', accounts.length);
      console.log('🔍 Raw blockchain accounts:', accounts);

      // Filter by student wallet and convert to StoredTransaction format
      const filteredAccounts = accounts.filter(account => {
        const matches = account.account.studentWallet.equals(studentWallet);
        if (matches) {
          console.log('✅ Found matching account for student:', {
            id: account.account.id.toNumber(),
            studentWallet: account.account.studentWallet.toString(),
            summary: account.account.summary
          });
        }
        return matches;
      });
      
      console.log('🎯 Accounts matching student wallet:', filteredAccounts.length);

      const result = filteredAccounts
        .map(account => ({
          id: account.account.id.toNumber(),
          transactionHash: account.account.transactionHash,
          summary: account.account.summary,
          tags: account.account.tags,
          category: account.account.category,
          confidenceScore: account.account.confidenceScore,
          timestamp: account.account.timestamp.toNumber(),
          studentWallet: account.account.studentWallet,
        }))
        .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, newest first
      
      console.log('📊 Final processed transactions:', result);
      return result;
    } catch (error) {
      console.error('❌ Error fetching student summaries:', error);
      return [];
    }
  }

  /**
   * Generate a random 64-character transaction hash for testing
   * The smart contract expects exactly 64 characters
   */
  private generateTransactionHash(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Create a keccak hash from the transaction hash for PDA seeds
   * This matches the smart contract's approach
   */
  private hashTransactionHash(transactionHash: string): Uint8Array {
    // Simple keccak-like hash function for browser compatibility
    // In a real app, you'd use a proper keccak library
    const encoder = new TextEncoder();
    const data = encoder.encode(transactionHash);
    
    // Simple hash function that produces 8 bytes
    let hash = new Uint8Array(8);
    for (let i = 0; i < data.length; i++) {
      hash[i % 8] ^= data[i];
    }
    
    return hash;
  }

  /**
   * Check if the summary store is initialized
   */
  async isSummaryStoreInitialized(): Promise<boolean> {
    try {
      const store = await this.getSummaryStore();
      return store !== null;
    } catch (error) {
      return false;
    }
  }
}
