# Tasks: Frontend Issues Fix

**Input**: Design documents from `/specs/007-this-is-an/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting, monorepo structure
   → Tests: contract tests, integration tests (TDD mandatory)
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging, external APIs (Google Trends, Ahrefs, Semrush)
   → UI/UX: React components, user interface, accessibility (WCAG 2.1 AA)
   → Polish: unit tests, performance (<200ms), docs, security audits
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Paths based on trend-analysis-platform structure

## Phase 3.1: Setup
- [x] T001 Install and configure frontend dependencies (Material-UI, React Query, Axios)
- [x] T002 [P] Configure TypeScript and ESLint for frontend
- [x] T003 [P] Set up React Router v6 configuration
- [x] T004 [P] Configure Material-UI theme and CssBaseline
- [x] T005 [P] Set up React Query client and providers

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T006 [P] Contract test GET /api/tabs in frontend/tests/contract/test_tabs_api.test.ts
- [x] T007 [P] Contract test POST /api/workflow/sessions in frontend/tests/contract/test_workflow_sessions.test.ts
- [x] T008 [P] Contract test POST /api/topic-decomposition in frontend/tests/contract/test_topic_decomposition.test.ts
- [x] T009 [P] Contract test POST /api/affiliate-research in frontend/tests/contract/test_affiliate_research.test.ts
- [x] T010 [P] Contract test POST /api/trend-analysis in frontend/tests/contract/test_trend_analysis.test.ts
- [x] T011 [P] Contract test POST /api/content/generate in frontend/tests/contract/test_content_generation.test.ts
- [x] T012 [P] Contract test POST /api/keywords/cluster in frontend/tests/contract/test_keyword_clustering.test.ts
- [x] T013 [P] Contract test POST /api/external-tools/process in frontend/tests/contract/test_external_tools.test.ts
- [x] T014 [P] Integration test complete workflow flow in frontend/tests/integration/test_workflow_integration.test.ts
- [x] T015 [P] Integration test tab navigation in frontend/tests/integration/test_tab_navigation.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T016 [P] Create API service layer in frontend/src/services/api.ts
- [x] T017 [P] Create React Query hooks in frontend/src/hooks/useWorkflow.ts
- [x] T018 [P] Create TypeScript types in frontend/src/types/workflow.ts
- [x] T019 [P] Create missing page components (TrendValidation, IdeaBurst, KeywordArmoury, Calendar, Settings)
- [x] T020 [P] Create ErrorBoundary component in frontend/src/components/ErrorBoundary.tsx
- [x] T021 [P] Create LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx
- [x] T022 Fix Enhanced Workflow Context initial step in frontend/src/contexts/EnhancedWorkflowContext.tsx
- [x] T023 Update App.tsx routing configuration in frontend/src/App.tsx
- [x] T024 Create TabNavigation component in frontend/src/components/TabNavigation.tsx
- [x] T025 Update AffiliateResearch component with React Query in frontend/src/pages/AffiliateResearch.tsx

## Phase 3.4: Enhanced Workflow Integration
- [x] T026 [P] Create TopicDecompositionStep component in frontend/src/components/workflow/TopicDecompositionStep.tsx
- [x] T027 [P] Create AffiliateResearchStep component in frontend/src/components/workflow/AffiliateResearchStep.tsx
- [x] T028 [P] Create TrendAnalysisStep component in frontend/src/components/workflow/TrendAnalysisStep.tsx
- [x] T029 [P] Create ContentGenerationStep component in frontend/src/components/workflow/ContentGenerationStep.tsx
- [x] T030 [P] Create KeywordClusteringStep component in frontend/src/components/workflow/KeywordClusteringStep.tsx
- [x] T031 [P] Create ExternalToolIntegrationStep component in frontend/src/components/workflow/ExternalToolIntegrationStep.tsx
- [x] T032 Create main EnhancedWorkflow component in frontend/src/components/workflow/EnhancedWorkflow.tsx
- [x] T033 Create WorkflowProgressTracker component in frontend/src/components/workflow/WorkflowProgressTracker.tsx
- [x] T034 Create WorkflowResultsDashboard component in frontend/src/components/workflow/WorkflowResultsDashboard.tsx

## Phase 3.5: Integration & API Connection
- [x] T035 Connect workflow components to API services
- [x] T036 Implement error handling for all API calls
- [x] T037 Add loading states for all async operations
- [x] T038 Implement form validation for all input fields
- [x] T039 Add success/error notifications for user actions

## Phase 3.6: Polish & Performance
- [x] T040 [P] Add React.memo to all workflow step components
- [x] T041 [P] Implement code splitting for page components
- [x] T042 [P] Add unit tests for all components in frontend/tests/unit/
- [x] T043 [P] Add integration tests for workflow steps in frontend/tests/integration/
- [x] T044 [P] Performance optimization (bundle analysis, lazy loading)
- [x] T045 [P] Accessibility improvements (WCAG 2.1 AA compliance)
- [x] T046 [P] Add comprehensive error logging and monitoring
- [x] T047 [P] Update documentation and README files
- [x] T048 [P] Add end-to-end tests with Cypress

## Dependencies
- Tests (T006-T015) before implementation (T016-T048)
- T016 blocks T017, T025 (API service required)
- T017 blocks T032-T034 (hooks required for workflow)
- T019 blocks T023 (page components required for routing)
- T022 blocks T032 (context fix required for workflow)
- T026-T031 block T032 (step components required for main workflow)
- T032 blocks T035 (main workflow required for integration)
- T035 blocks T040-T048 (integration required for polish)

## Parallel Execution Examples

### Phase 3.2: Contract Tests (T006-T015) - Can run in parallel
```bash
# Launch all contract tests together:
Task: "Contract test GET /api/tabs in frontend/tests/contract/test_tabs_api.test.ts"
Task: "Contract test POST /api/workflow/sessions in frontend/tests/contract/test_workflow_sessions.test.ts"
Task: "Contract test POST /api/topic-decomposition in frontend/tests/contract/test_topic_decomposition.test.ts"
Task: "Contract test POST /api/affiliate-research in frontend/tests/contract/test_affiliate_research.test.ts"
Task: "Contract test POST /api/trend-analysis in frontend/tests/contract/test_trend_analysis.test.ts"
Task: "Contract test POST /api/content/generate in frontend/tests/contract/test_content_generation.test.ts"
Task: "Contract test POST /api/keywords/cluster in frontend/tests/contract/test_keyword_clustering.test.ts"
Task: "Contract test POST /api/external-tools/process in frontend/tests/contract/test_external_tools.test.ts"
Task: "Integration test complete workflow flow in frontend/tests/integration/test_workflow_integration.test.ts"
Task: "Integration test tab navigation in frontend/tests/integration/test_tab_navigation.test.ts"
```

### Phase 3.3: Core Components (T016-T025) - Can run in parallel
```bash
# Launch core implementation tasks together:
Task: "Create API service layer in frontend/src/services/api.ts"
Task: "Create React Query hooks in frontend/src/hooks/useWorkflow.ts"
Task: "Create TypeScript types in frontend/src/types/workflow.ts"
Task: "Create missing page components (TrendValidation, IdeaBurst, KeywordArmoury, Calendar, Settings)"
Task: "Create ErrorBoundary component in frontend/src/components/ErrorBoundary.tsx"
Task: "Create LoadingSpinner component in frontend/src/components/LoadingSpinner.tsx"
```

### Phase 3.4: Workflow Steps (T026-T031) - Can run in parallel
```bash
# Launch workflow step components together:
Task: "Create TopicDecompositionStep component in frontend/src/components/workflow/TopicDecompositionStep.tsx"
Task: "Create AffiliateResearchStep component in frontend/src/components/workflow/AffiliateResearchStep.tsx"
Task: "Create TrendAnalysisStep component in frontend/src/components/workflow/TrendAnalysisStep.tsx"
Task: "Create ContentGenerationStep component in frontend/src/components/workflow/ContentGenerationStep.tsx"
Task: "Create KeywordClusteringStep component in frontend/src/components/workflow/KeywordClusteringStep.tsx"
Task: "Create ExternalToolIntegrationStep component in frontend/src/components/workflow/ExternalToolIntegrationStep.tsx"
```

### Phase 3.6: Polish Tasks (T040-T048) - Can run in parallel
```bash
# Launch polish tasks together:
Task: "Add React.memo to all workflow step components"
Task: "Implement code splitting for page components"
Task: "Add unit tests for all components in frontend/tests/unit/"
Task: "Add integration tests for workflow steps in frontend/tests/integration/"
Task: "Performance optimization (bundle analysis, lazy loading)"
Task: "Accessibility improvements (WCAG 2.1 AA compliance)"
Task: "Add comprehensive error logging and monitoring"
Task: "Update documentation and README files"
Task: "Add end-to-end tests with Cypress"
```

## Task Categories Summary

### Setup Tasks (5 tasks)
- Dependencies installation and configuration
- TypeScript, ESLint, React Router setup
- Material-UI theme configuration
- React Query client setup

### Test Tasks (10 tasks) - TDD MANDATORY
- Contract tests for all API endpoints
- Integration tests for workflow and navigation
- All tests must be written and fail before implementation

### Core Implementation Tasks (10 tasks)
- API service layer and React Query hooks
- TypeScript types and missing page components
- Error handling and loading components
- Context fixes and routing updates

### Enhanced Workflow Tasks (9 tasks)
- Individual workflow step components
- Main workflow orchestrator
- Progress tracking and results dashboard

### Integration Tasks (5 tasks)
- API connection and error handling
- Form validation and notifications
- Loading states and user feedback

### Polish Tasks (9 tasks)
- Performance optimization
- Testing and accessibility
- Documentation and monitoring

## Validation Checklist
*GATE: Checked before returning*

- [x] All contracts have corresponding tests (8 API endpoints → 8 contract tests)
- [x] All entities have model tasks (TypeScript types for all data models)
- [x] All tests come before implementation (TDD approach)
- [x] Parallel tasks truly independent (different files, no dependencies)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Tab navigation fixes covered (T019, T023, T024)
- [x] API integration fixes covered (T016, T017, T025)
- [x] Enhanced workflow integration covered (T026-T034)
- [x] Error handling and performance covered (T040-T048)

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Focus on fixing the three main issues: empty tabs, broken affiliate research, enhanced workflow integration
- Maintain existing backend API compatibility
- Ensure zero downtime deployment
- Target performance: <200ms API response, <2s page load, 60fps UI interactions