# Article Generation Process - Complete Overview

## System Architecture Summary

The article generation system uses a multi-stage process that integrates **RAG (Retrieval-Augmented Generation)**, **Linkup API** for affiliate research, and **LLM-based content generation** with structured section iteration.

---

## 1. RAG (Retrieval-Augmented Generation) Integration

### Purpose
RAG enhances article generation by retrieving relevant knowledge from a knowledge base before generating content, ensuring articles are based on factual, up-to-date information rather than just the LLM's training data.

### How RAG Works

#### **Step 1: RAG Query Phase**
When `rag_enabled: true` is set in the request:

1. **Query Construction**: 
   - Creates multiple queries from the article brief and top 3 keywords
   - Example: `["Skill development shouldn't just be for your day job...", "skill development", "monetize skills", "micro-consulting"]`

2. **RAG Endpoint Call**:
   - Sends POST requests to the RAG endpoint (e.g., `http://localhost:8080/query_simple`)
   - Each query retrieves up to 3 relevant documents/chunks
   - Supports collection filtering via `rag_collection_name`

3. **Document Retrieval**:
   - RAG service handles multiple response formats:
     - `results`, `documents`, `chunks`, or `data` fields
     - Extracts content, sources, and metadata from each document

#### **Step 2: Context Formatting**
- Formats retrieved documents into structured context for the LLM
- Includes source citations if `include_in_text_citations: true`
- Creates a formatted knowledge base section with numbered sources

#### **Step 3: Integration into Prompt**
- RAG context is prepended to the article generation prompt
- LLM is instructed to use this knowledge base information
- Ensures articles are grounded in retrieved facts rather than general knowledge

### RAG Service Features
- **Multiple Query Support**: Queries RAG with brief + keywords simultaneously
- **Error Handling**: Gracefully falls back to non-RAG generation if RAG fails
- **Source Tracking**: Maintains list of RAG sources for citation/reference
- **Collection Filtering**: Can filter by collection name (e.g., "career_and_personal_finance")

### Code Location
- **Service**: `backend/src/services/rag_service.py`
- **Integration**: `backend/src/api/article_generation_routes.py` (lines 76-119)

---

## 2. Linkup API Integration

### Purpose
Linkup.so provides real-time affiliate program discovery to find relevant monetization opportunities for articles.

### How Linkup Works

#### **Primary Use Case: Affiliate Research**
Linkup is used in the affiliate research workflow, not directly in article generation, but provides data that influences content:

1. **Search Flow**:
   ```
   User searches for affiliate programs
   → Check curated categories first (fast, offline)
   → If no match → Check ALL categories
   → If still no match → Try Linkup API
   → If Linkup fails → Use LLM generation fallback
   ```

2. **Linkup API Call**:
   - Searches Linkup.so API with query: `"{search_term} affiliate program"`
   - Uses depth: "standard", outputType: "sourcedAnswer"
   - Returns real-time, verified affiliate offers

3. **Program Formatting**:
   - Converts Linkup response format to internal schema
   - Includes: offer name, description, commission rate, network, EPC, link
   - Marks programs as verified (Linkup offers are pre-verified)

#### **Dynamic Category Generation**
When a topic doesn't match existing curated categories:

1. **First Priority**: Linkup API
   - Searches for real-time affiliate programs
   - Returns 8-12 relevant programs
   - Caches results for future use

2. **Fallback**: LLM Generation
   - Only used if Linkup returns no results
   - Generates relevant program suggestions using LLM

### Linkup Integration Points
- **Affiliate Research Service**: `backend/src/services/affiliate_research_service.py`
- **Curated Programs**: `backend/src/services/curated_affiliate_programs.py` (lines 382-407)
- **API Client**: `backend/src/integrations/linkup_api.py`

### Benefits
- **Real-time Data**: Latest available affiliate programs
- **Verified Offers**: Linkup pre-verifies all offers
- **Cost-effective**: Only uses LLM as fallback
- **Automatic**: No manual category management needed

---

## 3. Content Generation Process

### Overview
The content generation follows a structured workflow: **Outline Generation → Section Iteration → Content Assembly**

### Detailed Process Flow

#### **Phase 1: Initial Setup & RAG Retrieval**
1. Receive request with:
   - `brief`: Article description
   - `keywords`: Comma-separated keywords
   - `target_word_count`: Target length
   - `tone`: Writing style
   - `rag_enabled`: Whether to use RAG
   - `rag_endpoint`: RAG service URL

2. **RAG Query** (if enabled):
   - Query RAG system with brief + keywords
   - Retrieve relevant knowledge base documents
   - Format into context string

#### **Phase 2: Prompt Construction**
Builds comprehensive article generation prompt:

```python
# Prompt Structure:
1. Article Brief
2. Requirements (word count, tone, depth)
3. Keywords to include
4. RAG Context (if available) ← Knowledge base information
5. Article Structure Guidelines
6. Writing Guidelines
```

**Key Features**:
- If RAG context exists: Instructs LLM to use knowledge base information
- If no RAG: Instructs LLM to use general knowledge
- Includes citation instructions if `include_in_text_citations: true`

#### **Phase 3: Single-Pass Article Generation**
**Current Implementation**: Generates entire article in one LLM call

1. **LLM Call**:
   - Provider selection (OpenAI, Anthropic, Google AI, etc.)
   - Max tokens: `target_word_count * 2` (rough estimate)
   - Temperature: 0.7 (balanced creativity/consistency)

2. **Content Extraction**:
   - Extracts article text from LLM response
   - Validates minimum length (100+ words)
   - Handles different response formats

#### **Phase 4: Post-Processing**
1. **Section Parsing**:
   - Parses markdown headings (`#`, `##`, `###`)
   - Extracts sections with headings and content
   - Calculates word count per section

2. **Response Assembly**:
   - Returns complete article
   - Includes section breakdown
   - Includes RAG sources (if used)
   - Word count validation

### Alternative: Enhanced Content Generator (Section-by-Section)

The `EnhancedContentGenerator` class provides a more granular approach:

#### **Step 1: Content Structure Generation**
```python
# Groups keywords by type:
- Primary keywords → Introduction, main sections
- Secondary keywords → Supporting content
- Long-tail keywords → Detailed sections
- Question keywords → FAQ sections

# Calculates section distribution:
- Introduction: 15% of word count
- Main content: 60% of word count
- Detailed sections: 15% of word count
- Conclusion: 10% of word count
```

#### **Step 2: Section Iteration**
For each section in the structure:

1. **Section Prompt Creation**:
   - Section type (introduction, main_content, etc.)
   - Target word count for section
   - Keywords assigned to section
   - Content description context

2. **LLM Generation per Section**:
   - Generates content for each section individually
   - Includes section-specific keywords
   - Maintains consistent tone

3. **Section Analysis**:
   - Extracts headings from section content
   - Calculates keyword density
   - Tracks keywords used

#### **Step 3: Content Assembly**
- Combines all sections into complete article
- Generates SEO elements (title, meta description)
- Creates content outline
- Calculates overall metrics

### Content Structure Types

The system supports different content structures:

1. **Blog Post**:
   - Introduction (15%)
   - Main Content (60%)
   - Detailed Sections (15%)
   - Conclusion (10%)

2. **Guide**:
   - Introduction (10%)
   - Step-by-Step (70%)
   - Tips & Tricks (15%)
   - Conclusion (5%)

3. **Review**:
   - Introduction (10%)
   - Overview (20%)
   - Detailed Review (50%)
   - Pros/Cons (15%)
   - Conclusion (5%)

### Code Locations

**Main Article Generation**:
- `backend/src/api/article_generation_routes.py` (single-pass generation)

**Enhanced Generator** (section-by-section):
- `backend/src/services/enhanced_content_generator.py`
  - `_generate_content_structure()`: Lines 141-191
  - `_generate_content_sections()`: Lines 276-329 (iterates through sections)
  - `_generate_seo_elements()`: Lines 193-274
  - `_generate_content_outline()`: Lines 410-453

---

## Complete Workflow Example

### Request Flow:
```
POST /api/article/generate
{
  "brief": "Skill development guide...",
  "keywords": "skill development, monetize skills",
  "target_word_count": 2500,
  "tone": "journalistic",
  "rag_enabled": true,
  "rag_endpoint": "http://localhost:8080/query_simple",
  "rag_collection_name": "career_and_personal_finance"
}
```

### Processing Steps:

1. **RAG Query** (if enabled):
   ```
   Query 1: "Skill development guide..." → 3 documents
   Query 2: "skill development" → 3 documents
   Query 3: "monetize skills" → 3 documents
   Total: 9 documents retrieved
   ```

2. **Context Formatting**:
   ```
   Formats 9 documents into structured context
   Includes sources and citations
   ```

3. **Prompt Building**:
   ```
   Brief + Requirements + Keywords + RAG Context + Guidelines
   ```

4. **LLM Generation**:
   ```
   Single call generates complete 2500-word article
   Uses RAG context to inform content
   ```

5. **Post-Processing**:
   ```
   Parses sections from markdown
   Extracts headings and content
   Validates word count
   ```

6. **Response**:
   ```json
   {
     "success": true,
     "article": "Complete article text...",
     "word_count": 2487,
     "sections": [
       {"heading": "Introduction", "word_count": 375},
       {"heading": "Main Content", "word_count": 1492},
       ...
     ],
     "rag_sources": [...],
     "message": "Article generated successfully"
   }
   ```

---

## Key Features

### RAG Integration
✅ Queries knowledge base before generation  
✅ Formats context for LLM prompts  
✅ Supports multiple queries simultaneously  
✅ Graceful fallback if RAG fails  
✅ Source tracking and citations  

### Linkup Integration
✅ Real-time affiliate program discovery  
✅ Automatic category generation  
✅ Verified offer data  
✅ LLM fallback for edge cases  

### Content Generation
✅ Single-pass or section-by-section generation  
✅ Keyword-aware content structure  
✅ SEO optimization (title, meta description)  
✅ Section parsing and analysis  
✅ Word count validation  
✅ Multiple content types (blog, guide, review)  

---

## Configuration

### RAG Configuration
- `rag_enabled`: Enable/disable RAG
- `rag_endpoint`: RAG service URL
- `rag_collection_name`: Filter by collection
- `include_in_text_citations`: Add source citations

### LLM Configuration
- `llm_provider`: Provider (openai, anthropic, google_ai)
- `llm_model`: Specific model name
- `llm_key`: API key (if not in Supabase)

### Generation Parameters
- `target_word_count`: Desired article length
- `tone`: Writing style (journalistic, professional, etc.)
- `depth`: Research depth (comprehensive, standard, etc.)

---

## Error Handling

- **RAG Failures**: Falls back to non-RAG generation
- **LLM Failures**: Returns error with details
- **Empty Content**: Validates minimum length (100 words)
- **Provider Unavailable**: Falls back to first available provider
- **Timeout Handling**: 30-second timeout for RAG queries

---

## Performance Considerations

- **RAG Queries**: Parallel queries for multiple search terms
- **Caching**: Linkup results cached per session
- **Token Estimation**: `word_count * 2` tokens for generation
- **Section Generation**: Can be done in parallel (if using enhanced generator)



