import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import type { AIProcessingResult } from './groqService';
import type { TaggedSummaries } from '../types/tagged_summaries';

// Buffer polyfill for browser - using TextEncoder/TextDecoder instead
const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Program ID from the IDL
const PROGRAM_ID = new PublicKey('DFauwKZzbAymC7J68f2L2rL56S2t5sAboyNyvRJ82k6t');

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
        stringToBytes(hash),
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
          stringToBytes(transactionHash),
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
   * Get all tagged summaries for a student (this would require indexing in a real app)
   * For now, we'll return an empty array as we don't have a way to enumerate all accounts
   */
  async getStudentSummaries(_studentWallet: PublicKey): Promise<StoredTransaction[]> {
    // In a real application, you would need to:
    // 1. Use a program-derived address (PDA) to store a list of transaction hashes
    // 2. Or use an indexing service like Helius, QuickNode, or The Graph
    // 3. Or implement a custom RPC method in your program
    
    console.warn('getStudentSummaries not implemented - requires indexing service');
    return [];
  }

  /**
   * Generate a random 64-character transaction hash for testing
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
