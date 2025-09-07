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
    const prompt = `You are a campus transaction analyzer. Analyze this transaction and return ONLY a valid JSON object with no additional text or explanation.

Transaction: "${transactionData}"

Return this exact JSON structure:
{
  "summary": "Brief summary (max 100 chars)",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "category": "dining|academic|transportation|entertainment|shopping|services|other",
  "confidenceScore": 85
}

Rules:
- Return ONLY the JSON object
- No explanations or additional text
- Summary max 100 characters
- Max 5 tags
- Category must be one of the listed options
- Confidence score 0-100`;

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

      console.log('Groq API response:', content);

      // Try to extract JSON from the response
      let result;
      try {
        // First try to parse the content directly
        result = JSON.parse(content);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract valid JSON from API response');
        }
      }
      
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
