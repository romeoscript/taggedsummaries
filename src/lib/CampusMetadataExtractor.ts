import { AIProcessingResult } from './types';

/**
 * Interface for AI service providers
 */
export interface AIServiceProvider {
  processTransaction(transactionData: string): Promise<AIProcessingResult>;
}

/**
 * Mock AI service for development/testing
 */
export class MockAIService implements AIServiceProvider {
  async processTransaction(transactionData: string): Promise<AIProcessingResult> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock AI processing logic
    const categories = ['food', 'academic', 'transportation', 'entertainment', 'shopping'];
    const commonTags = ['campus', 'student', 'university', 'meal', 'book', 'bus', 'movie', 'store'];
    
    // Simple heuristic-based processing
    const lowerData = transactionData.toLowerCase();
    
    let category = 'other';
    let tags: string[] = ['campus'];
    let confidenceScore = 75;

    // Determine category based on keywords
    if (lowerData.includes('food') || lowerData.includes('meal') || lowerData.includes('cafe')) {
      category = 'food';
      tags.push('food', 'meal');
      confidenceScore = 85;
    } else if (lowerData.includes('book') || lowerData.includes('course') || lowerData.includes('class')) {
      category = 'academic';
      tags.push('academic', 'education');
      confidenceScore = 90;
    } else if (lowerData.includes('bus') || lowerData.includes('transport') || lowerData.includes('parking')) {
      category = 'transportation';
      tags.push('transportation');
      confidenceScore = 80;
    } else if (lowerData.includes('movie') || lowerData.includes('game') || lowerData.includes('entertainment')) {
      category = 'entertainment';
      tags.push('entertainment');
      confidenceScore = 70;
    } else if (lowerData.includes('store') || lowerData.includes('shop') || lowerData.includes('purchase')) {
      category = 'shopping';
      tags.push('shopping');
      confidenceScore = 75;
    }

    // Generate a summary
    const summary = `Campus transaction processed: ${category} category with ${tags.length} tags. Transaction amount and details extracted.`;

    return {
      summary,
      tags: tags.slice(0, 5), // Limit to 5 tags
      category,
      confidenceScore,
    };
  }
}

/**
 * OpenAI GPT integration for AI processing
 */
export class OpenAIService implements AIServiceProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async processTransaction(transactionData: string): Promise<AIProcessingResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant that processes campus transaction data. 
              Analyze the transaction and return a JSON response with:
              - summary: A brief 2-3 sentence summary of the transaction
              - tags: An array of 3-5 relevant tags (strings)
              - category: One of: food, academic, transportation, entertainment, shopping, other
              - confidenceScore: A number between 0-100 indicating confidence in the analysis
              
              Focus on campus-related activities and student spending patterns.`
            },
            {
              role: 'user',
              content: `Process this campus transaction: ${transactionData}`
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const result = JSON.parse(content);
      
      return {
        summary: result.summary,
        tags: result.tags,
        category: result.category,
        confidenceScore: result.confidenceScore,
      };
    } catch (error) {
      console.error('OpenAI processing failed:', error);
      // Fallback to mock service
      const mockService = new MockAIService();
      return mockService.processTransaction(transactionData);
    }
  }
}

/**
 * Main campus metadata extractor that coordinates AI processing
 */
export class CampusMetadataExtractor {
  private aiService: AIServiceProvider;

  constructor(aiService: AIServiceProvider = new MockAIService()) {
    this.aiService = aiService;
  }

  /**
   * Process campus transaction data and extract metadata
   */
  async extractMetadata(transactionData: string): Promise<AIProcessingResult> {
    try {
      console.log('Processing transaction data with AI...');
      const result = await this.aiService.processTransaction(transactionData);
      
      console.log('AI processing completed:', {
        category: result.category,
        confidence: result.confidenceScore,
        tags: result.tags,
      });
      
      return result;
    } catch (error) {
      console.error('Failed to extract metadata:', error);
      throw error;
    }
  }

  /**
   * Process multiple transactions in batch
   */
  async extractMetadataBatch(transactionDataList: string[]): Promise<AIProcessingResult[]> {
    const results: AIProcessingResult[] = [];
    
    for (const transactionData of transactionDataList) {
      try {
        const result = await this.extractMetadata(transactionData);
        results.push(result);
      } catch (error) {
        console.error('Failed to process transaction in batch:', error);
        // Continue with other transactions
      }
    }
    
    return results;
  }

  /**
   * Validate AI processing result
   */
  validateResult(result: AIProcessingResult): boolean {
    return (
      result.summary.length > 0 &&
      result.summary.length <= 500 &&
      result.tags.length > 0 &&
      result.tags.length <= 10 &&
      result.category.length > 0 &&
      result.confidenceScore >= 0 &&
      result.confidenceScore <= 100
    );
  }
}
