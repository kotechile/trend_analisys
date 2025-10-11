// Topic Analysis Service - Hybrid approach
class TopicAnalysisService {
  constructor() {
    // Pre-built database for common topics (fast lookup)
    this.topicDatabase = {
      'eco friendly homes': {
        relatedAreas: [
          'Solar Power Systems', 'Green Home Architecture', 'Eco-Friendly HVAC',
          'Water Heating Solutions', 'Energy Efficient Windows', 'Sustainable Building Materials',
          'Smart Home Technology', 'Rainwater Harvesting', 'Geothermal Heating', 'LED Lighting Systems'
        ],
        affiliatePrograms: [
          { name: 'Tesla Solar', commission: '8-15%', category: 'Solar Power', difficulty: 'Medium' },
          { name: 'Lennox HVAC', commission: '5-12%', category: 'HVAC', difficulty: 'Easy' },
          { name: 'Andersen Windows', commission: '3-8%', category: 'Windows', difficulty: 'Medium' },
          { name: 'Rheem Water Heaters', commission: '4-10%', category: 'Water Heating', difficulty: 'Easy' }
        ]
      },
      'best cars for family': {
        relatedAreas: [
          'Family SUVs', 'Minivans', 'Safety Features', 'Car Seats & Accessories',
          'Auto Insurance', 'Car Financing', 'Vehicle Maintenance', 'Road Trip Planning',
          'Car Reviews', 'Automotive Technology'
        ],
        affiliatePrograms: [
          { name: 'Cars.com', commission: '3-8%', category: 'Car Listings', difficulty: 'Easy' },
          { name: 'AutoTrader', commission: '2-6%', category: 'Car Marketplace', difficulty: 'Easy' },
          { name: 'Edmunds', commission: '4-10%', category: 'Car Reviews', difficulty: 'Medium' },
          { name: 'CarMax', commission: '1-5%', category: 'Used Cars', difficulty: 'Easy' }
        ]
      }
    }

    // Keyword patterns for smart matching
    this.keywordPatterns = {
      car: ['car', 'vehicle', 'auto', 'automotive', 'driving', 'family car', 'suv', 'minivan'],
      eco: ['eco', 'green', 'sustainable', 'environmental', 'home', 'solar', 'energy'],
      fitness: ['weight', 'fitness', 'diet', 'health', 'exercise', 'workout', 'nutrition'],
      crypto: ['crypto', 'bitcoin', 'trading', 'blockchain', 'investment', 'finance'],
      tech: ['technology', 'software', 'gadgets', 'electronics', 'computer', 'phone']
    }

    // Cache for LLM-generated analyses
    this.analysisCache = new Map()
  }

  // Main analysis function
  async analyzeTopic(topic) {
    const topicLower = topic.toLowerCase().trim()
    
    // 1. Check exact match in database
    if (this.topicDatabase[topicLower]) {
      return this.topicDatabase[topicLower]
    }

    // 2. Check cache for previously generated analyses
    if (this.analysisCache.has(topicLower)) {
      return this.analysisCache.get(topicLower)
    }

    // 3. Try keyword pattern matching
    const patternMatch = this.findPatternMatch(topicLower)
    if (patternMatch) {
      return patternMatch
    }

    // 4. Generate new analysis using LLM (or fallback)
    const newAnalysis = await this.generateAnalysis(topicLower)
    
    // 5. Cache the result
    this.analysisCache.set(topicLower, newAnalysis)
    
    return newAnalysis
  }

  // Pattern matching for known categories
  findPatternMatch(topic) {
    for (const [category, keywords] of Object.entries(this.keywordPatterns)) {
      if (keywords.some(keyword => topic.includes(keyword))) {
        return this.topicDatabase[`best ${category} for family`] || 
               this.topicDatabase[category] || 
               this.generateFallbackAnalysis(topic)
      }
    }
    return null
  }

  // Generate analysis using LLM (simulated for now)
  async generateAnalysis(topic) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In real implementation, this would call an LLM API:
    // const response = await fetch('/api/analyze-topic', {
    //   method: 'POST',
    //   body: JSON.stringify({ topic }),
    //   headers: { 'Content-Type': 'application/json' }
    // })
    // return await response.json()

    // For now, generate a smart fallback
    return this.generateSmartFallback(topic)
  }

  // Smart fallback when no exact match
  generateSmartFallback(topic) {
    const words = topic.split(' ').filter(word => word.length > 2)
    const relatedAreas = words.map(word => 
      word.charAt(0).toUpperCase() + word.slice(1) + ' Solutions'
    )
    
    // Add some generic but relevant areas
    relatedAreas.push(
      'Product Reviews',
      'Buying Guides', 
      'Comparison Tools',
      'Expert Recommendations'
    )

    return {
      relatedAreas: relatedAreas.slice(0, 8), // Limit to 8 areas
      affiliatePrograms: [
        { name: 'Amazon Associates', commission: '1-10%', category: 'General', difficulty: 'Easy' },
        { name: 'ShareASale', commission: '5-15%', category: 'Various', difficulty: 'Medium' },
        { name: 'CJ Affiliate', commission: '3-12%', category: 'Technology', difficulty: 'Medium' }
      ]
    }
  }

  // Add new topic to database (for manual curation)
  addTopic(topic, analysis) {
    this.topicDatabase[topic.toLowerCase()] = analysis
  }

  // Get all topics in database
  getAllTopics() {
    return Object.keys(this.topicDatabase)
  }

  // Search topics by keyword
  searchTopics(keyword) {
    const keywordLower = keyword.toLowerCase()
    return Object.keys(this.topicDatabase).filter(topic => 
      topic.includes(keywordLower)
    )
  }
}

export default new TopicAnalysisService()


