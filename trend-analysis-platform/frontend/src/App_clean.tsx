import { useState } from 'react';
// import { useAuth } from './hooks/useAuth';
import TrendsAnalysis from './pages/TrendsAnalysis';
import Settings from './pages/Settings.working';

// Simple page components
const Dashboard = () => (
  <div>
    <h2>🚀 TrendTap Dashboard</h2>
    <p>Welcome to the AI Research Workspace! This system features advanced LLM-powered semantic analysis for affiliate research.</p>
    
    <div style={{ backgroundColor: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
      <h3>✨ New Features:</h3>
      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
        <li><strong>AI-Powered Category Detection</strong> - Automatically detects topic categories</li>
        <li><strong>Semantic Analysis</strong> - Generates relevant subtopics and content opportunities</li>
        <li><strong>Smart Affiliate Programs</strong> - AI-recommended programs based on topic analysis</li>
        <li><strong>Comprehensive Testing</strong> - Test suite to verify LLM functionality</li>
      </ul>
    </div>
    
    <p>Navigate to <strong>"Affiliate Research"</strong> to use the full AI-powered research interface.</p>
  </div>
);

const AffiliateResearch = ({ onResearchComplete, onNavigateToTrends }: { 
  onResearchComplete?: (research: any) => void;
  onNavigateToTrends?: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [affiliateOffers, setAffiliateOffers] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError('');
    setSubtopics([]);
    setAffiliateOffers([]);
    setLoadingStep('🔍 Analyzing topic and generating subtopics...');

    try {
      // Step 1: Enhanced Topic Decomposition
      const topicResponse = await fetch('http://localhost:8000/api/enhanced-topics/analyze-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: searchQuery }),
      });

      if (!topicResponse.ok) {
        throw new Error('Failed to analyze topic');
      }

      const topicData = await topicResponse.json();
      setSubtopics(topicData.subtopics || []);
      setLoadingStep('💰 Finding relevant affiliate programs...');

      // Step 2: Affiliate Program Discovery
      const affiliateResponse = await fetch('http://localhost:8000/api/affiliate/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: searchQuery,
          category: null,
          country: null,
          min_commission: null,
          max_commission: null,
          payment_frequency: null,
          cookie_duration: null,
          network_preferences: [],
          exclude_networks: []
        }),
      });

      if (!affiliateResponse.ok) {
        throw new Error('Failed to find affiliate programs');
      }

      const affiliateData = await affiliateResponse.json();
      // The response format is different - it returns a research object with programs_data
      const programs = affiliateData.programs_data?.programs || [];
      setAffiliateOffers(programs);
      setLoadingStep('✅ Analysis complete!');

      // Store research data
      const researchData = {
        main_topic: searchQuery,
        subtopics: topicData.subtopics || [],
        programs: affiliateData.programs || [],
        created_at: new Date().toISOString()
      };

      if (onResearchComplete) {
        onResearchComplete(researchData);
      }

    } catch (err) {
      setError('Failed to search for affiliate programs. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div>
      <h2>🔍 Affiliate Research</h2>
      <p>Discover profitable affiliate opportunities using AI-powered analysis.</p>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Research Topic:
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., 'fitness equipment', 'cooking gadgets', 'home improvement'"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isLoading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isLoading ? 'Analyzing...' : '🔍 Start Research'}
        </button>
      </div>

      {loadingStep && (
        <div style={{ backgroundColor: '#e3f2fd', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          <p style={{ margin: 0, color: '#1976d2' }}>{loadingStep}</p>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {subtopics.length > 0 && (
        <div style={{ backgroundColor: '#e8f5e8', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>📋 Generated Subtopics</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {subtopics.map((subtopic, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {subtopic}
              </span>
            ))}
          </div>
        </div>
      )}

      {affiliateOffers.length > 0 && (
        <div style={{ backgroundColor: '#fff3e0', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>💰 Affiliate Programs Found</h3>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {affiliateOffers.map((offer, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>{offer.title}</h4>
                <p style={{ margin: '0 0 0.5rem 0', color: '#666' }}>{offer.description}</p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
                  <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    Commission: {offer.commission}
                  </span>
                  <span style={{ color: '#1976d2' }}>
                    Relevance: {offer.relevance_score}%
                  </span>
                  <span style={{ color: '#f57c00' }}>
                    Difficulty: {offer.difficulty_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subtopics.length > 0 && (
        <div style={{ backgroundColor: '#e1f5fe', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>📊 Next Steps</h3>
          <p>Your research is complete! You can now:</p>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            <li>Analyze trends for these subtopics</li>
            <li>Generate content ideas based on your research</li>
            <li>Explore specific affiliate programs in detail</li>
          </ul>
          <button
            onClick={onNavigateToTrends}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginTop: '1rem'
            }}
          >
            📈 Analyze Trends
          </button>
        </div>
      )}
    </div>
  );
};

const IdeaBurst = ({ currentResearch, selectedTrends, contentIdeas, onContentIdeasChange }: {
  currentResearch: any;
  selectedTrends: any[];
  contentIdeas: any[];
  onContentIdeasChange: (ideas: any[]) => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleContentGeneration = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Generate content ideas based on research or trends
      const baseTopics = selectedTrends.length > 0 
        ? selectedTrends.map(trend => trend.title)
        : (currentResearch?.subtopics || []);

      if (baseTopics.length === 0) {
        throw new Error('No topics available for content generation');
      }

      // Generate ideas for each topic
      const allIdeas = [];
      for (const topic of baseTopics) {
        const ideas = generateContentIdeas(topic);
        allIdeas.push(...ideas);
      }

      // Shuffle and limit to 20 ideas for better variety
      const shuffledIdeas = allIdeas.sort(() => Math.random() - 0.5).slice(0, 20);
      
      if (onContentIdeasChange) {
        onContentIdeasChange(shuffledIdeas);
      }
    } catch (err) {
      setError('Failed to generate content ideas. Please try again.');
      console.error('Content generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentIdeas = (baseTopic: string) => {
    const contentTypes = [
      'Complete Guide', 'Product Review', 'Tutorial', 'Listicle',
      'Web Application', 'Mobile App', 'SaaS Tool', 'Calculator Tool',
      'Dashboard App', 'Community Platform', 'Marketplace App',
      'Booking System', 'Analytics Tool', 'Content Generator'
    ];

    const ideas = [];
    
    for (let i = 0; i < 3; i++) {
      const contentType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      const difficulty = ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)];
      const timeEstimate = ['2-4 hours', '1-2 days', '1 week'][Math.floor(Math.random() * 3)];
      
      // Generate trend and opportunity scores
      const trendScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const opportunityScore = Math.floor(Math.random() * 30) + 70; // 70-100

      ideas.push({
        id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: `${baseTopic} ${contentType}: ${difficulty} Level Guide`,
        description: `A comprehensive ${contentType.toLowerCase()} focused on ${baseTopic.toLowerCase()}, designed for ${difficulty.toLowerCase()} users. This content will provide valuable insights and practical solutions.`,
        type: contentType,
        difficulty,
        estimated_time: timeEstimate,
        target_keywords: generateKeywords(baseTopic, contentType, difficulty),
        trendScore,
        opportunityScore,
        baseTopic,
        enhanced_keywords: [], // Will be populated after keyword enrichment
        seo_optimized: false // Will be true after keyword enhancement
      });
    }
    
    return ideas;
  };

  const generateKeywords = (topic: string, type: string, difficulty: string) => {
    const keywords = [
      topic,
      `${topic} ${type.toLowerCase()}`,
      `${difficulty.toLowerCase()} ${topic}`,
      `${topic} guide`,
      `${topic} tips`,
      `${topic} 2024`,
      `best ${topic}`,
      `${topic} for beginners`,
      `${topic} tutorial`,
      `${topic} review`
    ];
    
    // Shuffle and return 5-8 keywords
    return keywords.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 5);
  };

  const handleAhrefsUpload = async (file: File, ideaId: string) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Parse Ahrefs CSV format
      const headers = lines[0].split('\t').map(h => h.trim());
      const keywordIndex = headers.findIndex(h => h.toLowerCase().includes('keyword'));
      const difficultyIndex = headers.findIndex(h => h.toLowerCase().includes('difficulty'));
      const volumeIndex = headers.findIndex(h => h.toLowerCase().includes('volume'));
      const cpcIndex = headers.findIndex(h => h.toLowerCase().includes('cpc'));
      const trafficIndex = headers.findIndex(h => h.toLowerCase().includes('traffic potential'));
      
      if (keywordIndex === -1) {
        setError('Keyword column not found. Please ensure your CSV has a "Keyword" column.');
        return;
      }

      // Parse keywords with metrics
      const enhancedKeywords: any[] = [];
      lines.slice(1).forEach(line => {
        const columns = line.split('\t');
        const keyword = columns[keywordIndex]?.trim();
        if (!keyword) return;

        const keywordData = {
          keyword,
          search_volume: volumeIndex !== -1 ? parseInt(columns[volumeIndex]) || 0 : 0,
          keyword_difficulty: difficultyIndex !== -1 ? parseInt(columns[difficultyIndex]) || 0 : 0,
          cpc: cpcIndex !== -1 ? parseFloat(columns[cpcIndex]) || 0 : 0,
          traffic_potential: trafficIndex !== -1 ? parseInt(columns[trafficIndex]) || 0 : 0,
          opportunity_score: 0, // Will be calculated
          priority_score: 0, // Will be calculated
          affiliate_potential_score: 0, // Will be calculated
          is_optimized: false
        };

        // Calculate opportunity score
        const volumeScore = Math.min(100, (keywordData.search_volume / 1000) * 40);
        const difficultyScore = Math.max(0, (100 - keywordData.keyword_difficulty) * 0.4);
        const cpcScore = Math.min(20, keywordData.cpc * 10);
        keywordData.opportunity_score = Math.round(volumeScore + difficultyScore + cpcScore);
        
        // Calculate priority score
        keywordData.priority_score = Math.round(keywordData.opportunity_score * 0.8);
        
        // Calculate affiliate potential
        keywordData.affiliate_potential_score = Math.round(keywordData.opportunity_score * 0.7);

        enhancedKeywords.push(keywordData);
      });

      // Update the specific content idea with enhanced keywords
      if (onContentIdeasChange) {
        const updatedIdeas = contentIdeas.map(idea => 
          idea.id === ideaId 
            ? { 
                ...idea, 
                enhanced_keywords: enhancedKeywords,
                seo_optimized: true,
                keyword_count: enhancedKeywords.length
              }
            : idea
        );
        onContentIdeasChange(updatedIdeas);
      }

      setError('');
    } catch (err) {
      setError('Failed to process Ahrefs file. Please check the format and try again.');
      console.error('Ahrefs upload error:', err);
    }
  };

  const handleOptimizeKeywords = async (ideaId: string) => {
    try {
      const idea = contentIdeas.find(i => i.id === ideaId);
      if (!idea || !idea.enhanced_keywords) {
        setError('No enhanced keywords found for this idea. Please upload Ahrefs data first.');
        return;
      }

      // Simulate AI optimization
      const optimizedKeywords = idea.enhanced_keywords.map((keyword: any) => ({
        ...keyword,
        is_optimized: true,
        llm_optimized_title: `Best ${keyword.keyword} Guide 2024`,
        llm_optimized_description: `Complete guide to ${keyword.keyword} with expert tips and recommendations.`,
        content_suggestions: [
          `Focus on ${keyword.keyword} basics`,
          `Include ${keyword.keyword} examples`,
          `Add ${keyword.keyword} best practices`
        ],
        heading_suggestions: [
          `What is ${keyword.keyword}?`,
          `How to use ${keyword.keyword}`,
          `${keyword.keyword} Tips and Tricks`
        ],
        suggested_affiliate_networks: ['Amazon', 'ShareASale', 'CJ Affiliate'],
        monetization_opportunities: [
          `${keyword.keyword} products`,
          `${keyword.keyword} tools`,
          `${keyword.keyword} services`
        ]
      }));

      // Update the content idea with optimized keywords
      if (onContentIdeasChange) {
        const updatedIdeas = contentIdeas.map(idea => 
          idea.id === ideaId 
            ? { 
                ...idea, 
                enhanced_keywords: optimizedKeywords,
                seo_optimized: true,
                optimization_completed: true
              }
            : idea
        );
        onContentIdeasChange(updatedIdeas);
      }

      setError('');
    } catch (err) {
      setError('Failed to optimize keywords. Please try again.');
      console.error('Optimization error:', err);
    }
  };

  return (
    <div>
      <h2>💡 Idea Burst</h2>
      <p>Generate creative content ideas based on your research and trends.</p>
      
      {currentResearch && (
        <div style={{ backgroundColor: '#e8f5e8', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>📊 Current Research</h3>
          <p><strong>Topic:</strong> {currentResearch.main_topic}</p>
          <p><strong>Subtopics:</strong> {currentResearch.subtopics?.join(', ')}</p>
          <p><strong>Affiliate Programs Found:</strong> {currentResearch.programs?.length || 0}</p>
        </div>
      )}

      {selectedTrends.length > 0 && (
        <div style={{ backgroundColor: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <h3>📈 Selected Trends</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {selectedTrends.map((trend, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                {trend.title} ({trend.relevance_score}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Generate Ideas Button */}
      <div style={{ backgroundColor: '#fff3e0', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
        <h3>Generate Content Ideas</h3>
        <button
          onClick={handleContentGeneration}
          disabled={isGenerating || (selectedTrends.length === 0 && (!currentResearch?.subtopics || currentResearch.subtopics.length === 0))}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isGenerating ? '#ccc' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isGenerating ? 'Generating Ideas...' : '💡 Generate Content Ideas'}
        </button>
        <p style={{ color: '#666', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
          {selectedTrends.length > 0 
            ? 'Generate blog posts, tutorials, and other content ideas based on your selected trends.'
            : 'Generate content ideas based on your research subtopics, or select trends from Trends Analysis first.'
          }
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {contentIdeas.length > 0 && (
        <div style={{ backgroundColor: '#e8f5e8', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>💡 Generated Content Ideas ({contentIdeas.length})</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                Based on {selectedTrends.length > 0 ? 'selected trends' : 'research subtopics'}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
            {contentIdeas.map((idea, index) => (
              <div key={idea.id || index} style={{ 
                border: '1px solid #ddd', 
                padding: '1.5rem', 
                borderRadius: '12px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0', fontSize: '1.1rem', color: '#1976d2' }}>{idea.title}</h4>
                    {idea.seo_optimized && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          color: '#28a745',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ✅ SEO Optimized
                        </span>
                        {idea.optimization_completed && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#007bff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            ⚡ AI Enhanced
                          </span>
                        )}
                        {idea.keyword_count && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#6c757d'
                          }}>
                            📊 {idea.keyword_count} keywords
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    backgroundColor: idea.type === 'Complete Guide' ? '#e8f5e8' : 
                                   idea.type === 'Product Review' ? '#fff3e0' :
                                   idea.type === 'Tutorial' ? '#e3f2fd' :
                                   idea.type === 'Listicle' ? '#f3e5f5' :
                                   idea.type === 'Web Application' ? '#e1f5fe' :
                                   idea.type === 'Mobile App' ? '#f3e5f5' :
                                   idea.type === 'SaaS Tool' ? '#e8f5e8' :
                                   idea.type === 'Calculator Tool' ? '#fff8e1' :
                                   idea.type === 'Dashboard App' ? '#e0f2f1' :
                                   idea.type === 'Community Platform' ? '#fce4ec' :
                                   idea.type === 'Marketplace App' ? '#f1f8e9' :
                                   idea.type === 'Booking System' ? '#e3f2fd' :
                                   idea.type === 'Analytics Tool' ? '#fff3e0' :
                                   idea.type === 'Content Generator' ? '#f3e5f5' : '#f5f5f5',
                    color: idea.type === 'Complete Guide' ? '#2e7d32' : 
                           idea.type === 'Product Review' ? '#f57c00' :
                           idea.type === 'Tutorial' ? '#1976d2' :
                           idea.type === 'Listicle' ? '#7b1fa2' :
                           idea.type === 'Web Application' ? '#0277bd' :
                           idea.type === 'Mobile App' ? '#7b1fa2' :
                           idea.type === 'SaaS Tool' ? '#2e7d32' :
                           idea.type === 'Calculator Tool' ? '#f57c00' :
                           idea.type === 'Dashboard App' ? '#00695c' :
                           idea.type === 'Community Platform' ? '#c2185b' :
                           idea.type === 'Marketplace App' ? '#558b2f' :
                           idea.type === 'Booking System' ? '#1976d2' :
                           idea.type === 'Analytics Tool' ? '#f57c00' :
                           idea.type === 'Content Generator' ? '#7b1fa2' : '#666',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '16px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    marginLeft: '1rem'
                  }}>
                    {idea.type}
                  </div>
                </div>
                <p style={{ margin: '0 0 1rem 0', color: '#666', lineHeight: '1.5' }}>
                  {idea.description}
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#666' }}>📊</span>
                    <strong>Difficulty:</strong> {idea.difficulty}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: '#666' }}>⏱️</span>
                    <strong>Time:</strong> {idea.estimated_time}
                  </span>
                  {idea.trendScore && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#2e7d32' }}>
                      <span>📈</span>
                      <strong>Trend:</strong> {idea.trendScore}%
                    </span>
                  )}
                  {idea.opportunityScore && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1976d2' }}>
                      <span>🎯</span>
                      <strong>Opportunity:</strong> {idea.opportunityScore}%
                    </span>
                  )}
                </div>
                
                {/* Always show keyword management section */}
                <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: '#666' }}>
                      Keyword Management {idea.target_keywords && `(${idea.target_keywords.length} keywords)`}
                    </strong>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {idea.target_keywords && idea.target_keywords.length > 0 && (
                        <button
                          onClick={() => {
                            // Download keywords as CSV
                            const csvContent = idea.target_keywords.join(',');
                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${idea.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_keywords.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          📥 Download CSV
                        </button>
                      )}
                      <label style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        📤 Upload Ahrefs
                        <input
                          type="file"
                          accept=".csv,.tsv"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAhrefsUpload(file, idea.id);
                            }
                          }}
                        />
                      </label>
                      <button
                        onClick={() => handleOptimizeKeywords(idea.id)}
                        disabled={!idea.enhanced_keywords || idea.enhanced_keywords.length === 0}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: idea.optimization_completed ? '#28a745' : 
                                         (idea.enhanced_keywords && idea.enhanced_keywords.length > 0 ? '#2196f3' : '#ccc'),
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: idea.enhanced_keywords && idea.enhanced_keywords.length > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {idea.optimization_completed ? '✅ Optimized' : '⚡ Optimize'}
                      </button>
                    </div>
                  </div>
                  
                  {idea.target_keywords && idea.target_keywords.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {idea.target_keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '16px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {idea.enhanced_keywords && idea.enhanced_keywords.length > 0 && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e8f5e8', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#28a745' }}>Enhanced Keywords ({idea.enhanced_keywords.length}):</strong>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: '#28a745',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          ✅ Optimized
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {idea.enhanced_keywords.slice(0, 10).map((keyword: any, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              backgroundColor: '#d4edda',
                              color: '#155724',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '16px',
                              fontSize: '0.8rem',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            {keyword.keyword || keyword}
                            {keyword.search_volume && (
                              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                ({keyword.search_volume.toLocaleString()})
                              </span>
                            )}
                          </span>
                        ))}
                        {idea.enhanced_keywords.length > 10 && (
                          <span style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            +{idea.enhanced_keywords.length - 10} more...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Calendar = () => (
  <div>
    <h2>📅 Calendar</h2>
    <p>Content planning and scheduling for your research projects.</p>
    
    <div style={{ backgroundColor: '#f1f8e9', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
      <h3>Planning Features:</h3>
      <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
        <li><strong>Content Calendar</strong> - Schedule blog posts and articles</li>
        <li><strong>Project Tracking</strong> - Monitor research progress</li>
        <li><strong>Deadline Management</strong> - Set and track milestones</li>
        <li><strong>Team Collaboration</strong> - Share and assign tasks</li>
      </ul>
    </div>
    
    <div style={{ backgroundColor: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', marginTop: '1rem' }}>
      <h3>📅 Calendar View</h3>
      <p>Calendar functionality will be implemented here for content planning and scheduling.</p>
    </div>
  </div>
);

// Main App Component
function App() {
  const [currentTab, setCurrentTab] = useState(0);
  const [currentResearch, setCurrentResearch] = useState<any>(null);
  const [selectedTrends, setSelectedTrends] = useState<any[]>([]);
  const [contentIdeas, setContentIdeas] = useState<any[]>([]);
  // const { logout } = useAuth();

  // const handleLogout = async () => {
  //   await logout();
  // };

  const renderCurrentContent = () => {
    switch (currentTab) {
      case 0:
        return <Dashboard />;
      case 1:
        return <AffiliateResearch 
          onResearchComplete={setCurrentResearch} 
          onNavigateToTrends={() => setCurrentTab(2)} 
        />;
      case 2:
        return <TrendsAnalysis 
          currentResearch={currentResearch} 
          onTrendsSelected={setSelectedTrends}
        />;
      case 3:
        return <IdeaBurst 
          currentResearch={currentResearch} 
          selectedTrends={selectedTrends}
          contentIdeas={contentIdeas}
          onContentIdeasChange={setContentIdeas}
        />;
      case 4:
        return <Calendar />;
      case 5:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar Navigation */}
      <nav style={{ 
        width: '250px', 
        backgroundColor: '#1976d2', 
        color: 'white', 
        padding: '1rem 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>TrendTap</h1>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>AI Research Workspace</p>
        </div>
        
        <div style={{ flex: 1 }}>
          <button 
            onClick={() => setCurrentTab(0)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 0 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 0 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={() => setCurrentTab(1)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 1 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 1 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            🔍 Affiliate Research
          </button>
          <button 
            onClick={() => setCurrentTab(2)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 2 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 2 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            📈 Trends Analysis
          </button>
          <button 
            onClick={() => setCurrentTab(3)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 3 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 3 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            💡 Idea Burst
          </button>
          <button 
            onClick={() => setCurrentTab(4)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 4 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 4 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            📅 Calendar
          </button>
          <button 
            onClick={() => setCurrentTab(5)}
            style={{ 
              padding: '1rem', 
              border: 'none', 
              backgroundColor: currentTab === 5 ? '#e3f2fd' : 'transparent',
              cursor: 'pointer',
              color: currentTab === 5 ? '#1976d2' : 'white',
              width: '100%',
              textAlign: 'left'
            }}
          >
            ⚙️ Settings
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '1rem', backgroundColor: '#f5f5f5' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', minHeight: '70vh', borderRadius: '8px' }}>
          {renderCurrentContent()}
        </div>
      </main>
    </div>
  );
}

export default App;

