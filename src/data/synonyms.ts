/**
 * Keyword Synonym Lookup
 *
 * Maps all keyword synonyms/aliases to their canonical keyword ID.
 * Used during parsing to normalize keyword names.
 */
import { DriverType } from '../translator/types';
import { keywords } from './keywords';

/** Type for synonym map: lowercase synonym → canonical keyword ID */
export type SynonymMap = Map<string, string>;

/** Global synonym map for all drivers (case-insensitive lookup) */
export const globalSynonyms: SynonymMap = new Map<string, string>();

/** Per-driver synonym maps */
export const driverSynonyms: Record<DriverType, SynonymMap> = {
  sqlclient: new Map<string, string>(),
  odbc: new Map<string, string>(),
  oledb: new Map<string, string>(),
  jdbc: new Map<string, string>(),
  php: new Map<string, string>(),
  python: new Map<string, string>(),
  rust: new Map<string, string>(),
};

// Build synonym maps from keyword registry
function buildSynonymMaps(): void {
  for (const keyword of keywords) {
    const canonicalId = keyword.id;

    for (const [driverType, driverKeyword] of Object.entries(keyword.drivers)) {
      if (!driverKeyword) continue;

      const driver = driverType as DriverType;
      const driverMap = driverSynonyms[driver];

      // Add primary name
      if (driverKeyword.name) {
        const normalizedName = driverKeyword.name.toLowerCase().replace(/\s+/g, '');
        driverMap.set(normalizedName, canonicalId);
        globalSynonyms.set(normalizedName, canonicalId);

        // Also add with spaces preserved but lowercase
        const lowerName = driverKeyword.name.toLowerCase();
        driverMap.set(lowerName, canonicalId);
        globalSynonyms.set(lowerName, canonicalId);
      }

      // Add all synonyms
      if (driverKeyword.synonyms) {
        for (const synonym of driverKeyword.synonyms) {
          const normalizedSynonym = synonym.toLowerCase().replace(/\s+/g, '');
          driverMap.set(normalizedSynonym, canonicalId);
          globalSynonyms.set(normalizedSynonym, canonicalId);

          // Also add with spaces preserved
          const lowerSynonym = synonym.toLowerCase();
          driverMap.set(lowerSynonym, canonicalId);
          globalSynonyms.set(lowerSynonym, canonicalId);
        }
      }
    }
  }
}

// Initialize synonym maps
buildSynonymMaps();

/**
 * Resolve a keyword name to its canonical ID
 * @param keywordName - The keyword name to resolve (case-insensitive)
 * @param driver - Optional driver context for driver-specific resolution
 * @returns Canonical keyword ID or undefined if not found
 */
export function resolveKeyword(keywordName: string, driver?: DriverType): string | undefined {
  const normalized = keywordName.toLowerCase().replace(/\s+/g, '');

  // If driver specified, check driver-specific map first
  if (driver && driverSynonyms[driver].has(normalized)) {
    return driverSynonyms[driver].get(normalized);
  }

  // Fall back to global map
  return globalSynonyms.get(normalized);
}

/**
 * Check if a keyword name is recognized
 * @param keywordName - The keyword name to check
 * @param driver - Optional driver context
 * @returns True if keyword is recognized
 */
export function isKnownKeyword(keywordName: string, driver?: DriverType): boolean {
  return resolveKeyword(keywordName, driver) !== undefined;
}

/**
 * Get all synonyms for a canonical keyword ID
 * @param canonicalId - The canonical keyword ID
 * @param driver - Optional driver to get driver-specific synonyms
 * @returns Array of synonym names
 */
export function getSynonymsForKeyword(canonicalId: string, driver?: DriverType): string[] {
  const keyword = keywords.find((k) => k.id === canonicalId);
  if (!keyword) return [];

  const synonyms: string[] = [];

  if (driver) {
    const driverKeyword = keyword.drivers[driver];
    if (driverKeyword) {
      if (driverKeyword.name) synonyms.push(driverKeyword.name);
      if (driverKeyword.synonyms) synonyms.push(...driverKeyword.synonyms);
    }
  } else {
    // Get all synonyms across all drivers
    for (const driverKeyword of Object.values(keyword.drivers)) {
      if (driverKeyword?.name) synonyms.push(driverKeyword.name);
      if (driverKeyword?.synonyms) synonyms.push(...driverKeyword.synonyms);
    }
  }

  return [...new Set(synonyms)]; // Remove duplicates
}
