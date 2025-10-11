/**
 * Mock API Service Layer
 * Mocks API responses for frontend development without a backend
 */

// import { AxiosRequestConfig } from 'axios'; // Unused import
import {
  WorkflowSession, 
  TopicDecomposition, 
  TrendAnalysis, 
  WorkflowStep
} from '../types/workflow';

const mockData = {
  workflowSession: {
    id: 'mock-session-123',
    userId: 'mock-user',
    currentStep: WorkflowStep.TOPIC_DECOMPOSITION,
    progressPercentage: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as WorkflowSession,
  topicDecomposition: {
    id: 'mock-decomp-123',
    searchQuery: 'test query',
    subtopics: [
      { name: 'Subtopic 1', description: 'Description 1', relevanceScore: 0.9, selected: false },
      { name: 'Subtopic 2', description: 'Description 2', relevanceScore: 0.8, selected: false },
    ],
    createdAt: new Date().toISOString(),
    userId: 'mock-user',
  } as TopicDecomposition,
  affiliateOffers: {
    offers: [
      { id: 'offer-1', name: 'Offer 1', description: 'Desc 1', commission: '10%', category: 'Cat 1', difficulty: 'easy', selected: false, createdAt: new Date().toISOString() },
      { id: 'offer-2', name: 'Offer 2', description: 'Desc 2', commission: '20%', category: 'Cat 2', difficulty: 'medium', selected: false, createdAt: new Date().toISOString() },
    ],
    totalFound: 2,
  },
  trendAnalysis: {
    id: 'trend-123',
    subtopicIds: ['Subtopic 1'],
    trendData: [
      { keyword: 'Keyword 1', searchVolume: 1000, trendDirection: 'rising', competition: 'low', opportunityScore: 80, timeframe: 'Last 30 days' },
      { keyword: 'Keyword 2', searchVolume: 2000, trendDirection: 'stable', competition: 'medium', opportunityScore: 60, timeframe: 'Last 30 days' },
    ],
    insights: ['Insight 1', 'Insight 2'],
    createdAt: new Date().toISOString(),
    userId: 'mock-user',
  } as TrendAnalysis,
  contentIdeas: {
    contentIdeas: [
      { id: 'idea-1', title: 'Idea 1', description: 'Desc 1', contentType: 'blog_post', targetAudience: 'Audience 1', keywords: ['kw1', 'kw2'], affiliateOffers: ['offer-1'], priority: 'high', status: 'draft', createdAt: new Date().toISOString() },
      { id: 'idea-2', title: 'Idea 2', description: 'Desc 2', contentType: 'software_idea', targetAudience: 'Audience 2', keywords: ['kw3', 'kw4'], affiliateOffers: ['offer-2'], priority: 'medium', status: 'draft', createdAt: new Date().toISOString() },
    ],
    totalGenerated: 2,
  },
  keywordClusters: {
    clusters: [
      { id: 'cluster-1', name: 'Cluster 1', keywords: ['kw1', 'kw2'], avgVolume: 1500, avgDifficulty: 20, avgCPC: 0.5, selected: false, createdAt: new Date().toISOString() },
      { id: 'cluster-2', name: 'Cluster 2', keywords: ['kw3', 'kw4'], avgVolume: 2500, avgDifficulty: 40, avgCPC: 0.8, selected: false, createdAt: new Date().toISOString() },
    ],
    totalClusters: 2,
  },
  externalToolResults: {
    processedKeywords: 100,
    clusters: [],
  },
  tabs: {
    tabs: [],
    activeTab: 0,
  },
  llmProviders: [
    {
      id: '1',
      name: 'OpenAI GPT-3.5 Turbo',
      provider_type: 'openai',
      model_name: 'gpt-3.5-turbo',
      is_active: true,
      is_default: true,
      priority: 1,
      total_requests: 1250,
      successful_requests: 1245,
      failed_requests: 5,
      total_tokens_used: 2500000,
      total_cost: 12.50,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Google Gemini Pro',
      provider_type: 'google',
      model_name: 'gemini-pro',
      is_active: true,
      is_default: false,
      priority: 2,
      total_requests: 800,
      successful_requests: 790,
      failed_requests: 10,
      total_tokens_used: 1800000,
      total_cost: 9.00,
      last_used: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ],
  topicAnalysis: {
    result: 'ok'
  }
};

export const mockApiService = {
  get: async <T = any>(url: string): Promise<T> => {
    console.log(`[Mock API] GET: ${url}`);
    if (url.includes('sessions')) {
      return mockData.workflowSession as any;
    }
    if (url.includes('tabs')) {
        return mockData.tabs as any;
    }
    if (url.includes('admin/llm/providers')) {
        return mockData.llmProviders as any;
    }
    return {} as T;
  },
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    console.log(`[Mock API] POST: ${url}`, data);
    if (url.includes('topic-decomposition')) {
      return mockData.topicDecomposition as any;
    }
    if (url.includes('affiliate-research')) {
      return mockData.affiliateOffers as any;
    }
    if (url.includes('trend-analysis')) {
      return mockData.trendAnalysis as any;
    }
    if (url.includes('content/generate')) {
      return mockData.contentIdeas as any;
    }
    if (url.includes('keywords/cluster')) {
      return mockData.keywordClusters as any;
    }
    if (url.includes('external-tools/process')) {
      return mockData.externalToolResults as any;
    }
    if (url.includes('sessions')) {
        return mockData.workflowSession as any;
    }
    if (url.includes('topic-analysis/analyze')) {
        return mockData.topicAnalysis as any;
    }
    return {} as T;
  },
  put: async <T = any>(url: string, data?: any): Promise<T> => {
    console.log(`[Mock API] PUT: ${url}`, data);
    return {} as T;
  },
  delete: async <T = any>(url: string): Promise<T> => {
    console.log(`[Mock API] DELETE: ${url}`);
    return {} as T;
  },
  patch: async <T = any>(url:string, data?: any): Promise<T> => {
    console.log(`[Mock API] PATCH: ${url}`, data);
    return {} as T;
  },
};