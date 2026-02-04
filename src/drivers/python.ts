/**
 * Python Driver Configuration
 * mssql-python / pyodbc
 * 
 * IMPORTANT: Python driver has a restricted allowlist of keywords.
 * Only specific keywords are allowed per the driver specification.
 */
import { DriverConfig } from '../translator/types';

/** Keywords blocked by Python driver's restricted allowlist (FR-022) */
export const PYTHON_BLOCKED_KEYWORDS: string[] = [
  'attachdbfilename',
  'autotranslate',
  'contextconnection',
  'currentlanguage',
  'enlist',
  'extendedansitype',
  'failoverpartner',
  'initialcatalog',
  'loadbalancetimeout',
  'minpoolsize',
  'maxpoolsize',
  'multipleactiveresultsets',
  'multisubnetfailover',
  'networkaddress',
  'packetsize',
  'persistsecurityinfo',
  'pooling',
  'replication',
  'transactionbinding',
  'typeystemversion',
  'userinstance',
  'workstationid',
];

/** Check if a keyword is blocked by Python driver */
export function isPythonBlockedKeyword(keyword: string): boolean {
  return PYTHON_BLOCKED_KEYWORDS.includes(keyword.toLowerCase().replace(/\s+/g, ''));
}

export const pythonDriver: DriverConfig = {
  type: 'python',
  displayName: 'Python',
  detectionPatterns: [
    // Python mssql-python specific patterns
    /\bmssql\+pyodbc:\/\//i,
  ],
  detectionConfidence: 'medium',
  escapeRules: {
    useDoubleQuotes: true,
    quoteChar: '"',
    escapeSequence: '""',
  },
};
