# Tasks: Keyword Analysis with Enhanced Idea Burst

**Input**: Design documents from `/specs/011-1-a-new/`
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
- **Monorepo structure**: `trend-analysis-platform/backend/`, `trend-analysis-platform/frontend/`
- Paths shown below assume web application structure per plan.md

## Phase 3.1: Setup
- [x] T001 Create monorepo structure (trend-analysis-platform/backend/, trend-analysis-platform/frontend/, trend-analysis-platform/shared/)
- [x] T002 Initialize FastAPI backend project with dependencies (FastAPI, pandas, numpy, scikit-learn, Supabase)
- [x] T003 Initialize React frontend project with dependencies (React, TypeScript, Material-UI, Jest, React Testing Library)
- [x] T004 [P] Configure Python linting and formatting (black, flake8, pytest) in backend/
- [x] T005 [P] Configure TypeScript linting and formatting (ESLint, Prettier) in frontend/
- [x] T006 [P] Set up Supabase PostgreSQL database with connection configuration
- [x] T007 [P] Configure CI/CD pipeline (.github/workflows/) for both frontend and backend

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T008 [P] Contract test POST /api/v1/upload in backend/tests/contract/test_upload_post.py
- [x] T009 [P] Contract test GET /api/v1/upload/{file_id}/status in backend/tests/contract/test_upload_status.py
- [x] T010 [P] Contract test POST /api/v1/analysis/{file_id}/start in backend/tests/contract/test_analysis_start.py
- [x] T011 [P] Contract test GET /api/v1/analysis/{file_id}/status in backend/tests/contract/test_analysis_status.py
- [x] T012 [P] Contract test GET /api/v1/analysis/{file_id}/results in backend/tests/contract/test_analysis_results.py
- [x] T013 [P] Contract test GET /api/v1/reports/{report_id} in backend/tests/contract/test_reports_get.py
- [x] T014 [P] Contract test GET /api/v1/reports/{report_id}/export in backend/tests/contract/test_reports_export.py
- [x] T015 [P] Integration test complete keyword analysis workflow in backend/tests/integration/test_keyword_analysis.py
- [x] T016 [P] Integration test file upload and processing in backend/tests/integration/test_file_processing.py
- [x] T017 [P] Integration test SEO content idea generation in backend/tests/integration/test_content_ideas.py
- [x] T018 [P] Frontend component test FileUpload in frontend/src/components/__tests__/FileUpload.test.tsx
- [x] T019 [P] Frontend component test AnalysisResults in frontend/src/components/__tests__/AnalysisResults.test.tsx
- [x] T020 [P] Frontend component test SEOContentIdeas in frontend/src/components/__tests__/SEOContentIdeas.test.tsx
- [x] T021 [P] Frontend component test IdeaBurstPage in frontend/src/components/__tests__/IdeaBurstPage.test.tsx
- [x] T022 [P] Frontend component test SelectionIndicators in frontend/src/components/__tests__/SelectionIndicators.test.tsx

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T023 [P] Keyword model in backend/src/models/keyword.py
- [x] T024 [P] KeywordAnalysisReport model in backend/src/models/analysis_report.py
- [x] T025 [P] ContentOpportunity model in backend/src/models/content_opportunity.py
- [x] T026 [P] SEOContentIdea model in backend/src/models/seo_content_idea.py
- [x] T027 [P] AhrefsExportFile model in backend/src/models/ahrefs_export_file.py
- [x] T028 [P] IdeaBurstSession model in backend/src/models/idea_burst_session.py
- [x] T029 [P] SelectionIndicator model in backend/src/models/selection_indicator.py
- [x] T030 [P] FileParser service in backend/src/services/file_parser.py
- [x] T031 [P] KeywordAnalyzer service in backend/src/services/keyword_analyzer.py
- [x] T032 [P] ReportGenerator service in backend/src/services/report_generator.py
- [x] T033 [P] ContentIdeaGenerator service in backend/src/services/content_idea_generator.py
- [x] T034 [P] KeywordClustering utility in backend/src/utils/keyword_clustering.py
- [x] T035 [P] Scoring utility in backend/src/utils/scoring.py
- [x] T036 [P] Validation utility in backend/src/utils/validation.py
- [x] T037 POST /api/v1/upload endpoint in backend/src/api/upload.py
- [x] T038 GET /api/v1/upload/{file_id}/status endpoint in backend/src/api/upload.py
- [x] T039 POST /api/v1/analysis/{file_id}/start endpoint in backend/src/api/analysis.py
- [x] T040 GET /api/v1/analysis/{file_id}/status endpoint in backend/src/api/analysis.py
- [x] T041 GET /api/v1/analysis/{file_id}/results endpoint in backend/src/api/analysis.py
- [x] T042 GET /api/v1/reports/{report_id} endpoint in backend/src/api/reports.py
- [x] T043 GET /api/v1/reports/{report_id}/export endpoint in backend/src/api/reports.py
- [x] T044 Input validation for all endpoints
- [x] T045 Error handling and logging for all endpoints

## Phase 3.4: Frontend Components
- [x] T046 [P] FileUpload component in frontend/src/components/FileUpload.tsx
- [x] T047 [P] AnalysisResults component in frontend/src/components/AnalysisResults.tsx
- [x] T048 [P] KeywordTable component in frontend/src/components/KeywordTable.tsx
- [x] T049 [P] SEOContentIdeas component in frontend/src/components/SEOContentIdeas.tsx
- [x] T050 [P] OptimizationTips component in frontend/src/components/OptimizationTips.tsx
- [x] T051 [P] IdeaBurstPage component in frontend/src/components/IdeaBurstPage.tsx
- [x] T052 [P] SelectionIndicators component in frontend/src/components/SelectionIndicators.tsx
- [x] T053 [P] IdeaCard component in frontend/src/components/IdeaCard.tsx
- [x] T054 [P] KeywordAnalysis page in frontend/src/pages/KeywordAnalysis.tsx
- [x] T055 [P] Reports page in frontend/src/pages/Reports.tsx
- [x] T056 [P] ContentIdeas page in frontend/src/pages/ContentIdeas.tsx
- [x] T057 [P] IdeaBurst page in frontend/src/pages/IdeaBurst.tsx
- [x] T058 [P] API service in frontend/src/services/api.ts
- [x] T059 [P] Analysis service in frontend/src/services/analysis.ts
- [x] T060 [P] ContentIdeas service in frontend/src/services/contentIdeas.ts
- [x] T061 [P] IdeaBurst service in frontend/src/services/ideaBurst.ts
- [x] T062 [P] TypeScript types in frontend/src/types/keyword.ts
- [x] T063 [P] TypeScript types in frontend/src/types/analysis.ts
- [x] T064 [P] TypeScript types in frontend/src/types/seoContentIdea.ts
- [x] T065 [P] TypeScript types in frontend/src/types/ideaBurst.ts

## Phase 3.5: Integration
- [x] T066 Connect KeywordAnalyzer to Supabase database
- [x] T067 Connect ReportGenerator to Supabase database
- [x] T068 Connect ContentIdeaGenerator to Supabase database
- [ ] T069 Authentication middleware for all endpoints
- [ ] T070 Request/response logging middleware
- [ ] T071 CORS and security headers configuration
- [ ] T072 File upload validation and storage
- [ ] T073 TSV parsing and validation
- [ ] T074 Intent tag mapping and parsing
- [ ] T075 Opportunity score calculation algorithm
- [ ] T076 Keyword clustering for content ideas
- [ ] T077 SEO optimization score calculation
- [ ] T078 Traffic potential score calculation
- [ ] T079 Optimization tip generation
- [ ] T080 Visual selection indicator logic
- [ ] T081 Content type differentiation (articles vs software)
- [ ] T082 Idea ranking and prioritization
- [ ] T083 User selection and filtering
- [ ] T084 Session management for Idea Burst

## Phase 3.6: Enhanced Ahrefs Integration
- [ ] T085 [P] Enhanced Idea Burst Page component in frontend/src/components/EnhancedIdeaBurstPage.tsx
- [ ] T086 [P] Enhanced Database Service with Supabase SDK in backend/src/services/enhanced_database.py
- [ ] T087 [P] Enhanced Idea Generator with separate paths in backend/src/services/enhanced_idea_generator.py
- [ ] T088 [P] Enhanced API Service for frontend in frontend/src/services/enhanced_api.ts
- [ ] T089 [P] Ahrefs File Processing API endpoint in backend/src/api/ahrefs.py
- [ ] T090 [P] Enhanced Ideas API endpoint in backend/src/api/enhanced_ideas.py
- [ ] T091 [P] Blog Ideas API endpoint in backend/src/api/blog_ideas.py
- [ ] T092 [P] Software Ideas API endpoint in backend/src/api/software_ideas.py
- [ ] T093 [P] Enhanced Idea Burst API endpoint in backend/src/api/enhanced_idea_burst.py
- [ ] T094 [P] Ahrefs Analysis Service in backend/src/services/ahrefs_analyzer.py
- [ ] T095 [P] Blog Idea Generator Service in backend/src/services/blog_idea_generator.py
- [ ] T096 [P] Software Idea Generator Service in backend/src/services/software_idea_generator.py
- [ ] T097 [P] Enhanced Idea Burst Service in backend/src/services/enhanced_idea_burst.py
- [ ] T098 [P] Ahrefs Data Models in backend/src/models/ahrefs_models.py
- [ ] T099 [P] Blog Idea Models in backend/src/models/blog_idea.py
- [ ] T100 [P] Software Idea Models in backend/src/models/software_idea.py
- [ ] T101 [P] Enhanced Idea Burst Models in backend/src/models/enhanced_idea_burst.py
- [ ] T102 [P] Ahrefs File Upload component in frontend/src/components/AhrefsFileUpload.tsx
- [ ] T103 [P] Blog Ideas List component in frontend/src/components/BlogIdeasList.tsx
- [ ] T104 [P] Software Ideas List component in frontend/src/components/SoftwareIdeasList.tsx
- [ ] T105 [P] Enhanced Idea Comparison component in frontend/src/components/EnhancedIdeaComparison.tsx
- [ ] T106 [P] Ahrefs Analysis Results component in frontend/src/components/AhrefsAnalysisResults.tsx
- [ ] T107 [P] Enhanced Selection Indicators component in frontend/src/components/EnhancedSelectionIndicators.tsx
- [ ] T108 [P] Idea Type Filter component in frontend/src/components/IdeaTypeFilter.tsx
- [ ] T109 [P] Enhanced Idea Card component in frontend/src/components/EnhancedIdeaCard.tsx
- [ ] T110 [P] Ahrefs Integration page in frontend/src/pages/AhrefsIntegration.tsx
- [ ] T111 [P] Enhanced Idea Burst page in frontend/src/pages/EnhancedIdeaBurst.tsx
- [ ] T112 [P] Blog Ideas page in frontend/src/pages/BlogIdeas.tsx
- [ ] T113 [P] Software Ideas page in frontend/src/pages/SoftwareIdeas.tsx
- [ ] T114 [P] Enhanced API service in frontend/src/services/enhanced_api.ts
- [ ] T115 [P] Ahrefs service in frontend/src/services/ahrefs.ts
- [ ] T116 [P] Blog Ideas service in frontend/src/services/blogIdeas.ts
- [ ] T117 [P] Software Ideas service in frontend/src/services/softwareIdeas.ts
- [ ] T118 [P] Enhanced Idea Burst service in frontend/src/services/enhancedIdeaBurst.ts
- [ ] T119 [P] Ahrefs types in frontend/src/types/ahrefs.ts
- [ ] T120 [P] Blog Idea types in frontend/src/types/blogIdea.ts
- [ ] T121 [P] Software Idea types in frontend/src/types/softwareIdea.ts
- [ ] T122 [P] Enhanced Idea Burst types in frontend/src/types/enhancedIdeaBurst.ts

## Phase 3.7: Integration Testing
- [ ] T123 [P] Contract tests for Ahrefs API endpoints in backend/tests/contract/test_ahrefs_api.py
- [ ] T124 [P] Contract tests for Enhanced Ideas API endpoints in backend/tests/contract/test_enhanced_ideas_api.py
- [ ] T125 [P] Contract tests for Blog Ideas API endpoints in backend/tests/contract/test_blog_ideas_api.py
- [ ] T126 [P] Contract tests for Software Ideas API endpoints in backend/tests/contract/test_software_ideas_api.py
- [ ] T127 [P] Integration tests for Ahrefs file processing in backend/tests/integration/test_ahrefs_processing.py
- [ ] T128 [P] Integration tests for Enhanced Idea Generation in backend/tests/integration/test_enhanced_idea_generation.py
- [ ] T129 [P] Integration tests for Blog Idea Generation in backend/tests/integration/test_blog_idea_generation.py
- [ ] T130 [P] Integration tests for Software Idea Generation in backend/tests/integration/test_software_idea_generation.py
- [ ] T131 [P] Frontend component tests for Enhanced Idea Burst in frontend/src/components/__tests__/EnhancedIdeaBurstPage.test.tsx
- [ ] T132 [P] Frontend component tests for Ahrefs File Upload in frontend/src/components/__tests__/AhrefsFileUpload.test.tsx
- [ ] T133 [P] Frontend component tests for Blog Ideas List in frontend/src/components/__tests__/BlogIdeasList.test.tsx
- [ ] T134 [P] Frontend component tests for Software Ideas List in frontend/src/components/__tests__/SoftwareIdeasList.test.tsx
- [ ] T135 [P] Frontend component tests for Enhanced Selection Indicators in frontend/src/components/__tests__/EnhancedSelectionIndicators.test.tsx

## Phase 3.8: Polish
- [ ] T136 [P] Unit tests for KeywordAnalyzer in backend/tests/unit/test_keyword_analyzer.py
- [ ] T137 [P] Unit tests for ReportGenerator in backend/tests/unit/test_report_generator.py
- [ ] T138 [P] Unit tests for ContentIdeaGenerator in backend/tests/unit/test_content_idea_generator.py
- [ ] T139 [P] Unit tests for Scoring utility in backend/tests/unit/test_scoring.py
- [ ] T140 [P] Unit tests for Validation utility in backend/tests/unit/test_validation.py
- [ ] T141 [P] Unit tests for KeywordClustering in backend/tests/unit/test_keyword_clustering.py
- [ ] T142 [P] Frontend unit tests for API services in frontend/src/services/__tests__/
- [ ] T143 [P] Frontend unit tests for utility functions in frontend/src/utils/__tests__/
- [ ] T144 Performance tests for large file processing (<30 seconds for 50,000 keywords)
- [ ] T094 Performance tests for API response times (<200ms)
- [ ] T095 [P] Update API documentation in docs/api.md
- [ ] T096 [P] Update user guide in docs/user-guide.md
- [ ] T097 [P] Update developer documentation in docs/developer-guide.md
- [ ] T098 Remove code duplication and optimize algorithms
- [ ] T099 Security audit for file upload and data processing
- [ ] T100 Data retention and cleanup job (90-day expiration)
- [ ] T101 Manual testing workflow validation
- [ ] T102 Accessibility testing (WCAG 2.1 AA compliance)
- [ ] T103 Cross-browser compatibility testing
- [ ] T104 Mobile responsiveness testing

## Dependencies
- Tests (T008-T022) before implementation (T023-T065)
- T023-T029 (models) block T030-T036 (services)
- T030-T036 (services) block T037-T045 (endpoints)
- T037-T045 (endpoints) block T046-T065 (frontend components)
- T046-T065 (frontend components) block T066-T084 (integration)
- T066-T084 (integration) block T085-T104 (polish)
- T001 (project structure) blocks all other tasks
- T002-T003 (project initialization) blocks T004-T007 (configuration)

## Parallel Execution Examples
```
# Launch T008-T022 together (Contract and Integration Tests):
Task: "Contract test POST /api/v1/upload in backend/tests/contract/test_upload_post.py"
Task: "Contract test GET /api/v1/upload/{file_id}/status in backend/tests/contract/test_upload_status.py"
Task: "Contract test POST /api/v1/analysis/{file_id}/start in backend/tests/contract/test_analysis_start.py"
Task: "Contract test GET /api/v1/analysis/{file_id}/status in backend/tests/contract/test_analysis_status.py"
Task: "Contract test GET /api/v1/analysis/{file_id}/results in backend/tests/contract/test_analysis_results.py"
Task: "Contract test GET /api/v1/reports/{report_id} in backend/tests/contract/test_reports_get.py"
Task: "Contract test GET /api/v1/reports/{report_id}/export in backend/tests/contract/test_reports_export.py"
Task: "Integration test complete keyword analysis workflow in backend/tests/integration/test_keyword_analysis.py"
Task: "Integration test file upload and processing in backend/tests/integration/test_file_processing.py"
Task: "Integration test SEO content idea generation in backend/tests/integration/test_content_ideas.py"
Task: "Frontend component test FileUpload in frontend/src/components/__tests__/FileUpload.test.tsx"
Task: "Frontend component test AnalysisResults in frontend/src/components/__tests__/AnalysisResults.test.tsx"
Task: "Frontend component test SEOContentIdeas in frontend/src/components/__tests__/SEOContentIdeas.test.tsx"
Task: "Frontend component test IdeaBurstPage in frontend/src/components/__tests__/IdeaBurstPage.test.tsx"
Task: "Frontend component test SelectionIndicators in frontend/src/components/__tests__/SelectionIndicators.test.tsx"

# Launch T023-T029 together (Model Creation):
Task: "Keyword model in backend/src/models/keyword.py"
Task: "KeywordAnalysisReport model in backend/src/models/analysis_report.py"
Task: "ContentOpportunity model in backend/src/models/content_opportunity.py"
Task: "SEOContentIdea model in backend/src/models/seo_content_idea.py"
Task: "AhrefsExportFile model in backend/src/models/ahrefs_export_file.py"
Task: "IdeaBurstSession model in backend/src/models/idea_burst_session.py"
Task: "SelectionIndicator model in backend/src/models/selection_indicator.py"

# Launch T030-T036 together (Service Layer):
Task: "FileParser service in backend/src/services/file_parser.py"
Task: "KeywordAnalyzer service in backend/src/services/keyword_analyzer.py"
Task: "ReportGenerator service in backend/src/services/report_generator.py"
Task: "ContentIdeaGenerator service in backend/src/services/content_idea_generator.py"
Task: "KeywordClustering utility in backend/src/utils/keyword_clustering.py"
Task: "Scoring utility in backend/src/utils/scoring.py"
Task: "Validation utility in backend/src/utils/validation.py"

# Launch T046-T065 together (Frontend Components):
Task: "FileUpload component in frontend/src/components/FileUpload.tsx"
Task: "AnalysisResults component in frontend/src/components/AnalysisResults.tsx"
Task: "KeywordTable component in frontend/src/components/KeywordTable.tsx"
Task: "SEOContentIdeas component in frontend/src/components/SEOContentIdeas.tsx"
Task: "OptimizationTips component in frontend/src/components/OptimizationTips.tsx"
Task: "IdeaBurstPage component in frontend/src/components/IdeaBurstPage.tsx"
Task: "SelectionIndicators component in frontend/src/components/SelectionIndicators.tsx"
Task: "IdeaCard component in frontend/src/components/IdeaCard.tsx"
Task: "KeywordAnalysis page in frontend/src/pages/KeywordAnalysis.tsx"
Task: "Reports page in frontend/src/pages/Reports.tsx"
Task: "ContentIdeas page in frontend/src/pages/ContentIdeas.tsx"
Task: "IdeaBurst page in frontend/src/pages/IdeaBurst.tsx"
Task: "API service in frontend/src/services/api.ts"
Task: "Analysis service in frontend/src/services/analysis.ts"
Task: "ContentIdeas service in frontend/src/services/contentIdeas.ts"
Task: "IdeaBurst service in frontend/src/services/ideaBurst.ts"
Task: "TypeScript types in frontend/src/types/keyword.ts"
Task: "TypeScript types in frontend/src/types/analysis.ts"
Task: "TypeScript types in frontend/src/types/seoContentIdea.ts"
Task: "TypeScript types in frontend/src/types/ideaBurst.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Focus on TDD approach: tests first, then implementation
- Ensure all contracts have corresponding tests
- Ensure all entities have model tasks
- All tests come before implementation
- Parallel tasks are truly independent
- Each task specifies exact file path
- No task modifies same file as another [P] task

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
- [x] Enhanced Idea Burst functionality included
- [x] SEO content idea generation covered
- [x] Visual selection indicators included
- [x] Content type differentiation handled
