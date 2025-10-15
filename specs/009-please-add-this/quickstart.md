# Quickstart Guide: Google Autocomplete Integration

## Overview
This guide demonstrates how to use the enhanced topic decomposition feature that integrates Google Autocomplete with LLM processing for better affiliate research.

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend application running on `http://localhost:3000`
- Valid user session (for rate limiting and caching)

## Quick Start

### 1. Basic Enhanced Topic Decomposition

**Request**:
```bash
curl -X POST "http://localhost:8000/api/enhanced-topics/decompose" \
  -H "Content-Type: application/json" \
  -d '{
    "search_query": "fitness equipment",
    "user_id": "test_user",
    "max_subtopics": 6,
    "use_autocomplete": true,
    "use_llm": true
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Topic decomposed into 6 enhanced subtopics",
  "original_query": "fitness equipment",
  "subtopics": [
    {
      "title": "best home gym equipment 2024",
      "search_volume_indicators": ["High search volume from autocomplete"],
      "autocomplete_suggestions": ["home gym setup", "gym equipment reviews"],
      "relevance_score": 0.9,
      "source": "hybrid"
    },
    {
      "title": "commercial fitness equipment",
      "search_volume_indicators": ["Found 12 related search suggestions"],
      "autocomplete_suggestions": ["gym equipment suppliers", "fitness equipment wholesale"],
      "relevance_score": 0.8,
      "source": "hybrid"
    }
  ],
  "autocomplete_data": {
    "query": "fitness equipment",
    "suggestions": ["fitness equipment", "fitness equipment for home", "fitness equipment store"],
    "total_suggestions": 15,
    "processing_time": 0.45
  },
  "processing_time": 1.2,
  "enhancement_methods": ["autocomplete", "llm"]
}
```

### 2. Direct Autocomplete Access

**Request**:
```bash
curl "http://localhost:8000/api/enhanced-topics/autocomplete/fitness%20equipment"
```

**Expected Response**:
```json
{
  "success": true,
  "query": "fitness equipment",
  "suggestions": [
    "fitness equipment",
    "fitness equipment for home",
    "fitness equipment store",
    "fitness equipment near me"
  ],
  "total_suggestions": 15,
  "processing_time": 0.45
}
```

### 3. Method Comparison

**Request**:
```bash
curl -X POST "http://localhost:8000/api/enhanced-topics/compare-methods" \
  -H "Content-Type: application/json" \
  -d '{
    "search_query": "digital marketing",
    "user_id": "test_user",
    "max_subtopics": 6
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "original_query": "digital marketing",
  "comparison": {
    "llm_only": {
      "subtopics": [
        "digital marketing basics",
        "advanced digital marketing",
        "digital marketing tools"
      ],
      "processing_time": 0.8,
      "method": "LLM Only"
    },
    "autocomplete_only": {
      "subtopics": [
        "digital marketing courses",
        "digital marketing agency",
        "digital marketing jobs"
      ],
      "processing_time": 0.6,
      "method": "Autocomplete Only"
    },
    "hybrid": {
      "subtopics": [
        "digital marketing strategy 2024",
        "digital marketing automation",
        "digital marketing analytics"
      ],
      "processing_time": 1.1,
      "method": "Hybrid (LLM + Autocomplete)"
    }
  },
  "recommendation": "Hybrid approach provides the best balance of intelligence and real-world relevance"
}
```

## Frontend Integration

### 1. Enhanced Topic Decomposition Component

```typescript
import React, { useState } from 'react';
import { EnhancedTopicDecompositionStep } from './components/workflow/EnhancedTopicDecompositionStep';

const MyWorkflow = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);

  const handleEnhancedSearch = async () => {
    const response = await fetch('/api/enhanced-topics/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        search_query: searchQuery,
        user_id: 'current_user',
        max_subtopics: 6,
        use_autocomplete: true,
        use_llm: true
      })
    });
    
    const data = await response.json();
    setResults(data);
  };

  return (
    <EnhancedTopicDecompositionStep
      onSearch={handleEnhancedSearch}
      results={results}
    />
  );
};
```

### 2. Using the Enhanced Hook

```typescript
import { useEnhancedTopics } from './hooks/useEnhancedTopics';

const MyComponent = () => {
  const { 
    decomposeTopic, 
    getAutocompleteSuggestions, 
    compareMethods,
    isLoading,
    error 
  } = useEnhancedTopics();

  const handleDecompose = async () => {
    const result = await decomposeTopic({
      search_query: 'fitness equipment',
      user_id: 'user123',
      max_subtopics: 6,
      use_autocomplete: true,
      use_llm: true
    });
    
    console.log('Enhanced subtopics:', result.subtopics);
  };

  return (
    <div>
      <button onClick={handleDecompose} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Enhanced Decomposition'}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};
```

## Testing Scenarios

### Scenario 1: Successful Hybrid Decomposition
1. **Given**: User enters "fitness equipment" as search query
2. **When**: User requests enhanced topic decomposition
3. **Then**: System returns 6 subtopics with relevance scores and autocomplete suggestions
4. **And**: Processing time is under 2 seconds
5. **And**: All subtopics have source attribution (hybrid, llm, or autocomplete)

### Scenario 2: Autocomplete API Failure
1. **Given**: Google Autocomplete API is unavailable
2. **When**: User requests enhanced topic decomposition
3. **Then**: System gracefully falls back to LLM-only decomposition
4. **And**: User receives valid subtopics without autocomplete data
5. **And**: Error is logged but not shown to user

### Scenario 3: Rate Limiting
1. **Given**: User makes multiple rapid requests
2. **When**: Rate limit is exceeded
3. **Then**: System returns 429 status with rate limit message
4. **And**: User is advised to wait before retrying
5. **And**: Subsequent requests are queued appropriately

### Scenario 4: Method Comparison
1. **Given**: User wants to compare different approaches
2. **When**: User requests method comparison
3. **Then**: System returns side-by-side results for all three methods
4. **And**: Processing times and relevance scores are compared
5. **And**: Recommendation is provided based on results

## Performance Expectations

### Response Times
- **Autocomplete requests**: < 500ms
- **LLM processing**: < 1s
- **Hybrid decomposition**: < 2s
- **Method comparison**: < 3s

### Success Rates
- **Autocomplete availability**: > 95%
- **LLM processing**: > 99%
- **Hybrid approach**: > 90%
- **Overall success**: > 95%

### Rate Limits
- **Per user**: 10 requests per minute
- **Per IP**: 100 requests per hour
- **Burst limit**: 5 requests per 10 seconds

## Error Handling

### Common Errors
- **400 Bad Request**: Invalid input parameters
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: System error

### Error Response Format
```json
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please wait before retrying.",
  "details": {
    "retry_after": 60,
    "current_limit": 10,
    "reset_time": "2024-12-19T15:30:00Z"
  }
}
```

## Monitoring and Debugging

### Logging
- All requests are logged with timestamps
- Processing times are tracked for each component
- Error rates are monitored and alerted
- User behavior is analyzed for optimization

### Debug Mode
Enable debug logging by setting environment variable:
```bash
export ENHANCED_TOPICS_DEBUG=true
```

This will provide detailed logs including:
- Autocomplete request/response details
- LLM prompt and response data
- Hybrid scoring calculations
- Performance metrics

## Next Steps

1. **Integration**: Add the enhanced component to your workflow
2. **Customization**: Adjust relevance scoring algorithms
3. **Monitoring**: Set up alerts for performance issues
4. **Optimization**: Fine-tune rate limiting and caching
5. **User Feedback**: Gather feedback on relevance and usefulness

## Support

For issues or questions:
- Check the logs for detailed error information
- Verify rate limiting and timeout settings
- Test with different query types and lengths
- Monitor performance metrics and adjust accordingly

