/**
 * SqlClient Driver Configuration
 * Microsoft.Data.SqlClient / System.Data.SqlClient
 */
import { DriverConfig } from '../translator/types';

export const sqlclientDriver: DriverConfig = {
  type: 'sqlclient',
  displayName: 'SqlClient',
  detectionPatterns: [
    // SqlClient-specific patterns (high confidence)
    /\bIntegrated\s*Security\s*=/i,
    /\bTrust\s*Server\s*Certificate\s*=/i,
    /\bMultipleActiveResultSets\s*=/i,
    /\bApplication\s*Name\s*=/i,
    // Generic patterns (medium confidence) - Server= or Data Source= without Driver/Provider
    /^(?!.*(?:Driver|Provider)\s*=).*(?:Server|Data\s*Source)\s*=/i,
  ],
  detectionConfidence: 'high',
  escapeRules: {
    useDoubleQuotes: true,
    quoteChar: '"',
    escapeSequence: '""',
  },
};
