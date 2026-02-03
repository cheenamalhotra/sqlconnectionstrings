# Implementation Plan: SQL Server Connection String Translator

**Branch**: `001-connection-string-translator` | **Date**: 2026-01-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-connection-string-translator/spec.md`

## Summary

Build a VS Code extension that translates SQL Server connection strings between 7 driver formats (SqlClient, ODBC, OLEDB, JDBC, PHP, Python, Rust/mssql-tds). The extension provides a webview-based UI panel, command palette integration, and editor context menu support. Core translation engine uses a keyword mapping system with 128+ keywords verified from driver source code. All processing is local—no external network calls.

## Technical Context

**Language/Version**: TypeScript 5.x (ES2022 target)  
**Primary Dependencies**: VS Code Extension API (`@types/vscode`), Webpack (bundling)  
**Storage**: N/A (stateless translation, no persistence required)  
**Testing**: Mocha + @vscode/test-electron (extension testing), Jest (unit tests for core logic)  
**Target Platform**: VS Code 1.80+ (all platforms: Windows, macOS, Linux)  
**Project Type**: VS Code Extension (single project structure)  
**Performance Goals**: Translation completes in <100ms for any valid connection string  
**Constraints**: Zero external network calls, <5MB extension size, instant activation  
**Scale/Scope**: 128+ keyword mappings, 7 driver formats, single user local operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Test-First Mindset** | ✅ PASS | Unit tests for parser/translator before implementation. Integration tests for VS Code commands. |
| **II. 100% Code Coverage** | ✅ PASS | Core translation engine fully testable. VS Code API interactions mocked. |
| **III. Reliability** | ✅ PASS | Deterministic translation (same input → same output). Explicit error handling for malformed input. |
| **IV. Stability** | ✅ PASS | Public API minimal (commands). Keyword mappings versioned. |
| **V. Reusability** | ✅ PASS | Translation engine separate from VS Code UI. Can be extracted as npm package later. |
| **VI. Clean Code** | ✅ PASS | TypeScript strict mode. ESLint/Prettier enforced. Small focused functions. |
| **VII. Security by Design** | ✅ PASS | No network calls. No credential storage. Passwords processed but never logged. |

**Constitution Gate**: ✅ PASSED - No violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/001-connection-string-translator/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 getting started guide
├── contracts/           # Phase 1 API contracts
├── tasks.md             # Phase 2 task breakdown
├── checklists/          # Quality checklists
│   └── requirements.md
└── research/            # Driver keyword research
    ├── driver-keyword-mapping.md
    └── keyword-matrix-summary.md
```

### Source Code (repository root)

```text
src/
├── extension.ts              # Extension entry point, command registration
├── translator/               # Core translation engine (VS Code agnostic)
│   ├── parser.ts            # Connection string parser
│   ├── detector.ts          # Driver format auto-detection
│   ├── mapper.ts            # Keyword mapping logic
│   ├── generator.ts         # Output string generator
│   ├── validator.ts         # Syntax validation
│   └── types.ts             # TypeScript interfaces
├── drivers/                  # Driver-specific configurations
│   ├── sqlclient.ts
│   ├── odbc.ts
│   ├── oledb.ts
│   ├── jdbc.ts
│   ├── php.ts
│   ├── python.ts
│   ├── rust.ts
│   └── index.ts             # Driver registry
├── data/                     # Static keyword data
│   ├── keywords.ts          # Keyword definitions
│   ├── synonyms.ts          # Keyword synonym mappings
│   └── defaults.ts          # Default values per driver
├── webview/                  # Webview panel UI
│   ├── panel.ts             # Webview panel controller
│   ├── index.html           # Webview HTML template
│   ├── styles.css           # Webview styles
│   └── script.ts            # Webview client script
├── commands/                 # VS Code command handlers
│   ├── translate.ts         # Main translate command
│   ├── translateSelection.ts
│   ├── translateClipboard.ts
│   └── quickTranslate.ts
└── utils/                    # Shared utilities
    ├── escaping.ts          # Character escaping
    └── clipboard.ts         # Clipboard helpers

test/
├── unit/                     # Jest unit tests
│   ├── parser.test.ts
│   ├── detector.test.ts
│   ├── mapper.test.ts
│   ├── generator.test.ts
│   └── validator.test.ts
├── integration/              # VS Code extension tests
│   └── extension.test.ts
└── fixtures/                 # Test data
    └── connection-strings.ts

media/                        # Extension assets
└── icon.png

.vscode/
├── launch.json              # Debug configurations
└── tasks.json               # Build tasks

package.json                  # Extension manifest
tsconfig.json                # TypeScript config
webpack.config.js            # Bundler config
.eslintrc.json               # Linting config
.prettierrc                  # Formatting config
```

**Structure Decision**: Single VS Code extension project. Core translation engine in `src/translator/` is pure TypeScript with no VS Code dependencies, enabling easy unit testing and potential extraction as npm package. Driver-specific logic isolated in `src/drivers/`. Webview UI separated in `src/webview/`.

## Complexity Tracking

> No constitution violations requiring justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
