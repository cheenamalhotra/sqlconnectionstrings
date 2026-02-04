# Change Log

All notable changes to the "sql-connection-string-translator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-XX-XX

### Added
- Initial release of SQL Server Connection String Translator
- Translate between 7 SQL Server driver formats:
  - **SqlClient** (.NET / C#)
  - **ODBC** (Open Database Connectivity)
  - **OLEDB** (Object Linking and Embedding)
  - **JDBC** (Java Data  base Connectivity)
  - **PHP** (sqlsrv extension)
  - **Python** (mssql / pyodbc)
  - **Rust** (mssql-tds / tiberius)
- Auto-detection of input connection string format
- 128+ keyword mappings across all drivers
- Synonym support (e.g., `Data Source` = `Server`, `UID` = `User ID`)
- Syntax validation with meaningful error messages
- Webview UI featuring:
  - Source driver selection (auto-detect or manual)
  - Target driver selection
  - Translate to single format
  - Translate to all formats at once
  - Copy buttons for each translation result
  - Warning and error display
  - Input validation feedback
- Commands:
  - `Connection String: Open Translator` - Opens the translator panel
  - `Connection String: Translate Selection` - Translates selected text
  - `Connection String: Translate from Clipboard` - Translates clipboard content
  - `Connection String: Quick Translate to...` - Quick translate with format picker
- Context menu integration for selected text
- Keyboard shortcuts:
  - `Ctrl+Shift+C Ctrl+Shift+T` / `Cmd+Shift+C Cmd+Shift+T` - Open translator

### Known Issues
- Rust output generates struct initialization code, not a traditional connection string
- Python driver has restricted allowlist; some keywords generate warnings
- Some advanced driver-specific keywords may not map to all target drivers
