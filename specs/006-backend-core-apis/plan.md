# Implementation Plan: TrendTap - AI Research Workspace

**Branch**: `006-backend-core-apis` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-backend-core-apis/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: Web application (frontend + backend)
   → Structure Decision: Backend API + Frontend SPA
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → No violations detected - design follows constitutional principles
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → All technical unknowns resolved through research
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → No new violations after design phase
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
TrendTap is an AI research workspace that guarantees every article idea is pre-wired to a high-paying affiliate programme, scores ideas on future demand using hybrid forecasting, and auto-builds exact keyword clusters for ranking. The system integrates 14 affiliate networks, uses Google Trends + LLM extrapolation for trend validation, generates both content and software solutions, and provides one-click export to multiple platforms.

## Technical Context
**Language/Version**: Python 3.11+ (Backend), TypeScript 5.0+ (Frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy, Redis, React, Material-UI, React Query  
**Storage**: PostgreSQL (primary), Redis (caching/sessions)  
**Testing**: pytest (backend), Vitest (frontend), Playwright (E2E)  
**Target Platform**: Linux server (backend), Modern browsers (frontend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <200ms API response (95th percentile), <2s page load, 100+ concurrent users  
**Constraints**: <10MB CSV uploads, 10k keywords per user, 5-minute max trend analysis  
**Scale/Scope**: 1000+ users, 10k+ keyword records, 1000+ content ideas per user  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### User-Centric Design Gates
- [x] Interface design prioritizes user workflow efficiency (5-step workflow <15 min)
- [x] All user interactions are intuitive and visually appealing (Material-UI design system)
- [x] User experience requirements are clearly defined (complete user scenarios)

### Reliability & Accuracy Gates
- [x] Data sources (Google Trends, 14 affiliate networks, LLMs) are properly integrated
- [x] Data validation and error handling are comprehensive (CSV validation, API fallbacks)
- [x] Service reliability requirements are met (retry logic, circuit breakers)

### Maintainability & Scalability Gates
- [x] Code structure follows clean architecture principles (layered architecture)
- [x] Documentation is comprehensive and up-to-date (OpenAPI specs, user guides)
- [x] Architecture supports expected user growth (horizontal scaling, caching)

### Modularity Gates
- [x] Frontend and backend are properly separated (API-first design)
- [x] Clear interfaces between modules are defined (REST APIs, service contracts)
- [x] Dependencies are minimized and well-defined (explicit service boundaries)

### TDD Gates
- [x] Test coverage meets minimum 80% requirement (unit, integration, E2E tests)
- [x] Tests are written before implementation (contract tests first)
- [x] All critical paths have comprehensive test coverage (user workflows)

## Project Structure

### Documentation (this feature)
```
specs/006-backend-core-apis/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Backend API
trend-analysis-platform/backend/
├── src/
│   ├── api/
│   │   ├── affiliate_routes.py      # 14 affiliate network integrations
│   │   ├── trend_routes.py          # Google Trends + LLM forecasting
│   │   ├── keyword_routes.py        # CSV upload + DataForSEO crawling
│   │   ├── content_routes.py        # Article + software idea generation
│   │   ├── export_routes.py         # Google Docs/Notion/WordPress export
│   │   └── calendar_routes.py       # Content + software project scheduling
│   ├── models/
│   │   ├── affiliate_research.py    # Affiliate program data
│   │   ├── trend_analysis.py        # Trend forecasting results
│   │   ├── keyword_data.py          # Keyword clusters + priority scoring
│   │   ├── content_ideas.py         # Article ideas + outlines
│   │   ├── software_solutions.py    # Software tool ideas + complexity
│   │   └── content_calendar.py      # Scheduling + project tracking
│   ├── services/
│   │   ├── affiliate_service.py     # 14 network integrations
│   │   ├── trend_service.py         # Hybrid forecasting engine
│   │   ├── keyword_service.py       # CSV processing + DataForSEO
│   │   ├── content_service.py       # LLM content generation
│   │   ├── software_service.py      # Software solution generation
│   │   ├── export_service.py        # Multi-platform export
│   │   └── calendar_service.py      # Project scheduling
│   ├── core/
│   │   ├── config.py                # Environment configuration
│   │   ├── database.py              # PostgreSQL + Redis setup
│   │   └── security.py              # Authentication + authorization
│   └── main.py                      # FastAPI application
├── tests/
│   ├── contract/                    # API contract tests
│   ├── integration/                 # Service integration tests
│   └── unit/                        # Unit tests
└── requirements.txt                 # Python dependencies

# Frontend SPA
trend-analysis-platform/frontend/
├── src/
│   ├── components/
│   │   ├── affiliate/               # Affiliate research components
│   │   ├── trends/                  # Trend validation components
│   │   ├── keywords/                # Keyword management components
│   │   ├── content/                 # Content + software generation
│   │   ├── calendar/                # Project scheduling
│   │   └── export/                  # Export functionality
│   ├── pages/
│   │   ├── Dashboard.tsx            # Main workspace
│   │   ├── AffiliateResearch.tsx    # Step 1: Monetisation
│   │   ├── TrendValidation.tsx      # Step 2: Forecasting
│   │   ├── IdeaBurst.tsx            # Step 3: Content + Software
│   │   ├── KeywordArmoury.tsx       # Step 4: Keyword clusters
│   │   └── Calendar.tsx             # Project management
│   ├── services/
│   │   ├── apiClient.ts             # HTTP client with interceptors
│   │   ├── affiliateService.ts      # Affiliate API calls
│   │   ├── trendService.ts          # Trend analysis API
│   │   ├── keywordService.ts        # Keyword management API
│   │   ├── contentService.ts        # Content generation API
│   │   └── exportService.ts         # Export API calls
│   ├── hooks/
│   │   ├── useAffiliate.ts          # Affiliate research state
│   │   ├── useTrends.ts             # Trend analysis state
│   │   ├── useKeywords.ts           # Keyword management state
│   │   ├── useContent.ts            # Content generation state
│   │   └── useCalendar.ts           # Calendar state
│   └── types/
│       ├── affiliate.ts             # Affiliate program types
│       ├── trends.ts                # Trend analysis types
│       ├── keywords.ts              # Keyword data types
│       ├── content.ts               # Content + software types
│       └── calendar.ts              # Calendar types
├── tests/
│   ├── components/                  # Component tests
│   ├── hooks/                       # Hook tests
│   ├── services/                    # Service tests
│   └── integration/                 # E2E tests
└── package.json                     # Node.js dependencies
```

**Structure Decision**: Web application with clear separation between backend API and frontend SPA. Backend follows FastAPI + SQLAlchemy architecture with service layer pattern. Frontend uses React + TypeScript with Material-UI and React Query for state management.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Affiliate network integration patterns and rate limits
   - Google Trends API alternatives and CSV fallback strategies
   - DataForSEO API integration and cost optimization
   - LLM fine-tuning approaches for trend extrapolation
   - Social media API integration for news-cycle signals
   - SurferSEO/Frase API integration patterns
   - CoSchedule API integration for headline scoring

2. **Generate and dispatch research agents**:
   ```
   Task: "Research 14 affiliate network APIs (Share-a-sale, Impact, Amazon, CJ, Partnerize) for real-time EPC and commission data"
   Task: "Research Google Trends API alternatives and CSV fallback strategies for trend data"
   Task: "Research DataForSEO API integration patterns and cost optimization strategies"
   Task: "Research LLM fine-tuning approaches for trend extrapolation on 400k queries"
   Task: "Research social media API integration (Reddit, Twitter, TikTok) for news signals"
   Task: "Research SurferSEO/Frase API integration for content optimization"
   Task: "Research CoSchedule API integration for headline scoring"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical unknowns resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - 7 core entities: User, AffiliateResearch, TrendAnalysis, KeywordData, ContentIdeas, SoftwareSolutions, ContentCalendar
   - Validation rules from 58 functional requirements
   - State transitions for research sessions and content lifecycle

2. **Generate API contracts** from functional requirements:
   - Affiliate Research API (14 network integrations)
   - Trend Validation API (Google Trends + LLM + social signals)
   - Keyword Management API (CSV upload + DataForSEO)
   - Content Generation API (articles + software solutions)
   - Export Integration API (Google Docs/Notion/WordPress)
   - Calendar Management API (content + software projects)
   - Output OpenAPI 3.0 schemas to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per API endpoint group
   - Assert request/response schemas and error handling
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - 5-step workflow integration test scenarios
   - Edge case handling for API failures and data validation
   - Quickstart test = complete user journey validation

5. **Update agent file incrementally**:
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
   - Add new technologies: FastAPI, SQLAlchemy, Redis, React, Material-UI, React Query
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Backend-first: API contracts → models → services → routes
- Frontend-second: Types → services → hooks → components → pages
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md covering:
- Backend API development (affiliate, trends, keywords, content, export, calendar)
- Frontend SPA development (components, pages, services, hooks)
- Integration testing and E2E validation
- Performance optimization and security hardening

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*No violations detected - design follows constitutional principles*

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*