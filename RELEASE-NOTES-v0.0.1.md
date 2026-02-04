# Release Notes - SQL Connection String Translator v0.0.1

**Release Date:** February 4, 2026  
**Version:** 0.0.1 (Initial Release)  
**Package Size:** 94.46 KB

---

## 🎉 What's New

We're excited to introduce **SQL Connection String Translator** - a VS Code extension that makes it effortless to translate SQL Server connection strings between 7 different driver formats!

### 🚀 Key Features

#### Multi-Driver Support
Translate connection strings between:
- **SqlClient** (.NET / C#)
- **ODBC** (Open Database Connectivity)
- **OLEDB** (Object Linking and Embedding Database) 
- **JDBC** (Java Database Connectivity)
- **PHP** (sqlsrv extension)
- **Python** (mssql / pyodbc)
- **Rust** (mssql-tds / tiberius)

#### Intelligent Translation Engine
- ✅ **128+ keyword mappings** across all drivers
- ✅ **Auto-detection** with confidence scoring (high/medium/low)
- ✅ **Comprehensive synonym support** (e.g., `Server` = `Data Source`, `UID` = `User ID`)
- ✅ **Syntax validation** with detailed error messages
- ✅ **Smart OLEDB handling** - Automatically injects mandatory `Provider=MSOLEDBSQL;` keyword

#### Modern User Interface
- 🎨 **Intuitive webview panel** with VS Code theme integration
- 📋 **One-click copy** buttons for all translations
- 🔄 **Translate to all formats** simultaneously with grid view
- 🎯 **Real-time detection badges** showing source format confidence
- ⚡ **Keyboard shortcuts** for rapid workflow
- 📜 **History sidebar** to track recent translations

#### Developer Experience
- 🔌 **Context menu integration** - Right-click any selected text
- ⌨️ **Keyboard shortcuts:**
  - `Ctrl+Shift+C Ctrl+Shift+T` / `Cmd+Shift+C Cmd+Shift+T` - Open translator
  - `Ctrl+Enter` / `Cmd+Enter` - Translate
  - `Ctrl+Shift+Enter` / `Cmd+Shift+Enter` - Translate to all
- 📦 **Multiple translation commands** for different workflows
- 🎯 **Clipboard support** - Translate directly from clipboard

---

## 🔧 Technical Highlights

### Architecture
- **Modern TypeScript codebase** with comprehensive type definitions
- **Webpack production builds** for optimized performance (91.6 KB bundle)
- **External CSS stylesheet** for better maintainability and CSP compliance
- **Modular design** - 7 specialized driver modules + core translation engine

### OLEDB Compliance ⚠️
This release includes special handling for OLEDB connection strings:
- **Automatic Provider injection** - `Provider=MSOLEDBSQL;` added when translating TO OLEDB
- **First parameter positioning** - Provider keyword always appears first (OLEDB spec requirement)
- **Documentation** - Comprehensive keyword matrix with OLEDB-specific notes

### Code Quality
- ✅ Comprehensive test coverage (unit + integration tests)
- ✅ ESLint configuration for code consistency
- ✅ Prettier formatting for clean code
- ✅ Detailed specification documents and research materials

---

## 📋 Usage Examples

### Example 1: SqlClient to OLEDB
**Input (SqlClient):**
```
Server=localhost;Database=TestDB;User ID=sa;Password=MyPass123;
```

**Output (OLEDB):**
```
Provider=MSOLEDBSQL;Data Source=localhost;Initial Catalog=TestDB;User ID=sa;Password=MyPass123;
```

### Example 2: ODBC to Python
**Input (ODBC):**
```
Driver={ODBC Driver 18 for SQL Server};Server=tcp:myserver.database.windows.net,1433;Database=mydb;UID=admin;PWD=pass;
```

**Output (Python):**
```python
Config(
    server='tcp:myserver.database.windows.net,1433',
    database='mydb',
    user='admin',
    password='pass',
)
```

### Example 3: Translate to All Formats
Use the "Translate to All Formats" button to see your connection string in all 7 formats simultaneously - perfect for documentation or multi-language projects!

---

## ⚙️ Installation

### From VSIX File
```bash
code --install-extension sql-connection-string-translator-0.0.1.vsix
```

### Manual Installation
1. Download `sql-connection-string-translator-0.0.1.vsix`
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click `...` (More Actions) → `Install from VSIX...`
5. Select the downloaded file
6. Reload VS Code

---

## 🎯 Getting Started

### Quick Start
1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type: `Connection String: Open Translator`
3. Paste your connection string
4. Select target format
5. Click "Translate" or "Translate to All Formats"
6. Copy results with one click!

### Translate Selection
1. Select a connection string in any file
2. Right-click → `Translate Connection String`
3. Choose target format
4. Result appears in translator panel

### Translate from Clipboard
1. Copy a connection string to clipboard
2. Command Palette → `Connection String: Translate from Clipboard`
3. Select target format
4. View translated result

---

## ⚠️ Known Issues

### Rust Output Format
Rust translations generate struct initialization code (Config struct), not traditional connection strings, reflecting how the mssql-tds crate is used in practice.

### Python Allowlist
Python's mssql driver uses a restricted allowlist. Keywords outside this list will generate warnings but the translation will still complete.

### Driver-Specific Keywords
Some advanced keywords (e.g., OLEDB's `Auto Translate`, ODBC's `AnsiNPW`) may not have direct equivalents in all target drivers. These generate informative warnings.

### Repository
This release uses local git only. Remote repository integration coming in future releases.

---

## 🔮 What's Next?

We have exciting plans for future releases:
- 🔌 GitHub/Azure DevOps repository integration
- 🧪 Extended test coverage for edge cases
- 📚 Interactive tutorials and examples
- 🌐 Support for additional drivers (PostgreSQL, MySQL adapters)
- 🔒 Enhanced security keyword handling
- 🎨 Customizable UI themes

---

## 📖 Documentation

Detailed documentation available in the repository:
- **Specification:** `/specs/001-connection-string-translator/spec.md`
- **Keyword Matrix:** `/specs/001-connection-string-translator/research/keyword-matrix-summary.md`
- **Implementation Plan:** `/specs/001-connection-string-translator/plan.md`
- **Quick Start Guide:** `/specs/001-connection-string-translator/quickstart.md`

---

## 🤝 Contributing

This is an initial release. Feedback, bug reports, and feature requests are welcome!

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built with:
- TypeScript + Webpack
- VS Code Extension API
- Microsoft Learn documentation for OLEDB, ODBC, SqlClient specifications
- Community feedback and testing

---

**Thank you for trying SQL Connection String Translator v0.0.1!** 

We hope this tool saves you time and makes working with SQL Server connection strings across different platforms a breeze. 🚀
