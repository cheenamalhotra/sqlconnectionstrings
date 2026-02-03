/**
 * Keyword Mapper
 *
 * Maps keywords from source driver format to target driver format.
 * Handles synonym resolution, boolean normalization, and value transformation.
 *
 * Implements:
 * - FR-004: Keyword mapping table
 * - FR-016: Boolean normalization
 * - FR-020: Source keyword order preservation
 * - FR-022: Python blocked keyword warnings
 */
import {
  ParsedConnectionString,
  DriverType,
  TranslationOptions,
  TranslatedKeyword,
  UntranslatableKeyword,
  TranslationWarning,
  UntranslatableReason,
  DriverKeyword,
} from './types';
import { keywords, getKeywordById } from '../data/keywords';
import { resolveKeyword } from '../data/synonyms';
import { normalizeBooleanValue, formatBooleanForDriver, doDefaultsDiffer, getDefaultValue } from '../data/defaults';
import { isPythonBlockedKeyword } from '../drivers/python';

export interface MappingResult {
  translatedKeywords: TranslatedKeyword[];
  untranslatableKeywords: UntranslatableKeyword[];
  warnings: TranslationWarning[];
  /** Ordered list of canonical keyword IDs from source */
  keywordOrder: string[];
  /** Mapped pairs ready for generation (for backward compatibility) */
  mappedPairs: Map<string, string>;
}

/**
 * Map keywords from parsed connection string to target driver
 */
export function mapKeywords(
  parsed: ParsedConnectionString,
  targetDriver: DriverType,
  options?: TranslationOptions
): MappingResult {
  const translatedKeywords: TranslatedKeyword[] = [];
  const untranslatableKeywords: UntranslatableKeyword[] = [];
  const warnings: TranslationWarning[] = [];
  const keywordOrder: string[] = [];
  const mappedPairs = new Map<string, string>();

  // Process each parsed keyword in order
  for (const [canonicalId, parsedValue] of parsed.pairs) {
    keywordOrder.push(canonicalId);

    // Find keyword definition
    const keyword = getKeywordById(canonicalId);

    if (!keyword) {
      // Unknown keyword
      if (options?.preserveUnknown) {
        // Keep as-is with warning
        const sourceKeyword = parsedValue.originalKeyword || canonicalId;
        translatedKeywords.push({
          sourceKeyword,
          sourceValue: parsedValue.normalized,
          targetKeyword: canonicalId,
          targetValue: parsedValue.normalized,
          valueTransformed: false,
        });
        mappedPairs.set(canonicalId, parsedValue.normalized);
        // Note: Unknown keywords preserved as-is don't generate warnings
        // They don't represent functional behavior differences
      } else {
        untranslatableKeywords.push({
          keyword: parsedValue.originalKeyword || canonicalId,
          value: parsedValue.normalized,
          reason: 'UNKNOWN',
        });
      }
      continue;
    }

    // Get target driver config for this keyword
    const targetConfig = keyword.drivers[targetDriver];

    if (!targetConfig || targetConfig.name === null) {
      // Special case: server keyword for JDBC is handled in the URL path, not as a property
      // Don't mark it as untranslatable - the generator will place it in the URL
      if (targetDriver === 'jdbc' && canonicalId === 'server') {
        // Pass through to generator via mappedPairs - it will use this for the URL
        mappedPairs.set('server', parsedValue.normalized);
        continue;
      }

      // Keyword not supported in target driver
      const reason = getUntranslatableReason(keyword, targetDriver, parsed.driver);

      untranslatableKeywords.push({
        keyword: parsedValue.originalKeyword || canonicalId,
        value: parsedValue.normalized,
        reason,
      });

      // Check for Python blocked keywords
      if (targetDriver === 'python' && isPythonBlockedKeyword(canonicalId)) {
        warnings.push({
          code: 'PYTHON_BLOCKED',
          message: `Keyword '${keyword.displayName}' is blocked by Python driver's restricted allowlist`,
          keyword: canonicalId,
        });
      }

      continue;
    }

    // Note: Deprecated keywords are still functional, just not recommended
    // We don't warn about them since they still work

    // Transform value for target driver
    let targetValue = parsedValue.normalized;
    let valueTransformed = false;

    // Handle enum types (e.g., OLEDB Integrated Security = SSPI)
    if (targetConfig.type === 'enum' && targetConfig.enumValues && targetConfig.enumValues.length > 0) {
      // For enum types, check if the source value is a boolean-like value
      // If so, use the first enum value for "true" values
      const boolValue = normalizeBooleanValue(parsedValue.normalized);
      if (boolValue === true) {
        targetValue = targetConfig.enumValues[0]; // Use first enum value (e.g., 'SSPI')
        valueTransformed = true;
      }
    } else if (targetConfig.type === 'boolean') {
      // Normalize boolean values (FR-016)
      const boolValue = normalizeBooleanValue(parsedValue.normalized);
      if (boolValue !== undefined) {
        targetValue = formatBooleanForDriver(boolValue, targetDriver);
        valueTransformed = targetValue.toLowerCase() !== parsedValue.normalized.toLowerCase();
      }
    }

    // Note: Don't warn about default differences for keywords that ARE specified
    // The user has explicitly set the value, so it will override any default

    translatedKeywords.push({
      sourceKeyword: parsedValue.originalKeyword || canonicalId,
      sourceValue: parsedValue.normalized,
      targetKeyword: targetConfig.name,
      targetValue,
      valueTransformed,
    });
    mappedPairs.set(targetConfig.name, targetValue);
  }

  // Apply keyword ordering (FR-020)
  if (options?.keywordOrder === 'alphabetical') {
    translatedKeywords.sort((a, b) => a.targetKeyword.localeCompare(b.targetKeyword));
  } else if (options?.keywordOrder === 'canonical') {
    // Sort by keyword definition order
    const canonicalOrder = keywords.map((k) => k.id);
    translatedKeywords.sort((a, b) => {
      const aCanonical = resolveKeyword(a.sourceKeyword) || a.sourceKeyword;
      const bCanonical = resolveKeyword(b.sourceKeyword) || b.sourceKeyword;
      return canonicalOrder.indexOf(aCanonical) - canonicalOrder.indexOf(bCanonical);
    });
  }
  // Default: preserve source order (already in order)

  // Check for default differences on keywords NOT explicitly specified in source
  // Only warn if the keyword has different defaults and wasn't provided by the user
  const specifiedKeywords = new Set(keywordOrder);
  for (const keyword of keywords) {
    // Skip if keyword was explicitly specified in source connection string
    if (specifiedKeywords.has(keyword.id)) {
      continue;
    }

    // Check if defaults differ for this unspecified keyword
    if (doDefaultsDiffer(keyword.id, parsed.driver, targetDriver)) {
      // Only warn if both drivers support this keyword
      const sourceConfig = keyword.drivers[parsed.driver];
      const targetConfig = keyword.drivers[targetDriver];
      if (sourceConfig?.name !== null && targetConfig?.name !== null) {
        const sourceDefault = getDefaultValue(keyword.id, parsed.driver);
        const targetDefault = getDefaultValue(keyword.id, targetDriver);
        const sourceVal = sourceDefault !== undefined ? String(sourceDefault) : 'undefined';
        const targetVal = targetDefault !== undefined ? String(targetDefault) : 'undefined';
        warnings.push({
          code: 'DEFAULT_DIFFERS',
          message: `'${keyword.displayName}' default differs: ${parsed.driver}=${sourceVal}, ${targetDriver}=${targetVal}`,
          keyword: keyword.id,
        });
      }
    }
  }

  return {
    translatedKeywords,
    untranslatableKeywords,
    warnings,
    keywordOrder,
    mappedPairs,
  };
}

/**
 * Determine why a keyword can't be translated
 */
function getUntranslatableReason(
  keyword: { id: string; drivers: Partial<Record<DriverType, DriverKeyword>> },
  targetDriver: DriverType,
  sourceDriver: DriverType
): UntranslatableReason {
  // Check if Python blocked
  if (targetDriver === 'python' && isPythonBlockedKeyword(keyword.id)) {
    return 'BLOCKED_ALLOWLIST';
  }

  // Check if deprecated
  const targetConfig = keyword.drivers[targetDriver];
  if (targetConfig?.deprecated) {
    return 'DEPRECATED';
  }

  // Check if driver-specific
  const supportedDrivers = Object.entries(keyword.drivers)
    .filter(([_, config]) => config && config.name !== null)
    .map(([driver]) => driver);

  if (supportedDrivers.length === 1 && supportedDrivers[0] === sourceDriver) {
    return 'DRIVER_SPECIFIC';
  }

  return 'NOT_SUPPORTED';
}

/**
 * Get the list of canonical keyword IDs for a target driver
 * (keywords that are supported by the target driver)
 */
export function getSupportedKeywords(driver: DriverType): string[] {
  return keywords
    .filter((k) => {
      const driverConfig = k.drivers[driver];
      return driverConfig && driverConfig.name !== null;
    })
    .map((k) => k.id);
}

/**
 * Check if a keyword is supported by a target driver
 */
export function isKeywordSupported(keywordId: string, driver: DriverType): boolean {
  const keyword = getKeywordById(keywordId);
  if (!keyword) return false;

  const driverConfig = keyword.drivers[driver];
  return driverConfig !== undefined && driverConfig.name !== null;
}

/**
 * Get the target keyword name for a canonical keyword ID
 */
export function getTargetKeywordName(keywordId: string, driver: DriverType): string | null {
  const keyword = getKeywordById(keywordId);
  if (!keyword) return null;

  const driverConfig = keyword.drivers[driver];
  return driverConfig?.name ?? null;
}
