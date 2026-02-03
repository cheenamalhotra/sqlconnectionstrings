/**
 * Character Escaping Utilities
 *
 * Handles escaping and unescaping of special characters
 * in connection string values for different driver formats.
 */
import { DriverType } from '../translator/types';

/**
 * Characters that need escaping in connection string values
 */
export const SPECIAL_CHARS = [';', '=', '{', '}', '"', "'"];

/**
 * Check if a value contains characters that need escaping
 */
export function needsEscaping(value: string): boolean {
  return SPECIAL_CHARS.some(char => value.includes(char));
}

/**
 * Escape a value for a specific driver format
 */
export function escapeValue(value: string, driver: DriverType): string {
  if (!needsEscaping(value)) {
    return value;
  }

  switch (driver) {
    case 'sqlclient':
    case 'oledb':
    case 'php':
    case 'python':
      // Use double quotes, escape internal quotes by doubling
      return `"${value.replace(/"/g, '""')}"`;

    case 'odbc':
    case 'jdbc':
      // Use braces, escape internal braces by doubling
      return `{${value.replace(/}/g, '}}')}}`;

    case 'rust':
      // Rust uses standard string escaping
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

    default:
      return `"${value.replace(/"/g, '""')}"`;
  }
}

/**
 * Unescape a quoted/braced value
 */
export function unescapeValue(value: string): string {
  if (!value) return value;

  const trimmed = value.trim();

  // Double-quoted value
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/""/g, '"');
  }

  // Single-quoted value
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/''/g, "'");
  }

  // Braced value
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1);
    return inner.replace(/}}/g, '}');
  }

  return value;
}

/**
 * Check if a value is quoted or braced
 */
export function isQuotedOrBraced(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  );
}

/**
 * Remove quotes or braces from a value
 */
export function stripQuotes(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('{') && trimmed.endsWith('}'))
  ) {
    return trimmed.slice(1, -1);
  }

  return value;
}

/**
 * Escape a value for use in JDBC URL
 */
export function escapeForJdbc(value: string): string {
  if (!needsEscaping(value)) {
    return value;
  }
  // JDBC uses braces with }} for literal }
  return `{${value.replace(/}/g, '}}')}}`;
}

/**
 * Escape a value for use in Rust struct
 */
export function escapeForRust(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}
