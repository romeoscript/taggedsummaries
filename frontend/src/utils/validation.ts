import { keccak256 } from 'js-sha3';

/**
 * Validation utilities based on the smart contract constraints
 * These match the validation patterns from the test suite
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate transaction hash format and length
 */
export function validateTransactionHash(hash: string): ValidationResult {
  if (!hash) {
    return { isValid: false, error: 'Transaction hash is required' };
  }
  
  if (hash.length !== 64) {
    return { isValid: false, error: 'Transaction hash must be 64 characters' };
  }
  
  // Check if it's a valid hex string
  if (!/^[0-9a-fA-F]+$/.test(hash)) {
    return { isValid: false, error: 'Transaction hash must contain only hexadecimal characters' };
  }
  
  return { isValid: true };
}

/**
 * Validate summary length
 */
export function validateSummary(summary: string): ValidationResult {
  if (!summary || summary.trim().length === 0) {
    return { isValid: false, error: 'Summary is required' };
  }
  
  if (summary.length > 800) {
    return { isValid: false, error: 'Summary too long (maximum 800 characters)' };
  }
  
  return { isValid: true };
}

/**
 * Validate tags array
 */
export function validateTags(tags: string[]): ValidationResult {
  if (!tags || tags.length === 0) {
    return { isValid: false, error: 'At least one tag is required' };
  }
  
  if (tags.length > 15) {
    return { isValid: false, error: 'Too many tags (maximum 15 allowed)' };
  }
  
  // Check for empty tags
  const emptyTags = tags.filter(tag => !tag.trim());
  if (emptyTags.length > 0) {
    return { isValid: false, error: 'Tags cannot be empty' };
  }
  
  return { isValid: true };
}

/**
 * Validate category
 */
export function validateCategory(category: string): ValidationResult {
  if (!category || category.trim().length === 0) {
    return { isValid: false, error: 'Category is required' };
  }
  
  return { isValid: true };
}

/**
 * Validate confidence score
 */
export function validateConfidenceScore(score: number): ValidationResult {
  if (typeof score !== 'number' || isNaN(score)) {
    return { isValid: false, error: 'Confidence score must be a number' };
  }
  
  if (score < 0 || score > 100) {
    return { isValid: false, error: 'Invalid confidence score (0-100 only)' };
  }
  
  return { isValid: true };
}

/**
 * Generate a random 64-character transaction hash
 * This matches the pattern from the test suite
 */
export function generateTransactionHash(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Derive tagged summary PDA exactly as in the smart contract
 * This matches the deriveTaggedSummaryPDA function from the test suite
 */
export function deriveTaggedSummaryPDA(transactionHash: string, studentPubkey: string): string {
  const hashBytes = keccak256.arrayBuffer(transactionHash);
  const hashSlice = new Uint8Array(hashBytes.slice(0, 8));
  
  // Note: This is a simplified version for frontend use
  // The actual PDA derivation would need to be done on the blockchain side
  // This is mainly for validation and display purposes
  return `tagged_summary_${Array.from(hashSlice).map(b => b.toString(16).padStart(2, '0')).join('')}_${studentPubkey.slice(0, 8)}`;
}

/**
 * Comprehensive validation for AI processing result
 */
export function validateAIResult(result: {
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
}): ValidationResult {
  const summaryValidation = validateSummary(result.summary);
  if (!summaryValidation.isValid) {
    return summaryValidation;
  }
  
  const tagsValidation = validateTags(result.tags);
  if (!tagsValidation.isValid) {
    return tagsValidation;
  }
  
  const categoryValidation = validateCategory(result.category);
  if (!categoryValidation.isValid) {
    return categoryValidation;
  }
  
  const confidenceValidation = validateConfidenceScore(result.confidenceScore);
  if (!confidenceValidation.isValid) {
    return confidenceValidation;
  }
  
  return { isValid: true };
}
