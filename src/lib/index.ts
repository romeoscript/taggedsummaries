// Export all types
export * from './types';

// Export the main blockchain client
export { TaggedSummaryClient } from './TaggedSummaryClient';

// Export AI integration components
export {
  CampusMetadataExtractor,
  MockAIService,
  OpenAIService,
  AIServiceProvider,
} from './CampusMetadataExtractor';

// Re-export commonly used types for convenience
export type {
  SummaryStore,
  TaggedSummary,
  StoreSummaryInput,
  AIProcessingResult,
  TaggedSummaryConfig,
} from './types';

// Export error types
export { TaggedSummaryError } from './types';

// Export default configuration
export { DEFAULT_CONFIG } from './types';
