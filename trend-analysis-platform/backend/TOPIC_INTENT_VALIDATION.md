# Topic Intent Validation System

## Overview

The affiliate search system now uses **topic intent detection** to determine the appropriate search strategy for ANY topic, not just predefined categories.

## How It Works

### 1. **Topic Category Detection**

The system analyzes the topic and search term to identify intent:

- **`abstract_concept`**: Career development, salary negotiation, professional networks, strategies, methodologies
  - Requires curated programs only (no generic web scraping)
  - Examples: "Building professional networks", "Salary negotiation strategies"
  
- **`concrete_product`**: Cameras, lenses, software, tools, equipment
  - Allows web scraping + curated programs
  - Examples: "Photography equipment", "Video editing software"
  
- **`specific_brand`**: Named products, brands with capital letters
  - Uses focused search strategies
  - Examples: "Adobe Photoshop", "Canon Cameras"

### 2. **Search Strategy Selection**

Based on detected category:

```python
# Abstract concepts (career, building, strategies, etc.)
→ Uses curated programs ONLY
→ Skips web scraping (avoids generic results)
→ Falls back to Linkup API + LLM if needed

# Concrete products (cameras, software, tools)
→ Uses curated programs
→ Allows web scraping for additional results
→ Comprehensive coverage

# Specific brands
→ Focused search
→ High-quality results
```

### 3. **Validation Examples**

| Topic | Category | Web Scraping? | Why |
|-------|----------|---------------|-----|
| "Building professional networks" | abstract_concept | ❌ No | Generic web results would include home building materials |
| "Canon camera equipment" | concrete_product | ✅ Yes | Specific product has clear affiliate programs |
| "Career development courses" | abstract_concept | ❌ No | Needs curated education/career programs |
| "Green building materials" | concrete_product | ✅ Yes | Specific products have affiliate programs |
| "Photography lenses" | concrete_product | ✅ Yes | Product category with defined programs |

### 4. **Result Quality**

- **Abstract concepts**: Only curated, validated programs
  - No false positives like "Building" → eco materials
  - Ensures career searches get ONLY career programs
  
- **Concrete products**: Mix of curated + web results
  - Comprehensive coverage
  - Validates relevance via keyword matching

## Implementation Details

### Topic Category Detection

```python
def _identify_topic_category(self, topic: str, search_term: str) -> str:
    """Detects if topic is abstract concept, concrete product, or specific brand"""
    
    abstract_keywords = [
        'career', 'salary', 'promotion', 'negotiate', 'professional',
        'networks', 'mentorships', 'politics', 'influence', 'sustainability',
        'building', 'developing', 'creating', 'enhancing'
    ]
    
    concrete_keywords = [
        'camera', 'lens', 'software', 'tool', 'equipment', 'product',
        'brand', 'device', 'platform', 'service', 'app'
    ]
    
    # Returns: 'abstract_concept', 'concrete_product', or 'specific_brand'
```

### Search Strategy

```python
def _is_web_scraping_appropriate(self, search_term: str, topic: str) -> bool:
    """Determines if web scraping would produce useful results"""
    
    topic_category = self._identify_topic_category(topic, search_term)
    
    # Only concrete products/tools get web scraping
    allowed = ['concrete_product', 'specific_brand', 'specific_tool']
    return topic_category in allowed
```

## Benefits

✅ **Works for ANY topic**: Not limited to career or home building  
✅ **Intelligent filtering**: Avoids irrelevant results  
✅ **Quality over quantity**: Abstract concepts get curated programs only  
✅ **Comprehensive when needed**: Concrete products get full search  
✅ **No false positives**: "Building networks" ≠ "building materials"

## Current Status

- Backend running with topic intent detection
- Frontend running on port 3000
- System now validates all topics against their intent
- Search results filtered by topic category

