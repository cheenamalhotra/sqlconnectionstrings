/**
 * OLEDB Driver Configuration
 * MSOLEDBSQL / SQLOLEDB Provider
 */
import { DriverConfig } from '../translator/types';

export const oledbDriver: DriverConfig = {
  type: 'oledb',
  displayName: 'OLEDB',
  detectionPatterns: [
    // OLEDB-specific: Provider= keyword
    /\bProvider\s*=\s*MSOLEDBSQL/i,
    /\bProvider\s*=\s*SQLOLEDB/i,
    /\bProvider\s*=\s*SQLNCLI/i,
  ],
  detectionConfidence: 'high',
  escapeRules: {
    useDoubleQuotes: true,
    quoteChar: '"',
    escapeSequence: '""',
  },
};
