
# Implementation Plan: Keyword Analysis with Ahrefs Data

**Branch**: `011-1-a-new` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-1-a-new/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement comprehensive keyword analysis functionality that processes Ahrefs TSV export files, calculates opportunity scores using weighted factors (Search Volume 40%, Difficulty 30%, CPC 20%, Intent 10%), generates detailed keyword reports, creates SEO-optimized content ideas with intelligent primary/secondary keyword selection, and provides an enhanced Idea Burst page with visual selection indicators to help users identify and prioritize the best content opportunities.

## Technical Context
**Language/Version**: Python 3.11 (FastAPI backend), TypeScript/React (frontend)  
**Primary Dependencies**: FastAPI, pandas, numpy, React, Material-UI, Supabase, scikit-learn (for keyword clustering and content idea generation)  
**Storage**: Supabase PostgreSQL for keyword data and analysis results  
**Testing**: pytest (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Web application (React frontend + FastAPI backend)  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <200ms API response time, handle 10MB files (50,000 keywords) in <30 seconds  
**Constraints**: 10MB file size limit, 90-day data retention, TSV format parsing  
**Scale/Scope**: Content strategists and SEO professionals, 1M+ keywords analysis capacity

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### User-Centric Design Gates
- [x] Interface design prioritizes user workflow efficiency (file upload → analysis → results workflow)
- [x] All user interactions are intuitive and visually appealing (drag-drop upload, clear scoring visualization)
- [x] User experience requirements are clearly defined (content strategist workflow optimization)

### Reliability & Accuracy Gates
- [x] Data sources (Ahrefs TSV export files) are properly integrated with validation
- [x] Data validation and error handling are comprehensive (file format, missing data handling)
- [x] Service reliability requirements are met (robust file processing, error recovery)

### Maintainability & Scalability Gates
- [x] Code structure follows clean architecture principles (modular analysis engine)
- [x] Documentation is comprehensive and up-to-date (API contracts, data models)
- [x] Architecture supports expected user growth (scalable keyword processing)

### Modularity Gates
- [x] Frontend and backend are properly separated (React + FastAPI)
- [x] Clear interfaces between modules are defined (REST API contracts)
- [x] Dependencies are minimized and well-defined (pandas, numpy for analysis)

### TDD Gates
- [x] Test coverage meets minimum 80% requirement (pytest + Jest)
- [x] Tests are written before implementation (contract tests first)
- [x] All critical paths have comprehensive test coverage (analysis algorithms, file processing)

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── src/
│   ├── models/
│   │   ├── keyword.py
│   │   ├── analysis_report.py
│   │   ├── content_opportunity.py
│   │   └── seo_content_idea.py
│   ├── services/
│   │   ├── file_parser.py
│   │   ├── keyword_analyzer.py
│   │   ├── report_generator.py
│   │   └── content_idea_generator.py
│   ├── api/
│   │   ├── upload.py
│   │   ├── analysis.py
│   │   └── reports.py
│   └── utils/
│       ├── scoring.py
│       ├── validation.py
│       └── keyword_clustering.py
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx
│   │   ├── AnalysisResults.tsx
│   │   ├── KeywordTable.tsx
│   │   ├── SEOContentIdeas.tsx
│   │   ├── OptimizationTips.tsx
│   │   ├── IdeaBurstPage.tsx
│   │   ├── SelectionIndicators.tsx
│   │   └── IdeaCard.tsx
│   ├── pages/
│   │   ├── KeywordAnalysis.tsx
│   │   ├── Reports.tsx
│   │   ├── ContentIdeas.tsx
│   │   └── IdeaBurst.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── analysis.ts
│   │   ├── contentIdeas.ts
│   │   └── ideaBurst.ts
│   └── types/
│       ├── keyword.ts
│       ├── analysis.ts
│       ├── seoContentIdea.ts
│       └── ideaBurst.ts
└── tests/
    ├── components/
    ├── pages/
    └── services/
```

**Structure Decision**: Web application structure with separate frontend (React/TypeScript) and backend (FastAPI/Python) components. The backend handles TSV file processing, keyword analysis, scoring algorithms, and intelligent SEO content idea generation with keyword clustering. The frontend provides the user interface for file upload, results visualization, SEO content idea management, and enhanced Idea Burst page with visual selection indicators for content prioritization.

## Phase 0: Outline & Research ✅
1. **Extract unknowns from Technical Context** above:
   - ✅ TSV format handling (pandas parsing for Ahrefs compatibility)
   - ✅ Scoring algorithm (weighted approach with 40/30/20/10 weights)
   - ✅ Performance optimization (pandas + numpy for large datasets)
   - ✅ Content recommendation patterns (rule-based matching)
   - ✅ Intent tag mapping (Ahrefs comma-separated to primary categories)
   - ✅ SEO content idea generation (intelligent keyword selection and clustering)
   - ✅ Optimization tip generation (actionable content creation guidance)
   - ✅ Visual selection indicators (UI/UX patterns for idea prioritization)
   - ✅ Content type differentiation (article vs software idea handling)

2. **Generate and dispatch research agents**:
   ```
   ✅ Research Ahrefs TSV export format parsing
   ✅ Research keyword scoring algorithms
   ✅ Research performance optimization for large datasets
   ✅ Research content recommendation patterns
   ✅ Research intent tag mapping strategies
   ✅ Research SEO content idea generation algorithms
   ✅ Research keyword clustering and selection strategies
   ✅ Research optimization tip generation patterns
   ✅ Research visual selection indicator patterns
   ✅ Research content type differentiation strategies
   ```

3. **Consolidate findings** in `research.md` using format:
   - ✅ Decision: TSV parsing with pandas for exact Ahrefs compatibility
   - ✅ Decision: Weighted scoring system for interpretable results
   - ✅ Decision: Pandas-based processing with chunked reading
   - ✅ Decision: Rule-based pattern matching for content suggestions
   - ✅ Decision: Intent tag mapping with fallback to Informational
   - ✅ Decision: Intelligent keyword clustering for SEO content ideas
   - ✅ Decision: Primary/secondary keyword selection with optimization guidance
   - ✅ Decision: Visual indicator system for idea prioritization
   - ✅ Decision: Content type-specific indicator display (articles vs software)

**Output**: ✅ research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts ✅
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - ✅ Keyword entity with metrics, intent parsing, and analysis results
   - ✅ KeywordAnalysisReport entity with summary statistics and 90-day expiration
   - ✅ ContentOpportunity entity linking keywords to content ideas
   - ✅ SEOContentIdea entity with primary/secondary keywords, optimization scores, and actionable tips
   - ✅ IdeaBurstSession entity for idea generation sessions and user selections
   - ✅ SelectionIndicator entity for visual prioritization indicators
   - ✅ AhrefsExportFile entity for TSV file metadata
   - ✅ Validation rules, state transitions, and intent mapping logic defined

2. **Generate API contracts** from functional requirements:
   - ✅ Upload API (upload.yaml) - TSV file upload and status checking
   - ✅ Analysis API (analysis.yaml) - analysis start, status, and results with intent parsing and SEO content ideas
   - ✅ Reports API (reports.yaml) - report management and JSON export with enhanced content ideas
   - ✅ IdeaBurst API (ideaburst.yaml) - idea generation, selection indicators, and session management
   - ✅ REST patterns with OpenAPI 3.0.3 schemas including SEOContentIdea and SelectionIndicator schemas

3. **Generate contract tests** from contracts:
   - ✅ Contract schemas defined for all endpoints
   - ✅ Request/response validation rules specified
   - ✅ Error handling patterns documented

4. **Extract test scenarios** from user stories:
   - ✅ Complete workflow documented in quickstart.md including SEO content idea generation
   - ✅ Enhanced Idea Burst page workflow with visual selection indicators
   - ✅ Success criteria and error handling defined for enhanced functionality
   - ✅ Performance expectations specified for keyword clustering, content idea generation, and visual indicators

5. **Update agent file incrementally** (O(1) operation):
   - ✅ Ready for agent context update with new technologies

**Output**: ✅ data-model.md, ✅ /contracts/*, ✅ quickstart.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] (including SEOContentIdea, IdeaBurstSession, SelectionIndicator)
- Each user story → integration test task
- SEO content idea generation → keyword clustering and selection tasks
- Optimization tip generation → content guidance tasks
- Idea Burst page → visual indicator and selection component tasks
- Content type differentiation → article vs software idea handling tasks
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md (increased due to SEO content idea generation and enhanced Idea Burst page complexity)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
