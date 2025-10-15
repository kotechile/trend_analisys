
# Implementation Plan: Complete Dataflow Persistence in Supabase

**Branch**: `010-please-make-sure` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-please-make-sure/spec.md`

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
Implement complete dataflow persistence in Supabase for the trend analysis platform, ensuring all research data (topics, subtopics, trend analyses, content ideas) is properly stored with referential integrity and can be retrieved to reconstruct the complete research workflow.

## Technical Context
**Language/Version**: Python 3.11+ (backend), TypeScript/React (frontend)  
**Primary Dependencies**: FastAPI, Supabase Python client, React, TypeScript  
**Storage**: Supabase (PostgreSQL) with existing schema  
**Testing**: pytest (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Web application (Linux server backend, browser frontend)
**Project Type**: web (frontend + backend detected)
**Performance Goals**: <200ms API response times, 80%+ test coverage  
**Constraints**: Must maintain existing database schema compatibility, preserve data integrity during failures  
**Scale/Scope**: Multi-user platform with research session persistence and data retrieval

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### User-Centric Design Gates
- [x] Interface design prioritizes user workflow efficiency (data persistence is transparent to user)
- [x] All user interactions are intuitive and visually appealing (no UI changes required)
- [x] User experience requirements are clearly defined (seamless data persistence)

### Reliability & Accuracy Gates
- [x] Data sources (Google Trends, Ahrefs, Semrush, LLMs) are properly integrated (existing)
- [x] Data validation and error handling are comprehensive (referential integrity requirements)
- [x] Service reliability requirements are met (graceful failure handling)

### Maintainability & Scalability Gates
- [x] Code structure follows clean architecture principles (extends existing patterns)
- [x] Documentation is comprehensive and up-to-date (will be updated)
- [x] Architecture supports expected user growth (Supabase scales automatically)

### Modularity Gates
- [x] Frontend and backend are properly separated (existing structure)
- [x] Clear interfaces between modules are defined (API contracts)
- [x] Dependencies are minimized and well-defined (Supabase client only)

### TDD Gates
- [x] Test coverage meets minimum 80% requirement (will be maintained)
- [x] Tests are written before implementation (TDD approach)
- [x] All critical paths have comprehensive test coverage (data persistence critical paths)

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
trend-analysis-platform/
├── backend/
│   ├── src/
│   │   ├── models/           # Data models for persistence
│   │   ├── services/         # Business logic services
│   │   ├── api/             # FastAPI routes and endpoints
│   │   └── database/        # Database connection and operations
│   ├── migrations/          # Database schema migrations
│   └── tests/               # Backend unit and integration tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API client services
│   │   └── types/          # TypeScript type definitions
│   └── tests/              # Frontend unit and integration tests
└── shared/
    ├── types/              # Shared TypeScript types
    └── utils/              # Shared utilities
```

**Structure Decision**: Web application structure with separate frontend and backend directories, leveraging existing project layout. The feature extends existing database models and API endpoints without requiring structural changes.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

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

**Specific Task Categories**:

1. **Database Schema Tasks** [P]:
   - Create research_topics table migration
   - Enhance topic_decompositions table with foreign keys
   - Enhance trend_analyses table with subtopic relationships
   - Enhance content_ideas table with research_topic_id
   - Add indexes for performance optimization
   - Create RLS policies for all tables

2. **Data Model Tasks** [P]:
   - Create ResearchTopic model
   - Enhance TopicDecomposition model
   - Enhance TrendAnalysis model
   - Enhance ContentIdea model
   - Add validation rules and constraints
   - Implement version control for ResearchTopic

3. **API Contract Tests** [P]:
   - Research topics CRUD operations tests
   - Subtopics creation and retrieval tests
   - Complete dataflow retrieval tests
   - Error handling and validation tests
   - Authentication and authorization tests

4. **Service Layer Tasks**:
   - Research topic service implementation
   - Topic decomposition service enhancement
   - Trend analysis service enhancement
   - Content idea service enhancement
   - Data persistence orchestration service

5. **API Endpoint Tasks**:
   - Research topics endpoints implementation
   - Subtopics endpoints implementation
   - Complete dataflow endpoint implementation
   - Error handling middleware updates
   - Response formatting and validation

6. **Integration Tests**:
   - End-to-end research workflow tests
   - Data integrity verification tests
   - Error recovery and rollback tests
   - Performance and concurrency tests

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Database → Models → Services → API → Integration
- Mark [P] for parallel execution (independent files)
- Critical path: Database schema → Models → Contract tests → Services → API

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md covering:
- 8 database schema tasks
- 6 data model tasks  
- 8 contract test tasks
- 6 service layer tasks
- 4 API endpoint tasks
- 3 integration test tasks

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
