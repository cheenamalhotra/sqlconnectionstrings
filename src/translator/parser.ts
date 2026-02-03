/**
 * Connection String Parser
 *
 * Parses connection strings from all 7 supported driver formats.
 * Uses a state machine approach for handling quoted/braced values.
 *
 * Implements:
 * - FR-001: Parse 7 driver formats
 * - FR-017: Nested/escaped braces
 * - FR-018: Best-effort parsing
 * - FR-019: Whitespace normalization
 * - FR-020: Source keyword order preservation
 * - FR-021: 32KB size limit
 */
import {
  ParsedConnectionString,
  ParsedValue,
  ParseError,
  ParseWarning,
  JdbcUrlComponents,
  MAX_CONNECTION_STRING_SIZE,
} from './types';
import { detect } from './detector';
import { resolveKeyword, isKnownKeyword } from '../data/synonyms';
import { unescapeValue, isQuotedOrBraced } from '../utils/escaping';

/** Parser state for state machine */
type ParserState = 'KEY' | 'VALUE' | 'QUOTED' | 'BRACED' | 'DONE';

/**
 * Parse a connection string into structured format
 */
export function parse(input: string): ParsedConnectionString {
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const pairs = new Map<string, ParsedValue>();

  // FR-021: Check input size
  if (new TextEncoder().encode(input).length > MAX_CONNECTION_STRING_SIZE) {
    errors.push({
      code: 'INPUT_TOO_LARGE',
      message: `Connection string exceeds maximum size of ${MAX_CONNECTION_STRING_SIZE / 1024}KB`,
      suggestion: 'Reduce the connection string length',
    });
    return createEmptyResult(input, errors, warnings);
  }

  // Check for empty input
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    errors.push({
      code: 'EMPTY_INPUT',
      message: 'Connection string is empty',
      suggestion: 'Provide a valid connection string',
    });
    return createEmptyResult(input, errors, warnings);
  }

  // Detect driver format
  const detection = detect(trimmedInput);

  // Parse JDBC URL specially
  let jdbcUrl: JdbcUrlComponents | undefined;
  let propertyString = trimmedInput;

  if (detection.driver === 'jdbc' && trimmedInput.toLowerCase().startsWith('jdbc:sqlserver://')) {
    const jdbcParsed = parseJdbcUrl(trimmedInput);
    jdbcUrl = jdbcParsed.jdbcUrl;
    propertyString = jdbcParsed.propertyString;
    errors.push(...jdbcParsed.errors);
    
    // Add server from JDBC URL to pairs so it can be translated to other formats
    if (jdbcUrl.host) {
      const serverValue = jdbcUrl.port && jdbcUrl.port !== 1433 
        ? `${jdbcUrl.host},${jdbcUrl.port}` 
        : jdbcUrl.host;
      pairs.set('server', {
        raw: serverValue,
        normalized: serverValue,
        position: { start: 17, end: 17 + serverValue.length }, // After "jdbc:sqlserver://"
        wasQuoted: false,
        originalKeyword: 'server',
      });
    }
  }

  // Parse key-value pairs using state machine
  const parseResult = parseKeyValuePairs(propertyString);
  errors.push(...parseResult.errors);

  // Process parsed pairs
  const seenKeys = new Set<string>();

  for (const [rawKey, rawValue, position] of parseResult.pairs) {
    const normalizedKey = normalizeKeyword(rawKey);
    const canonicalId = resolveKeyword(rawKey, detection.driver) ?? normalizedKey;

    // Check for duplicates (FR-020: first occurrence wins)
    if (seenKeys.has(canonicalId)) {
      warnings.push({
        code: 'DUPLICATE_KEYWORD',
        message: `Duplicate keyword '${rawKey}' ignored (first occurrence used)`,
        keyword: rawKey,
        position,
      });
      continue;
    }
    seenKeys.add(canonicalId);

    // Check for unknown keywords
    if (!isKnownKeyword(rawKey, detection.driver)) {
      warnings.push({
        code: 'UNKNOWN_KEYWORD',
        message: `Unknown keyword '${rawKey}' - may not translate correctly`,
        keyword: rawKey,
        position,
      });
    }

    // Store parsed value
    const wasQuoted = isQuotedOrBraced(rawValue);
    const normalized = wasQuoted ? unescapeValue(rawValue) : rawValue.trim();

    pairs.set(canonicalId, {
      raw: rawValue,
      normalized,
      position,
      wasQuoted,
      originalKeyword: rawKey,
    });
  }

  return {
    driver: detection.driver,
    confidence: detection.confidence,
    pairs,
    originalInput: input,
    errors,
    warnings,
    jdbcUrl,
  };
}

/**
 * Parse JDBC URL format
 */
function parseJdbcUrl(input: string): {
  jdbcUrl: JdbcUrlComponents;
  propertyString: string;
  errors: ParseError[];
} {
  const errors: ParseError[] = [];

  // Extract URL prefix: jdbc:sqlserver://host:port
  const urlMatch = input.match(/^jdbc:sqlserver:\/\/([^:;]+)(?::(\d+))?(?:;(.*))?$/i);

  if (!urlMatch) {
    errors.push({
      code: 'INVALID_SYNTAX',
      message: 'Invalid JDBC URL format',
      suggestion: 'Use format: jdbc:sqlserver://host:port;property=value;...',
    });
    return {
      jdbcUrl: { host: '', port: 1433, properties: new Map() },
      propertyString: input,
      errors,
    };
  }

  const host = urlMatch[1];
  const port = urlMatch[2] ? parseInt(urlMatch[2], 10) : 1433;
  const propertyString = urlMatch[3] || '';

  return {
    jdbcUrl: {
      host,
      port,
      properties: new Map(),
    },
    propertyString,
    errors,
  };
}

/**
 * Parse key-value pairs using state machine
 */
function parseKeyValuePairs(input: string): {
  pairs: Array<[string, string, { start: number; end: number }]>;
  errors: ParseError[];
} {
  const pairs: Array<[string, string, { start: number; end: number }]> = [];
  const errors: ParseError[] = [];

  let state: ParserState = 'KEY';
  let currentKey = '';
  let currentValue = '';
  let keyStart = 0;
  let valueStart = 0;
  let quoteChar = '';
  let braceDepth = 0;

  for (let i = 0; i <= input.length; i++) {
    const char = i < input.length ? input[i] : ';'; // Treat end as delimiter
    const isEnd = i >= input.length;

    switch (state) {
      case 'KEY':
        if (char === '=') {
          currentKey = currentKey.trim();
          state = 'VALUE';
          valueStart = i + 1;
        } else if (char === ';') {
          // Empty key-value, skip
          currentKey = '';
        } else {
          if (!currentKey) keyStart = i;
          currentKey += char;
        }
        break;

      case 'VALUE':
        if (char === '"' || char === "'") {
          quoteChar = char;
          currentValue += char;
          state = 'QUOTED';
        } else if (char === '{') {
          braceDepth = 1;
          currentValue += char;
          state = 'BRACED';
        } else if (char === ';' || isEnd) {
          // End of value
          if (currentKey) {
            pairs.push([currentKey, currentValue.trim(), { start: keyStart, end: i }]);
          }
          currentKey = '';
          currentValue = '';
          state = 'KEY';
          keyStart = i + 1;
        } else {
          currentValue += char;
        }
        break;

      case 'QUOTED':
        currentValue += char;
        if (char === quoteChar) {
          // Check for escaped quote (doubled)
          if (i + 1 < input.length && input[i + 1] === quoteChar) {
            currentValue += input[i + 1];
            i++; // Skip next quote
          } else {
            state = 'VALUE';
          }
        }
        // Check for unclosed quote at end
        if (isEnd && state === 'QUOTED') {
          errors.push({
            code: 'UNMATCHED_QUOTE',
            message: `Unclosed quote starting at position ${valueStart}`,
            position: { start: valueStart, end: i },
            suggestion: `Add closing ${quoteChar} character`,
          });
          // Best effort: save what we have
          if (currentKey) {
            pairs.push([currentKey, currentValue, { start: keyStart, end: i }]);
          }
          state = 'DONE';
        }
        break;

      case 'BRACED':
        currentValue += char;
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          // Check for escaped brace (doubled)
          if (i + 1 < input.length && input[i + 1] === '}') {
            currentValue += input[i + 1];
            i++; // Skip next brace
          } else {
            braceDepth--;
            if (braceDepth === 0) {
              state = 'VALUE';
            }
          }
        }
        // Check for unclosed brace at end
        if (isEnd && braceDepth > 0) {
          errors.push({
            code: 'UNMATCHED_BRACE',
            message: `Unclosed brace starting at position ${valueStart}`,
            position: { start: valueStart, end: i },
            suggestion: 'Add closing } character',
          });
          // Best effort: save what we have
          if (currentKey) {
            pairs.push([currentKey, currentValue, { start: keyStart, end: i }]);
          }
          state = 'DONE';
        }
        break;
    }
  }

  return { pairs, errors };
}

/**
 * Normalize a keyword to canonical form
 */
function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase().replace(/\s+/g, '');
}

/**
 * Create an empty result for error cases
 */
function createEmptyResult(
  input: string,
  errors: ParseError[],
  warnings: ParseWarning[]
): ParsedConnectionString {
  return {
    driver: 'sqlclient',
    confidence: 'low',
    pairs: new Map(),
    originalInput: input,
    errors,
    warnings,
  };
}

export { parseJdbcUrl, parseKeyValuePairs, normalizeKeyword };
