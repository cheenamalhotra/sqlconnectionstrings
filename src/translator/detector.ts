/**
 * Driver Format Detector
 *
 * Auto-detects the driver format of a connection string based on
 * syntax patterns and keyword analysis.
 *
 * Implements:
 * - FR-003: Auto-detect input format
 */
import { DriverType, DetectionConfidence } from './types';

export interface DetectionResult {
  driver: DriverType;
  confidence: DetectionConfidence;
  /** Matched pattern description for debugging */
  matchedPattern?: string;
}

/**
 * Detection patterns in priority order (highest confidence first)
 */
const DETECTION_PATTERNS: Array<{
  pattern: RegExp;
  driver: DriverType;
  confidence: DetectionConfidence;
  description: string;
}> = [
  // JDBC - URL prefix is definitive
  {
    pattern: /^jdbc:sqlserver:\/\//i,
    driver: 'jdbc',
    confidence: 'high',
    description: 'JDBC URL prefix',
  },
  // ODBC - Driver= keyword is definitive
  {
    pattern: /\bDriver\s*=\s*\{[^}]*SQL\s*Server[^}]*\}/i,
    driver: 'odbc',
    confidence: 'high',
    description: 'ODBC Driver specification',
  },
  {
    pattern: /\bDriver\s*=\s*\{?ODBC\s*Driver\s*\d+/i,
    driver: 'odbc',
    confidence: 'high',
    description: 'ODBC Driver version',
  },
  {
    pattern: /\bDriver\s*=\s*\{?SQL\s*Server\s*Native\s*Client/i,
    driver: 'odbc',
    confidence: 'high',
    description: 'SQL Server Native Client',
  },
  // OLEDB - Provider= keyword is definitive
  {
    pattern: /\bProvider\s*=\s*MSOLEDBSQL/i,
    driver: 'oledb',
    confidence: 'high',
    description: 'MSOLEDBSQL Provider',
  },
  {
    pattern: /\bProvider\s*=\s*SQLOLEDB/i,
    driver: 'oledb',
    confidence: 'high',
    description: 'SQLOLEDB Provider',
  },
  {
    pattern: /\bProvider\s*=\s*SQLNCLI/i,
    driver: 'oledb',
    confidence: 'high',
    description: 'SQL Native Client Provider',
  },
  // Rust - struct patterns
  {
    pattern: /ClientContext\s*\{/,
    driver: 'rust',
    confidence: 'high',
    description: 'Rust ClientContext struct',
  },
  {
    pattern: /transport_context\s*:/,
    driver: 'rust',
    confidence: 'high',
    description: 'Rust transport_context field',
  },
  // Python - mssql+pyodbc URL
  {
    pattern: /mssql\+pyodbc:\/\//i,
    driver: 'python',
    confidence: 'high',
    description: 'Python mssql+pyodbc URL',
  },
  // SqlClient - specific keywords
  {
    pattern: /\bIntegrated\s*Security\s*=/i,
    driver: 'sqlclient',
    confidence: 'high',
    description: 'SqlClient Integrated Security',
  },
  {
    pattern: /\bTrust\s*Server\s*Certificate\s*=/i,
    driver: 'sqlclient',
    confidence: 'medium',
    description: 'TrustServerCertificate keyword',
  },
  {
    pattern: /\bMultipleActiveResultSets\s*=/i,
    driver: 'sqlclient',
    confidence: 'high',
    description: 'SqlClient MARS keyword',
  },
  {
    pattern: /\bApplication\s*Name\s*=/i,
    driver: 'sqlclient',
    confidence: 'medium',
    description: 'Application Name keyword',
  },
  // PHP - specific keywords
  {
    pattern: /\bLoginTimeout\s*=/i,
    driver: 'php',
    confidence: 'medium',
    description: 'PHP LoginTimeout keyword',
  },
  {
    pattern: /\bConnectionPooling\s*=/i,
    driver: 'php',
    confidence: 'medium',
    description: 'PHP ConnectionPooling keyword',
  },
  // Generic patterns (lower confidence)
  {
    pattern: /\bTrusted_Connection\s*=/i,
    driver: 'odbc',
    confidence: 'medium',
    description: 'ODBC Trusted_Connection',
  },
  {
    pattern: /\bMARS_Connection\s*=/i,
    driver: 'odbc',
    confidence: 'medium',
    description: 'ODBC MARS_Connection',
  },
];

/**
 * Detect the driver format of a connection string
 */
export function detect(input: string): DetectionResult {
  const trimmed = input.trim();

  // Check each pattern in priority order
  for (const { pattern, driver, confidence, description } of DETECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { driver, confidence, matchedPattern: description };
    }
  }

  // Fallback: analyze keywords to determine most likely format
  return analyzeKeywords(trimmed);
}

/**
 * Analyze keywords to determine driver format
 */
function analyzeKeywords(input: string): DetectionResult {
  const lower = input.toLowerCase();

  // Count driver-specific indicators
  const indicators: Record<DriverType, number> = {
    sqlclient: 0,
    odbc: 0,
    oledb: 0,
    jdbc: 0,
    php: 0,
    python: 0,
    rust: 0,
  };

  // SqlClient indicators
  if (/\buser\s*id\s*=/i.test(input)) indicators.sqlclient += 2;
  if (/\bdata\s*source\s*=/i.test(input)) indicators.sqlclient += 1;
  if (/\binitial\s*catalog\s*=/i.test(input)) indicators.sqlclient += 1;
  if (/\bpersist\s*security\s*info\s*=/i.test(input)) indicators.sqlclient += 2;

  // ODBC indicators
  if (/\buid\s*=/i.test(input)) indicators.odbc += 1;
  if (/\bpwd\s*=/i.test(input)) indicators.odbc += 1;
  if (/\bdsn\s*=/i.test(input)) indicators.odbc += 3;

  // OLEDB indicators
  if (/\bole\s*db\s*services\s*=/i.test(input)) indicators.oledb += 3;

  // JDBC indicators
  if (lower.includes('databasename=')) indicators.jdbc += 2;
  if (lower.includes('logintimeout=')) indicators.jdbc += 1;

  // PHP indicators
  if (lower.includes('returnvaluesonnulls=')) indicators.php += 2;
  if (lower.includes('scrollablecursor=')) indicators.php += 2;

  // Python indicators
  if (lower.includes('mssql+pyodbc')) indicators.python += 3;

  // Rust indicators
  if (lower.includes('to_string()')) indicators.rust += 3;

  // Find highest score
  let maxScore = 0;
  let detected: DriverType = 'sqlclient';

  for (const [driver, score] of Object.entries(indicators)) {
    if (score > maxScore) {
      maxScore = score;
      detected = driver as DriverType;
    }
  }

  // Determine confidence
  let confidence: DetectionConfidence = 'low';
  if (maxScore >= 3) confidence = 'medium';
  if (maxScore >= 5) confidence = 'high';

  return {
    driver: detected,
    confidence,
    matchedPattern: maxScore > 0 ? 'Keyword analysis' : 'Default (no patterns matched)',
  };
}

/**
 * Get all detection patterns for a driver
 */
export function getDriverPatterns(driver: DriverType): RegExp[] {
  return DETECTION_PATTERNS.filter((p) => p.driver === driver).map((p) => p.pattern);
}

/**
 * Test if input matches a specific driver format
 */
export function isDriverFormat(input: string, driver: DriverType): boolean {
  const result = detect(input);
  return result.driver === driver && result.confidence !== 'low';
}
