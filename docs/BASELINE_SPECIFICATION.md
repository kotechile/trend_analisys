# Baseline Specification

This document outlines the functional and non-functional requirements for the Trend Analysis & Content Generation Platform.

## Table of Contents

1. [Overview](#overview)
2. [Functional Requirements](#functional-requirements)
3. [Non-Functional Requirements](#non-functional-requirements)
4. [Technical Architecture](#technical-architecture)
5. [Data Models](#data-models)
6. [API Specifications](#api-specifications)
7. [User Interface Requirements](#user-interface-requirements)
8. [Integration Requirements](#integration-requirements)
9. [Security Requirements](#security-requirements)
10. [Performance Requirements](#performance-requirements)

## Overview

The Trend Analysis & Content Generation Platform is a comprehensive tool that empowers content creators to make data-driven decisions through a multi-phase workflow from affiliate research to content creation.

### Migration Context
This project involves migrating from a legacy Python/Noodl system to a modern React/FastAPI architecture. The original implementation in `legacy-reference/python-code/` serves as the foundation for the new system, providing proven business logic and integration patterns.

### Core Workflow
1. **Phase 0**: Affiliate Research (Legacy: `affiliate_research_api.py`)
2. **Phase 1**: Trend Analysis (Legacy: `enhanced_trend_research_with_bypass.py`)
3. **Keyword Refinement**: Data upload and analysis (Legacy: `enhanced_keyword_generator.py`)
4. **Phase 2**: Content Generation (Legacy: `blog_idea_generator.py`)
5. **Dashboard**: Management and tracking (New React implementation)

## Functional Requirements

### 1. User Authentication

#### 1.1 User Registration
- **FR-1.1**: Users can create accounts using email and password
- **FR-1.2**: Email verification is required before account activation
- **FR-1.3**: Users can provide additional profile information (name, company, etc.)
- **FR-1.4**: Password must meet security requirements (minimum 8 characters, complexity rules)

#### 1.2 User Login
- **FR-1.5**: Users can log in with email and password
- **FR-1.6**: Support for "Remember Me" functionality
- **FR-1.7**: Password reset functionality via email
- **FR-1.8**: Account lockout after failed login attempts

#### 1.3 Account Management
- **FR-1.9**: Users can update their profile information
- **FR-1.10**: Users can change their password
- **FR-1.11**: Users can delete their accounts
- **FR-1.12**: All user data is scoped to the authenticated user

### 2. Phase 0: Affiliate Research

#### 2.1 Topic Input
- **FR-2.1**: Users can input a topic for affiliate research
- **FR-2.2**: Topic validation (minimum length, character limits)
- **FR-2.3**: Support for topic suggestions and autocomplete

#### 2.2 Affiliate Program Discovery
- **FR-2.4**: System integrates with web search API (Linkup) to find affiliate programs
- **FR-2.5**: Results include program details (commission rates, requirements, etc.)
- **FR-2.6**: Affiliate programs are categorized by relevance and quality
- **FR-2.7**: Results are filtered and ranked by potential profitability

#### 2.3 Data Storage and Presentation
- **FR-2.8**: Research results are saved to Supabase
- **FR-2.9**: Results are presented in a user-friendly interface
- **FR-2.10**: Users can view detailed information about each affiliate program
- **FR-2.11**: Users can bookmark or favorite affiliate programs

#### 2.12 Phase Progression
- **FR-2.12**: Users can decide to proceed to Phase 1 or save for later
- **FR-2.13**: Research results are linked to subsequent phases

### 3. Phase 1: Trend Analysis

#### 3.1 Topic Submission
- **FR-3.1**: Users can submit topics related to their affiliate research
- **FR-3.2**: Support for multiple related topics per analysis
- **FR-3.3**: Topic validation and suggestions

#### 3.2 Trend Data Collection
- **FR-3.4**: System is ready to integrate with new Google Trends API when available
- **FR-3.5**: Short-term solution uses LLM-based trend analysis
- **FR-3.6**: Historical trend data collection and storage
- **FR-3.7**: Real-time trend monitoring capabilities

#### 3.3 LLM Analysis
- **FR-3.8**: LLM generates detailed trend analysis
- **FR-3.9**: Analysis includes sub-topics identification
- **FR-3.10**: Content opportunities are identified and categorized
- **FR-3.11**: Market insights and competitive analysis provided
- **FR-3.12**: Trend predictions and future outlook

#### 3.4 Data Storage
- **FR-3.13**: All analysis results are stored in Supabase
- **FR-3.14**: Data is linked to user and previous phases
- **FR-3.15**: Analysis history is maintained for reference

### 4. Keyword Refinement

#### 4.1 Keyword Data Upload
- **FR-4.1**: Users can upload keyword data files (CSV, Excel)
- **FR-4.2**: Support for manual keyword entry
- **FR-4.3**: Keyword data validation and formatting

#### 4.2 Keyword Analysis
- **FR-4.4**: System processes search volume data
- **FR-4.5**: Keyword difficulty analysis and scoring
- **FR-4.6**: Related keywords identification and grouping
- **FR-4.7**: Keyword competition analysis

#### 4.3 Keyword Selection
- **FR-4.8**: Users can select most effective keywords
- **FR-4.9**: Keyword filtering and sorting capabilities
- **FR-4.10**: Keyword performance metrics and scoring

#### 4.4 Data Storage
- **FR-4.11**: Refined keyword data is stored in Supabase
- **FR-4.12**: Data is linked to trend analysis and content generation

### 5. Phase 2: Content Generation

#### 5.1 Content Idea Generation
- **FR-5.1**: System generates blog post ideas based on analysis
- **FR-5.2**: Ideas are ranked by potential success metrics
- **FR-5.3**: Support for different content types (articles, guides, reviews, etc.)

#### 5.2 Content Details
- **FR-5.4**: Each idea includes compelling title suggestions with primiary keyword(s) included
- **FR-5.5**: Detailed content outlines are provided
- **FR-5.6**: SEO recommendations for each content piece
- **FR-5.7**: Target audience profiles and personas

#### 5.3 Content Calendar
- **FR-5.8**: Content calendar view for scheduling posts
- **FR-5.9**: Drag-and-drop scheduling interface
- **FR-5.10**: Content deadline and reminder system
- **FR-5.11**: Publishing status tracking

#### 5.4 Data Storage
- **FR-5.12**: All content ideas and calendar data stored in Supabase
- **FR-5.13**: Content performance tracking and analytics

### 6. Dashboard

#### 6.1 Overview
- **FR-6.1**: Central dashboard showing all user activities
- **FR-6.2**: Recent analyses and content ideas summary
- **FR-6.3**: Quick access to all phases and features

#### 6.2 Analysis Management
- **FR-6.4**: View all past analyses and their results
- **FR-6.5**: Search and filter analysis history
- **FR-6.6**: Export analysis data and reports

#### 6.3 Content Management
- **FR-6.7**: Manage generated content ideas
- **FR-6.8**: Content calendar overview and management
- **FR-6.9**: Content performance tracking and metrics

#### 6.4 User Preferences
- **FR-6.10**: Customizable dashboard layout
- **FR-6.11**: Notification preferences and settings
- **FR-6.12**: Integration settings and API configurations

## Non-Functional Requirements

### 1. Reliability

#### 1.1 Error Handling
- **NFR-1.1**: Robust error handling for all API endpoints
- **NFR-1.2**: Graceful degradation when external services fail
- **NFR-1.3**: Comprehensive logging and monitoring
- **NFR-1.4**: Automatic retry mechanisms for transient failures

#### 1.2 Data Integrity
- **NFR-1.5**: Data validation at all input points
- **NFR-1.6**: Transactional integrity for multi-step operations
- **NFR-1.7**: Data backup and recovery procedures
- **NFR-1.8**: Audit trails for all data modifications

### 2. Performance

#### 2.1 Response Times
- **NFR-2.1**: API responses under 500ms for 95% of requests
- **NFR-2.2**: Frontend page loads under 2 seconds
- **NFR-2.3**: Database queries optimized for performance
- **NFR-2.4**: Caching implemented for frequently accessed data

#### 2.2 Scalability
- **NFR-2.5**: System supports 1000+ concurrent users
- **NFR-2.6**: Horizontal scaling capabilities
- **NFR-2.7**: Load balancing for high availability
- **NFR-2.8**: Database optimization for large datasets

### 3. Security

#### 3.1 Data Protection
- **NFR-3.1**: All data encrypted at rest and in transit
- **NFR-3.2**: HTTPS/TLS 1.3 for all communications
- **NFR-3.3**: API keys and secrets properly secured
- **NFR-3.4**: Regular security audits and penetration testing

#### 3.2 Access Control
- **NFR-3.5**: Role-based access control (RBAC)
- **NFR-3.6**: JWT tokens for API authentication
- **NFR-3.7**: Rate limiting to prevent abuse
- **NFR-3.8**: Input sanitization to prevent injection attacks

#### 3.3 Privacy
- **NFR-3.9**: GDPR compliance for data handling
- **NFR-3.10**: User data anonymization options
- **NFR-3.11**: Data retention policies and deletion
- **NFR-3.12**: Privacy policy and terms of service

## Technical Architecture

### 1. Backend Architecture
- **FastAPI** for high-performance API development
- **Supabase** for database, authentication, and real-time features
- **Redis** for caching and session management
- **Docker** for containerization and deployment

### 2. Frontend Architecture
- **React 18** with TypeScript for type safety
- **Material-UI** for consistent, professional UI
- **React Query** for efficient data fetching and caching
- **React Router** for client-side routing

### 3. Database Design
- **PostgreSQL** via Supabase for relational data
- **Row Level Security (RLS)** for data isolation
- **Real-time subscriptions** for live updates
- **Automated backups** and point-in-time recovery

## Data Models

### 1. User Management
```sql
users (
  id: uuid (primary key)
  email: varchar (unique)
  full_name: varchar
  created_at: timestamp
  updated_at: timestamp
)
```

### 2. Phase 0: Affiliate Research
```sql
affiliate_research (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  topic: varchar
  status: varchar
  results: jsonb
  created_at: timestamp
)
```

### 3. Phase 1: Trend Analysis
```sql
trend_analysis (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  affiliate_research_id: uuid (foreign key)
  topics: jsonb
  trend_data: jsonb
  llm_analysis: jsonb
  created_at: timestamp
)
```

### 4. Keyword Refinement
```sql
keyword_data (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  trend_analysis_id: uuid (foreign key)
  keywords: jsonb
  search_volumes: jsonb
  difficulties: jsonb
  selected_keywords: jsonb
  created_at: timestamp
)
```

### 5. Phase 2: Content Generation
```sql
content_ideas (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  keyword_data_id: uuid (foreign key)
  ideas: jsonb
  calendar: jsonb
  created_at: timestamp
)
```

## API Specifications

### 1. Authentication Endpoints
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### 2. Phase 0: Affiliate Research
- `POST /api/v1/affiliate-research` - Start affiliate research
- `GET /api/v1/affiliate-research/{id}` - Get research results
- `PUT /api/v1/affiliate-research/{id}` - Update research status

### 3. Phase 1: Trend Analysis
- `POST /api/v1/trend-analysis` - Start trend analysis
- `GET /api/v1/trend-analysis/{id}` - Get analysis results
- `POST /api/v1/trend-analysis/{id}/refresh` - Refresh trend data

### 4. Keyword Refinement
- `POST /api/v1/keywords/upload` - Upload keyword data
- `GET /api/v1/keywords/{id}` - Get keyword data
- `PUT /api/v1/keywords/{id}/select` - Select keywords

### 5. Phase 2: Content Generation
- `POST /api/v1/content/generate` - Generate content ideas
- `GET /api/v1/content/ideas` - Get content ideas
- `PUT /api/v1/content/calendar` - Update content calendar

### 6. Dashboard
- `GET /api/v1/dashboard/overview` - Get dashboard data
- `GET /api/v1/dashboard/analyses` - Get analysis history
- `GET /api/v1/dashboard/content` - Get content management data

## User Interface Requirements

### 1. Design Principles
- **Mobile-first responsive design**
- **Accessibility compliance (WCAG 2.1 AA)**
- **Consistent Material-UI theming**
- **Intuitive navigation and user flow**

### 2. Key Pages
- **Landing Page**: Marketing and authentication
- **Dashboard**: Overview and navigation
- **Phase 0**: Affiliate research interface
- **Phase 1**: Trend analysis interface
- **Keyword Refinement**: Data upload and selection
- **Phase 2**: Content generation and calendar
- **Settings**: User preferences and account management

### 3. Interactive Elements
- **Real-time progress indicators**
- **Drag-and-drop functionality**
- **Data visualization charts and graphs**
- **Modal dialogs for detailed views**

## Integration Requirements

### 1. External APIs
- **Supabase**: Database and authentication
- **Linkup API**: Affiliate program discovery
- **Google Trends API**: Trend data (when available)
- **LLM APIs**: OpenAI, Anthropic, Google AI
- **Ahrefs/Semrush**: Keyword data (future integration)

### 2. Data Formats
- **JSON**: Primary data exchange format
- **CSV/Excel**: Keyword data upload
- **REST API**: Standard HTTP methods
- **WebSocket**: Real-time updates

### 3. Legacy Code Reference
- **Location**: `legacy-reference/python-code/` folder
- **Purpose**: Reference implementation for business logic patterns
- **Usage**: Consult original code for understanding functionality before implementing new architecture
- **Key Files**:
  - `enhanced_trend_research_with_bypass.py` - Trend analysis with PyTrends bypass
  - `affiliate_research_api.py` - Affiliate research logic with Linkup integration
  - `blog_idea_generator.py` - Content generation with SEO optimization
  - `keyword_research_api.py` - Keyword research functionality
  - `supabase_affiliate_storage.py` - Database integration with RLS
  - `enhanced_keyword_generator.py` - Advanced keyword generation
  - `bypass_trends_mode.py` - PyTrends fallback mechanism
- **Migration Guidelines**:
  - Use legacy code as reference for business logic understanding
  - Adapt Flask patterns to FastAPI async/await architecture
  - Convert synchronous operations to asynchronous where beneficial
  - Maintain data compatibility with existing Supabase schema
  - Enhance error handling and logging for production use
  - Do not copy code directly - reimplement with modern patterns

## Security Requirements

### 1. Authentication & Authorization
- **JWT tokens** with expiration
- **Refresh token** rotation
- **Role-based permissions**
- **API rate limiting**

### 2. Data Protection
- **Encryption at rest** (AES-256)
- **Encryption in transit** (TLS 1.3)
- **Input validation** and sanitization
- **SQL injection prevention**

### 3. Compliance
- **GDPR compliance** for EU users
- **CCPA compliance** for California users
- **SOC 2 Type II** certification (future)
- **Regular security audits**

## Performance Requirements

### 1. Response Times
- **API endpoints**: < 500ms (95th percentile)
- **Page loads**: < 2 seconds
- **Database queries**: < 100ms
- **File uploads**: < 30 seconds

### 2. Throughput
- **Concurrent users**: 1000+
- **API requests**: 10,000+ per hour
- **Database connections**: 100+ concurrent
- **File processing**: 100+ files per minute

### 3. Availability
- **Uptime**: 99.9% availability
- **Recovery time**: < 4 hours
- **Backup frequency**: Daily
- **Monitoring**: 24/7 system monitoring

---

*This specification serves as the definitive guide for development and should be referenced for all implementation decisions.*
