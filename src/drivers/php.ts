/**
 * PHP Driver Configuration
 * sqlsrv / PDO_SQLSRV
 */
import { DriverConfig } from '../translator/types';

export const phpDriver: DriverConfig = {
  type: 'php',
  displayName: 'PHP',
  detectionPatterns: [
    // PHP-specific patterns
    /\bLoginTimeout\s*=/i,
    /\bConnectionPooling\s*=/i,
    // PHP uses similar syntax to SqlClient, detected by context
  ],
  detectionConfidence: 'medium',
  escapeRules: {
    useDoubleQuotes: true,
    quoteChar: '"',
    escapeSequence: '""',
  },
};
