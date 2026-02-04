/**
 * JDBC Driver Configuration
 * mssql-jdbc (Microsoft JDBC Driver for SQL Server)
 */
import { DriverConfig } from '../translator/types';

export const jdbcDriver: DriverConfig = {
  type: 'jdbc',
  displayName: 'JDBC',
  detectionPatterns: [
    // JDBC URL prefix - highest confidence
    /^jdbc:sqlserver:\/\//i,
  ],
  detectionConfidence: 'high',
  escapeRules: {
    quoteChar: '{',
    closeQuoteChar: '}',
    escapeSequence: '}}',
  },
  usesUrlFormat: true,
  formatPrefix: 'jdbc:sqlserver://',
};
