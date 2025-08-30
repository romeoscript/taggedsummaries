import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { PublicKey, Keypair, Connection, Transaction } from '@solana/web3.js';
import { TaggedSummaries } from '../target/types/tagged_summaries';
import {
  SummaryStore,
  TaggedSummary,
  StoreSummaryInput,
  TaggedSummaryConfig,
  DEFAULT_CONFIG,
  TaggedSummaryError,
} from './types';

/**
 * Main client for interacting with the Tagged Summaries smart contract
 */
export class TaggedSummaryClient {
  private program: Program<TaggedSummaries>;
  private connection: Connection;
  private config: TaggedSummaryConfig;

  constructor(
    program: Program<TaggedSummaries>,
    connection: Connection,
    config: Partial<TaggedSummaryConfig> = {}
  ) {
    this.program = program;
    this.connection = connection;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the SummaryStore PDA
   */
  private getSummaryStorePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('summary_store')],
      this.program.programId
    );
  }

  /**
   * Get the TaggedSummary PDA for a specific transaction and student
   */
  private getTaggedSummaryPDA(
    transactionHash: string,
    studentWallet: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('tagged_summary'),
        Buffer.from(transactionHash),
        studentWallet.toBuffer(),
      ],
      this.program.programId
    );
  }

  /**
   * Initialize the summary store
   */
  async initialize(authority: Keypair): Promise<string> {
    try {
      const [summaryStorePDA] = this.getSummaryStorePDA();

      const tx = await this.program.methods
        .initialize()
        .accounts({
          summaryStore: summaryStorePDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      console.log('Summary store initialized:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to initialize summary store:', error);
      throw error;
    }
  }

  /**
   * Store a tagged summary on the blockchain
   */
  async storeTaggedSummary(
    input: StoreSummaryInput,
    student: Keypair
  ): Promise<string> {
    try {
      // Validate input
      this.validateStoreSummaryInput(input);

      const [summaryStorePDA] = this.getSummaryStorePDA();
      const [taggedSummaryPDA] = this.getTaggedSummaryPDA(
        input.transactionHash,
        student.publicKey
      );

      const tx = await this.program.methods
        .storeTaggedSummary(
          input.transactionHash,
          input.summary,
          input.tags,
          input.category,
          input.confidenceScore
        )
        .accounts({
          taggedSummary: taggedSummaryPDA,
          summaryStore: summaryStorePDA,
          student: student.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([student])
        .rpc();

      console.log('Tagged summary stored:', tx);
      return tx;
    } catch (error) {
      console.error('Failed to store tagged summary:', error);
      throw error;
    }
  }

  /**
   * Fetch a tagged summary by transaction hash and student wallet
   */
  async getTaggedSummary(
    transactionHash: string,
    studentWallet: PublicKey
  ): Promise<TaggedSummary | null> {
    try {
      const [taggedSummaryPDA] = this.getTaggedSummaryPDA(
        transactionHash,
        studentWallet
      );

      const account = await this.program.account.taggedSummary.fetch(
        taggedSummaryPDA
      );

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
      console.error('Failed to fetch tagged summary:', error);
      return null;
    }
  }

  /**
   * Fetch the summary store account
   */
  async getSummaryStore(): Promise<SummaryStore | null> {
    try {
      const [summaryStorePDA] = this.getSummaryStorePDA();

      const account = await this.program.account.summaryStore.fetch(
        summaryStorePDA
      );

      return {
        authority: account.authority,
        totalSummaries: account.totalSummaries.toNumber(),
      };
    } catch (error) {
      console.error('Failed to fetch summary store:', error);
      return null;
    }
  }

  /**
   * Get all tagged summaries for a student
   */
  async getStudentSummaries(studentWallet: PublicKey): Promise<TaggedSummary[]> {
    try {
      const accounts = await this.program.account.taggedSummary.all([
        {
          memcmp: {
            offset: 8 + 8 + 64 + 4 + 500 + 4 + (32 * 10) + 4 + 50 + 1 + 8, // offset to studentWallet field
            bytes: studentWallet.toBase58(),
          },
        },
      ]);

      return accounts.map((account) => ({
        id: account.account.id.toNumber(),
        transactionHash: account.account.transactionHash,
        summary: account.account.summary,
        tags: account.account.tags,
        category: account.account.category,
        confidenceScore: account.account.confidenceScore,
        timestamp: account.account.timestamp.toNumber(),
        studentWallet: account.account.studentWallet,
      }));
    } catch (error) {
      console.error('Failed to fetch student summaries:', error);
      return [];
    }
  }

  /**
   * Validate input for storeTaggedSummary
   */
  private validateStoreSummaryInput(input: StoreSummaryInput): void {
    if (input.tags.length > this.config.maxTags) {
      throw new Error(TaggedSummaryError.TooManyTags);
    }

    if (input.summary.length > this.config.maxSummaryLength) {
      throw new Error(TaggedSummaryError.SummaryTooLong);
    }

    if (input.confidenceScore > this.config.maxConfidenceScore) {
      throw new Error(TaggedSummaryError.InvalidConfidence);
    }

    if (input.transactionHash.length !== this.config.hashLength) {
      throw new Error(TaggedSummaryError.InvalidHash);
    }
  }
}
