/**
 * SQL Server Connection String Translator - Core Types
 * Based on data-model.md specification
 */

// ============================================================================
// Driver Types (T010)
// ============================================================================

/** Supported SQL Server driver formats */
export type DriverType =
  | 'sqlclient' // Microsoft.Data.SqlClient / System.Data.SqlClient
  | 'odbc' // ODBC Driver for SQL Server
  | 'oledb' // MSOLEDBSQL / SQLOLEDB
  | 'jdbc' // mssql-jdbc
  | 'php' // sqlsrv / PDO_SQLSRV
  | 'python' // mssql-python / pyodbc
  | 'rust'; // mssql-tds

/** Keyword categorization for organizing in UI */
export type KeywordCategory =
  | 'connection' // Server, Database, Port, Instance
  | 'auth' // User ID, Password, Authentication
  | 'security' // Encrypt, TrustServerCertificate, ColumnEncryption
  | 'timeout' // Connection Timeout, Command Timeout
  | 'appInfo' // Application Name, Workstation ID
  | 'hadr' // MultiSubnetFailover, Failover Partner
  | 'network' // Packet Size, Keep Alive
  | 'features' // MARS, Replication
  | 'database' // AttachDBFilename, Language
  | 'pooling' // Pooling, Min/Max Pool Size
  | 'resiliency' // Connect Retry Count/Interval
  | 'driver' // Driver, Provider, Type System Version
  | 'behavior' // Various driver-specific behaviors
  | 'keyVault' // Azure Key Vault settings
  | 'azureAd' // Azure AD specific
  | 'tracing' // Trace settings
  | 'other'; // Uncategorized

// ============================================================================
// Keyword Mapping Types (T011)
// ============================================================================

/** Value types for keyword validation */
export type KeywordValueType = 'string' | 'boolean' | 'integer' | 'enum';

/** Driver-specific keyword configuration */
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

/** Canonical connection string keyword with driver-specific mappings */
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

// ============================================================================
// Parsing Types (T012)
// ============================================================================

/** Parsed value with metadata */
export interface ParsedValue {
  /** Raw value as provided */
  raw: string;
  /** Normalized value (trimmed, unescaped) */
  normalized: string;
  /** Position in original string (for error reporting) */
  position: { start: number; end: number };
  /** Whether value was quoted or braced */
  wasQuoted: boolean;
  /** Original keyword name as it appeared in the input */
  originalKeyword?: string;
}

/** JDBC-specific URL parsing result */
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

/** Detection confidence level for driver format */
export type DetectionConfidence = 'high' | 'medium' | 'low' | 'manual';

/** Result of parsing a connection string */
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

// ============================================================================
// Error Types (T013)
// ============================================================================

/** Parse error codes */
export type ParseErrorCode =
  | 'UNMATCHED_QUOTE'
  | 'UNMATCHED_BRACE'
  | 'INVALID_SYNTAX'
  | 'EMPTY_INPUT'
  | 'UNRECOGNIZED_FORMAT'
  | 'INPUT_TOO_LARGE';

/** Parse error with position */
export interface ParseError {
  code: ParseErrorCode;
  message: string;
  position?: { start: number; end: number };
  suggestion?: string;
}

/** Parse warning codes */
export type ParseWarningCode =
  | 'UNKNOWN_KEYWORD'
  | 'DUPLICATE_KEYWORD'
  | 'MISSING_REQUIRED'
  | 'DEPRECATED_KEYWORD'
  | 'CONFLICTING_KEYWORDS';

/** Parse warning with context */
export interface ParseWarning {
  code: ParseWarningCode;
  message: string;
  keyword?: string;
  position?: { start: number; end: number };
}

// ============================================================================
// Translation Types (T014)
// ============================================================================

/** Translation options */
export interface TranslationOptions {
  /** Include keywords with default values in output */
  includeDefaults?: boolean;
  /** Preserve unknown keywords with warning (vs. omit) */
  preserveUnknown?: boolean;
  /** Use short keyword names where available */
  preferShortNames?: boolean;
  /** Output formatting style */
  formatting?: 'compact' | 'readable';
  /** Keyword ordering in output */
  keywordOrder?: 'source' | 'canonical' | 'alphabetical';
}

/** Translation request input */
export interface TranslationRequest {
  /** Parsed source connection string */
  source: ParsedConnectionString;
  /** Target driver format */
  targetDriver: DriverType;
  /** Translation options */
  options?: TranslationOptions;
}

/** Successfully translated keyword */
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

/** Reason a keyword couldn't be translated */
export type UntranslatableReason =
  | 'NOT_SUPPORTED' // Target driver doesn't support this keyword
  | 'DRIVER_SPECIFIC' // Keyword is specific to source driver only
  | 'UNKNOWN' // Keyword not recognized
  | 'DEPRECATED' // Keyword is deprecated in target
  | 'BLOCKED_ALLOWLIST'; // Keyword blocked by target driver's allowlist (Python)

/** Keyword that couldn't be translated */
export interface UntranslatableKeyword {
  /** Source keyword name */
  keyword: string;
  /** Source value */
  value: string;
  /** Reason for untranslatability */
  reason: UntranslatableReason;
}

/** Translation warning codes */
export type TranslationWarningCode =
  | 'KEYWORD_OMITTED'
  | 'VALUE_NORMALIZED'
  | 'DEFAULT_DIFFERS'
  | 'BEHAVIOR_DIFFERS'
  | 'PYTHON_BLOCKED';

/** Translation warning */
export interface TranslationWarning {
  code: TranslationWarningCode;
  message: string;
  keyword?: string;
}

/** Translation error codes */
export type TranslationErrorCode =
  | 'PARSE_FAILED'
  | 'REQUIRED_MISSING'
  | 'INVALID_TARGET';

/** Translation error */
export interface TranslationError {
  code: TranslationErrorCode;
  message: string;
}

/** Translation result */
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

// ============================================================================
// Webview Message Types (T015)
// ============================================================================

/** Messages from webview to extension */
export type WebviewMessage =
  | { command: 'translate'; input: string; targetDriver: DriverType; sourceDriver?: DriverType }
  | { command: 'translateAll'; input: string; sourceDriver?: DriverType }
  | { command: 'detect'; input: string }
  | { command: 'validate'; input: string }
  | { command: 'copy'; input: string }
  | { command: 'copyWithDriver'; input: string; driver: string }
  | { command: 'ready' };

/** Messages from extension to webview */
export type ExtensionMessage =
  | { command: 'translateResult'; result: TranslationResult }
  | { command: 'translateAllResult'; results: Record<DriverType, TranslationResult> }
  | { command: 'detectResult'; detection: { driver: DriverType | null; confidence: DetectionConfidence } }
  | { command: 'validateResult'; validation: { isValid: boolean; errors: ParseError[]; warnings: ParseWarning[] } }
  | { command: 'error'; message: string }
  | { command: 'copySuccess' }
  | { command: 'copyError'; error: string };

// ============================================================================
// Driver Configuration Types
// ============================================================================

/** Driver configuration for parsing and generating */
export interface DriverConfig {
  /** Driver identifier */
  type: DriverType;
  /** Display name */
  displayName: string;
  /** Regex patterns to detect this driver format */
  detectionPatterns: RegExp[];
  /** Detection confidence when pattern matches */
  detectionConfidence: DetectionConfidence;
  /** Escape rules for special characters */
  escapeRules: EscapeRules;
  /** Format function for output generation */
  formatPrefix?: string;
  /** Whether this driver uses URL format (like JDBC) */
  usesUrlFormat?: boolean;
}

/** Escape rules for a driver */
export interface EscapeRules {
  /** Character to escape values containing delimiters (e.g., { for braces) */
  quoteChar?: string;
  /** Closing quote character if different from opening */
  closeQuoteChar?: string;
  /** How to escape the quote character itself inside values */
  escapeSequence?: string;
  /** Alternative: use double-quoting for values */
  useDoubleQuotes?: boolean;
}

// ============================================================================
// Extension State Types
// ============================================================================

/** Extension activation state */
export interface ExtensionState {
  /** Last used target driver (for remembering preference) */
  lastTargetDriver?: DriverType;
}

/** Quick pick item for driver selection */
export interface DriverPickItem {
  label: string;
  description: string;
  driver: DriverType;
}

// ============================================================================
// Constants
// ============================================================================

/** Maximum connection string size in bytes (32KB per FR-021) */
export const MAX_CONNECTION_STRING_SIZE = 32 * 1024;

/** All supported driver types as array */
export const ALL_DRIVERS: DriverType[] = [
  'sqlclient',
  'odbc',
  'oledb',
  'jdbc',
  'php',
  'python',
  'rust',
];

/** Driver display names */
export const DRIVER_DISPLAY_NAMES: Record<DriverType, string> = {
  sqlclient: 'SqlClient',
  odbc: 'ODBC',
  oledb: 'OLEDB',
  jdbc: 'JDBC',
  php: 'PHP',
  python: 'Python',
  rust: 'Rust (mssql-tds)',
};
