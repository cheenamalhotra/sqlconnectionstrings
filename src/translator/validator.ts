/**
 * Connection String Validator
 *
 * Validates connection string syntax and provides meaningful error messages.
 *
 * Implements:
 * - FR-008: Meaningful error messages
 * - US5: Validate connection string syntax
 */
import {
  ParsedConnectionString,
  ParseError,
  ParseWarning,
  DriverType,
  TranslationWarning,
  TranslationError,
} from './types';
import { getKeywordById } from '../data/keywords';
import { isKnownKeyword } from '../data/synonyms';

export interface ValidationResult {
  isValid: boolean;
  errors: ParseError[];
  warnings: ParseWarning[];
}

/**
 * Validate a parsed connection string
 */
export function validate(parsed: ParsedConnectionString): ValidationResult {
  const errors: ParseError[] = [...parsed.errors];
  const warnings: ParseWarning[] = [...parsed.warnings];

  // Check for required keywords
  validateRequiredKeywords(parsed, errors, warnings);

  // Check for conflicting keywords
  validateConflictingKeywords(parsed, warnings);

  // Check for deprecated keywords
  validateDeprecatedKeywords(parsed, parsed.driver, warnings);

  // Validate value types
  validateValueTypes(parsed, parsed.driver, warnings);

  // Validate unknown keywords
  validateUnknownKeywords(parsed, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate that required keywords are present
 */
function validateRequiredKeywords(
  parsed: ParsedConnectionString,
  _errors: ParseError[],
  warnings: ParseWarning[]
): void {
  // Server/Data Source is always required
  const hasServer =
    parsed.pairs.has('server') ||
    parsed.pairs.has('datasource') ||
    parsed.jdbcUrl?.host;

  if (!hasServer) {
    warnings.push({
      code: 'MISSING_REQUIRED',
      message: 'Missing required parameter: Server/Data Source',
    });
  }

  // Check driver-specific requirements
  switch (parsed.driver) {
    case 'odbc':
      if (!parsed.pairs.has('driver')) {
        warnings.push({
          code: 'MISSING_REQUIRED',
          message: 'ODBC connections typically require a Driver specification',
        });
      }
      break;

    case 'oledb':
      if (!parsed.pairs.has('provider')) {
        warnings.push({
          code: 'MISSING_REQUIRED',
          message: 'OLEDB connections require a Provider specification',
        });
      }
      break;
  }

  // Authentication check
  const hasIntegratedSecurity =
    parsed.pairs.has('integratedsecurity') ||
    parsed.pairs.has('trustedconnection');
  const hasUserId = parsed.pairs.has('userid') || parsed.pairs.has('user');
  const hasPassword = parsed.pairs.has('password') || parsed.pairs.has('pwd');
  const hasAuthentication = parsed.pairs.has('authentication');

  if (!hasIntegratedSecurity && !hasAuthentication && (!hasUserId || !hasPassword)) {
    warnings.push({
      code: 'MISSING_REQUIRED',
      message: 'No authentication specified: use Integrated Security, Authentication, or User ID + Password',
    });
  }
}

/**
 * Check for conflicting keywords
 */
function validateConflictingKeywords(
  parsed: ParsedConnectionString,
  warnings: ParseWarning[]
): void {
  // Integrated Security + User ID conflict
  const hasIntegratedSecurity =
    parsed.pairs.has('integratedsecurity') ||
    parsed.pairs.has('trustedconnection');
  const hasUserId = parsed.pairs.has('userid') || parsed.pairs.has('user');

  if (hasIntegratedSecurity && hasUserId) {
    const intSecValue =
      parsed.pairs.get('integratedsecurity')?.normalized ||
      parsed.pairs.get('trustedconnection')?.normalized ||
      '';

    if (['true', 'yes', 'sspi', '1'].includes(intSecValue.toLowerCase())) {
      warnings.push({
        code: 'CONFLICTING_KEYWORDS',
        message: 'User ID is ignored when Integrated Security is enabled',
        keyword: 'userid',
      });
    }
  }

  // Multiple server specifications
  const serverKeywords = ['server', 'datasource', 'address', 'addr', 'networkaddress'];
  const foundServerKeywords = serverKeywords.filter((k) => parsed.pairs.has(k));

  if (foundServerKeywords.length > 1) {
    warnings.push({
      code: 'CONFLICTING_KEYWORDS',
      message: `Multiple server specifications found: ${foundServerKeywords.join(', ')}. Using first occurrence.`,
      keyword: 'server',
    });
  }

  // Encrypt + TrustServerCertificate
  if (parsed.pairs.has('encrypt') && parsed.pairs.has('trustservercertificate')) {
    const encryptValue = parsed.pairs.get('encrypt')?.normalized.toLowerCase();
    if (encryptValue === 'false' || encryptValue === 'no') {
      warnings.push({
        code: 'CONFLICTING_KEYWORDS',
        message: 'TrustServerCertificate has no effect when Encrypt is disabled',
        keyword: 'trustservercertificate',
      });
    }
  }
}

/**
 * Check for deprecated keywords
 */
function validateDeprecatedKeywords(
  parsed: ParsedConnectionString,
  driver: DriverType,
  warnings: ParseWarning[]
): void {
  for (const [canonicalId, parsedValue] of parsed.pairs) {
    const keyword = getKeywordById(canonicalId);
    if (!keyword) continue;

    const driverConfig = keyword.drivers[driver];
    if (driverConfig?.deprecated) {
      warnings.push({
        code: 'DEPRECATED_KEYWORD',
        message: `Keyword '${keyword.displayName}' is deprecated: ${driverConfig.deprecationMessage || 'Consider using an alternative'}`,
        keyword: canonicalId,
        position: parsedValue.position,
      });
    }
  }
}

/**
 * Validate value types match expected types
 */
function validateValueTypes(
  parsed: ParsedConnectionString,
  driver: DriverType,
  warnings: ParseWarning[]
): void {
  for (const [canonicalId, parsedValue] of parsed.pairs) {
    const keyword = getKeywordById(canonicalId);
    if (!keyword) continue;

    const driverConfig = keyword.drivers[driver];
    if (!driverConfig) continue;

    const value = parsedValue.normalized;

    switch (driverConfig.type) {
      case 'boolean':
        if (!isValidBoolean(value)) {
          warnings.push({
            code: 'UNKNOWN_KEYWORD',
            message: `Invalid boolean value '${value}' for '${keyword.displayName}'. Expected: true/false, yes/no, 1/0`,
            keyword: canonicalId,
            position: parsedValue.position,
          });
        }
        break;

      case 'integer':
        if (!/^\d+$/.test(value)) {
          warnings.push({
            code: 'UNKNOWN_KEYWORD',
            message: `Invalid integer value '${value}' for '${keyword.displayName}'`,
            keyword: canonicalId,
            position: parsedValue.position,
          });
        }
        break;

      case 'enum':
        if (
          driverConfig.enumValues &&
          !driverConfig.enumValues.some((e) => e.toLowerCase() === value.toLowerCase())
        ) {
          warnings.push({
            code: 'UNKNOWN_KEYWORD',
            message: `Invalid value '${value}' for '${keyword.displayName}'. Expected: ${driverConfig.enumValues.join(', ')}`,
            keyword: canonicalId,
            position: parsedValue.position,
          });
        }
        break;
    }
  }
}

/**
 * Check for unknown keywords in parsed connection string
 */
function validateUnknownKeywords(
  parsed: ParsedConnectionString,
  warnings: ParseWarning[]
): void {
  for (const [canonicalId, parsedValue] of parsed.pairs) {
    const keyword = getKeywordById(canonicalId);
    if (!keyword && !isKnownKeyword(canonicalId)) {
      // This is an unknown keyword - check if we already warned about it
      const alreadyWarned = warnings.some(
        (w) => w.code === 'UNKNOWN_KEYWORD' && w.keyword?.toLowerCase() === canonicalId.toLowerCase()
      );
      if (!alreadyWarned) {
        warnings.push({
          code: 'UNKNOWN_KEYWORD',
          message: `Unknown keyword: '${parsedValue.originalKeyword || canonicalId}'`,
          keyword: parsedValue.originalKeyword || canonicalId,
          position: parsedValue.position,
        });
      }
    }
  }
}

/**
 * Check if value is a valid boolean
 */
function isValidBoolean(value: string): boolean {
  const lower = value.toLowerCase();
  return ['true', 'false', 'yes', 'no', '1', '0', 'on', 'off', 'sspi'].includes(lower);
}

/**
 * Validate raw input string (before parsing)
 */
export function validateSyntax(input: string): ValidationResult {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];

  // Check for unmatched quotes
  let inQuote = false;
  let quoteChar = '';
  let quoteStart = -1;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!inQuote && (char === '"' || char === "'")) {
      inQuote = true;
      quoteChar = char;
      quoteStart = i;
    } else if (inQuote && char === quoteChar) {
      // Check for escaped quote
      if (i + 1 < input.length && input[i + 1] === quoteChar) {
        i++; // Skip escaped quote
      } else {
        inQuote = false;
      }
    }
  }

  if (inQuote) {
    errors.push({
      code: 'UNMATCHED_QUOTE',
      message: `Syntax error: Unmatched ${quoteChar === '"' ? 'double' : 'single'} quote at position ${quoteStart}`,
      position: { start: quoteStart, end: input.length },
      suggestion: `Add closing ${quoteChar} character`,
    });
  }

  // Check for unmatched braces
  let braceDepth = 0;
  let braceStart = -1;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === '{') {
      if (braceDepth === 0) braceStart = i;
      braceDepth++;
    } else if (input[i] === '}') {
      // Check for escaped brace
      if (i + 1 < input.length && input[i + 1] === '}') {
        i++; // Skip escaped brace
      } else {
        braceDepth--;
      }
    }
  }

  if (braceDepth > 0) {
    errors.push({
      code: 'UNMATCHED_BRACE',
      message: `Syntax error: Unmatched opening brace at position ${braceStart}`,
      position: { start: braceStart, end: input.length },
      suggestion: 'Add closing } character',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Legacy API - For backward compatibility
// ============================================================================

/**
 * Legacy validation result type
 */
export interface LegacyValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors (fatal) */
  errors: TranslationError[];
  /** Validation warnings (non-fatal) */
  warnings: TranslationWarning[];
}

/**
 * Legacy validate function - for backward compatibility
 * @param parsed - Parsed connection string
 * @param targetDriver - Target driver format (for driver-specific validation)
 * @returns Validation result
 */
export function validateLegacy(
  parsed: ParsedConnectionString,
  targetDriver?: DriverType
): LegacyValidationResult {
  const errors: TranslationError[] = [];
  const warnings: TranslationWarning[] = [];

  // Check for required keywords
  const hasServer = hasKeyword(parsed, ['server', 'data source', 'datasource', 'servername']);

  if (!hasServer) {
    errors.push({
      code: 'REQUIRED_MISSING',
      message: 'Missing required keyword: Server/Data Source',
    });
  }

  // Check for potentially problematic configurations
  const hasUserId = hasKeyword(parsed, ['user id', 'userid', 'uid', 'user']);
  const hasPassword = hasKeyword(parsed, ['password', 'pwd']);
  const hasIntegratedSecurity = hasKeyword(parsed, [
    'integrated security',
    'integratedsecurity',
    'trusted_connection',
  ]);

  // Warn if no authentication method is specified
  if (!hasUserId && !hasIntegratedSecurity) {
    warnings.push({
      code: 'BEHAVIOR_DIFFERS',
      message:
        'No authentication method specified. Consider adding User ID/Password or Integrated Security.',
    });
  }

  // Warn if user ID without password
  if (hasUserId && !hasPassword) {
    warnings.push({
      code: 'BEHAVIOR_DIFFERS',
      message: 'User ID specified without Password',
    });
  }

  // Driver-specific validation
  if (targetDriver) {
    validateForDriver(parsed, targetDriver, warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if parsed connection string has any of the specified keywords
 */
function hasKeyword(parsed: ParsedConnectionString, keywords: string[]): boolean {
  for (const keyword of keywords) {
    const normalized = keyword.toLowerCase().replace(/\s+/g, '');
    for (const key of parsed.pairs.keys()) {
      if (key.toLowerCase().replace(/\s+/g, '') === normalized) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Perform driver-specific validation
 */
function validateForDriver(
  parsed: ParsedConnectionString,
  targetDriver: DriverType,
  warnings: TranslationWarning[]
): void {
  switch (targetDriver) {
    case 'odbc':
      // ODBC requires Driver keyword
      if (!hasKeyword(parsed, ['driver'])) {
        warnings.push({
          code: 'BEHAVIOR_DIFFERS',
          message: 'ODBC connections typically require a Driver keyword',
        });
      }
      break;

    case 'oledb':
      // OLEDB requires Provider keyword
      if (!hasKeyword(parsed, ['provider'])) {
        warnings.push({
          code: 'BEHAVIOR_DIFFERS',
          message: 'OLEDB connections require a Provider keyword',
        });
      }
      break;

    case 'python':
      // Python mssql-python has an allowlist of supported keywords
      warnings.push({
        code: 'BEHAVIOR_DIFFERS',
        message: 'Python mssql-python driver has a limited set of supported keywords',
      });
      break;

    default:
      // No additional validation
      break;
  }
}
