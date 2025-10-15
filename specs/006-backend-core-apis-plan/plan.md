
# Implementation Plan: Enhanced Research Workflow Integration

**Branch**: `006-backend-core-apis-plan` | **Date**: 2025-01-27 | **Spec**: [link]
**Input**: Feature specification from `/specs/006-backend-core-apis-plan/spec.md`

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
Enhance the existing TrendTap AI Research Workspace with a complete integrated workflow for CSV trend data upload, trend selection, keyword generation, and external tool integration. Build upon existing backend services (keyword_service.py, trend_analysis_service.py, content_service.py) with frontend orchestration components.

## Technical Context
**Language/Version**: Python 3.11, TypeScript/React 18  
**Primary Dependencies**: FastAPI, React, Supabase, pandas, scikit-learn  
**Storage**: Supabase PostgreSQL with existing schemas  
**Testing**: pytest (backend), Jest/React Testing Library (frontend)  
**Target Platform**: Web application (Linux server + browser)  
**Project Type**: web (frontend + backend)  
**Performance Goals**: <200ms API response times, 15-minute end-to-end workflow  
**Constraints**: Maintain existing API contracts, preserve caching/performance optimizations  
**Scale/Scope**: 10k users, 50-100 trends per workflow, 500-1000 keywords per analysis

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### User-Centric Design Gates
- [x] Interface design prioritizes user workflow efficiency (step-by-step workflow with progress tracking)
- [x] All user interactions are intuitive and visually appealing (trend selection UI with checkboxes and filtering)
- [x] User experience requirements are clearly defined (15-minute end-to-end workflow target)

### Reliability & Accuracy Gates
- [x] Data sources (Google Trends, Ahrefs, Semrush, LLMs) are properly integrated (build upon existing services)
- [x] Data validation and error handling are comprehensive (CSV validation, format detection)
- [x] Service reliability requirements are met (maintain existing caching and performance optimizations)

### Maintainability & Scalability Gates
- [x] Code structure follows clean architecture principles (enhance existing services, don't create new ones)
- [x] Documentation is comprehensive and up-to-date (maintain existing API contracts)
- [x] Architecture supports expected user growth (build upon existing scalable infrastructure)

### Modularity Gates
- [x] Frontend and backend are properly separated (enhance existing services, create new frontend components)
- [x] Clear interfaces between modules are defined (maintain existing API contracts)
- [x] Dependencies are minimized and well-defined (build upon existing dependencies)

### TDD Gates
- [x] Test coverage meets minimum 80% requirement (enhance existing test coverage)
- [x] Tests are written before implementation (TDD approach for new features)
- [x] All critical paths have comprehensive test coverage (maintain existing test coverage)

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
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── keyword_service.py
│   │   │   ├── trend_analysis_service.py
│   │   │   └── content_service.py
│   │   └── api/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── tests/
└── shared/
    └── package.json
```

**Structure Decision**: Web application with separate frontend and backend directories. The backend contains existing services that will be enhanced, and the frontend will receive new orchestration components for the enhanced workflow.

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
- Each contract endpoint → contract test task [P]
- Each new entity → model creation task [P] 
- Each workflow step → integration test task
- Service enhancement tasks for existing services
- Frontend component tasks for workflow orchestration
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Backend before frontend for API dependencies
- Mark [P] for parallel execution (independent files)

**Specific Task Categories**:
1. **Database Tasks**: Create new tables (TrendSelections, KeywordClusters, WorkflowSessions)
2. **Backend Service Tasks**: Enhance existing services with new methods
3. **API Contract Tasks**: Implement new endpoints for workflow management
4. **Frontend Component Tasks**: Create workflow orchestration components
5. **Integration Tasks**: CSV processing, external tool integration
6. **Testing Tasks**: Unit tests, integration tests, contract tests

**Estimated Output**: 30-35 numbered, ordered tasks in tasks.md

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
