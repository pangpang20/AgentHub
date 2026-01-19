# Tasks: AgentHub Platform

**Input**: Design documents from `/specs/001-agent-hub-platform/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included for all critical functionality following TDD principles.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Shared**: `shared/types/`, `shared/constants/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create monorepo structure with backend/, frontend/, and shared/ directories
- [ ] T002 Initialize Next.js 14 frontend with TypeScript and App Router in frontend/
- [ ] T003 Initialize Node.js backend with Express.js and TypeScript in backend/
- [ ] T004 [P] Configure ESLint and Prettier for both frontend and backend
- [ ] T005 [P] Configure TypeScript strict mode for both projects
- [ ] T006 [P] Setup shared TypeScript types package in shared/
- [ ] T007 Create Docker Compose configuration for PostgreSQL, Redis, and local development
- [ ] T008 Initialize Git repository with .gitignore for node_modules, .env, build artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T009 Setup Prisma ORM with PostgreSQL connection in backend/prisma/
- [ ] T010 Create complete database schema in backend/prisma/schema.prisma (all entities from data-model.md)
- [ ] T011 Generate Prisma client and create initial migration
- [ ] T012 Implement JWT authentication middleware in backend/src/middleware/auth.ts
- [ ] T013 Implement error handling middleware in backend/src/middleware/error.ts
- [ ] T014 Implement logging middleware with structured logging in backend/src/middleware/logging.ts
- [ ] T015 Configure environment variable management with dotenv in backend/src/config/
- [ ] T016 Setup Redis client for caching and sessions in backend/src/config/redis.ts
- [ ] T017 Setup express app with CORS, body parsing, and security middleware in backend/src/app.ts
- [ ] T018 Implement bcrypt password hashing utilities in backend/src/utils/auth.ts
- [ ] T019 Create base API router structure in backend/src/api/

### Frontend Foundation

- [ ] T020 Setup Zustand store for state management in frontend/src/store/
- [ ] T021 Setup React Query for data fetching in frontend/src/lib/api.ts
- [ ] T022 Configure Tailwind CSS with shadcn/ui components in frontend/
- [ ] T023 Create base layout with navigation in frontend/src/app/layout.tsx
- [ ] T024 Setup authentication utilities and token management in frontend/src/lib/auth.ts
- [ ] T025 Create API client with interceptors in frontend/src/lib/api.ts

### Testing Foundation

- [ ] T026 [P] Setup Jest testing framework for backend in backend/
- [ ] T027 [P] Setup Playwright for e2e testing in frontend/
- [ ] T028 [P] Setup Supertest for API testing in backend/tests/
- [ ] T029 [P] Create test database configuration in backend/tests/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Agent Builder (Priority: P1) 🎯 MVP

**Goal**: Enable users to create, edit, and configure AI agents through a visual interface

**Independent Test**: User can create an agent with custom prompt, save it, and see it in their agent list

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T030 [P] [US1] Contract test for POST /agents endpoint in backend/tests/contract/test-agents.ts
- [ ] T031 [P] [US1] Contract test for GET /agents endpoint in backend/tests/contract/test-agents.ts
- [ ] T032 [P] [US1] Contract test for GET /agents/:id endpoint in backend/tests/contract/test-agents.ts
- [ ] T033 [P] [US1] Contract test for PUT /agents/:id endpoint in backend/tests/contract/test-agents.ts
- [ ] T034 [P] [US1] Contract test for DELETE /agents/:id endpoint in backend/tests/contract/test-agents.ts
- [ ] T035 [P] [US1] Integration test for agent creation flow in backend/tests/integration/test-agent-creation.ts
- [ ] T036 [P] [US1] e2e test for agent builder UI in frontend/tests/e2e/test-agent-builder.spec.ts

### Backend Implementation for User Story 1

- [ ] T037 [P] [US1] Create Agent service with CRUD operations in backend/src/services/agents/agentService.ts
- [ ] T038 [P] [US1] Create Agent validation schemas in backend/src/services/agents/validation.ts
- [ ] T039 [US1] Implement POST /agents endpoint in backend/src/api/agents.ts (depends on T037, T038)
- [ ] T040 [US1] Implement GET /agents endpoint with pagination in backend/src/api/agents.ts (depends on T037)
- [ ] T041 [US1] Implement GET /agents/:id endpoint in backend/src/api/agents.ts (depends on T037)
- [ ] T042 [US1] Implement PUT /agents/:id endpoint in backend/src/api/agents.ts (depends on T037, T038)
- [ ] T043 [US1] Implement DELETE /agents/:id endpoint in backend/src/api/agents.ts (depends on T037)
- [ ] T044 [US1] Add error handling and validation for all agent endpoints

### Frontend Implementation for User Story 1

- [ ] T045 [P] [US1] Create AgentBuilder component with form fields in frontend/src/components/agents/AgentBuilder.tsx
- [ ] T046 [P] [US1] Create AgentList component with display in frontend/src/components/agents/AgentList.tsx
- [ ] T047 [P] [US1] Create AgentCard component for individual agents in frontend/src/components/agents/AgentCard.tsx
- [ ] T048 [US1] Create agents page with routing in frontend/src/app/(dashboard)/agents/page.tsx (depends on T045, T046, T047)
- [ ] T049 [US1] Create agent detail page in frontend/src/app/(dashboard)/agents/[id]/page.tsx (depends on T045)
- [ ] T050 [US1] Create agents Zustand store in frontend/src/store/agents.ts
- [ ] T051 [US1] Integrate agent API calls with React Query in frontend/src/lib/api/agents.ts
- [ ] T052 [US1] Add form validation and error handling to AgentBuilder

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Agent Conversation (Priority: P1) 🎯 MVP

**Goal**: Enable users to have real-time conversations with their created agents

**Independent Test**: User can create an agent, open a conversation, send a message, and receive a response

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T053 [P] [US2] Contract test for POST /conversations endpoint in backend/tests/contract/test-conversations.ts
- [ ] T054 [P] [US2] Contract test for GET /conversations endpoint in backend/tests/contract/test-conversations.ts
- [ ] T055 [P] [US2] Contract test for POST /conversations/:id/messages endpoint in backend/tests/contract/test-conversations.ts
- [ ] T056 [P] [US2] Contract test for GET /conversations/:id/messages endpoint in backend/tests/contract/test-conversations.ts
- [ ] T057 [P] [US2] Integration test for conversation flow in backend/tests/integration/test-conversations.ts
- [ ] T058 [P] [US2] WebSocket integration test for message streaming in backend/tests/integration/test-websocket.ts
- [ ] T059 [P] [US2] e2e test for conversation UI in frontend/tests/e2e/test-conversation.spec.ts

### Backend Implementation for User Story 2

- [ ] T060 [P] [US2] Create Conversation service in backend/src/services/conversations/conversationService.ts
- [ ] T061 [P] [US2] Create Message service in backend/src/services/conversations/messageService.ts
- [ ] T062 [P] [US2] Create LLM provider abstraction layer in backend/src/services/llm/llmProvider.ts
- [ ] T063 [P] [US2] Implement OpenAI provider in backend/src/services/llm/openaiProvider.ts
- [ ] T064 [P] [US2] Implement Anthropic provider in backend/src/services/llm/anthropicProvider.ts
- [ ] T065 [US2] Implement POST /conversations endpoint in backend/src/api/conversations.ts (depends on T060)
- [ ] T066 [US2] Implement GET /conversations endpoint in backend/src/api/conversations.ts (depends on T060)
- [ ] T067 [US2] Implement POST /conversations/:id/messages endpoint in backend/src/api/conversations.ts (depends on T060, T061, T062)
- [ ] T068 [US2] Implement GET /conversations/:id/messages endpoint in backend/src/api/conversations.ts (depends on T060, T061)
- [ ] T069 [US2] Setup Socket.io server in backend/src/websockets/server.ts
- [ ] T070 [US2] Implement WebSocket message streaming handler in backend/src/websockets/conversation.ts
- [ ] T071 [US2] Add WebSocket authentication middleware
- [ ] T072 [US2] Implement message streaming with LLM response chunks
- [ ] T073 [US2] Add conversation room management for Socket.io

### Frontend Implementation for User Story 2

- [ ] T074 [P] [US2] Create ChatInterface component in frontend/src/components/conversations/ChatInterface.tsx
- [ ] T075 [P] [US2] Create MessageList component in frontend/src/components/conversations/MessageList.tsx
- [ ] T076 [P] [US2] Create MessageBubble component in frontend/src/components/conversations/MessageBubble.tsx
- [ ] T077 [US2] Create conversations page in frontend/src/app/(dashboard)/conversations/page.tsx (depends on T074, T075, T076)
- [ ] T078 [US2] Create conversation detail page in frontend/src/app/(dashboard)/conversations/[id]/page.tsx (depends on T074, T075, T076)
- [ ] T079 [US2] Create conversations Zustand store in frontend/src/store/conversations.ts
- [ ] T080 [US2] Implement WebSocket client in frontend/src/lib/websocket.ts
- [ ] T081 [US2] Integrate conversation API calls with React Query in frontend/src/lib/api/conversations.ts
- [ ] T082 [US2] Add typing indicators and streaming message display
- [ ] T083 [US2] Add message input and send functionality

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Knowledge Base Integration (Priority: P2)

**Goal**: Enable users to upload documents to agent knowledge bases for RAG

**Independent Test**: User can upload a PDF document and ask the agent questions about its content

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T084 [P] [US3] Contract test for POST /agents/:id/knowledge-base/documents in backend/tests/contract/test-knowledge-base.ts
- [ ] T085 [P] [US3] Contract test for GET /agents/:id/knowledge-base/documents in backend/tests/contract/test-knowledge-base.ts
- [ ] T086 [P] [US3] Integration test for document upload and processing in backend/tests/integration/test-knowledge-base.ts
- [ ] T087 [P] [US3] e2e test for knowledge base UI in frontend/tests/e2e/test-knowledge-base.spec.ts

### Backend Implementation for User Story 3

- [ ] T088 [P] [US3] Create KnowledgeBase service in backend/src/services/knowledge/knowledgeBaseService.ts
- [ ] T089 [P] [US3] Create Document service in backend/src/services/knowledge/documentService.ts
- [ ] T090 [P] [US3] Setup Pinecone client in backend/src/config/pinecone.ts
- [ ] T091 [P] [US3] Implement document processing pipeline in backend/src/services/knowledge/documentProcessor.ts
- [ ] T092 [P] [US3] Implement PDF document loader using LangChain in backend/src/services/knowledge/loaders/pdfLoader.ts
- [ ] T093 [P] [US3] Implement text chunking strategy in backend/src/services/knowledge/chunking/textSplitter.ts
- [ ] T094 [P] [US3] Implement embedding generation with OpenAI in backend/src/services/knowledge/embeddings/embeddingService.ts
- [ ] T095 [US3] Implement POST /agents/:id/knowledge-base/documents endpoint in backend/src/api/knowledge-base.ts (depends on T088, T089, T091)
- [ ] T096 [US3] Implement GET /agents/:id/knowledge-base/documents endpoint in backend/src/api/knowledge-base.ts (depends on T088)
- [ ] T097 [US3] Implement document status updates and error handling
- [ ] T098 [US3] Implement RAG retrieval in LLM service
- [ ] T099 [US3] Add document validation and size limits

### Frontend Implementation for User Story 3

- [ ] T100 [P] [US3] Create DocumentUpload component in frontend/src/components/knowledge/DocumentUpload.tsx
- [ ] T101 [P] [US3] Create DocumentList component in frontend/src/components/knowledge/DocumentList.tsx
- [ ] T102 [P] [US3] Create DocumentCard component in frontend/src/components/knowledge/DocumentCard.tsx
- [ ] T103 [US3] Add knowledge base section to agent detail page in frontend/src/app/(dashboard)/agents/[id]/page.tsx (depends on T100, T101, T102)
- [ ] T104 [US3] Implement file upload with progress tracking
- [ ] T105 [US3] Add document status indicators (pending, processing, completed, failed)
- [ ] T106 [US3] Integrate knowledge base API calls with React Query in frontend/src/lib/api/knowledge-base.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: User Story 4 - Plugin System (Priority: P2)

**Goal**: Enable users to add tools and integrations to agents

**Independent Test**: User can add a web search plugin and ask the agent to search for information

### Tests for User Story 4 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T107 [P] [US4] Contract test for GET /plugins endpoint in backend/tests/contract/test-plugins.ts
- [ ] T108 [P] [US4] Contract test for POST /agents/:id/plugins in backend/tests/contract/test-plugins.ts
- [ ] T109 [P] [US4] Integration test for plugin installation and execution in backend/tests/integration/test-plugins.ts
- [ ] T110 [P] [US4] e2e test for plugin marketplace UI in frontend/tests/e2e/test-plugins.spec.ts

### Backend Implementation for User Story 4

- [ ] T111 [P] [US4] Create Plugin service in backend/src/services/plugins/pluginService.ts
- [ ] T112 [P] [US4] Create plugin manifest validation in backend/src/services/plugins/manifestValidator.ts
- [ ] T113 [P] [US4] Implement plugin sandbox using worker threads in backend/src/services/plugins/pluginSandbox.ts
- [ ] T114 [P] [US4] Implement GET /plugins endpoint in backend/src/api/plugins.ts (depends on T111)
- [ ] T115 [US4] Implement POST /agents/:id/plugins endpoint in backend/src/api/plugins.ts (depends on T111, T112, T113)
- [ ] T116 [US4] Implement plugin execution in LLM service
- [ ] T117 [US4] Add plugin permission system
- [ ] T118 [US4] Implement plugin health monitoring
- [ ] T119 [US4] Create sample plugins (web search, calculator)

### Frontend Implementation for User Story 4

- [ ] T120 [P] [US4] Create PluginMarketplace component in frontend/src/components/plugins/PluginMarketplace.tsx
- [ ] T121 [P] [US4] Create PluginConfig component in frontend/src/components/plugins/PluginConfig.tsx
- [ ] T122 [US4] Create PluginCard component in frontend/src/components/plugins/PluginCard.tsx
- [ ] T123 [US4] Add plugins section to agent builder in frontend/src/components/agents/AgentBuilder.tsx
- [ ] T124 [US4] Integrate plugins API calls with React Query in frontend/src/lib/api/plugins.ts
- [ ] T125 [US4] Add plugin installation UI with configuration forms

---

## Phase 7: User Story 5 - Agent Templates (Priority: P3)

**Goal**: Provide pre-built agent templates for quick setup

**Independent Test**: User can select a template and create an agent from it

### Tests for User Story 5 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T126 [P] [US5] Contract test for GET /templates endpoint in backend/tests/contract/test-templates.ts
- [ ] T127 [P] [US5] e2e test for template selection in frontend/tests/e2e/test-templates.spec.ts

### Backend Implementation for User Story 5

- [ ] T128 [P] [US5] Create Template service in backend/src/services/templates/templateService.ts
- [ ] T129 [US5] Implement GET /templates endpoint in backend/src/api/templates.ts (depends on T128)
- [ ] T130 [US5] Update agent creation to support templateId parameter
- [ ] T131 [US5] Seed default templates into database

### Frontend Implementation for User Story 5

- [ ] T132 [P] [US5] Create TemplateGallery component in frontend/src/components/templates/TemplateGallery.tsx
- [ ] T133 [P] [US5] Create TemplateCard component in frontend/src/components/templates/TemplateCard.tsx
- [ ] T134 [US5] Add template selection to agent creation flow
- [ ] T135 [US5] Integrate templates API calls with React Query in frontend/src/lib/api/templates.ts

---

## Phase 8: User Story 6 - User Management (Priority: P3)

**Goal**: Enable administrators to manage users and permissions

**Independent Test**: Administrator can create users and assign roles

### Tests for User Story 6 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T136 [P] [US6] Contract test for user management endpoints in backend/tests/contract/test-users.ts
- [ ] T137 [P] [US6] Integration test for role-based access control in backend/tests/integration/test-rbac.ts
- [ ] T138 [P] [US6] e2e test for user management UI in frontend/tests/e2e/test-user-management.spec.ts

### Backend Implementation for User Story 6

- [ ] T139 [P] [US6] Create User service with RBAC in backend/src/services/users/userService.ts
- [ ] T140 [P] [US6] Create Role service in backend/src/services/users/roleService.ts
- [ ] T141 [US6] Implement user management endpoints in backend/src/api/users.ts (depends on T139, T140)
- [ ] T142 [US6] Implement role-based access control middleware
- [ ] T143 [US6] Add audit logging for user management actions

### Frontend Implementation for User Story 6

- [ ] T144 [P] [US6] Create UserManagement component in frontend/src/components/admin/UserManagement.tsx
- [ ] T145 [P] [US6] Create RoleManagement component in frontend/src/components/admin/RoleManagement.tsx
- [ ] T146 [US6] Add admin pages for user and role management
- [ ] T147 [US6] Integrate user management API calls with React Query in frontend/src/lib/api/users.ts

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Testing & Quality

- [ ] T148 [P] Run all unit tests and ensure 80%+ coverage
- [ ] T149 [P] Run all integration tests and fix failures
- [ ] T150 [P] Run all e2e tests and fix failures
- [ ] T151 [P] Perform security audit with npm audit
- [ ] T152 [P] Run TypeScript type checking and fix errors
- [ ] T153 [P] Run ESLint and fix warnings

### Performance Optimization

- [ ] T154 [P] Add database indexes for frequently queried fields
- [ ] T155 [P] Implement API response caching with Redis
- [ ] T156 [P] Optimize frontend bundle size with code splitting
- [ ] T157 [P] Add image optimization for avatars and icons
- [ ] T158 [P] Implement connection pooling for database

### Documentation

- [ ] T159 [P] Update API documentation with OpenAPI spec
- [ ] T160 [P] Create component documentation with Storybook
- [ ] T161 [P] Write deployment guide
- [ ] T162 [P] Update README with setup instructions
- [ ] T163 [P] Document environment variables

### Security Hardening

- [ ] T164 [P] Implement rate limiting for API endpoints
- [ ] T165 [P] Add input sanitization for all user inputs
- [ ] T166 [P] Implement CSRF protection
- [ ] T167 [P] Add security headers with helmet.js
- [ ] T168 [P] Implement API key rotation mechanism

### Monitoring & Observability

- [ ] T169 [P] Setup structured logging with correlation IDs
- [ ] T170 [P] Implement metrics collection for agent performance
- [ ] T171 [P] Create analytics dashboard
- [ ] T172 [P] Setup error tracking (Sentry or similar)
- [ ] T173 [P] Implement health check endpoints

### Final Validation

- [ ] T174 Run quickstart.md validation and fix issues
- [ ] T175 Perform end-to-end testing of all user stories
- [ ] T176 Load test with 1000 concurrent users
- [ ] T177 Verify GDPR and SOC2 compliance measures
- [ ] T178 Create production deployment configuration
- [ ] T179 Write rollback procedures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Services before API endpoints
- API endpoints before WebSocket handlers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/Services within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Contract test for POST /agents endpoint in backend/tests/contract/test-agents.ts"
Task: "Contract test for GET /agents endpoint in backend/tests/contract/test-agents.ts"
Task: "Contract test for GET /agents/:id endpoint in backend/tests/contract/test-agents.ts"
Task: "Contract test for PUT /agents/:id endpoint in backend/tests/contract/test-agents.ts"
Task: "Contract test for DELETE /agents/:id endpoint in backend/tests/contract/test-agents.ts"

# Launch all services for User Story 1 together:
Task: "Create Agent service with CRUD operations in backend/src/services/agents/agentService.ts"
Task: "Create Agent validation schemas in backend/src/services/agents/validation.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 - Agent Builder
4. Complete Phase 4: User Story 2 - Agent Conversation
5. **STOP and VALIDATE**: Test both stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Complete Phase 9: Polish → Final production deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Agent Builder)
   - Developer B: User Story 2 (Agent Conversation)
   - Developer C: User Story 3 (Knowledge Base)
3. After P1 stories complete:
   - Developer A: User Story 4 (Plugin System)
   - Developer B: User Story 5 (Agent Templates)
   - Developer C: User Story 6 (User Management)
4. Team collaborates on Phase 9: Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 179
- Estimated timeline: 8-12 weeks (1 developer) or 3-4 weeks (3 developers)
