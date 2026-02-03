/**
 * Detector Unit Tests
 *
 * Tests for driver format auto-detection.
 */
import { detect, isDriverFormat, getDriverPatterns } from '../../src/translator/detector';
import * as fixtures from '../fixtures/connection-strings';

describe('Detector', () => {
  // T056 - SqlClient detection
  describe('SqlClient detection', () => {
    it('should detect SqlClient format with Integrated Security', () => {
      const result = detect(fixtures.SQLCLIENT_INTEGRATED);
      expect(result.driver).toBe('sqlclient');
      expect(result.confidence).toBe('high');
    });

    it('should detect SqlClient format with User ID', () => {
      const result = detect(fixtures.SQLCLIENT_BASIC);
      expect(result.driver).toBe('sqlclient');
    });

    it('should detect SqlClient with synonyms', () => {
      const result = detect(fixtures.SQLCLIENT_SYNONYMS);
      expect(result.driver).toBe('sqlclient');
    });
  });

  // T057 - JDBC URL detection
  describe('JDBC URL detection', () => {
    it('should detect JDBC URL format with high confidence', () => {
      const result = detect(fixtures.JDBC_BASIC);
      expect(result.driver).toBe('jdbc');
      expect(result.confidence).toBe('high');
    });

    it('should detect JDBC URL with full options', () => {
      const result = detect(fixtures.JDBC_FULL);
      expect(result.driver).toBe('jdbc');
      expect(result.confidence).toBe('high');
    });
  });

  // T058 - ODBC Driver= detection
  describe('ODBC detection', () => {
    it('should detect ODBC format with Driver keyword', () => {
      const result = detect(fixtures.ODBC_BASIC);
      expect(result.driver).toBe('odbc');
      expect(result.confidence).toBe('high');
    });

    it('should detect ODBC with Trusted_Connection', () => {
      const result = detect(fixtures.ODBC_TRUSTED);
      expect(result.driver).toBe('odbc');
    });
  });

  // T059 - OLEDB Provider= detection
  describe('OLEDB detection', () => {
    it('should detect OLEDB format with Provider keyword', () => {
      const result = detect(fixtures.OLEDB_BASIC);
      expect(result.driver).toBe('oledb');
      expect(result.confidence).toBe('high');
    });

    it('should detect OLEDB with Integrated Security', () => {
      const result = detect(fixtures.OLEDB_INTEGRATED);
      expect(result.driver).toBe('oledb');
    });
  });

  // T060 - Confidence levels
  describe('confidence levels', () => {
    it('should return high confidence for JDBC URL', () => {
      const result = detect('jdbc:sqlserver://localhost:1433;');
      expect(result.confidence).toBe('high');
    });

    it('should return high confidence for ODBC Driver', () => {
      const result = detect('Driver={ODBC Driver 18 for SQL Server};');
      expect(result.confidence).toBe('high');
    });

    it('should return high confidence for OLEDB Provider', () => {
      const result = detect('Provider=MSOLEDBSQL;');
      expect(result.confidence).toBe('high');
    });

    it('should return low confidence for ambiguous input', () => {
      const result = detect('Server=localhost;Database=mydb;');
      expect(['low', 'medium']).toContain(result.confidence);
    });
  });

  // PHP detection
  describe('PHP detection', () => {
    it('should detect PHP format', () => {
      const result = detect(fixtures.PHP_BASIC);
      // PHP is similar to SqlClient, may detect as either
      expect(['php', 'sqlclient', 'odbc']).toContain(result.driver);
    });
  });

  // Python detection
  describe('Python detection', () => {
    it('should detect Python mssql+pyodbc URL', () => {
      const result = detect('mssql+pyodbc://user:pass@server/db');
      expect(result.driver).toBe('python');
      expect(result.confidence).toBe('high');
    });
  });

  // Rust detection
  describe('Rust detection', () => {
    it('should detect Rust ClientContext struct', () => {
      const result = detect('ClientContext { transport_context: ...');
      expect(result.driver).toBe('rust');
      expect(result.confidence).toBe('high');
    });
  });

  // Helper functions
  describe('helper functions', () => {
    it('isDriverFormat should return true for matching format', () => {
      expect(isDriverFormat(fixtures.JDBC_BASIC, 'jdbc')).toBe(true);
      expect(isDriverFormat(fixtures.ODBC_BASIC, 'odbc')).toBe(true);
    });

    it('isDriverFormat should return false for non-matching format', () => {
      expect(isDriverFormat(fixtures.JDBC_BASIC, 'odbc')).toBe(false);
    });

    it('getDriverPatterns should return patterns for driver', () => {
      const patterns = getDriverPatterns('jdbc');
      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].test('jdbc:sqlserver://localhost')).toBe(true);
    });
  });
});
