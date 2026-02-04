/**
 * Default Values by Driver
 *
 * Provides default values for keywords per driver.
 * Used during translation when a keyword has a different default in the target driver.
 */
import { DriverType } from '../translator/types';
import { keywords } from './keywords';

/** Default values map: keyword ID → value */
export type DefaultsMap = Map<string, string | boolean | number>;

/** Per-driver default values */
export const driverDefaults: Record<DriverType, DefaultsMap> = {
  sqlclient: new Map<string, string | boolean | number>(),
  odbc: new Map<string, string | boolean | number>(),
  oledb: new Map<string, string | boolean | number>(),
  jdbc: new Map<string, string | boolean | number>(),
  php: new Map<string, string | boolean | number>(),
  python: new Map<string, string | boolean | number>(),
  rust: new Map<string, string | boolean | number>(),
};

// Build default value maps from keyword registry
function buildDefaultMaps(): void {
  for (const keyword of keywords) {
    for (const [driverType, driverKeyword] of Object.entries(keyword.drivers)) {
      if (!driverKeyword || driverKeyword.defaultValue === undefined) continue;

      const driver = driverType as DriverType;
      driverDefaults[driver].set(keyword.id, driverKeyword.defaultValue);
    }
  }
}

// Initialize default maps
buildDefaultMaps();

/**
 * Get the default value for a keyword in a specific driver
 * @param keywordId - Canonical keyword ID
 * @param driver - Target driver
 * @returns Default value or undefined if no default
 */
export function getDefaultValue(
  keywordId: string,
  driver: DriverType
): string | boolean | number | undefined {
  return driverDefaults[driver].get(keywordId);
}

/**
 * Check if a value equals the default for a keyword in a driver
 * @param keywordId - Canonical keyword ID
 * @param value - Value to check
 * @param driver - Target driver
 * @returns True if value equals the default
 */
export function isDefaultValue(
  keywordId: string,
  value: string | boolean | number,
  driver: DriverType
): boolean {
  const defaultValue = getDefaultValue(keywordId, driver);
  if (defaultValue === undefined) return false;

  // Handle boolean comparisons
  if (typeof defaultValue === 'boolean') {
    const boolValue = normalizeBooleanValue(value);
    return boolValue === defaultValue;
  }

  // Handle numeric comparisons
  if (typeof defaultValue === 'number') {
    const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
    return numValue === defaultValue;
  }

  // String comparison (case-insensitive)
  return String(value).toLowerCase() === String(defaultValue).toLowerCase();
}

/**
 * Normalize a value to boolean
 * @param value - Value to normalize
 * @returns Boolean value or undefined if not a boolean-like value
 */
export function normalizeBooleanValue(value: string | boolean | number): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;

  const lower = String(value).toLowerCase().trim();

  // True values
  if (['true', 'yes', '1', 'on', 'sspi'].includes(lower)) {
    return true;
  }

  // False values
  if (['false', 'no', '0', 'off'].includes(lower)) {
    return false;
  }

  return undefined;
}

/**
 * Get the boolean format preferred by a driver
 * @param value - Boolean value
 * @param driver - Target driver
 * @returns Formatted boolean string
 */
export function formatBooleanForDriver(value: boolean, driver: DriverType): string {
  switch (driver) {
    case 'sqlclient':
      return value ? 'True' : 'False';
    case 'odbc':
      return value ? 'Yes' : 'No';
    case 'oledb':
      return value ? 'True' : 'False';
    case 'jdbc':
      return value ? 'true' : 'false';
    case 'php':
      return value ? 'true' : 'false';
    case 'python':
      return value ? 'True' : 'False';
    case 'rust':
      return value ? 'true' : 'false';
    default:
      return value ? 'true' : 'false';
  }
}

/**
 * Get all defaults for a driver
 * @param driver - Target driver
 * @returns Map of keyword ID → default value
 */
export function getAllDefaults(driver: DriverType): DefaultsMap {
  return driverDefaults[driver];
}

/**
 * Check if defaults differ between source and target drivers
 * @param keywordId - Canonical keyword ID
 * @param sourceDriver - Source driver
 * @param targetDriver - Target driver
 * @returns True if defaults are functionally different
 */
export function doDefaultsDiffer(
  keywordId: string,
  sourceDriver: DriverType,
  targetDriver: DriverType
): boolean {
  const sourceDefault = getDefaultValue(keywordId, sourceDriver);
  const targetDefault = getDefaultValue(keywordId, targetDriver);

  if (sourceDefault === undefined && targetDefault === undefined) return false;
  
  // Handle case where one is undefined and other is a "not specified" equivalent
  if (sourceDefault === undefined || targetDefault === undefined) {
    // Convert undefined to string for comparison with unspecified values
    const val1 = sourceDefault === undefined ? 'undefined' : String(sourceDefault);
    const val2 = targetDefault === undefined ? 'undefined' : String(targetDefault);
    return !areValuesFunctionallyEqual(val1, val2);
  }

  // Normalize and compare functionally
  return !areValuesFunctionallyEqual(sourceDefault, targetDefault);
}

/**
 * Check if two values are functionally equal (case-insensitive for booleans and common values)
 * @param value1 - First value
 * @param value2 - Second value
 * @returns True if values are functionally equal
 */
function areValuesFunctionallyEqual(
  value1: string | boolean | number,
  value2: string | boolean | number
): boolean {
  // Same value/type
  if (value1 === value2) return true;

  // Both are booleans
  if (typeof value1 === 'boolean' && typeof value2 === 'boolean') {
    return value1 === value2;
  }

  // Both are numbers
  if (typeof value1 === 'number' && typeof value2 === 'number') {
    return value1 === value2;
  }

  // Normalize to strings and compare
  const str1 = String(value1).toLowerCase().trim();
  const str2 = String(value2).toLowerCase().trim();

  // Direct string match (case-insensitive)
  if (str1 === str2) return true;

  // Handle "undefined" and "notspecified" as functionally equivalent
  // (e.g., Attestation Protocol defaults)
  const unspecifiedValues = ['undefined', 'notspecified', 'none', ''];
  if (unspecifiedValues.includes(str1) && unspecifiedValues.includes(str2)) {
    return true;
  }

  // Handle 0 and undefined as functionally equivalent for timeouts
  // (e.g., Command Timeout: 0 means no timeout, same as undefined)
  const zeroEquivValues = ['0', 'undefined', ''];
  if (zeroEquivValues.includes(str1) && zeroEquivValues.includes(str2)) {
    return true;
  }

  // Handle false and undefined as functionally equivalent for opt-in features
  // (e.g., Integrated Security: false means don't use it, same as undefined)
  const falseEquivValues = ['false', 'no', '0', 'off', 'undefined', ''];
  if (falseEquivValues.includes(str1) && falseEquivValues.includes(str2)) {
    return true;
  }

  // Normalize boolean-like values
  const bool1 = normalizeBooleanValue(str1);
  const bool2 = normalizeBooleanValue(str2);

  // If both can be interpreted as booleans, compare the boolean values
  if (bool1 !== undefined && bool2 !== undefined) {
    return bool1 === bool2;
  }

  // For non-boolean values, compare as lowercase strings
  return str1 === str2;
}
