# Dynamic Category Generation

## Overview

The affiliate programs system now automatically generates new categories using **Linkup API first, then LLM fallback** when a topic doesn't match any existing curated categories.

## How It Works

1. **Search Flow**:
   - User searches for affiliate programs with a search term and topic
   - System first checks for existing curated categories that match
   - If no matches found, the system tries to find programs in all categories
   - If still no programs found, the system triggers dynamic generation

2. **Dynamic Generation**:
   - **First Priority**: Uses Linkup API to get real-time, up-to-date affiliate programs
   - **Fallback**: If Linkup returns no results, uses LLM (OpenAI) to generate relevant programs
   - Generates 8-12 real, relevant affiliate programs
   - Caches the generated programs for future use
   - Returns programs in the same format as curated programs

3. **Benefits**:
   - No need to manually add categories for every new topic
   - System automatically adapts to new niches
   - **Real-time data**: Uses Linkup API for latest available programs
   - **Cost-effective**: Only uses LLM as fallback
   - Maintains quality by only using real affiliate programs
   - Caches results for performance

## How It Works

### Search Flow:
1. Check curated programs (curated categories)
2. If no match → Check ALL categories
3. If still no match → Try Linkup API
4. If Linkup fails → Use LLM generation
5. Cache results for future requests

## Configuration

The dynamic generation can be configured in `curated_affiliate_programs.py`:

- `generate_category_dynamically()` method handles the LLM call
- Cache TTL is managed per session
- LLM provider can be changed (default: "openai")

## Usage

No special action needed! The system automatically:
1. Checks curated programs first (fast, offline)
2. Falls back to dynamic generation when needed
3. Caches results for subsequent requests

## Example

If you search for "astrophotography equipment" and there's no matching category:
- System will use LLM to generate relevant programs
- Generated programs include companies like telescopes retailers, astronomy software, etc.
- Results are cached for future "astrophotography" searches

