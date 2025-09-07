export interface AIProcessingResult {
  summary: string;
  tags: string[];
  category: string;
  confidenceScore: number;
}

export class GroqAIService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractMetadata(transactionData: string): Promise<AIProcessingResult> {
    const prompt = `Analyze this campus transaction and extract metadata:

Transaction: "${transactionData}"

Please provide a JSON response with the following structure:
{
  "summary": "A concise summary of the transaction (max 100 characters)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"] (max 5 tags),
  "category": "One of: dining, academic, transportation, entertainment, shopping, services, other",
  "confidenceScore": 85 (confidence percentage 0-100)
}

Focus on campus-related transactions. Tags should be relevant keywords like "food", "textbook", "bus", "coffee", "campus", etc.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from Groq API');
      }

      // Parse the JSON response
      const result = JSON.parse(content);
      
      // Validate and clean the result
      return {
        summary: result.summary?.substring(0, 100) || 'Transaction summary',
        tags: Array.isArray(result.tags) ? result.tags.slice(0, 5) : ['transaction'],
        category: result.category || 'other',
        confidenceScore: Math.min(Math.max(result.confidenceScore || 80, 0), 100)
      };

    } catch (error) {
      console.error('Groq API error:', error);
      // Return fallback result
      return {
        summary: 'Campus transaction',
        tags: ['campus', 'transaction'],
        category: 'other',
        confidenceScore: 50
      };
    }
  }

  async extractMetadataBatch(transactionDataList: string[]): Promise<AIProcessingResult[]> {
    const promises = transactionDataList.map(transaction => 
      this.extractMetadata(transaction)
    );
    return Promise.all(promises);
  }
}
