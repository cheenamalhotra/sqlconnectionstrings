/**
 * Translation Engine Entry Point
 *
 * Orchestrates parsing, mapping, and generation for connection string translation.
 */
import {
  DriverType,
  TranslationResult,
  TranslationOptions,
  ALL_DRIVERS,
} from './types';
import { parse } from './parser';
import { mapKeywords } from './mapper';
import { generate } from './generator';

/**
 * Translate a connection string to a target driver format
 * @param input - Source connection string
 * @param targetDriver - Target driver format
 * @param options - Translation options
 * @returns Translation result
 */
export function translate(
  input: string,
  targetDriver: DriverType,
  options?: TranslationOptions
): TranslationResult {
  // Parse input
  const parsed = parse(input);

  // Check for parse errors
  if (parsed.errors.length > 0) {
    return {
      success: false,
      targetDriver,
      connectionString: '',
      translatedKeywords: [],
      untranslatableKeywords: [],
      warnings: [],
      errors: parsed.errors.map((e) => ({
        code: 'PARSE_FAILED',
        message: e.message,
      })),
    };
  }

  // Map keywords to target
  const mapped = mapKeywords(parsed, targetDriver, options);

  // Generate output string - pass parsed data for drivers that need original values (e.g., JDBC server)
  const output = generate(mapped, targetDriver, options, parsed);

  return {
    success: true,
    targetDriver,
    connectionString: output,
    translatedKeywords: mapped.translatedKeywords,
    untranslatableKeywords: mapped.untranslatableKeywords,
    warnings: mapped.warnings,
    errors: [],
  };
}

/**
 * Translate to all supported driver formats
 * @param input - Source connection string
 * @param options - Translation options
 * @returns Array of translation results for all drivers
 */
export function translateAll(
  input: string,
  options?: TranslationOptions
): TranslationResult[] {
  return ALL_DRIVERS.map((driver) => translate(input, driver, options));
}

export { parse } from './parser';
export { mapKeywords } from './mapper';
export { generate } from './generator';
export { validate } from './validator';
export { detect } from './detector';
