# Tagged Summaries TypeScript Client Library

This TypeScript client library provides a complete interface for interacting with the Tagged Summaries Solana smart contract, including AI-powered metadata extraction for campus transactions.

## Features

- **Blockchain Integration**: Full TypeScript client for the Tagged Summaries smart contract
- **AI Processing**: Integration with AI services for automatic metadata extraction
- **Type Safety**: Complete TypeScript definitions matching the Rust smart contract
- **Error Handling**: Comprehensive error handling and validation
- **Flexible AI**: Support for both mock AI (development) and OpenAI GPT (production)

## Installation

The library is included in the main project. Install dependencies:

```bash
npm install
```

## Quick Start

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import {
  TaggedSummaryClient,
  CampusMetadataExtractor,
  MockAIService,
} from './src/lib';

// Setup
const connection = new Connection('http://localhost:8899', 'confirmed');
const program = anchor.workspace.TaggedSummaries;

// Create clients
const client = new TaggedSummaryClient(program, connection);
const aiExtractor = new CampusMetadataExtractor(new MockAIService());

// Process a transaction
const transactionData = "Student meal purchase at campus cafeteria - $12.50";
const aiResult = await aiExtractor.extractMetadata(transactionData);

// Store on blockchain
const input = {
  transactionHash: "your-transaction-hash",
  summary: aiResult.summary,
  tags: aiResult.tags,
  category: aiResult.category,
  confidenceScore: aiResult.confidenceScore,
};

const txSignature = await client.storeTaggedSummary(input, studentKeypair);
```

## Components

### TaggedSummaryClient

Main blockchain client for interacting with the smart contract.

**Methods:**
- `initialize(authority: Keypair)`: Initialize the summary store
- `storeTaggedSummary(input: StoreSummaryInput, student: Keypair)`: Store a tagged summary
- `getTaggedSummary(transactionHash: string, studentWallet: PublicKey)`: Fetch a summary
- `getSummaryStore()`: Get the global summary store
- `getStudentSummaries(studentWallet: PublicKey)`: Get all summaries for a student

### CampusMetadataExtractor

AI-powered metadata extraction for campus transactions.

**Features:**
- Mock AI service for development/testing
- OpenAI GPT integration for production
- Batch processing support
- Input validation

**Usage:**
```typescript
// Mock AI (development)
const extractor = new CampusMetadataExtractor(new MockAIService());

// OpenAI (production)
const extractor = new CampusMetadataExtractor(new OpenAIService('your-api-key'));

// Process transaction
const result = await extractor.extractMetadata(transactionData);
```

### Types

Complete TypeScript definitions:

- `TaggedSummary`: Summary data structure
- `SummaryStore`: Global store data
- `StoreSummaryInput`: Input for storing summaries
- `AIProcessingResult`: AI processing output
- `TaggedSummaryError`: Error types

## Configuration

The library uses sensible defaults but can be customized:

```typescript
const config = {
  maxTags: 10,
  maxSummaryLength: 500,
  maxConfidenceScore: 100,
  hashLength: 64,
};

const client = new TaggedSummaryClient(program, connection, config);
```

## Error Handling

The library includes comprehensive error handling:

```typescript
try {
  const result = await client.storeTaggedSummary(input, student);
} catch (error) {
  if (error.message === TaggedSummaryError.TooManyTags) {
    // Handle too many tags error
  }
}
```

## Examples

See `example.ts` for complete usage examples including:
- Basic transaction processing
- Batch processing
- OpenAI integration
- Error handling

## Development

### Running Tests

```bash
npm test
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## API Reference

### TaggedSummaryClient

#### Constructor
```typescript
new TaggedSummaryClient(program: Program<TaggedSummaries>, connection: Connection, config?: Partial<TaggedSummaryConfig>)
```

#### Methods

**initialize(authority: Keypair): Promise<string>**
Initialize the summary store. Returns transaction signature.

**storeTaggedSummary(input: StoreSummaryInput, student: Keypair): Promise<string>**
Store a tagged summary on the blockchain. Returns transaction signature.

**getTaggedSummary(transactionHash: string, studentWallet: PublicKey): Promise<TaggedSummary | null>**
Fetch a tagged summary by transaction hash and student wallet.

**getSummaryStore(): Promise<SummaryStore | null>**
Get the global summary store account.

**getStudentSummaries(studentWallet: PublicKey): Promise<TaggedSummary[]>**
Get all tagged summaries for a specific student.

### CampusMetadataExtractor

#### Constructor
```typescript
new CampusMetadataExtractor(aiService: AIServiceProvider)
```

#### Methods

**extractMetadata(transactionData: string): Promise<AIProcessingResult>**
Process a single transaction and extract metadata.

**extractMetadataBatch(transactionDataList: string[]): Promise<AIProcessingResult[]>**
Process multiple transactions in batch.

**validateResult(result: AIProcessingResult): boolean**
Validate an AI processing result.

## Contributing

1. Follow TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Use proper error handling
5. Follow the existing code style
