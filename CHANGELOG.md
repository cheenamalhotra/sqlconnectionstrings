# Change Log

All notable changes to the "sql-connection-string-translator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-02-04

> 📖 [Full Release Notes](release-notes/v0.0.1.md)

### Added
- Initial release of SQL Server Connection String Translator
- Translate between 7 SQL Server driver formats:
  - **SqlClient** (.NET / C#)
  - **ODBC** (Open Database Connectivity)
  - **OLEDB** (Object Linking and Embedding)
  - **JDBC** (Java Database Connectivity)
  - **PHP** (sqlsrv extension)
  - **Python** (mssql / pyodbc)
  - **Rust** (mssql-tds / tiberius)
- Auto-detection of input connection string format with confidence scoring
- 128+ keyword mappings across all drivers
- Comprehensive synonym support (e.g., `Data Source` = `Server`, `UID` = `User ID`)
- Syntax validation with detailed error messages
- **OLEDB Provider keyword auto-injection** - Automatically adds `Provider=MSOLEDBSQL;` when translating to OLEDB format
- External CSS stylesheet for improved maintainability and performance
- Webview UI featuring:
  - Source driver selection (auto-detect or manual)
  - Target driver selection
  - Translate to single format
  - Translate to all formats at once
  - Copy buttons for each translation result
  - Warning and error display
  - Real-time detection badges
  - Responsive grid layout for multi-format results
- Commands:
  - `Connection String: Open Translator` - Opens the translator panel
  - `Connection String: Translate Selection` - Translates selected text
  - `Connection String: Translate from Clipboard` - Translates clipboard content
  - `Connection String: Quick Translate to...` - Quick translate with format picker
- Context menu integration for selected text
- Keyboard shortcuts:
  - `Ctrl+Shift+C Ctrl+Shift+T` / `Cmd+Shift+C Cmd+Shift+T` - Open translator
  - `Ctrl+Enter` / `Cmd+Enter` - Translate
  - `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` - Translate to all formats
- History sidebar showing recent translations

### Fixed
- OLEDB connection strings now properly include mandatory `Provider` keyword as first parameter
- Content Security Policy updated to allow external stylesheets (no more `unsafe-inline`)
- Reduced bundle size (extension.js: 91.6 KB)

### Removed
- Validate-only button (simplified UI to focus on translation workflow)

### Known Issues
- Rust output generates struct initialization code, not a traditional connection string
- Python driver has restricted allowlist; some keywords generate warnings
- Some advanced driver-specific keywords may not map to all target drivers
- No remote repository configured yet (local commits only)

### Technical Details
- **Extension Size:** 94.46 KB (91 files)
- **Technologies:** TypeScript, Webpack, VS Code Extension API
- **CSS Framework:** External stylesheet with VS Code theme integration
- **Keyword Matrix:** 362-line comprehensive mapping document
