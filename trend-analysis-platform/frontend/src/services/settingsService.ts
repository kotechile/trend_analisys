/**
 * Settings Service
 * Handles API calls for settings management
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface LLMProviderSettings {
  default_provider: string;
  available_providers: string[];
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const settingsService = {
  /**
   * Get available LLM providers and current default
   */
  async getLLMProviders(): Promise<LLMProviderSettings> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings/llm-providers`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      throw new Error('Failed to fetch LLM providers');
    }
  },

  /**
   * Set the default LLM provider
   */
  async setDefaultLLMProvider(settings: LLMProviderSettings): Promise<SettingsResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/settings/llm-providers`, settings);
      return response.data;
    } catch (error) {
      console.error('Error setting LLM provider:', error);
      throw new Error('Failed to set LLM provider');
    }
  },

  /**
   * Get overall settings status
   */
  async getSettingsStatus(): Promise<SettingsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/settings/status`);
      return response.data;
    } catch (error) {
      console.error('Error fetching settings status:', error);
      throw new Error('Failed to fetch settings status');
    }
  }
};
