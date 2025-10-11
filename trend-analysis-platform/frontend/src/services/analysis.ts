/**
 * Analysis Service
 * 
 * Service for managing keyword analysis operations.
 * Handles analysis requests, status tracking, and results retrieval.
 */

import apiService from './api';
import type {
  AnalysisStartResponse,
  AnalysisStatusResponse,
  AnalysisResultsResponse,
} from './api';

// Analysis request options
export interface AnalysisOptions {
  include_clustering?: boolean;
  include_competitor_analysis?: boolean;
  include_trend_analysis?: boolean;
  min_volume_threshold?: number;
  max_difficulty_threshold?: number;
  content_idea_generation?: boolean;
  optimization_tips?: boolean;
}

// Analysis status
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'error';

// Analysis progress
export interface AnalysisProgress {
  status: AnalysisStatus;
  progress: number;
  message: string;
  current_step?: string;
  estimated_completion?: string;
}

// Analysis results summary
export interface AnalysisSummary {
  total_keywords: number;
  total_volume: number;
  average_difficulty: number;
  average_cpc: number;
  intent_distribution: Record<string, number>;
  top_keywords: any[];
  high_opportunity_keywords: any[];
  content_opportunities: any[];
  seo_content_ideas: any[];
}

// Analysis service class
class AnalysisService {
  private activeAnalyses: Map<string, AnalysisProgress> = new Map();
  private statusCheckInterval: NodeJS.Timeout | null = null;

  /**
   * Start a new keyword analysis
   */
  async startAnalysis(
    fileId: string,
    options: AnalysisOptions = {}
  ): Promise<AnalysisStartResponse> {
    try {
      const response = await apiService.startAnalysis(fileId);
      
      // Initialize progress tracking
      this.activeAnalyses.set(response.analysis_id, {
        status: 'pending',
        progress: 0,
        message: 'Analysis started',
      });

      // Start status polling if not already running
      this.startStatusPolling();

      return response;
    } catch (error) {
      throw new Error(`Failed to start analysis: ${error}`);
    }
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(fileId: string): Promise<AnalysisProgress> {
    try {
      const response = await apiService.getAnalysisStatus(fileId);
      
      const progress: AnalysisProgress = {
        status: response.status as AnalysisStatus,
        progress: response.progress,
        message: response.message,
      };

      // Update active analyses
      if (response.analysis_id) {
        this.activeAnalyses.set(response.analysis_id, progress);
      }

      return progress;
    } catch (error) {
      throw new Error(`Failed to get analysis status: ${error}`);
    }
  }

  /**
   * Get analysis results
   */
  async getAnalysisResults(fileId: string): Promise<AnalysisResultsResponse> {
    try {
      const response = await apiService.getAnalysisResults(fileId);
      
      // Remove from active analyses when completed
      if (response.analysis_id) {
        this.activeAnalyses.delete(response.analysis_id);
      }

      return response;
    } catch (error) {
      throw new Error(`Failed to get analysis results: ${error}`);
    }
  }

  /**
   * Get all active analyses
   */
  getActiveAnalyses(): Map<string, AnalysisProgress> {
    return new Map(this.activeAnalyses);
  }

  /**
   * Get analysis progress by ID
   */
  getAnalysisProgress(analysisId: string): AnalysisProgress | undefined {
    return this.activeAnalyses.get(analysisId);
  }

  /**
   * Cancel analysis
   */
  async cancelAnalysis(analysisId: string): Promise<void> {
    try {
      // Remove from active analyses
      this.activeAnalyses.delete(analysisId);
      
      // In a real implementation, you would call an API endpoint to cancel the analysis
      console.log(`Analysis ${analysisId} cancelled`);
    } catch (error) {
      throw new Error(`Failed to cancel analysis: ${error}`);
    }
  }

  /**
   * Start status polling for active analyses
   */
  private startStatusPolling(): void {
    if (this.statusCheckInterval) {
      return; // Already polling
    }

    this.statusCheckInterval = setInterval(async () => {
      const activeIds = Array.from(this.activeAnalyses.keys());
      
      if (activeIds.length === 0) {
        this.stopStatusPolling();
        return;
      }

      // Check status for all active analyses
      for (const analysisId of activeIds) {
        try {
          const progress = this.activeAnalyses.get(analysisId);
          if (!progress) continue;

          // Update progress based on status
          if (progress.status === 'processing') {
            progress.progress = Math.min(progress.progress + 5, 95);
            progress.message = `Processing... ${progress.progress}%`;
          }
        } catch (error) {
          console.error(`Error checking status for analysis ${analysisId}:`, error);
        }
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * Stop status polling
   */
  private stopStatusPolling(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  /**
   * Clean up completed analyses
   */
  cleanupCompletedAnalyses(): void {
    const completedIds: string[] = [];
    
    for (const [id, progress] of this.activeAnalyses) {
      if (progress.status === 'completed' || progress.status === 'error') {
        completedIds.push(id);
      }
    }

    completedIds.forEach(id => this.activeAnalyses.delete(id));
  }

  /**
   * Get analysis summary
   */
  async getAnalysisSummary(fileId: string): Promise<AnalysisSummary> {
    try {
      const results = await this.getAnalysisResults(fileId);
      
      return {
        total_keywords: results.summary.total_keywords,
        total_volume: results.summary.total_volume,
        average_difficulty: results.summary.average_difficulty,
        average_cpc: results.summary.average_cpc,
        intent_distribution: results.summary.intent_distribution,
        top_keywords: results.keywords.slice(0, 10),
        high_opportunity_keywords: results.keywords
          .filter(k => k.opportunity_score >= 80)
          .slice(0, 10),
        content_opportunities: results.content_opportunities,
        seo_content_ideas: results.seo_content_ideas,
      };
    } catch (error) {
      throw new Error(`Failed to get analysis summary: ${error}`);
    }
  }

  /**
   * Export analysis results
   */
  async exportAnalysisResults(
    fileId: string,
    format: 'json' | 'csv' | 'xlsx' = 'json'
  ): Promise<Blob> {
    try {
      const results = await this.getAnalysisResults(fileId);
      
      if (format === 'json') {
        const jsonString = JSON.stringify(results, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
      }
      
      // For other formats, you would implement conversion logic
      throw new Error(`Export format ${format} not implemented yet`);
    } catch (error) {
      throw new Error(`Failed to export analysis results: ${error}`);
    }
  }

  /**
   * Get analysis history
   */
  async getAnalysisHistory(limit: number = 50, offset: number = 0): Promise<any[]> {
    try {
      const reports = await apiService.getReports(limit, offset);
      return reports.reports;
    } catch (error) {
      throw new Error(`Failed to get analysis history: ${error}`);
    }
  }

  /**
   * Delete analysis
   */
  async deleteAnalysis(analysisId: string): Promise<void> {
    try {
      await apiService.deleteReport(analysisId);
      
      // Remove from active analyses
      this.activeAnalyses.delete(analysisId);
    } catch (error) {
      throw new Error(`Failed to delete analysis: ${error}`);
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStatistics(): Promise<{
    total_analyses: number;
    completed_analyses: number;
    failed_analyses: number;
    average_processing_time: number;
    total_keywords_analyzed: number;
  }> {
    try {
      const reports = await apiService.getReports(1000, 0);
      
      const total = reports.reports.length;
      const completed = reports.reports.filter(r => r.status === 'completed').length;
      const failed = reports.reports.filter(r => r.status === 'error').length;
      const totalKeywords = reports.reports.reduce((sum, r) => sum + r.keywords_count, 0);
      
      return {
        total_analyses: total,
        completed_analyses: completed,
        failed_analyses: failed,
        average_processing_time: 0, // Would need to calculate from timestamps
        total_keywords_analyzed: totalKeywords,
      };
    } catch (error) {
      throw new Error(`Failed to get analysis statistics: ${error}`);
    }
  }

  /**
   * Validate analysis options
   */
  validateAnalysisOptions(options: AnalysisOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.min_volume_threshold !== undefined && options.min_volume_threshold < 0) {
      errors.push('Minimum volume threshold must be non-negative');
    }

    if (options.max_difficulty_threshold !== undefined && 
        (options.max_difficulty_threshold < 0 || options.max_difficulty_threshold > 100)) {
      errors.push('Maximum difficulty threshold must be between 0 and 100');
    }

    if (options.min_volume_threshold !== undefined && 
        options.max_difficulty_threshold !== undefined &&
        options.min_volume_threshold > 0 && options.max_difficulty_threshold < 100) {
      // This is a warning, not an error
      console.warn('High volume threshold with low difficulty threshold may result in few results');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get recommended analysis options
   */
  getRecommendedAnalysisOptions(keywordCount: number): AnalysisOptions {
    const options: AnalysisOptions = {
      include_clustering: keywordCount > 100,
      include_competitor_analysis: keywordCount > 50,
      include_trend_analysis: keywordCount > 200,
      content_idea_generation: true,
      optimization_tips: true,
    };

    if (keywordCount > 1000) {
      options.min_volume_threshold = 100;
      options.max_difficulty_threshold = 80;
    } else if (keywordCount > 500) {
      options.min_volume_threshold = 50;
      options.max_difficulty_threshold = 85;
    }

    return options;
  }

  /**
   * Cleanup method to stop polling and clear data
   */
  cleanup(): void {
    this.stopStatusPolling();
    this.activeAnalyses.clear();
  }
}

// Create and export singleton instance
const analysisService = new AnalysisService();
export default analysisService;

// Export types
export type {
  AnalysisOptions,
  AnalysisStatus,
  AnalysisProgress,
  AnalysisSummary,
};
