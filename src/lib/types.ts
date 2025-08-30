import { PublicKey } from '@solana/web3.js';

/**
 * TypeScript interfaces matching the Rust structs in the smart contract
 */

export interface SummaryStore {
  authority: PublicKey;
  totalSummaries: number;
}

export interface TaggedSummary {
  id: number;
  transactionHash: string;
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
  timestamp: number;
  studentWallet: PublicKey;
}

/**
 * Input types for smart contract instructions
 */
export interface StoreSummaryInput {
  transactionHash: string;
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
}

/**
 * AI processing result types
 */
export interface AIProcessingResult {
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
}

/**
 * Error types
 */
export enum TaggedSummaryError {
  TooManyTags = 'TooManyTags',
  SummaryTooLong = 'SummaryTooLong',
  InvalidConfidence = 'InvalidConfidence',
  InvalidHash = 'InvalidHash',
}

/**
 * Configuration types
 */
export interface TaggedSummaryConfig {
  maxTags: number;
  maxSummaryLength: number;
  maxConfidenceScore: number;
  hashLength: number;
}

export const DEFAULT_CONFIG: TaggedSummaryConfig = {
  maxTags: 10,
  maxSummaryLength: 500,
  maxConfidenceScore: 100,
  hashLength: 64,
};
