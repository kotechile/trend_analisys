# Tasks: Enhanced Research Workflow Integration

**Input**: Design documents from `/specs/006-backend-core-apis-plan/`
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
- Paths based on trend-analysis-platform/ structure

## Phase 3.1: Setup
- [ ] T001 Verify existing project structure (trend-analysis-platform/)
- [ ] T002 [P] Add new dependencies: pandas, scikit-learn for CSV processing and clustering
- [ ] T003 [P] Configure CSV upload limits and validation in backend settings
- [ ] T004 [P] Set up file upload handling in FastAPI configuration
- [ ] T005 [P] Configure Redis caching for workflow sessions

## Phase 3.2: Database Schema (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These database changes MUST be created before ANY implementation**
- [ ] T006 [P] Create trend_selections table migration in backend/migrations/
- [ ] T007 [P] Create keyword_clusters table migration in backend/migrations/
- [ ] T008 [P] Create workflow_sessions table migration in backend/migrations/
- [ ] T009 [P] Add external_tool_source fields to keyword_data table migration
- [ ] T010 [P] Add CSV processing fields to trend_analysis table migration
- [ ] T011 [P] Create database indexes for performance optimization

## Phase 3.3: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.4
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T012 [P] Contract test POST /workflow/sessions in tests/contract/test_workflow_sessions_post.py
- [ ] T013 [P] Contract test GET /workflow/sessions in tests/contract/test_workflow_sessions_get.py
- [ ] T014 [P] Contract test POST /workflow/sessions/{id}/csv-upload in tests/contract/test_csv_upload.py
- [ ] T015 [P] Contract test GET /workflow/sessions/{id}/trends in tests/contract/test_trends_get.py
- [ ] T016 [P] Contract test POST /workflow/sessions/{id}/trends in tests/contract/test_trends_post.py
- [ ] T017 [P] Contract test POST /workflow/sessions/{id}/keywords/generate in tests/contract/test_keywords_generate.py
- [ ] T018 [P] Contract test GET /workflow/sessions/{id}/keywords/export in tests/contract/test_keywords_export.py
- [ ] T019 [P] Contract test POST /workflow/sessions/{id}/external-upload in tests/contract/test_external_upload.py
- [ ] T020 [P] Contract test GET /workflow/sessions/{id}/clusters in tests/contract/test_clusters_get.py
- [ ] T021 [P] Integration test complete workflow in tests/integration/test_enhanced_workflow.py
- [ ] T022 [P] Integration test CSV processing in tests/integration/test_csv_processing.py
- [ ] T023 [P] Integration test keyword clustering in tests/integration/test_keyword_clustering.py

## Phase 3.4: Core Implementation (ONLY after tests are failing)
- [ ] T024 [P] TrendSelections model in backend/src/models/trend_selections.py
- [ ] T025 [P] KeywordClusters model in backend/src/models/keyword_clusters.py
- [ ] T026 [P] WorkflowSessions model in backend/src/models/workflow_sessions.py
- [ ] T027 [P] Enhance KeywordData model with external_tool_source fields
- [ ] T028 [P] Enhance TrendAnalysis model with CSV processing fields
- [ ] T029 [P] WorkflowSessionService in backend/src/services/workflow_session_service.py
- [ ] T030 [P] CSV processing service in backend/src/services/csv_processing_service.py
- [ ] T031 [P] Keyword clustering service in backend/src/services/keyword_clustering_service.py
- [ ] T032 [P] External tool integration service in backend/src/services/external_tool_service.py
- [ ] T033 [P] Enhance KeywordService with seed keyword generation methods
- [ ] T034 [P] Enhance TrendAnalysisService with CSV upload methods
- [ ] T035 [P] Enhance ContentService with workflow integration methods

## Phase 3.5: API Implementation
- [ ] T036 POST /workflow/sessions endpoint in backend/src/api/workflow_routes.py
- [ ] T037 GET /workflow/sessions endpoint in backend/src/api/workflow_routes.py
- [ ] T038 GET /workflow/sessions/{session_id} endpoint in backend/src/api/workflow_routes.py
- [ ] T039 PUT /workflow/sessions/{session_id} endpoint in backend/src/api/workflow_routes.py
- [ ] T040 POST /workflow/sessions/{session_id}/csv-upload endpoint in backend/src/api/workflow_routes.py
- [ ] T041 GET /workflow/sessions/{session_id}/trends endpoint in backend/src/api/workflow_routes.py
- [ ] T042 POST /workflow/sessions/{session_id}/trends endpoint in backend/src/api/workflow_routes.py
- [ ] T043 POST /workflow/sessions/{session_id}/keywords/generate endpoint in backend/src/api/workflow_routes.py
- [ ] T044 GET /workflow/sessions/{session_id}/keywords/export endpoint in backend/src/api/workflow_routes.py
- [ ] T045 POST /workflow/sessions/{session_id}/external-upload endpoint in backend/src/api/workflow_routes.py
- [ ] T046 GET /workflow/sessions/{session_id}/clusters endpoint in backend/src/api/workflow_routes.py

## Phase 3.6: Frontend Components
- [ ] T047 [P] WorkflowSessionProvider context in frontend/src/contexts/WorkflowSessionContext.tsx
- [ ] T048 [P] CSVUpload component in frontend/src/components/CSVUpload.tsx
- [ ] T049 [P] TrendSelection component in frontend/src/components/TrendSelection.tsx
- [ ] T050 [P] KeywordGeneration component in frontend/src/components/KeywordGeneration.tsx
- [ ] T051 [P] KeywordExport component in frontend/src/components/KeywordExport.tsx
- [ ] T052 [P] ExternalUpload component in frontend/src/components/ExternalUpload.tsx
- [ ] T053 [P] KeywordClusters component in frontend/src/components/KeywordClusters.tsx
- [ ] T054 [P] WorkflowProgress component in frontend/src/components/WorkflowProgress.tsx
- [ ] T055 [P] EnhancedWorkflowPage component in frontend/src/pages/EnhancedWorkflowPage.tsx
- [ ] T056 [P] Workflow API service in frontend/src/services/workflowApi.ts

## Phase 3.7: Integration
- [ ] T057 Connect WorkflowSessionService to database
- [ ] T058 Connect CSV processing service to file storage
- [ ] T059 Connect keyword clustering service to scikit-learn
- [ ] T060 Connect external tool service to data processing pipeline
- [ ] T061 Add workflow routes to main FastAPI app
- [ ] T062 Add frontend routing for enhanced workflow page
- [ ] T063 Configure file upload middleware
- [ ] T064 Add workflow session caching to Redis
- [ ] T065 Add error handling and logging for workflow operations

## Phase 3.8: Polish
- [ ] T066 [P] Unit tests for CSV processing in tests/unit/test_csv_processing.py
- [ ] T067 [P] Unit tests for keyword clustering in tests/unit/test_keyword_clustering.py
- [ ] T068 [P] Unit tests for external tool integration in tests/unit/test_external_tool.py
- [ ] T069 [P] Unit tests for workflow session service in tests/unit/test_workflow_session.py
- [ ] T070 [P] Frontend unit tests for workflow components in frontend/tests/components/
- [ ] T071 Performance tests for CSV processing (< 5 seconds for 10MB files)
- [ ] T072 Performance tests for keyword clustering (< 60 seconds for 1000 keywords)
- [ ] T073 Performance tests for complete workflow (< 15 minutes end-to-end)
- [ ] T074 [P] Update API documentation with new endpoints
- [ ] T075 [P] Update frontend documentation with new components
- [ ] T076 [P] Add accessibility features (WCAG 2.1 AA compliance)
- [ ] T077 [P] Security audit for file upload and data processing
- [ ] T078 [P] Remove code duplication and optimize performance
- [ ] T079 [P] Run complete quickstart.md validation
- [ ] T080 [P] Update README with enhanced workflow instructions

## Dependencies
- Database migrations (T006-T011) before models (T024-T028)
- Models (T024-T028) before services (T029-T035)
- Services (T029-T035) before API endpoints (T036-T046)
- API endpoints (T036-T046) before frontend components (T047-T056)
- Tests (T012-T023) before implementation (T024-T056)
- Implementation before integration (T057-T065)
- Integration before polish (T066-T080)

## Parallel Execution Examples

### Database Setup (T006-T011)
```bash
# Launch database migrations in parallel:
Task: "Create trend_selections table migration in backend/migrations/"
Task: "Create keyword_clusters table migration in backend/migrations/"
Task: "Create workflow_sessions table migration in backend/migrations/"
Task: "Add external_tool_source fields to keyword_data table migration"
Task: "Add CSV processing fields to trend_analysis table migration"
Task: "Create database indexes for performance optimization"
```

### Contract Tests (T012-T023)
```bash
# Launch contract tests in parallel:
Task: "Contract test POST /workflow/sessions in tests/contract/test_workflow_sessions_post.py"
Task: "Contract test GET /workflow/sessions in tests/contract/test_workflow_sessions_get.py"
Task: "Contract test POST /workflow/sessions/{id}/csv-upload in tests/contract/test_csv_upload.py"
Task: "Contract test GET /workflow/sessions/{id}/trends in tests/contract/test_trends_get.py"
Task: "Contract test POST /workflow/sessions/{id}/trends in tests/contract/test_trends_post.py"
Task: "Contract test POST /workflow/sessions/{id}/keywords/generate in tests/contract/test_keywords_generate.py"
Task: "Contract test GET /workflow/sessions/{id}/keywords/export in tests/contract/test_keywords_export.py"
Task: "Contract test POST /workflow/sessions/{id}/external-upload in tests/contract/test_external_upload.py"
Task: "Contract test GET /workflow/sessions/{id}/clusters in tests/contract/test_clusters_get.py"
Task: "Integration test complete workflow in tests/integration/test_enhanced_workflow.py"
Task: "Integration test CSV processing in tests/integration/test_csv_processing.py"
Task: "Integration test keyword clustering in tests/integration/test_keyword_clustering.py"
```

### Models (T024-T028)
```bash
# Launch model creation in parallel:
Task: "TrendSelections model in backend/src/models/trend_selections.py"
Task: "KeywordClusters model in backend/src/models/keyword_clusters.py"
Task: "WorkflowSessions model in backend/src/models/workflow_sessions.py"
Task: "Enhance KeywordData model with external_tool_source fields"
Task: "Enhance TrendAnalysis model with CSV processing fields"
```

### Services (T029-T035)
```bash
# Launch service creation in parallel:
Task: "WorkflowSessionService in backend/src/services/workflow_session_service.py"
Task: "CSV processing service in backend/src/services/csv_processing_service.py"
Task: "Keyword clustering service in backend/src/services/keyword_clustering_service.py"
Task: "External tool integration service in backend/src/services/external_tool_service.py"
Task: "Enhance KeywordService with seed keyword generation methods"
Task: "Enhance TrendAnalysisService with CSV upload methods"
Task: "Enhance ContentService with workflow integration methods"
```

### Frontend Components (T047-T056)
```bash
# Launch frontend component creation in parallel:
Task: "WorkflowSessionProvider context in frontend/src/contexts/WorkflowSessionContext.tsx"
Task: "CSVUpload component in frontend/src/components/CSVUpload.tsx"
Task: "TrendSelection component in frontend/src/components/TrendSelection.tsx"
Task: "KeywordGeneration component in frontend/src/components/KeywordGeneration.tsx"
Task: "KeywordExport component in frontend/src/components/KeywordExport.tsx"
Task: "ExternalUpload component in frontend/src/components/ExternalUpload.tsx"
Task: "KeywordClusters component in frontend/src/components/KeywordClusters.tsx"
Task: "WorkflowProgress component in frontend/src/components/WorkflowProgress.tsx"
Task: "EnhancedWorkflowPage component in frontend/src/pages/EnhancedWorkflowPage.tsx"
Task: "Workflow API service in frontend/src/services/workflowApi.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- All API endpoints must be implemented in single workflow_routes.py file (sequential)
- Frontend components can be developed in parallel as they are independent files

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Each contract file → contract test task [P]
   - Each endpoint → implementation task
   
2. **From Data Model**:
   - Each entity → model creation task [P]
   - Relationships → service layer tasks
   
3. **From User Stories**:
   - Each story → integration test [P]
   - Quickstart scenarios → validation tasks

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Frontend → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Database migrations before models
- [x] Models before services
- [x] Services before API endpoints
- [x] API endpoints before frontend components
- [x] Complete workflow coverage from CSV upload to keyword clustering