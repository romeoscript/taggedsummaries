import { Program, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { keccak256 } from 'js-sha3';
import type { AIProcessingResult } from './groqService';
import type { TaggedSummaries } from '../types/tagged_summaries';
import { validateAIResult, validateTransactionHash } from '../utils/validation';

// Buffer polyfill for browser
if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = {
    from: (data: string | Uint8Array) => {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(data);
    },
    isBuffer: (obj: unknown): boolean => {
      return obj instanceof Uint8Array;
    },
    alloc: (size: number): Uint8Array => {
      return new Uint8Array(size);
    },
    concat: (list: Uint8Array[]): Uint8Array => {
      const totalLength = list.reduce((acc, item) => acc + item.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const item of list) {
        result.set(item, offset);
        offset += item.length;
      }
      return result;
    }
  } as typeof Buffer;
}

// Removed stringToBytes function - using Buffer.from instead

// Program ID from the IDL
const PROGRAM_ID = new PublicKey('2ZQqMy6V5cZjUpU8Y5F9MoJkXBLSLR2r1GiYuotMBhZu');

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

  constructor(program: Program<TaggedSummaries>) {
    this.program = program;
  }

  /**
   * Initialize the summary store (only needs to be called once)
   */
  async initializeSummaryStore(authority: PublicKey): Promise<string> {
    const [summaryStorePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('summary_store')],
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
   * Store a tagged summary on the blockchain - ENHANCED VERSION
   */
  async storeTaggedSummary(
    aiResult: AIProcessingResult,
    transactionHash: string,
    student: PublicKey
  ): Promise<string> {
    // Validate AI result before processing
    const aiValidation = validateAIResult(aiResult);
    if (!aiValidation.isValid) {
      throw new Error(`AI Result validation failed: ${aiValidation.error}`);
    }

    // Generate a 64-character transaction hash if not provided
    const hash = transactionHash || this.generateTransactionHash();
    
    // Validate transaction hash
    const hashValidation = validateTransactionHash(hash);
    if (!hashValidation.isValid) {
      throw new Error(`Transaction hash validation failed: ${hashValidation.error}`);
    }

     console.log('🔗 Storing tagged summary...');
     console.log('   Hash:', hash);
     console.log('   Student:', student.toString());

     // Generate PDAs exactly as in the smart contract
     const hashBytes = keccak256.arrayBuffer(hash);
     const hashSlice = new Uint8Array(hashBytes.slice(0, 8));
     console.log(PROGRAM_ID, 'PROGRAM_ID');
     
     
     const [taggedSummaryPDA] = PublicKey.findProgramAddressSync(
       [
         Buffer.from('tagged_summary'),
         hashSlice,
         student.toBuffer(),
       ],
       PROGRAM_ID
     );

     const [summaryStorePDA] = PublicKey.findProgramAddressSync(
       [Buffer.from('summary_store')],
       PROGRAM_ID
     );

     // Ensure all data types are correct
     const summary = String(aiResult.summary);
     const tags = aiResult.tags.map(tag => String(tag));
     const category = String(aiResult.category);
     const confidenceScore = Math.floor(Number(aiResult.confidenceScore));

     console.log('   Processed data:', {
       hash,
       summary: summary.substring(0, 50) + '...',
       tags,
       category,
       confidenceScore
     });

     console.log('   Using PDA:', taggedSummaryPDA.toString());
     console.log('   PDA derivation seeds:', [
       'tagged_summary',
       Array.from(hashSlice).map(b => b.toString(16).padStart(2, '0')).join(''),
       student.toString()
     ]);

     try {
       const tx = await this.program.methods
         .storeTaggedSummary(
           hash,
           summary,
           tags,
           category,
           confidenceScore
         )
         .accounts({
           taggedSummary: taggedSummaryPDA,
           summaryStore: summaryStorePDA,
           student: student,
           systemProgram: web3.SystemProgram.programId,
         })
         .rpc();

       console.log('✅ Tagged summary stored:', tx);
       return tx;
     } catch (error: unknown) {
       console.error('❌ Error storing tagged summary:', error);
       
       // Parse specific error messages from the smart contract
       if (error instanceof Error && error.message) {
         if (error.message.includes('Too many tags')) {
           throw new Error('Too many tags (maximum 15 allowed)');
         }
         if (error.message.includes('Summary too long')) {
           throw new Error('Summary too long (maximum 800 characters)');
         }
         if (error.message.includes('Invalid confidence score')) {
           throw new Error('Invalid confidence score (0-100 only)');
         }
         if (error.message.includes('Transaction hash must be 64 characters')) {
           throw new Error('Transaction hash must be 64 characters');
         }
         if (error.message.includes('already in use')) {
           throw new Error('This transaction hash has already been used');
         }
       }
       
       // Re-throw with original error if no specific message found
       throw error;
     }
  }

  /**
   * Get a tagged summary by transaction hash and student wallet
   */
  async getTaggedSummary(
    transactionHash: string,
    studentWallet: PublicKey
  ): Promise<StoredTransaction | null> {
    try {
      const hashBytes = keccak256.arrayBuffer(transactionHash);
      const hashSlice = new Uint8Array(hashBytes.slice(0, 8));

       const [taggedSummaryPDA] = PublicKey.findProgramAddressSync(
         [
           Buffer.from('tagged_summary'),
           hashSlice,
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
    } catch {
      console.error('Error fetching tagged summary');
      return null;
    }
  }

  /**
   * Get the summary store account
   */
  async getSummaryStore(): Promise<{ authority: PublicKey; totalSummaries: number } | null> {
    try {
      const [summaryStorePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('summary_store')],
        PROGRAM_ID
      );

      const account = await this.program.account.summaryStore.fetch(summaryStorePDA);
      
      return {
        authority: account.authority,
        totalSummaries: account.totalSummaries.toNumber(),
      };
    } catch {
      console.error('Error fetching summary store');
      return null;
    }
  }

  /**
   * Get all tagged summaries for a student
   */
  async getStudentSummaries(studentWallet: PublicKey): Promise<StoredTransaction[]> {
    try {
      const accounts = await this.program.account.taggedSummary.all();
      
      const filteredAccounts = accounts.filter(account => 
        account.account.studentWallet.equals(studentWallet)
      );

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
        .sort((a, b) => b.timestamp - a.timestamp);
      
      return result;
    } catch {
      console.error('Error fetching student summaries');
      return [];
    }
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
    } catch {
      return false;
    }
  }
}