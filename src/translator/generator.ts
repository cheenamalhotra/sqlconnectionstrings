/**
 * Connection String Generator
 *
 * Generates connection strings for all 7 target driver formats.
 * Handles proper formatting, escaping, and driver-specific requirements.
 *
 * Implements:
 * - FR-002: Generate 7 formats
 * - FR-005: Driver-specific escaping
 */
import { DriverType, TranslationOptions, ParsedConnectionString } from './types';
import { escapeValue, needsEscaping } from '../utils/escaping';
import { MappingResult } from './mapper';
import { getRustFieldPath } from '../drivers/rust';
import { resolveKeyword } from '../data/synonyms';

/**
 * Generate connection string for target driver
 */
export function generate(
  mapped: MappingResult,
  targetDriver: DriverType,
  options?: TranslationOptions,
  parsed?: ParsedConnectionString
): string {
  switch (targetDriver) {
    case 'jdbc':
      return generateJdbc(mapped, parsed, options);
    case 'rust':
      return generateRust(mapped, options);
    default:
      return generateKeyValue(mapped, targetDriver, options);
  }
}

/**
 * Generate standard key=value; format
 */
function generateKeyValue(
  mapped: MappingResult,
  driver: DriverType,
  options?: TranslationOptions
): string {
  const parts: string[] = [];
  let prefix = '';

  // For ODBC, add the Driver specification first if not already present
  if (driver === 'odbc') {
    const hasDriver = mapped.translatedKeywords.some(
      (kw) => kw.targetKeyword.toLowerCase() === 'driver'
    );
    if (!hasDriver) {
      parts.push('Driver={ODBC Driver 18 for SQL Server}');
    }
  }

  // For PHP, add the sqlsrv: prefix
  if (driver === 'php') {
    prefix = 'sqlsrv:';
  }

  for (const kw of mapped.translatedKeywords) {
    const value = formatValue(kw.targetValue, driver);
    parts.push(`${kw.targetKeyword}=${value}`);
  }

  const separator = options?.formatting === 'readable' ? '; ' : ';';
  return prefix + parts.join(separator) + (parts.length > 0 ? ';' : '');
}

/**
 * Generate JDBC URL format (T053)
 */
function generateJdbc(
  mapped: MappingResult,
  parsed?: ParsedConnectionString,
  options?: TranslationOptions
): string {
  // Extract server info from parsed connection string
  let host = 'localhost';
  let port = 1433;
  let instanceName: string | undefined;

  // Look for server value in the parsed pairs (canonical 'server' key)
  const serverValue = parsed?.pairs.get('server')?.normalized;
  
  if (serverValue) {
    // Parse host\instance or host,port or host:port
    // Note: In JavaScript regex, we need \\\\ to match a single backslash
    const instanceMatch = serverValue.match(/^([^\\]+)\\(.+)$/);
    const portMatch = serverValue.match(/^([^:,\\]+)[,:](\d+)$/);

    if (instanceMatch) {
      host = instanceMatch[1];
      instanceName = instanceMatch[2];
    } else if (portMatch) {
      host = portMatch[1];
      port = parseInt(portMatch[2], 10);
    } else {
      host = serverValue;
    }
  }

  // Build properties (excluding server which goes in URL)
  const props: string[] = [];
  const serverRelatedKeywords = ['server', 'datasource', 'address', 'addr', 'networkaddress'];

  for (const kw of mapped.translatedKeywords) {
    // Skip server-related keywords (they go in URL)
    const canonicalId = resolveKeyword(kw.sourceKeyword);
    if (canonicalId && serverRelatedKeywords.includes(canonicalId)) {
      continue;
    }

    const value = formatValueForJdbc(kw.targetValue);
    props.push(`${kw.targetKeyword}=${value}`);
  }

  // Add instance name as property if present
  if (instanceName) {
    props.unshift(`instanceName=${instanceName}`);
  }

  const separator = options?.formatting === 'readable' ? '; ' : ';';
  const propsStr = props.join(separator);

  return `jdbc:sqlserver://${host}:${port};${propsStr}${propsStr ? ';' : ''}`;
}

/**
 * Generate Rust ClientContext struct
 */
function generateRust(mapped: MappingResult, options?: TranslationOptions): string {
  const fields: Map<string, string> = new Map();

  // Build field values
  for (const kw of mapped.translatedKeywords) {
    const canonicalId = resolveKeyword(kw.sourceKeyword);
    if (!canonicalId) continue;

    const rustPath = getRustFieldPath(canonicalId);

    if (rustPath) {
      fields.set(rustPath, formatRustValue(kw.targetValue, kw.targetKeyword));
    }
  }

  // Generate struct initialization
  return generateRustStruct(fields, options);
}

/**
 * Generate Rust struct initialization code
 */
function generateRustStruct(fields: Map<string, string>, options?: TranslationOptions): string {
  const indent = options?.formatting === 'readable' ? '    ' : '  ';
  const nestedIndent = options?.formatting === 'readable' ? '        ' : '    ';
  const lines: string[] = ['ClientContext {'];

  // Group by top-level field
  const grouped: Map<string, Map<string, string>> = new Map();
  const simpleFields: Map<string, string> = new Map();

  for (const [path, value] of fields) {
    const parts = path.split('.');
    if (parts.length > 1) {
      const topLevel = parts[0];
      const nested = parts.slice(1).join('.');
      if (!grouped.has(topLevel)) {
        grouped.set(topLevel, new Map());
      }
      grouped.get(topLevel)!.set(nested, value);
    } else {
      simpleFields.set(path, value);
    }
  }

  // Generate simple fields
  for (const [field, value] of simpleFields) {
    lines.push(`${indent}${field}: ${value},`);
  }

  // Generate nested structs
  for (const [topLevel, nestedFields] of grouped) {
    const structName = getStructName(topLevel);
    lines.push(`${indent}${topLevel}: ${structName} {`);
    for (const [field, value] of nestedFields) {
      lines.push(`${nestedIndent}${field}: ${value},`);
    }
    lines.push(`${indent}},`);
  }

  lines.push(`${indent}..Default::default()`);
  lines.push('}');

  return lines.join('\n');
}

/**
 * Get Rust struct name from field name
 */
function getStructName(fieldName: string): string {
  const names: Record<string, string> = {
    transport_context: 'TransportContext::Tcp',
    encryption_options: 'EncryptionOptions',
    auth: 'AuthContext',
  };
  return names[fieldName] || 'Unknown';
}

/**
 * Format value for Rust
 */
function formatRustValue(value: string, keyword: string): string {
  // Check if boolean
  const boolValue = parseBooleanValue(value);
  if (boolValue !== undefined) {
    // Check if this is an encryption mode field
    if (keyword.includes('mode')) {
      return getEncryptionEnumValue(value) || (boolValue ? 'true' : 'false');
    }
    return boolValue ? 'true' : 'false';
  }

  // Check if integer
  if (/^\d+$/.test(value)) {
    return value;
  }

  // Check for encryption mode enum
  if (keyword.includes('mode')) {
    const enumValue = getEncryptionEnumValue(value);
    if (enumValue) return enumValue;
  }

  // String value
  return `"${escapeRustString(value)}".to_string()`;
}

/**
 * Get Rust encryption enum value
 */
function getEncryptionEnumValue(value: string): string | null {
  const lower = value.toLowerCase();
  const mapping: Record<string, string> = {
    true: 'EncryptionSetting::On',
    yes: 'EncryptionSetting::On',
    mandatory: 'EncryptionSetting::Required',
    strict: 'EncryptionSetting::Required',
    false: 'EncryptionSetting::Off',
    no: 'EncryptionSetting::Off',
    optional: 'EncryptionSetting::On',
    on: 'EncryptionSetting::On',
    off: 'EncryptionSetting::Off',
    required: 'EncryptionSetting::Required',
  };
  return mapping[lower] || null;
}

/**
 * Escape string for Rust
 */
function escapeRustString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Format value with escaping if needed
 */
function formatValue(value: string, driver: DriverType): string {
  if (needsEscaping(value)) {
    return escapeValue(value, driver);
  }
  return value;
}

/**
 * Format value for JDBC (use braces for escaping)
 */
function formatValueForJdbc(value: string): string {
  if (needsEscaping(value)) {
    // JDBC uses braces for escaping, escape internal braces by doubling
    return `{${value.replace(/}/g, '}}')}}`;
  }
  return value;
}

/**
 * Parse boolean-like value
 */
function parseBooleanValue(value: string): boolean | undefined {
  const lower = value.toLowerCase();
  if (['true', 'yes', '1', 'on', 'sspi'].includes(lower)) return true;
  if (['false', 'no', '0', 'off'].includes(lower)) return false;
  return undefined;
}

/**
 * Generate connection string with optional pretty formatting
 */
export function generateFormatted(
  mapped: MappingResult,
  targetDriver: DriverType,
  pretty: boolean = false,
  parsed?: ParsedConnectionString
): string {
  const options: TranslationOptions = {
    formatting: pretty ? 'readable' : 'compact',
  };
  return generate(mapped, targetDriver, options, parsed);
}

/**
 * Generate all 7 driver formats from a single mapping result
 */
export function generateAll(
  mapped: MappingResult,
  options?: TranslationOptions,
  parsed?: ParsedConnectionString
): Map<DriverType, string> {
  const drivers: DriverType[] = ['sqlclient', 'odbc', 'oledb', 'jdbc', 'php', 'python', 'rust'];
  const results = new Map<DriverType, string>();

  for (const driver of drivers) {
    results.set(driver, generate(mapped, driver, options, parsed));
  }

  return results;
}
