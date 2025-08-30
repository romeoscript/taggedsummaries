import * as anchor from '@coral-xyz/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import {
  TaggedSummaryClient,
  CampusMetadataExtractor,
  MockAIService,
  StoreSummaryInput,
} from './index';

/**
 * Example usage of the Tagged Summaries client library
 */
export async function exampleUsage() {
  // Setup connection and program
  const connection = new Connection('http://localhost:8899', 'confirmed');
  const provider = new anchor.AnchorProvider(connection, window.solana, {});
  anchor.setProvider(provider);

  // Get the program (you'll need to import your program ID)
  const program = anchor.workspace.TaggedSummaries;

  // Create the client
  const client = new TaggedSummaryClient(program, connection);

  // Create the AI extractor
  const aiExtractor = new CampusMetadataExtractor(new MockAIService());

  // Example: Process a campus transaction
  const transactionData = "Student meal purchase at campus cafeteria - $12.50 for lunch combo";
  
  try {
    // Step 1: Extract metadata using AI
    console.log('Extracting metadata from transaction...');
    const aiResult = await aiExtractor.extractMetadata(transactionData);
    
    console.log('AI Result:', aiResult);

    // Step 2: Create transaction hash (in real app, this would be the actual hash)
    const transactionHash = "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678";

    // Step 3: Prepare the input for blockchain storage
    const input: StoreSummaryInput = {
      transactionHash,
      summary: aiResult.summary,
      tags: aiResult.tags,
      category: aiResult.category,
      confidenceScore: aiResult.confidenceScore,
    };

    // Step 4: Store on blockchain (requires a student keypair)
    // const student = Keypair.generate(); // In real app, this would be the actual student wallet
    // const txSignature = await client.storeTaggedSummary(input, student);
    // console.log('Transaction signature:', txSignature);

    // Step 5: Fetch the stored summary
    // const summary = await client.getTaggedSummary(transactionHash, student.publicKey);
    // console.log('Stored summary:', summary);

  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

/**
 * Example: Batch processing multiple transactions
 */
export async function batchProcessingExample() {
  const aiExtractor = new CampusMetadataExtractor(new MockAIService());
  
  const transactions = [
    "Book purchase at campus bookstore - $45.00 for Chemistry textbook",
    "Bus pass renewal - $25.00 for monthly student transit",
    "Movie ticket at campus theater - $8.50 for student discount",
    "Coffee at campus Starbucks - $4.75 for grande latte",
  ];

  try {
    const results = await aiExtractor.extractMetadataBatch(transactions);
    console.log('Batch processing results:', results);
  } catch (error) {
    console.error('Error in batch processing:', error);
  }
}

/**
 * Example: Using OpenAI service (requires API key)
 */
export async function openAIExample() {
  // const openAIService = new OpenAIService('your-openai-api-key');
  // const aiExtractor = new CampusMetadataExtractor(openAIService);
  
  // const transactionData = "Student meal purchase at campus cafeteria - $12.50 for lunch combo";
  // const result = await aiExtractor.extractMetadata(transactionData);
  // console.log('OpenAI result:', result);
}
