# SQL Server Connection String Translator

A VS Code extension that translates SQL Server connection strings between 7 different driver formats.

![VS Code Version](https://img.shields.io/badge/VS%20Code-1.80%2B-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

🔄 **Translate between 7 formats:**

- **SqlClient** (.NET / C#)
- **ODBC** (Open Database Connectivity)
- **OLEDB** (Object Linking and Embedding)
- **JDBC** (Java Database Connectivity)
- **PHP** (sqlsrv extension)
- **Python** (mssql / pyodbc)
- **Rust** (mssql-tds / tiberius)

✨ **Key Features:**

- Auto-detect input format
- Translate to single or all formats at once
- Syntax validation with meaningful error messages
- Warnings for untranslatable keywords
- Copy buttons for easy clipboard access
- Keyboard shortcuts support

## Usage

### Open Translator Panel

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Type "Connection String: Open Translator"
3. Press Enter

### Translate Selected Text

1. Select a connection string in your editor
2. Right-click and choose "Connection String: Translate Selection"
3. Or use Command Palette: "Connection String: Translate Selection"

### Translate from Clipboard

1. Copy a connection string to clipboard
2. Open Command Palette
3. Type "Connection String: Translate from Clipboard"

### Quick Translate

1. Open Command Palette
2. Type "Connection String: Quick Translate to..."
3. Paste your connection string
4. Select target format

## Keyboard Shortcuts

| Shortcut                    | Action                              |
| --------------------------- | ----------------------------------- |
| `Ctrl+Shift+C Ctrl+Shift+T` | Open Translator Panel               |
| `Ctrl+Enter`                | Translate (in panel)                |
| `Ctrl+Shift+Enter`          | Translate to All Formats (in panel) |

## Supported Keywords

The extension supports 128+ keywords across all drivers, including:

### Connection

- Server / Data Source / Address / Host
- Database / Initial Catalog
- Port

### Authentication

- User ID / UID / User
- Password / PWD
- Integrated Security / Trusted_Connection
- Authentication (Azure AD)

### Security

- Encrypt
- TrustServerCertificate
- HostNameInCertificate

### Timeouts

- Connect Timeout / Connection Timeout / Login Timeout
- Command Timeout

### Pooling

- Pooling / Connection Pooling
- Min Pool Size / Max Pool Size
- Connection Lifetime

### High Availability (HADR)

- MultiSubnetFailover
- ApplicationIntent
- FailoverPartner

### Application

- Application Name / App
- Workstation ID

## Warnings and Errors

### Python Driver Warnings

The Python (mssql) driver has a restricted keyword allowlist. Some keywords like `MultiSubnetFailover` are blocked and will generate warnings.

### Untranslatable Keywords

Some keywords are driver-specific and cannot be translated. These will be listed with the reason:

- `NOT_SUPPORTED` - Keyword not available in target driver
- `BLOCKED_ALLOWLIST` - Python driver restriction
- `DEPRECATED` - Keyword is deprecated
- `DRIVER_SPECIFIC` - Only works with source driver

## Examples

### SqlClient to JDBC

**Input (SqlClient):**

```text
Server=myserver.database.windows.net;Database=mydb;User ID=admin;Password=secret;Encrypt=True;
```

**Output (JDBC):**

```text
jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb;user=admin;password=secret;encrypt=true;
```

### ODBC to Python

**Input (ODBC):**

```text
Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=mydb;Trusted_Connection=Yes;
```

**Output (Python):**

```text
Server=localhost;Database=mydb;Trusted_Connection=Yes;
```

### SqlClient to Rust

**Input (SqlClient):**

```text
Server=localhost;Database=mydb;Integrated Security=True;
```

**Output (Rust):**

```rust
ClientContext {
    transport_context: TransportContext::Tcp {
        host: "localhost".to_string(),
    },
    auth: AuthContext::Windows,
    ..Default::default()
}
```

## Requirements

- VS Code 1.80.0 or higher

## Extension Settings

This extension contributes the following settings:

- (Coming soon)

## Known Issues

- Rust output generates struct initialization code, not a connection string format
- Some advanced driver-specific keywords may not have mappings in all target drivers
- Python driver has a restricted allowlist and some keywords will generate warnings

## Release Notes

### 1.0.0

Initial release:

- Translate between 7 SQL Server driver formats
- Auto-detection of input format
- 128+ keywords supported
- Syntax validation with meaningful error messages
- Webview UI with copy functionality
- Context menu integration
- Keyboard shortcuts

## Contributing

Contributions are welcome! Please see the [GitHub repository](https://github.com/your-repo/connection-string-translator).

## License

MIT License
