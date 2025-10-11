/**
 * Service for handling AHREFS data upload and processing
 */

export interface AhrefsKeyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  traffic_potential: number;
  intents: string[];
  serp_features: string[];
  parent_keyword?: string;
  country: string;
  global_volume: number;
  global_traffic_potential: number;
  first_seen: string;
  last_update: string;
}

export interface AhrefsUploadResponse {
  success: boolean;
  message: string;
  file_id?: string;
  keywords_count?: number;
  keywords?: AhrefsKeyword[];
}

export interface AhrefsContentIdeasRequest {
  topic_id: string;
  topic_title: string;
  subtopics: string[];
  ahrefs_keywords: AhrefsKeyword[];
  user_id: string;
}

export interface AhrefsContentIdeasResponse {
  success: boolean;
  message: string;
  total_ideas: number;
  blog_ideas: number;
  software_ideas: number;
  ideas: any[];
  analytics_summary: {
    total_volume: number;
    avg_difficulty: number;
    avg_cpc: number;
    high_volume_keywords: number;
    low_difficulty_keywords: number;
    commercial_keywords: number;
  };
}

class AhrefsService {
  private baseUrl = 'http://localhost:8000';

  /**
   * Upload and parse AHREFS CSV file
   */
  async uploadAhrefsFile(file: File, topicId: string, userId: string): Promise<AhrefsUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('topic_id', topicId);
      formData.append('user_id', userId);

      const response = await fetch(`${this.baseUrl}/api/ahrefs/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload AHREFS file:', error);
      throw error;
    }
  }

  /**
   * Parse AHREFS CSV content directly
   */
  parseAhrefsCSV(csvContent: string): AhrefsKeyword[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split('\t').map(h => h.trim().replace(/"/g, ''));
    const keywords: AhrefsKeyword[] = [];

    // Map AHREFS columns
    const columnMapping = {
      keyword: ['keyword', 'query', 'search term'],
      volume: ['volume'],
      difficulty: ['difficulty'],
      cpc: ['cpc'],
      traffic_potential: ['traffic potential', 'traffic'],
      intents: ['intents'],
      serp_features: ['serp features'],
      parent_keyword: ['parent keyword'],
      country: ['country'],
      global_volume: ['global volume'],
      global_traffic_potential: ['global traffic potential'],
      first_seen: ['first seen'],
      last_update: ['last update']
    };

    const findColumnIndex = (targetColumns: string[]): number => {
      for (const target of targetColumns) {
        for (let i = 0; i < headers.length; i++) {
          if (target.toLowerCase() === headers[i].toLowerCase()) {
            return i;
          }
        }
      }
      return -1;
    };

    const keywordIndex = findColumnIndex(columnMapping.keyword);
    if (keywordIndex === -1) {
      throw new Error('Keyword column not found in CSV');
    }

    const volumeIndex = findColumnIndex(columnMapping.volume);
    const difficultyIndex = findColumnIndex(columnMapping.difficulty);
    const cpcIndex = findColumnIndex(columnMapping.cpc);
    const trafficIndex = findColumnIndex(columnMapping.traffic_potential);
    const intentsIndex = findColumnIndex(columnMapping.intents);
    const serpFeaturesIndex = findColumnIndex(columnMapping.serp_features);
    const parentKeywordIndex = findColumnIndex(columnMapping.parent_keyword);
    const countryIndex = findColumnIndex(columnMapping.country);
    const globalVolumeIndex = findColumnIndex(columnMapping.global_volume);
    const globalTrafficIndex = findColumnIndex(columnMapping.global_traffic_potential);
    const firstSeenIndex = findColumnIndex(columnMapping.first_seen);
    const lastUpdateIndex = findColumnIndex(columnMapping.last_update);

    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split('\t').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length <= keywordIndex) continue;

      const keyword = columns[keywordIndex];
      if (!keyword) continue;

      const keywordData: AhrefsKeyword = {
        keyword,
        volume: volumeIndex !== -1 ? parseInt(columns[volumeIndex]) || 0 : 0,
        difficulty: difficultyIndex !== -1 ? parseInt(columns[difficultyIndex]) || 0 : 0,
        cpc: cpcIndex !== -1 ? parseFloat(columns[cpcIndex]) || 0 : 0,
        traffic_potential: trafficIndex !== -1 ? parseInt(columns[trafficIndex]) || 0 : 0,
        intents: intentsIndex !== -1 ? columns[intentsIndex].split(',').map(i => i.trim()) : [],
        serp_features: serpFeaturesIndex !== -1 ? columns[serpFeaturesIndex].split(',').map(f => f.trim()) : [],
        parent_keyword: parentKeywordIndex !== -1 ? columns[parentKeywordIndex] : undefined,
        country: countryIndex !== -1 ? columns[countryIndex] : 'us',
        global_volume: globalVolumeIndex !== -1 ? parseInt(columns[globalVolumeIndex]) || 0 : 0,
        global_traffic_potential: globalTrafficIndex !== -1 ? parseInt(columns[globalTrafficIndex]) || 0 : 0,
        first_seen: firstSeenIndex !== -1 ? columns[firstSeenIndex] : '',
        last_update: lastUpdateIndex !== -1 ? columns[lastUpdateIndex] : ''
      };

      keywords.push(keywordData);
    }

    return keywords;
  }

  /**
   * Generate content ideas using AHREFS data
   */
  async generateContentIdeasWithAhrefs(request: AhrefsContentIdeasRequest): Promise<AhrefsContentIdeasResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/content-ideas/generate-ahrefs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate content ideas with AHREFS:', error);
      throw error;
    }
  }

  /**
   * Calculate analytics summary from AHREFS keywords
   */
  calculateAnalyticsSummary(keywords: AhrefsKeyword[]) {
    if (keywords.length === 0) {
      return {
        total_volume: 0,
        avg_difficulty: 0,
        avg_cpc: 0,
        high_volume_keywords: 0,
        low_difficulty_keywords: 0,
        commercial_keywords: 0
      };
    }

    const totalVolume = keywords.reduce((sum, kw) => sum + (kw.volume || 0), 0);
    
    // Handle both 'difficulty' and 'kd' field names
    const avgDifficulty = keywords.reduce((sum, kw) => {
      const difficulty = kw.difficulty || (kw as any).kd || 0;
      return sum + difficulty;
    }, 0) / keywords.length;
    
    const avgCpc = keywords.reduce((sum, kw) => sum + (kw.cpc || 0), 0) / keywords.length;
    const highVolumeKeywords = keywords.filter(kw => (kw.volume || 0) > 1000).length;
    
    const lowDifficultyKeywords = keywords.filter(kw => {
      const difficulty = kw.difficulty || (kw as any).kd || 0;
      return difficulty < 30;
    }).length;
    
    // Handle intents safely - check if it exists and is an array
    const commercialKeywords = keywords.filter(kw => {
      if (!kw.intents || !Array.isArray(kw.intents)) {
        return false;
      }
      return kw.intents.some(intent => 
        intent.toLowerCase().includes('commercial') || 
        intent.toLowerCase().includes('transactional')
      );
    }).length;

    return {
      total_volume: totalVolume,
      avg_difficulty: Math.round(avgDifficulty * 100) / 100,
      avg_cpc: Math.round(avgCpc * 100) / 100,
      high_volume_keywords: highVolumeKeywords,
      low_difficulty_keywords: lowDifficultyKeywords,
      commercial_keywords: commercialKeywords
    };
  }
}

export const ahrefsService = new AhrefsService();
