import { supabase } from '../lib/supabase';

export interface LLMProvider {
  model_name: string;
  provider: string;
}

export interface LLMCredentials {
  modelName: string;
  provider: string;
  apiKey: string;
}

export interface MultipleLLMCredentials {
  providers: LLMCredentials[];
  primaryProvider: string;
}

class LLMCredentialsService {
  private cachedCredentials: LLMCredentials | null = null;
  private cachedMultipleCredentials: MultipleLLMCredentials | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get active LLM provider and API key from Supabase (single provider)
   */
  async getLLMCredentials(): Promise<LLMCredentials> {
    // Check cache first
    if (this.cachedCredentials && Date.now() < this.cacheExpiry) {
      console.log('Using cached LLM credentials');
      return this.cachedCredentials;
    }

    try {
      console.log('🔑 Fetching LLM credentials from Supabase...');

      // Step 1: Get active LLM provider
      const { data: providerData, error: providerError } = await supabase
        .from('llm_providers')
        .select('model_name, provider_type')
        .eq('is_active', true)
        .single();

      if (providerError) {
        console.error('Error fetching LLM provider:', providerError);
        throw new Error(`Failed to fetch LLM provider: ${providerError.message}`);
      }

      if (!providerData) {
        throw new Error('No active LLM provider found');
      }

      console.log('🔑 Active LLM provider:', providerData);

      // Step 2: Get API key for the provider (using the provider from step 1)
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('key_value')
        .eq('is_active', true)
        .eq('provider', providerData.provider_type)
        .single();

      if (keyError) {
        console.error('Error fetching API key:', keyError);
        throw new Error(`Failed to fetch API key for provider ${providerData.provider_type}: ${keyError.message}`);
      }

      if (!keyData) {
        throw new Error(`No active API key found for provider: ${providerData.provider_type}`);
      }

      const credentials: LLMCredentials = {
        modelName: providerData.model_name,
        provider: providerData.provider_type,
        apiKey: keyData.key_value
      };

      // Cache the credentials
      this.cachedCredentials = credentials;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;

      console.log('LLM credentials fetched successfully:', {
        modelName: credentials.modelName,
        provider: credentials.provider,
        apiKeyLength: credentials.apiKey.length
      });

      return credentials;
    } catch (error) {
      console.error('Failed to get LLM credentials:', error);
      throw error;
    }
  }

  /**
   * Clear cached credentials (useful for testing or when credentials change)
   */
  clearCache(): void {
    this.cachedCredentials = null;
    this.cacheExpiry = 0;
    console.log('LLM credentials cache cleared');
  }

  /**
   * Get the base URL for the LLM provider
   */
  getProviderBaseUrl(provider: string): string {
    const baseUrls: Record<string, string> = {
      'deepseek': 'https://api.deepseek.com',
      'openai': 'https://api.openai.com',
      'anthropic': 'https://api.anthropic.com',
      'google': 'https://generativelanguage.googleapis.com',
      'cohere': 'https://api.cohere.ai'
    };

    return baseUrls[provider.toLowerCase()] || 'https://api.openai.com';
  }

  /**
   * Get the API endpoint path for the model
   */
  getModelEndpoint(provider: string, modelName: string): string {
    const providerLower = provider.toLowerCase();
    
    switch (providerLower) {
      case 'deepseek':
        return '/v1/chat/completions';
      case 'openai':
        return '/v1/chat/completions';
      case 'anthropic':
        return '/v1/messages';
      case 'google':
        return `/v1beta/models/${modelName}:generateContent`;
      case 'cohere':
        return '/v1/chat';
      default:
        return '/v1/chat/completions';
    }
  }
}

export const llmCredentialsService = new LLMCredentialsService();
export default llmCredentialsService;
