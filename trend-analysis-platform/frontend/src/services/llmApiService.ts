import { llmCredentialsService, LLMCredentials } from './llmCredentialsService';

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class LLMApiService {
  private baseUrl: string = '';

  /**
   * Make a direct LLM API call using credentials from Supabase
   */
  async callLLM(request: LLMRequest): Promise<LLMResponse> {
    try {
      console.log('🤖 Making LLM API call with dynamic credentials...');
      
      // Get credentials from Supabase
      const credentials = await llmCredentialsService.getLLMCredentials();
      
      // Set base URL for the provider
      this.baseUrl = llmCredentialsService.getProviderBaseUrl(credentials.provider);
      const endpoint = llmCredentialsService.getModelEndpoint(credentials.provider, credentials.modelName);
      const url = `${this.baseUrl}${endpoint}`;

      console.log('🤖 LLM API call details:', {
        provider: credentials.provider,
        modelName: credentials.modelName,
        url: url,
        messageCount: request.messages.length
      });

      // Prepare request based on provider
      const requestBody = this.prepareRequestBody(credentials, request);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiKey}`,
          ...this.getProviderHeaders(credentials.provider)
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LLM API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(credentials.provider, data);
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw error;
    }
  }

  /**
   * Prepare request body based on provider
   */
  private prepareRequestBody(credentials: LLMCredentials, request: LLMRequest): any {
    const provider = credentials.provider.toLowerCase();
    
    switch (provider) {
      case 'deepseek':
      case 'openai':
        return {
          model: credentials.modelName,
          messages: request.messages,
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.7
        };
      
      case 'anthropic':
        return {
          model: credentials.modelName,
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.7,
          messages: request.messages
        };
      
      case 'google':
        return {
          contents: request.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            maxOutputTokens: request.max_tokens || 1000,
            temperature: request.temperature || 0.7
          }
        };
      
      case 'cohere':
        return {
          model: credentials.modelName,
          message: request.messages[request.messages.length - 1]?.content || '',
          chat_history: request.messages.slice(0, -1).map(msg => ({
            role: msg.role,
            message: msg.content
          })),
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.7
        };
      
      default:
        // Default to OpenAI format
        return {
          model: credentials.modelName,
          messages: request.messages,
          max_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.7
        };
    }
  }

  /**
   * Get provider-specific headers
   */
  private getProviderHeaders(provider: string): Record<string, string> {
    const providerLower = provider.toLowerCase();
    
    switch (providerLower) {
      case 'anthropic':
        return {
          'anthropic-version': '2023-06-01'
        };
      case 'google':
        return {};
      default:
        return {};
    }
  }

  /**
   * Parse response based on provider
   */
  private parseResponse(provider: string, data: any): LLMResponse {
    const providerLower = provider.toLowerCase();
    
    switch (providerLower) {
      case 'deepseek':
      case 'openai':
        return {
          content: data.choices?.[0]?.message?.content || '',
          usage: data.usage
        };
      
      case 'anthropic':
        return {
          content: data.content?.[0]?.text || '',
          usage: data.usage
        };
      
      case 'google':
        return {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: data.usageMetadata
        };
      
      case 'cohere':
        return {
          content: data.text || '',
          usage: data.meta
        };
      
      default:
        return {
          content: data.choices?.[0]?.message?.content || data.text || '',
          usage: data.usage
        };
    }
  }

  /**
   * Generate subtopics for a given topic using LLM
   */
  async generateSubtopics(topic: string, maxSubtopics: number = 8): Promise<string[]> {
    try {
      console.log(`🔄 Generating subtopics for topic: ${topic}`);
      
      const request: LLMRequest = {
        messages: [
          {
            role: 'system',
            content: `You are a research assistant. Generate ${maxSubtopics} relevant subtopics for the given main topic. Each subtopic should be a concise phrase that represents a specific aspect or angle of the main topic. Return only the subtopics, one per line, without numbering or bullet points.`
          },
          {
            role: 'user',
            content: `Generate ${maxSubtopics} subtopics for: ${topic}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      const response = await this.callLLM(request);
      
      // Parse the response to extract subtopics
      const subtopics = response.content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, maxSubtopics);

      console.log('Generated subtopics:', subtopics);
      return subtopics;
    } catch (error) {
      console.error('Failed to generate subtopics:', error);
      throw error;
    }
  }
}

export const llmApiService = new LLMApiService();
export default llmApiService;
