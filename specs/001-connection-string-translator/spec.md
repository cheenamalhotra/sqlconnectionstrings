# Feature Specification: SQL Server Connection String Translator

**Feature Branch**: `001-connection-string-translator`  
**Created**: 2026-01-29  
**Status**: Draft  
**Input**: User description: "Create an application that translates connection strings from one SQL Server driver to another with a modern, user-friendly UI"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Translate SqlClient Connection String to JDBC (Priority: P1)

A developer has an existing .NET application using Microsoft.Data.SqlClient and needs to migrate a microservice to Java. They paste their SqlClient connection string into the translator and select JDBC as the target format. The system parses the input, identifies common keywords (Server, Database, User ID, Password, Encrypt, TrustServerCertificate), and outputs a properly formatted JDBC URL.

**Why this priority**: This is the core functionality - the fundamental value proposition of the application. Without this, the product delivers zero value.

**Independent Test**: Can be fully tested by entering a valid SqlClient connection string and verifying a correct JDBC URL is generated. Delivers immediate value to developers doing cross-platform migrations.

**Acceptance Scenarios**:

1. **Given** a valid SqlClient connection string `Server=myserver.database.windows.net;Database=mydb;User ID=user@myserver;Password=pass123;Encrypt=True;TrustServerCertificate=False`, **When** user selects JDBC as target format, **Then** system outputs `jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb;user=user@myserver;password=pass123;encrypt=true;trustServerCertificate=false;`
2. **Given** a SqlClient connection string with Integrated Security, **When** user selects JDBC as target, **Then** system outputs equivalent `integratedSecurity=true;` JDBC parameter
3. **Given** a valid connection string, **When** translation completes, **Then** user can copy the result to clipboard with one click

---

### User Story 2 - Auto-Detect Input Driver Format (Priority: P2)

A developer pastes a connection string but doesn't know which driver format it uses (inherited from legacy codebase). The system automatically detects the source format based on syntax patterns and keyword analysis, then highlights the detected format for user confirmation.

**Why this priority**: Improves user experience significantly by reducing friction - users don't need to know the source format to use the tool.

**Independent Test**: Paste various connection string formats and verify the system correctly identifies each one. Shows "Detected: JDBC" or similar indicator.

**Acceptance Scenarios**:

1. **Given** a connection string starting with `jdbc:sqlserver://`, **When** pasted into input, **Then** system auto-detects "JDBC" format
2. **Given** a connection string with `Driver={ODBC Driver 18 for SQL Server}`, **When** pasted into input, **Then** system auto-detects "ODBC" format
3. **Given** a connection string with `Provider=MSOLEDBSQL`, **When** pasted into input, **Then** system auto-detects "OLEDB" format
4. **Given** a connection string with `Data Source=` or `Server=` (SqlClient style), **When** pasted into input, **Then** system auto-detects "SqlClient" format

---

### User Story 3 - Translate to Multiple Target Formats Simultaneously (Priority: P2)

A DevOps engineer needs to update connection strings across multiple applications using different technology stacks. They paste one connection string and see translations to ALL supported driver formats at once, allowing them to copy whichever format each target application needs.

**Why this priority**: Significantly improves productivity for users managing polyglot environments - a common enterprise scenario.

**Independent Test**: Paste one connection string and verify all 7 target formats are displayed simultaneously with copy buttons for each.

**Acceptance Scenarios**:

1. **Given** any valid connection string, **When** "Translate to All" option is selected, **Then** system displays translations for SqlClient, ODBC, OLEDB, JDBC, PHP, Python, and Rust (mssql-tds) formats
2. **Given** translations are displayed, **When** user clicks copy button on any format, **Then** that specific translation is copied to clipboard
3. **Given** a keyword doesn't have an equivalent in target driver, **When** translating, **Then** system shows warning and omits unsupported parameter

---

### User Story 4 - Handle Driver-Specific Keywords (Priority: P3)

A developer translates a connection string that contains driver-specific keywords (e.g., `MultiSubnetFailover`, `ApplicationIntent`, `ColumnEncryption`). The system maps these to equivalent keywords in the target driver when available, or clearly indicates when a keyword has no equivalent.

**Why this priority**: Enterprise-grade connection strings often use advanced features. Supporting these makes the tool valuable for real-world production scenarios.

**Independent Test**: Enter a connection string with advanced keywords and verify correct mapping or clear warning when target driver doesn't support them.

**Acceptance Scenarios**:

1. **Given** `MultiSubnetFailover=True` in SqlClient connection string, **When** translating to JDBC, **Then** system outputs `multiSubnetFailover=true;`
2. **Given** `ApplicationIntent=ReadOnly` in source, **When** translating to ODBC, **Then** system outputs equivalent ODBC keyword `ApplicationIntent=ReadOnly`
3. **Given** a keyword with no target equivalent (e.g., OLEDB-specific `Auto Translate` to JDBC), **When** translating, **Then** system displays warning: "Keyword 'Auto Translate' has no equivalent in JDBC and was omitted"

---

### User Story 5 - Validate Connection String Syntax (Priority: P3)

A developer pastes a malformed connection string with missing quotes, unescaped characters, or invalid keyword names. The system provides clear error messages indicating what's wrong and where, helping users fix issues before translation.

**Why this priority**: Improves reliability and user trust. Better error handling prevents confusion when users paste broken connection strings.

**Independent Test**: Paste various malformed connection strings and verify helpful error messages are displayed with suggestions for fixes.

**Acceptance Scenarios**:

1. **Given** a connection string with unmatched quotes, **When** pasted, **Then** system shows error: "Syntax error: Unmatched quote at position X"
2. **Given** a connection string with unknown keyword, **When** parsed, **Then** system shows warning: "Unknown keyword 'XYZ' - this may not translate correctly"
3. **Given** a connection string missing required parameter (no server), **When** parsed, **Then** system shows warning: "Missing required parameter: Server/Data Source"

---

### Edge Cases

- What happens when connection string contains passwords with special characters (`;`, `=`, `{`, `}`)?
- How does system handle connection strings with Azure AD/Entra authentication keywords?
- What happens when user pastes non-connection-string text?
- How are empty values handled (e.g., `Password=;`)?
- How are connection strings with both synonymous keywords handled (e.g., both `Server` and `Data Source`)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse connection strings from 7 supported driver formats: SqlClient, ODBC, OLEDB, JDBC, PHP, Python (pyodbc/mssql-python), Rust (mssql-tds)
- **FR-002**: System MUST generate connection strings in all 7 supported driver formats
- **FR-003**: System MUST auto-detect the input connection string format based on syntax patterns
- **FR-004**: System MUST maintain a mapping table of equivalent keywords across all driver formats
- **FR-005**: System MUST handle special character escaping appropriate to each driver format (e.g., `{}` escaping in JDBC 8.4+, semicolon escaping)
- **FR-006**: System MUST display clear warnings when a source keyword has no equivalent in the target driver
- **FR-007**: System MUST provide one-click copy-to-clipboard functionality for translated connection strings
- **FR-008**: System MUST validate connection string syntax and provide meaningful error messages
- **FR-009**: System MUST support common authentication methods: SQL Authentication, Windows/Integrated Security, Azure AD/Entra ID
- **FR-010**: System MUST preserve all recognized parameters during translation, even if not explicitly supported (with warning)
- **FR-011**: System MUST NOT transmit connection strings to any external server - all processing happens client-side
- **FR-012**: System MUST provide a "Translate to All" mode showing all target formats simultaneously
- **FR-013**: System MUST auto-detect special characters in values and apply driver-appropriate escaping rules during translation
- **FR-014**: System MUST support basic accessibility: keyboard navigation, proper ARIA labels, and visible focus indicators
- **FR-015**: System MUST perform case-insensitive keyword matching when parsing and comparing connection strings (except Rust struct fields)
- **FR-016**: System MUST normalize boolean values case-insensitively (`True`/`true`/`TRUE`/`Yes`/`yes`/`1` → true) and output in target driver's conventional format
- **FR-017**: System MUST handle nested/escaped braces in braced values (e.g., `Password={pass}}word}` where `}}` represents literal `}`)
- **FR-018**: System MUST use best-effort parsing - extract as many valid key-value pairs as possible even when syntax errors are encountered, reporting errors for invalid portions
- **FR-019**: System MUST normalize whitespace around `=` and `;` delimiters (e.g., `Server = localhost ; Database = mydb` → `Server=localhost;Database=mydb`)
- **FR-020**: System MUST preserve source keyword order in translated output (first occurrence wins for duplicates)
- **FR-021**: System MUST support connection strings up to 32KB without degradation; larger strings MAY be rejected with clear error message
- **FR-022**: System MUST warn when translating to Python driver if source contains keywords blocked by Python's restricted allowlist

### Key Entities

- **ConnectionString**: Raw input string, detected format, parsed key-value pairs, validation status
- **Driver**: Name, format pattern, supported keywords, keyword aliases, escape rules
- **Keyword**: Name, data type, driver-specific synonyms, default value, required status
- **TranslationResult**: Target driver, translated string, warnings list, success status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can translate a connection string in under 5 seconds (paste, translate, copy)
- **SC-002**: System correctly translates 95% of standard connection strings without user intervention
- **SC-003**: All 7 driver formats are supported with 128+ keywords mapped (source code verified)
- **SC-004**: System provides helpful feedback for 100% of syntax errors (no silent failures)
- **SC-005**: Application loads and is interactive within 2 seconds on standard hardware
- **SC-006**: Zero data leaves the user's browser - fully client-side operation

## Technical Decisions *(for /speckit.plan)*

### Technology Stack Recommendations

- **Platform**: VS Code Extension
- **Language**: TypeScript (VS Code extension standard)
- **UI**: VS Code Webview Panel for rich UI, Commands for quick access
- **Distribution**: VS Code Marketplace or VSIX file
- **Dependencies**: Minimal - pure TypeScript, no external runtime dependencies

### VS Code Extension Features

- **Commands**:
  - `Connection String: Translate` - Opens translator panel
  - `Connection String: Translate Selection` - Translates selected text in editor
  - `Connection String: Translate from Clipboard` - Translates clipboard content
  - `Connection String: Quick Translate to...` - Quick pick target format

- **UI Components**:
  - Webview Panel for full translator interface
  - Quick Pick for target driver selection
  - Input Box for connection string entry
  - Output Channel for translation results
  - Status Bar item showing detected format

- **Editor Integration**:
  - Context menu: "Translate Connection String"
  - CodeLens on detected connection strings (optional)
  - Hover information for connection string keywords

### UI Mockup Concept (Webview Panel)

```text
+-----------------------------------------------------------------------------+
|  SQL Connection String Translator                          [Light/Dark]    |
+-----------------------------------------------------------------------------+
|                                                                             |
|  INPUT CONNECTION STRING                          [Detected: SqlClient]    |
|  +-----------------------------------------------------------------------+  |
|  | Server=myserver.database.windows.net;Database=mydb;User ID=user;...  |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  TARGET FORMAT: [JDBC v]  [SqlClient] [ODBC] [OLEDB] [PHP] [Python]        |
|                           [Rust]      [All Formats]                         |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=... | [Copy] |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  WARNINGS:                                                                  |
|  - Keyword 'AttachDBFilename' has no equivalent in JDBC                    |
|                                                                             |
|  -------------------------------------------------------------------------  |
|  Supported Drivers: SqlClient - ODBC - OLEDB - JDBC - PHP - Python - Rust  |
|  (Rust uses mssql-tds ClientContext struct format)                          |
+-----------------------------------------------------------------------------+
```

## Clarifications

### Session 2026-01-29

- Q: How should the system handle passwords containing special characters (`;`, `=`, `{`, `}`) that are also used as delimiters? → A: Auto-detect and apply driver-appropriate escaping (e.g., `{pass;word}` for JDBC, `"pass;word"` for SqlClient)
- Q: When the application first loads, what should the default view display? → A: Empty input field with placeholder text explaining what to paste (e.g., "Paste your connection string here...")
- Q: Should the application support keyboard accessibility and screen readers? → A: Basic accessibility: keyboard navigation, proper labels, focus indicators
- Q: Should the system accept single or multiple connection strings per input? → A: Single connection string only (user translates one at a time)
- Q: What platform should this be built for? → A: VS Code extension with commands and webview UI

## Assumptions

- Users have basic familiarity with connection strings and database connectivity concepts
- Connection strings do not need to be validated against actual database servers
- The tool is for syntax translation only, not connection testing
- All supported drivers use semicolon-delimited key=value format (except JDBC URL prefix)
- VS Code 1.80+ is the minimum supported version
- Password and sensitive data handling is the user's responsibility (we process but don't store)
- Keywords are case-insensitive for all drivers (SqlClient, ODBC, OLEDB, JDBC, PHP, Python) except Rust struct fields
- Boolean values are accepted case-insensitively (True/true/TRUE/Yes/yes/1 all mean true)
- Passwords and user-provided values are always case-sensitive and preserved exactly
- Whitespace around delimiters (`=`, `;`) is normalized during parsing (leading/trailing trimmed)
- Rust output generates `ClientContext` struct initialization code with dot notation for nested fields (e.g., `encryption_options.mode` → `encryption_options: EncryptionOptions { mode: ... }`)

## Scope Boundaries

### In Scope

- Translation between 7 SQL Server driver formats
- VS Code extension with webview panel UI
- VS Code commands for quick translation workflows
- Editor context menu integration
- Common and advanced connection string keywords
- Syntax validation and error messaging
- Copy-to-clipboard functionality
- Auto-detection of input format

### Out of Scope

- Connection testing/validation against actual databases
- Support for non-SQL Server databases (MySQL, PostgreSQL, etc.)
- Server-side processing or API
- User accounts, history, or saved translations
- Mobile-native applications (responsive web is sufficient)
- Programmatic API for integration (future consideration)
