# Tasks: SQL Server Connection String Translator

**Input**: Design documents from `/specs/001-connection-string-translator/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅  
**Tests**: Included (TDD per constitution)  
**Generated**: 2026-01-29

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included for each task

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create VS Code extension project structure and configuration

- [X] T001 Create project structure per plan.md in repository root
- [X] T002 Initialize package.json with VS Code extension manifest, commands, activation events per contracts/extension-api.md
- [X] T003 [P] Create tsconfig.json with ES2022 target, strict mode, bundler moduleResolution
- [X] T004 [P] Create webpack.config.js for extension bundling (entry: src/extension.ts, output: dist/)
- [X] T005 [P] Create .eslintrc.json with TypeScript rules and VS Code extension recommendations
- [X] T006 [P] Create .prettierrc with consistent formatting settings
- [X] T007 [P] Create .vscode/launch.json with Extension Host debug configuration
- [X] T008 [P] Create .vscode/tasks.json with watch and build tasks
- [X] T009 Install dependencies: @types/vscode, typescript, webpack, webpack-cli, ts-loader, eslint, prettier, jest, @vscode/test-electron

---

## Phase 2: Foundational (Core Types & Infrastructure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Types

- [X] T010 Create DriverType and KeywordCategory types in src/translator/types.ts per data-model.md §DriverType
- [X] T011 [P] Create Keyword and DriverKeyword interfaces in src/translator/types.ts per data-model.md §Keyword
- [X] T012 [P] Create ParsedConnectionString, ParsedValue, JdbcUrlComponents interfaces in src/translator/types.ts
- [X] T013 [P] Create ParseError, ParseWarning, error codes in src/translator/types.ts per data-model.md §ParseError
- [X] T014 [P] Create TranslationRequest, TranslationOptions, TranslationResult interfaces in src/translator/types.ts
- [X] T015 [P] Create WebviewMessage, ExtensionMessage types in src/translator/types.ts per data-model.md §WebviewMessage

### Keyword Data (128+ Keywords)

- [X] T016 Create keyword registry structure in src/data/keywords.ts with Keyword[] array
- [X] T017 [P] Add connection keywords (server, database, port, instance) to src/data/keywords.ts per keyword-matrix-summary.md
- [X] T018 [P] Add authentication keywords (user, password, integrated security, authentication) to src/data/keywords.ts
- [X] T019 [P] Add security keywords (encrypt, trustServerCertificate, hostNameInCertificate, columnEncryption) to src/data/keywords.ts
- [X] T020 [P] Add timeout keywords (connectTimeout, commandTimeout) to src/data/keywords.ts
- [X] T021 [P] Add app/network keywords (applicationName, workstationId, packetSize) to src/data/keywords.ts
- [X] T022 [P] Add HADR keywords (multiSubnetFailover, failoverPartner, applicationIntent) to src/data/keywords.ts
- [X] T023 [P] Add pooling keywords (pooling, minPoolSize, maxPoolSize, connectionLifetime) to src/data/keywords.ts
- [X] T024 [P] Add feature keywords (mars, attachDBFilename, language, replication) to src/data/keywords.ts
- [X] T025 [P] Add driver-specific keywords (driver, provider, typeSystemVersion) to src/data/keywords.ts
- [X] T026 Create synonym lookup map in src/data/synonyms.ts from keyword registry
- [X] T027 [P] Create default values map in src/data/defaults.ts per driver

### Driver Configurations

- [X] T028 Create driver interface and registry in src/drivers/index.ts
- [X] T029 [P] Create SqlClient driver config in src/drivers/sqlclient.ts with format patterns, escape rules
- [X] T030 [P] Create ODBC driver config in src/drivers/odbc.ts with Driver= detection pattern
- [X] T031 [P] Create OLEDB driver config in src/drivers/oledb.ts with Provider= detection pattern
- [X] T032 [P] Create JDBC driver config in src/drivers/jdbc.ts with jdbc:sqlserver:// prefix handling
- [X] T033 [P] Create PHP driver config in src/drivers/php.ts
- [X] T034 [P] Create Python driver config in src/drivers/python.ts with blocked keyword allowlist per keyword-matrix-summary.md
- [X] T035 [P] Create Rust driver config in src/drivers/rust.ts with struct field mappings per research.md §Rust

### Extension Entry Point

- [X] T036 Create extension activation function in src/extension.ts with command registration per contracts/extension-api.md
- [X] T037 Create extension deactivation function in src/extension.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Translate SqlClient to JDBC (Priority: P1) 🎯 MVP

**Goal**: Core translation functionality - parse SqlClient, output JDBC format

**Independent Test**: Paste `Server=myserver;Database=mydb;User ID=user;Password=pass` → get valid JDBC URL

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T038 [P] [US1] Unit test for parser basic parsing in test/unit/parser.test.ts
- [X] T039 [P] [US1] Unit test for parser quoted/braced value handling in test/unit/parser.test.ts
- [X] T040 [P] [US1] Unit test for parser whitespace normalization in test/unit/parser.test.ts (FR-019)
- [X] T041 [P] [US1] Unit test for parser nested braces in test/unit/parser.test.ts (FR-017)
- [X] T042 [P] [US1] Unit test for parser best-effort parsing in test/unit/parser.test.ts (FR-018)
- [X] T043 [P] [US1] Unit test for generator SqlClient output in test/unit/generator.test.ts
- [X] T044 [P] [US1] Unit test for generator JDBC URL output in test/unit/generator.test.ts
- [X] T045 [P] [US1] Unit test for mapper keyword translation in test/unit/mapper.test.ts
- [X] T046 [P] [US1] Unit test for mapper keyword order preservation in test/unit/mapper.test.ts (FR-020)
- [X] T047 [P] [US1] Create test fixtures with sample connection strings in test/fixtures/connection-strings.ts

### Implementation for User Story 1

- [X] T048 [US1] Implement character escaping utilities in src/utils/escaping.ts (quote, brace, semicolon escaping)
- [X] T049 [US1] Implement connection string parser in src/translator/parser.ts with tokenizer and state machine per research.md §R2
- [X] T050 [US1] Implement input size validation (32KB limit) in src/translator/parser.ts (FR-021)
- [X] T051 [US1] Implement keyword mapper in src/translator/mapper.ts with synonym resolution
- [X] T052 [US1] Implement output generator in src/translator/generator.ts with driver-specific formatting
- [X] T053 [US1] Implement JDBC URL generator with host:port prefix in src/translator/generator.ts
- [X] T054 [US1] Implement translate() function orchestrating parse→map→generate in src/translator/index.ts
- [X] T055 [US1] Implement clipboard helper in src/utils/clipboard.ts

**Checkpoint**: User Story 1 complete - can translate SqlClient ↔ JDBC

---

## Phase 4: User Story 2 - Auto-Detect Input Driver Format (Priority: P2)

**Goal**: Automatically identify source driver format from syntax patterns

**Independent Test**: Paste JDBC URL → system shows "Detected: JDBC"

### Tests for User Story 2

- [X] T056 [P] [US2] Unit test for detector SqlClient detection in test/unit/detector.test.ts
- [X] T057 [P] [US2] Unit test for detector JDBC URL detection in test/unit/detector.test.ts
- [X] T058 [P] [US2] Unit test for detector ODBC Driver= detection in test/unit/detector.test.ts
- [X] T059 [P] [US2] Unit test for detector OLEDB Provider= detection in test/unit/detector.test.ts
- [X] T060 [P] [US2] Unit test for detector confidence levels in test/unit/detector.test.ts

### Implementation for User Story 2

- [X] T061 [US2] Implement driver format detector in src/translator/detector.ts with pattern matching per research.md §R2
- [X] T062 [US2] Add confidence level calculation (high/medium/low) to detector
- [X] T063 [US2] Integrate detector into parser as first step in src/translator/parser.ts
- [X] T064 [US2] Add PHP, Python, Rust detection patterns to src/translator/detector.ts

**Checkpoint**: User Stories 1 AND 2 complete - can detect format and translate

---

## Phase 5: User Story 3 - Translate to All Formats (Priority: P2)

**Goal**: Show translations to all 7 driver formats simultaneously

**Independent Test**: Paste one connection string → see 7 different outputs

### Tests for User Story 3

- [X] T065 [P] [US3] Unit test for translateAll returning 7 results in test/unit/translator.test.ts
- [X] T066 [P] [US3] Unit test for generator OLEDB output in test/unit/generator.test.ts
- [X] T067 [P] [US3] Unit test for generator PHP output in test/unit/generator.test.ts
- [X] T068 [P] [US3] Unit test for generator Python output with blocked keyword warnings in test/unit/generator.test.ts (FR-022)
- [X] T069 [P] [US3] Unit test for generator Rust struct output in test/unit/generator.test.ts per research.md §Rust

### Implementation for User Story 3

- [X] T070 [US3] Implement translateAll() function in src/translator/index.ts returning TranslationResult[]
- [X] T071 [US3] Add OLEDB output formatting to src/translator/generator.ts
- [X] T072 [US3] Add PHP output formatting to src/translator/generator.ts
- [X] T073 [US3] Add Python output formatting with blocked keyword detection (FR-022) to src/translator/generator.ts
- [X] T074 [US3] Add Rust ClientContext struct generation per research.md §Rust to src/translator/generator.ts
- [X] T075 [US3] Add ODBC output formatting to src/translator/generator.ts

**Checkpoint**: Can translate to all 7 formats simultaneously

---

## Phase 6: User Story 4 - Handle Driver-Specific Keywords (Priority: P3)

**Goal**: Map advanced keywords (MultiSubnetFailover, ApplicationIntent, ColumnEncryption) with warnings for unsupported

**Independent Test**: Translate string with `MultiSubnetFailover=True` → see correct mapping or warning

### Tests for User Story 4

- [X] T076 [P] [US4] Unit test for HADR keyword translation in test/unit/mapper.test.ts
- [X] T077 [P] [US4] Unit test for untranslatable keyword detection in test/unit/mapper.test.ts
- [X] T078 [P] [US4] Unit test for UntranslatableReason codes in test/unit/mapper.test.ts

### Implementation for User Story 4

- [X] T079 [US4] Add HADR/resiliency keywords to mapping logic in src/translator/mapper.ts
- [X] T080 [US4] Implement untranslatable keyword detection in src/translator/mapper.ts with UntranslatableReason
- [X] T081 [US4] Generate translation warnings for unsupported keywords in src/translator/generator.ts
- [X] T082 [US4] Add boolean value normalization (True/true/TRUE/Yes/1) in src/translator/mapper.ts (FR-016)

**Checkpoint**: Advanced keywords handled with proper warnings

---

## Phase 7: User Story 5 - Validate Connection String Syntax (Priority: P3)

**Goal**: Provide clear error messages for malformed input

**Independent Test**: Paste `Server=localhost"` (unmatched quote) → see "Syntax error: Unmatched quote"

### Tests for User Story 5

- [X] T083 [P] [US5] Unit test for validator unmatched quote detection in test/unit/validator.test.ts
- [X] T084 [P] [US5] Unit test for validator unmatched brace detection in test/unit/validator.test.ts
- [X] T085 [P] [US5] Unit test for validator unknown keyword warning in test/unit/validator.test.ts
- [X] T086 [P] [US5] Unit test for validator missing required parameter in test/unit/validator.test.ts

### Implementation for User Story 5

- [X] T087 [US5] Implement syntax validator in src/translator/validator.ts with position tracking
- [X] T088 [US5] Implement unknown keyword detection with warning in src/translator/validator.ts
- [X] T089 [US5] Implement missing required keyword detection in src/translator/validator.ts
- [X] T090 [US5] Integrate validator into parser for comprehensive error reporting in src/translator/parser.ts

**Checkpoint**: All parser/translator functionality complete with validation

---

## Phase 8: VS Code Extension UI

**Purpose**: Wire translation engine to VS Code commands and webview panel

### Command Handlers

- [X] T091 [P] Implement translate command handler in src/commands/translate.ts per contracts/extension-api.md
- [X] T092 [P] Implement translateSelection command handler in src/commands/translateSelection.ts
- [X] T093 [P] Implement translateClipboard command handler in src/commands/translateClipboard.ts
- [X] T094 [P] Implement quickTranslate command handler in src/commands/quickTranslate.ts
- [X] T095 Implement showDriverPicker helper returning DriverType in src/commands/translate.ts

### Webview Panel

- [X] T096 Create TranslatorPanel class in src/webview/panel.ts with singleton pattern per contracts/extension-api.md
- [X] T097 Create webview HTML template in src/webview/index.html per spec.md §UI Mockup
- [X] T098 [P] Create webview styles in src/webview/styles.css with VS Code theme variable integration
- [X] T099 Create webview client script in src/webview/script.ts with postMessage communication
- [X] T100 Implement webview message handler in TranslatorPanel (WebviewMessage → ExtensionMessage)

### Integration Tests

- [X] T101 Integration test for extension activation in test/integration/extension.test.ts
- [X] T102 [P] Integration test for translate command in test/integration/commands.test.ts
- [X] T103 [P] Integration test for webview panel creation in test/integration/webview.test.ts

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T104 [P] Add accessibility attributes (ARIA labels, keyboard navigation) to webview HTML (FR-014)
- [X] T105 [P] Add extension icon in media/icon.png (128x128)
- [X] T106 [P] Create README.md with feature overview, usage, supported drivers
- [X] T107 [P] Create CHANGELOG.md with v0.1.0 initial release notes
- [X] T108 Run all unit tests and verify 100% coverage per constitution
- [X] T109 Run all integration tests with @vscode/test-electron
- [X] T110 Verify extension size <5MB after webpack bundling
- [X] T111 Run quickstart.md validation scenarios manually
- [X] T112 Performance test: verify translation completes in <100ms

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)          → No dependencies
Phase 2 (Foundational)   → Depends on Phase 1
Phase 3-7 (User Stories) → All depend on Phase 2
Phase 8 (VS Code UI)     → Depends on Phases 3-7 (core translation)
Phase 9 (Polish)         → Depends on Phase 8
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (P1) - Core Translation | Phase 2 | Foundational complete |
| US2 (P2) - Auto-Detect | Phase 2 | Foundational complete (parallel with US1) |
| US3 (P2) - Translate All | US1 | US1 complete |
| US4 (P3) - Advanced Keywords | US1 | US1 complete |
| US5 (P3) - Validation | Phase 2 | Foundational complete (parallel with US1) |

### Parallel Opportunities Per Phase

**Phase 1**: T003, T004, T005, T006, T007, T008 (all config files)  
**Phase 2**: T011-T015 (types), T017-T025 (keywords), T029-T035 (drivers)  
**Phase 3**: T038-T047 (all tests), then T048-T054 (implementation with dependencies)  
**Phase 4-7**: Tests can run in parallel within each phase  
**Phase 8**: T091-T094 (commands), T098 (styles)  
**Phase 9**: T104-T107 (all independent polish tasks)

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)

For fastest time-to-value, implement **only Phases 1-3**:
- Setup + Foundational + US1 = **~55 tasks**
- Delivers: Parse any driver → translate to JDBC
- Can be extended incrementally

### Incremental Delivery Order

1. **MVP**: US1 (SqlClient → JDBC translation)
2. **Usability**: US2 (Auto-detect) + US5 (Validation)
3. **Feature Complete**: US3 (All formats) + US4 (Advanced keywords)
4. **Polish**: VS Code UI + Extension packaging

---

## Summary

| Phase | Description | Tasks | Focus |
|-------|-------------|-------|-------|
| 1 | Setup | 9 | Project initialization |
| 2 | Foundational | 28 | Types, keywords (128+), drivers |
| 3 | User Story 1 (P1) | 18 | Core translation (MVP) |
| 4 | User Story 2 (P2) | 9 | Auto-detection |
| 5 | User Story 3 (P2) | 11 | All formats |
| 6 | User Story 4 (P3) | 7 | Advanced keywords |
| 7 | User Story 5 (P3) | 8 | Validation |
| 8 | VS Code UI | 13 | Commands, webview |
| 9 | Polish | 9 | Accessibility, docs, tests |
| **Total** | | **112** | |

**Parallel Opportunities**: 68 tasks marked [P]  
**Independent MVP**: Phases 1-3 (55 tasks)  
**Full Feature Set**: All 9 phases (112 tasks)

---

*Tasks generated from plan.md, spec.md (22 FRs, 5 user stories), data-model.md, contracts/extension-api.md, and research.md. All tasks follow TDD methodology per constitution.*
