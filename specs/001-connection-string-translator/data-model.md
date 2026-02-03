# Data Model: SQL Server Connection String Translator

**Created**: 2026-01-29  
**Phase**: 1 (Design)  
**Purpose**: Define TypeScript interfaces and data structures for the translation engine

---

## Core Entities

### DriverType

Enumeration of all supported SQL Server driver formats.

```typescript
export type DriverType = 
  | 'sqlclient'   // Microsoft.Data.SqlClient / System.Data.SqlClient
  | 'odbc'        // ODBC Driver for SQL Server
  | 'oledb'       // MSOLEDBSQL / SQLOLEDB
  | 'jdbc'        // mssql-jdbc
  | 'php'         // sqlsrv / PDO_SQLSRV
  | 'python'      // mssql-python / pyodbc
  | 'rust';       // mssql-tds
```

### KeywordCategory

Categorization for organizing keywords in UI and documentation.

```typescript
export type KeywordCategory =
  | 'connection'    // Server, Database, Port, Instance
  | 'auth'          // User ID, Password, Authentication
  | 'security'      // Encrypt, TrustServerCertificate, ColumnEncryption
  | 'timeout'       // Connection Timeout, Command Timeout
  | 'appInfo'       // Application Name, Workstation ID
  | 'hadr'          // MultiSubnetFailover, Failover Partner
  | 'network'       // Packet Size, Keep Alive
  | 'features'      // MARS, Replication
  | 'database'      // AttachDBFilename, Language
  | 'pooling'       // Pooling, Min/Max Pool Size
  | 'resiliency'    // Connect Retry Count/Interval
  | 'driver'        // Driver, Provider, Type System Version
  | 'behavior'      // Various driver-specific behaviors
  | 'keyVault'      // Azure Key Vault settings
  | 'azureAd'       // Azure AD specific
  | 'tracing'       // Trace settings
  | 'other';        // Uncategorized
```

---

## Keyword Mapping Entities

### Keyword

Represents a canonical connection string keyword with driver-specific mappings.

```typescript
export interface Keyword {
  /** Canonical lowercase identifier (e.g., "server", "database") */
  id: string;
  
  /** Display name for UI (e.g., "Server/Host", "Database") */
  displayName: string;
  
  /** Category for grouping */
  category: KeywordCategory;
  
  /** Driver-specific configurations */
  drivers: Partial<Record<DriverType, DriverKeyword>>;
  
  /** Human-readable description */
  description?: string;
}
```

### DriverKeyword

Driver-specific keyword configuration.

```typescript
export interface DriverKeyword {
  /** Primary keyword name for this driver (null if not supported in key-value format) */
  name: string | null;
  
  /** Additional accepted names (aliases/synonyms) */
  synonyms?: string[];
  
  /** Value type for validation */
  type: KeywordValueType;
  
  /** Default value if not specified */
  defaultValue?: string | boolean | number;
  
  /** Whether this keyword is required for valid connection */
  required?: boolean;
  
  /** Whether this keyword is deprecated */
  deprecated?: boolean;
  
  /** Deprecation message if deprecated */
  deprecationMessage?: string;
  
  /** For enum types, list of valid values */
  enumValues?: string[];
  
  /** Special notes for translation (e.g., "In URL path for JDBC") */
  notes?: string;
}

export type KeywordValueType = 
  | 'string'
  | 'boolean'
  | 'integer'
  | 'enum';
```

---

## Parsing Entities

### ParsedConnectionString

Result of parsing a connection string.

```typescript
export interface ParsedConnectionString {
  /** Detected source driver format */
  driver: DriverType;
  
  /** Confidence level of driver detection */
  confidence: DetectionConfidence;
  
  /** Parsed key-value pairs (keys normalized to lowercase) */
  pairs: Map<string, ParsedValue>;
  
  /** Original input string */
  originalInput: string;
  
  /** Parsing errors (fatal issues) */
  errors: ParseError[];
  
  /** Parsing warnings (non-fatal issues) */
  warnings: ParseWarning[];
  
  /** JDBC-specific: extracted URL components */
  jdbcUrl?: JdbcUrlComponents;
}

export type DetectionConfidence = 'high' | 'medium' | 'low' | 'manual';

export interface ParsedValue {
  /** Raw value as provided */
  raw: string;
  
  /** Normalized value (trimmed, unescaped) */
  normalized: string;
  
  /** Position in original string (for error reporting) */
  position: { start: number; end: number };
  
  /** Whether value was quoted or braced */
  wasQuoted: boolean;
}
```

### JdbcUrlComponents

JDBC-specific URL parsing result.

```typescript
export interface JdbcUrlComponents {
  /** Host/server from URL (e.g., "localhost" from jdbc:sqlserver://localhost:1433) */
  host: string;
  
  /** Port from URL (default 1433) */
  port: number;
  
  /** Instance name if specified */
  instanceName?: string;
  
  /** Properties after semicolon */
  properties: Map<string, string>;
}
```

### ParseError / ParseWarning

Error and warning types.

```typescript
export interface ParseError {
  code: ParseErrorCode;
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
}

export type ParseErrorCode =
  | 'UNMATCHED_QUOTE'
  | 'UNMATCHED_BRACE'
  | 'INVALID_SYNTAX'
  | 'EMPTY_INPUT'
  | 'UNRECOGNIZED_FORMAT';

export interface ParseWarning {
  code: ParseWarningCode;
  message: string;
  keyword?: string;
  position?: { start: number; end: number };
}

export type ParseWarningCode =
  | 'UNKNOWN_KEYWORD'
  | 'DUPLICATE_KEYWORD'
  | 'MISSING_REQUIRED'
  | 'DEPRECATED_KEYWORD'
  | 'CONFLICTING_KEYWORDS';
```

---

## Translation Entities

### TranslationRequest

Input to the translation engine.

```typescript
export interface TranslationRequest {
  /** Parsed source connection string */
  source: ParsedConnectionString;
  
  /** Target driver format */
  targetDriver: DriverType;
  
  /** Translation options */
  options?: TranslationOptions;
}

export interface TranslationOptions {
  /** Include keywords with default values in output */
  includeDefaults?: boolean;
  
  /** Preserve unknown keywords with warning (vs. omit) */
  preserveUnknown?: boolean;
  
  /** Use short keyword names where available */
  preferShortNames?: boolean;
  
  /** Output formatting style */
  formatting?: 'compact' | 'readable';
  
  /** Keyword ordering in output (default: 'source') */
  keywordOrder?: 'source' | 'canonical' | 'alphabetical';
}
```

### TranslationResult

Output from the translation engine.

```typescript
export interface TranslationResult {
  /** Whether translation was successful */
  success: boolean;
  
  /** Target driver format */
  targetDriver: DriverType;
  
  /** Translated connection string */
  connectionString: string;
  
  /** Keywords that were successfully translated */
  translatedKeywords: TranslatedKeyword[];
  
  /** Keywords that could not be translated */
  untranslatableKeywords: UntranslatableKeyword[];
  
  /** Translation warnings */
  warnings: TranslationWarning[];
  
  /** Translation errors (if success is false) */
  errors: TranslationError[];
}

export interface TranslatedKeyword {
  /** Source keyword name */
  sourceKeyword: string;
  
  /** Source value */
  sourceValue: string;
  
  /** Target keyword name */
  targetKeyword: string;
  
  /** Target value (may be transformed) */
  targetValue: string;
  
  /** Whether value was transformed (e.g., True → true) */
  valueTransformed: boolean;
}

export interface UntranslatableKeyword {
  /** Source keyword name */
  keyword: string;
  
  /** Source value */
  value: string;
  
  /** Reason for untranslatability */
  reason: UntranslatableReason;
}

export type UntranslatableReason =
  | 'NOT_SUPPORTED'      // Target driver doesn't support this keyword
  | 'DRIVER_SPECIFIC'    // Keyword is specific to source driver only
  | 'UNKNOWN'            // Keyword not recognized
  | 'DEPRECATED'         // Keyword is deprecated in target
  | 'BLOCKED_ALLOWLIST'; // Keyword blocked by target driver's allowlist (Python)

export interface TranslationWarning {
  code: TranslationWarningCode;
  message: string;
  keyword?: string;
}

export type TranslationWarningCode =
  | 'KEYWORD_OMITTED'
  | 'VALUE_NORMALIZED'
  | 'DEFAULT_DIFFERS'
  | 'BEHAVIOR_DIFFERS'
  | 'PYTHON_BLOCKED';    // Keyword in Python restricted allowlist

export interface TranslationError {
  code: TranslationErrorCode;
  message: string;
}

export type TranslationErrorCode =
  | 'PARSE_FAILED'
  | 'REQUIRED_MISSING'
  | 'INVALID_TARGET';
```

---

## VS Code Extension Entities

### WebviewMessage

Messages from webview to extension.

```typescript
export type WebviewMessage =
  | { command: 'translate'; input: string; targetDriver: DriverType }
  | { command: 'translateAll'; input: string }
  | { command: 'copy'; text: string }
  | { command: 'ready' };
```

### ExtensionMessage

Messages from extension to webview.

```typescript
export type ExtensionMessage =
  | { command: 'translationResult'; result: TranslationResult }
  | { command: 'translationError'; error: string }
  | { command: 'allResults'; results: TranslationResult[] }
  | { command: 'copySuccess' }
  | { command: 'copyError'; error: string };
```

### ExtensionState

Extension activation state.

```typescript
export interface ExtensionState {
  /** Last used target driver (for remembering preference) */
  lastTargetDriver?: DriverType;
  
  /** Webview panel instance (if open) */
  panel?: vscode.WebviewPanel;
}
```

---

## Validation Rules

### Keyword Value Validation

| Type | Validation Rule |
|------|-----------------|
| `string` | Any non-empty string; check for special char escaping |
| `boolean` | Must match driver's boolean format (True/Yes/1 etc.) |
| `integer` | Must be valid integer; check min/max if applicable |
| `enum` | Must match one of `enumValues` (case-insensitive) |

### Required Keywords by Driver

| Driver | Required Keywords |
|--------|-------------------|
| All | Server/Data Source (or equivalent) |
| All (non-Windows auth) | User ID + Password OR Authentication method |
| JDBC | Database name (in URL or as property) |
| ODBC | Driver specification |
| OLEDB | Provider specification |

### Conflict Detection

| Conflict | Resolution |
|----------|------------|
| `Integrated Security=True` + `User ID` | Warning: User ID ignored with Windows auth |
| `Encrypt=False` + `TrustServerCertificate` | Info: TrustServerCertificate has no effect |
| Multiple server specifications | Error: Use only one of Server/Data Source/Address |

---

## State Transitions

### ParsedConnectionString States

```text
                     ┌──────────────┐
                     │  Raw Input   │
                     └──────┬───────┘
                            │ parse()
                            ▼
              ┌─────────────────────────┐
              │    Detected Driver      │
              │   (high/medium/low)     │
              └────────────┬────────────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │ Parsed   │   │ Parsed   │   │  Parse   │
     │  (OK)    │   │  (Warns) │   │  Error   │
     └──────────┘   └──────────┘   └──────────┘
```

### TranslationResult States

```text
     ┌──────────────┐
     │ParsedConnStr │
     └──────┬───────┘
            │ translate(targetDriver)
            ▼
     ┌──────────────────────────────────┐
     │          Translation              │
     └──────────────┬───────────────────┘
                    │
     ┌──────────────┼───────────────────┐
     ▼              ▼                   ▼
┌─────────┐  ┌─────────────┐    ┌─────────────┐
│ Success │  │Success+Warn │    │   Failed    │
│ (clean) │  │(some omit)  │    │  (errors)   │
└─────────┘  └─────────────┘    └─────────────┘
```

---

*Data model designed for VS Code extension. All interfaces are TypeScript-first with strict typing.*
