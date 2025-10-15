# Data Model: TrendTap - AI Research Workspace

**Date**: 2025-10-02  
**Feature**: 006-backend-core-apis  
**Status**: Complete

## Entity Overview

TrendTap's data model consists of 7 core entities supporting the 5-step workflow from affiliate research to content export.

## 1. User Entity
- **Purpose**: Content creators using TrendTap
- **Key Fields**: id, email, password_hash, role, subscription_tier, preferences
- **Relationships**: One-to-many with all other entities

## 2. AffiliateResearch Entity
- **Purpose**: Affiliate program research sessions
- **Key Fields**: id, user_id, topic, status, results, selected_programs
- **Status**: PENDING → IN_PROGRESS → COMPLETED/FAILED

## 3. TrendAnalysis Entity
- **Purpose**: Trend analysis with hybrid forecasting
- **Key Fields**: id, user_id, topics, status, opportunity_scores, llm_forecast
- **Status**: PENDING → PROCESSING → COMPLETED/FAILED

## 4. KeywordData Entity
- **Purpose**: Keyword research data from CSV/DataForSEO
- **Key Fields**: id, user_id, keywords, source, priority_scores, serp_analysis
- **Sources**: CSV_UPLOAD, DATAFORSEO, MANUAL

## 5. ContentIdeas Entity
- **Purpose**: Generated article ideas with SEO optimization
- **Key Fields**: id, user_id, title, content_type, headline_score, priority_score
- **Types**: ARTICLE, GUIDE, REVIEW, TUTORIAL, LISTICLE

## 6. SoftwareSolutions Entity
- **Purpose**: Generated software solution ideas
- **Key Fields**: id, user_id, name, software_type, complexity_score, priority_score
- **Types**: CALCULATOR, ANALYZER, GENERATOR, CONVERTER, ESTIMATOR

## 7. ContentCalendar Entity
- **Purpose**: Scheduled content and software projects
- **Key Fields**: id, user_id, scheduled_date, status, entry_type
- **Types**: CONTENT, SOFTWARE_PROJECT

## Database Indexes
- User email and created_at
- Entity user_id and status fields
- Calendar scheduled_date
- Content priority_score and complexity_score

## Validation Rules
- Email uniqueness and format validation
- Status state transitions
- File size limits (10MB max)
- Keyword count limits (10,000 max)
- Cross-entity referential integrity

**Status**: ✅ Data model complete, ready for API contract generation