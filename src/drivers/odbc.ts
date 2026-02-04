/**
 * ODBC Driver Configuration
 * ODBC Driver for SQL Server
 */
import { DriverConfig } from '../translator/types';

export const odbcDriver: DriverConfig = {
  type: 'odbc',
  displayName: 'ODBC',
  detectionPatterns: [
    // ODBC-specific: Driver= keyword
    /\bDriver\s*=\s*\{[^}]*SQL\s*Server[^}]*\}/i,
    /\bDriver\s*=\s*\{?ODBC\s*Driver\s*\d+/i,
    /\bDriver\s*=\s*\{?SQL\s*Server\s*Native\s*Client/i,
  ],
  detectionConfidence: 'high',
  escapeRules: {
    quoteChar: '{',
    closeQuoteChar: '}',
    escapeSequence: '}}',
  },
};
