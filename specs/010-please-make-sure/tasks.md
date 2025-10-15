# Tasks: Complete Dataflow Persistence in Supabase

**Input**: Design documents from `/specs/010-please-make-sure/`
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
- **Web app**: `backend/src/`, `frontend/src/` (based on plan.md structure)
- **Database**: `backend/migrations/`
- **Tests**: `backend/tests/`, `frontend/tests/`

## Phase 3.1: Setup
- [x] T001 Create research_topics table migration in backend/migrations/create_research_topics_table.sql
- [x] T002 [P] Enhance topic_decompositions table with research_topic_id foreign key in backend/migrations/enhance_topic_decompositions.sql
- [x] T003 [P] Enhance trend_analyses table with subtopic_name field in backend/migrations/enhance_trend_analyses.sql
- [x] T004 [P] Enhance content_ideas table with research_topic_id foreign key in backend/migrations/enhance_content_ideas.sql
- [x] T005 [P] Add performance indexes for all tables in backend/migrations/add_dataflow_indexes.sql
- [x] T006 [P] Create RLS policies for research_topics table in backend/migrations/create_research_topics_rls.sql

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T007 [P] Contract test POST /api/research-topics in backend/tests/contract/test_research_topics_post.py
- [ ] T008 [P] Contract test GET /api/research-topics/{id} in backend/tests/contract/test_research_topics_get.py
- [ ] T009 [P] Contract test PUT /api/research-topics/{id} in backend/tests/contract/test_research_topics_put.py
- [ ] T010 [P] Contract test DELETE /api/research-topics/{id} in backend/tests/contract/test_research_topics_delete.py
- [ ] T011 [P] Contract test POST /api/research-topics/{id}/subtopics in backend/tests/contract/test_subtopics_post.py
- [ ] T012 [P] Contract test GET /api/research-topics/{id}/complete in backend/tests/contract/test_complete_dataflow.py
- [ ] T013 [P] Integration test complete research workflow in backend/tests/integration/test_research_workflow.py
- [ ] T014 [P] Integration test data integrity and relationships in backend/tests/integration/test_data_integrity.py
- [ ] T015 [P] Integration test error handling and rollback in backend/tests/integration/test_error_handling.py

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T016 [P] ResearchTopic model in backend/src/models/research_topic.py
- [ ] T017 [P] Enhanced TopicDecomposition model in backend/src/models/topic_decomposition.py
- [ ] T018 [P] Enhanced TrendAnalysis model in backend/src/models/trend_analysis.py
- [ ] T019 [P] Enhanced ContentIdea model in backend/src/models/content_idea.py
- [ ] T020 [P] ResearchTopicService CRUD operations in backend/src/services/research_topic_service.py
- [ ] T021 [P] Enhanced TopicDecompositionService in backend/src/services/topic_decomposition_service.py
- [ ] T022 [P] Enhanced TrendAnalysisService in backend/src/services/trend_analysis_service.py
- [ ] T023 [P] Enhanced ContentIdeaService in backend/src/services/content_idea_service.py
- [ ] T024 [P] DataPersistenceOrchestrationService in backend/src/services/data_persistence_service.py
- [ ] T025 POST /api/research-topics endpoint in backend/src/api/research_topics_routes.py
- [ ] T026 GET /api/research-topics/{id} endpoint in backend/src/api/research_topics_routes.py
- [ ] T027 PUT /api/research-topics/{id} endpoint in backend/src/api/research_topics_routes.py
- [ ] T028 DELETE /api/research-topics/{id} endpoint in backend/src/api/research_topics_routes.py
- [ ] T029 POST /api/research-topics/{id}/subtopics endpoint in backend/src/api/research_topics_routes.py
- [ ] T030 GET /api/research-topics/{id}/subtopics endpoint in backend/src/api/research_topics_routes.py
- [ ] T031 GET /api/research-topics/{id}/complete endpoint in backend/src/api/research_topics_routes.py
- [ ] T032 Input validation and error handling in backend/src/api/validation.py
- [ ] T033 Response formatting and serialization in backend/src/api/serializers.py

## Phase 3.4: Integration
- [ ] T034 Connect ResearchTopicService to Supabase database in backend/src/database/research_topic_repository.py
- [ ] T035 Connect TopicDecompositionService to Supabase database in backend/src/database/topic_decomposition_repository.py
- [ ] T036 Connect TrendAnalysisService to Supabase database in backend/src/database/trend_analysis_repository.py
- [ ] T037 Connect ContentIdeaService to Supabase database in backend/src/database/content_idea_repository.py
- [ ] T038 Transaction management for data persistence in backend/src/database/transaction_manager.py
- [ ] T039 Authentication middleware for research topics endpoints in backend/src/middleware/auth_middleware.py
- [ ] T040 Request/response logging for dataflow operations in backend/src/middleware/logging_middleware.py
- [ ] T041 Error handling middleware for partial success scenarios in backend/src/middleware/error_middleware.py

## Phase 3.5: Frontend Integration
- [ ] T042 [P] ResearchTopic TypeScript types in frontend/src/types/research.ts
- [ ] T043 [P] ResearchTopic API client service in frontend/src/services/researchTopicService.ts
- [ ] T044 [P] Dataflow persistence hooks in frontend/src/hooks/useDataflowPersistence.ts
- [ ] T045 [P] Research topic management components in frontend/src/components/research/ResearchTopicManager.tsx
- [ ] T046 [P] Complete dataflow display component in frontend/src/components/research/CompleteDataflow.tsx
- [ ] T047 [P] Error handling and loading states in frontend/src/components/research/DataflowErrorHandler.tsx
- [ ] T048 Update existing workflow components to use new persistence in frontend/src/contexts/WorkflowContext.tsx

## Phase 3.6: Polish
- [ ] T049 [P] Unit tests for ResearchTopic model validation in backend/tests/unit/test_research_topic_model.py
- [ ] T050 [P] Unit tests for TopicDecomposition model validation in backend/tests/unit/test_topic_decomposition_model.py
- [ ] T051 [P] Unit tests for TrendAnalysis model validation in backend/tests/unit/test_trend_analysis_model.py
- [ ] T052 [P] Unit tests for ContentIdea model validation in backend/tests/unit/test_content_idea_model.py
- [ ] T053 [P] Unit tests for service layer business logic in backend/tests/unit/test_services.py
- [ ] T054 [P] Unit tests for frontend components in frontend/tests/components/test_research_components.tsx
- [ ] T055 [P] Unit tests for frontend hooks in frontend/tests/hooks/test_useDataflowPersistence.ts
- [ ] T056 Performance tests for API response times (<200ms) in backend/tests/performance/test_api_performance.py
- [ ] T057 [P] Update API documentation in backend/docs/api.md
- [ ] T058 [P] Update frontend documentation in frontend/docs/dataflow-persistence.md
- [ ] T059 [P] Security audit for data access patterns in backend/security/dataflow_security_audit.md
- [ ] T060 Remove code duplication and optimize queries in backend/src/services/
- [ ] T061 Run manual testing scenarios from quickstart.md
- [ ] T062 [P] Update shared TypeScript types in shared/types/research.ts

## Dependencies
- Database migrations (T001-T006) before model creation (T016-T019)
- Tests (T007-T015) before implementation (T016-T033)
- Models (T016-T019) before services (T020-T024)
- Services (T020-T024) before API endpoints (T025-T033)
- API endpoints (T025-T033) before integration (T034-T041)
- Backend integration (T034-T041) before frontend integration (T042-T048)
- Implementation before polish (T049-T062)

## Parallel Execution Examples

### Database Setup (T002-T006 can run in parallel):
```
Task: "Enhance topic_decompositions table with research_topic_id foreign key in backend/migrations/enhance_topic_decompositions.sql"
Task: "Enhance trend_analyses table with subtopic_name field in backend/migrations/enhance_trend_analyses.sql"
Task: "Enhance content_ideas table with research_topic_id foreign key in backend/migrations/enhance_content_ideas.sql"
Task: "Add performance indexes for all tables in backend/migrations/add_dataflow_indexes.sql"
Task: "Create RLS policies for research_topics table in backend/migrations/create_research_topics_rls.sql"
```

### Contract Tests (T007-T015 can run in parallel):
```
Task: "Contract test POST /api/research-topics in backend/tests/contract/test_research_topics_post.py"
Task: "Contract test GET /api/research-topics/{id} in backend/tests/contract/test_research_topics_get.py"
Task: "Contract test PUT /api/research-topics/{id} in backend/tests/contract/test_research_topics_put.py"
Task: "Contract test DELETE /api/research-topics/{id} in backend/tests/contract/test_research_topics_delete.py"
Task: "Contract test POST /api/research-topics/{id}/subtopics in backend/tests/contract/test_subtopics_post.py"
Task: "Contract test GET /api/research-topics/{id}/complete in backend/tests/contract/test_complete_dataflow.py"
Task: "Integration test complete research workflow in backend/tests/integration/test_research_workflow.py"
Task: "Integration test data integrity and relationships in backend/tests/integration/test_data_integrity.py"
Task: "Integration test error handling and rollback in backend/tests/integration/test_error_handling.py"
```

### Model Creation (T016-T019 can run in parallel):
```
Task: "ResearchTopic model in backend/src/models/research_topic.py"
Task: "Enhanced TopicDecomposition model in backend/src/models/topic_decomposition.py"
Task: "Enhanced TrendAnalysis model in backend/src/models/trend_analysis.py"
Task: "Enhanced ContentIdea model in backend/src/models/content_idea.py"
```

### Service Layer (T020-T024 can run in parallel):
```
Task: "ResearchTopicService CRUD operations in backend/src/services/research_topic_service.py"
Task: "Enhanced TopicDecompositionService in backend/src/services/topic_decomposition_service.py"
Task: "Enhanced TrendAnalysisService in backend/src/services/trend_analysis_service.py"
Task: "Enhanced ContentIdeaService in backend/src/services/content_idea_service.py"
Task: "DataPersistenceOrchestrationService in backend/src/services/data_persistence_service.py"
```

### Frontend Components (T042-T047 can run in parallel):
```
Task: "ResearchTopic TypeScript types in frontend/src/types/research.ts"
Task: "ResearchTopic API client service in frontend/src/services/researchTopicService.ts"
Task: "Dataflow persistence hooks in frontend/src/hooks/useDataflowPersistence.ts"
Task: "Research topic management components in frontend/src/components/research/ResearchTopicManager.tsx"
Task: "Complete dataflow display component in frontend/src/components/research/CompleteDataflow.tsx"
Task: "Error handling and loading states in frontend/src/components/research/DataflowErrorHandler.tsx"
```

### Unit Tests (T049-T055 can run in parallel):
```
Task: "Unit tests for ResearchTopic model validation in backend/tests/unit/test_research_topic_model.py"
Task: "Unit tests for TopicDecomposition model validation in backend/tests/unit/test_topic_decomposition_model.py"
Task: "Unit tests for TrendAnalysis model validation in backend/tests/unit/test_trend_analysis_model.py"
Task: "Unit tests for ContentIdea model validation in backend/tests/unit/test_content_idea_model.py"
Task: "Unit tests for service layer business logic in backend/tests/unit/test_services.py"
Task: "Unit tests for frontend components in frontend/tests/components/test_research_components.tsx"
Task: "Unit tests for frontend hooks in frontend/tests/hooks/test_useDataflowPersistence.ts"
```

## Critical Path
1. **T001** → Database setup
2. **T002-T006** → Database enhancements (parallel)
3. **T007-T015** → Contract and integration tests (parallel)
4. **T016-T019** → Model creation (parallel)
5. **T020-T024** → Service layer (parallel)
6. **T025-T033** → API endpoints (sequential)
7. **T034-T041** → Backend integration (sequential)
8. **T042-T048** → Frontend integration (parallel)
9. **T049-T062** → Polish and testing (parallel)

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Database migrations must be run in order
- API endpoints share the same route file, so they're sequential
- Frontend components can be developed in parallel
- All unit tests can run in parallel as they test different files

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - research-topics-api.yaml → 6 contract test tasks (T007-T012)
   - Each endpoint → implementation task (T025-T031)
   
2. **From Data Model**:
   - ResearchTopic entity → model task (T016)
   - TopicDecomposition entity → model task (T017)
   - TrendAnalysis entity → model task (T018)
   - ContentIdea entity → model task (T019)
   
3. **From User Stories**:
   - Complete research workflow → integration test (T013)
   - Data integrity → integration test (T014)
   - Error handling → integration test (T015)
   
4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Integration → Frontend → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (research-topics-api.yaml → T007-T012)
- [x] All entities have model tasks (4 entities → T016-T019)
- [x] All tests come before implementation (T007-T015 before T016-T033)
- [x] Parallel tasks truly independent (different files marked [P])
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Database migrations in correct order
- [x] API endpoints properly sequenced
- [x] Frontend integration after backend completion
- [x] Comprehensive test coverage planned
