/**
 * Parser Unit Tests
 *
 * Tests for connection string parsing functionality.
 * Written FIRST per TDD methodology - these tests should FAIL until parser is implemented.
 */
import { parse } from '../../src/translator/parser';
import * as fixtures from '../fixtures/connection-strings';

describe('Parser', () => {
  // T038 - Basic parsing tests
  describe('basic parsing', () => {
    it('should parse a basic SqlClient connection string', () => {
      const result = parse(fixtures.SQLCLIENT_BASIC);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('server')?.normalized).toBe('localhost');
      expect(result.pairs.get('database')?.normalized).toBe('mydb');
      expect(result.pairs.get('userid')?.normalized).toBe('sa');
      expect(result.pairs.get('password')?.normalized).toBe('pass123');
    });

    it('should parse JDBC URL format', () => {
      const result = parse(fixtures.JDBC_BASIC);

      expect(result.errors).toHaveLength(0);
      expect(result.driver).toBe('jdbc');
      expect(result.jdbcUrl?.host).toBe('localhost');
      expect(result.jdbcUrl?.port).toBe(1433);
      expect(result.pairs.get('database')?.normalized).toBe('mydb');
    });

    it('should parse ODBC with driver specification', () => {
      const result = parse(fixtures.ODBC_BASIC);

      expect(result.errors).toHaveLength(0);
      expect(result.driver).toBe('odbc');
      expect(result.pairs.get('driver')?.normalized).toContain('ODBC Driver');
    });

    it('should parse OLEDB with provider', () => {
      const result = parse(fixtures.OLEDB_BASIC);

      expect(result.errors).toHaveLength(0);
      expect(result.driver).toBe('oledb');
      expect(result.pairs.get('provider')?.normalized).toBe('MSOLEDBSQL');
    });

    it('should handle synonyms correctly', () => {
      const result = parse(fixtures.SQLCLIENT_SYNONYMS);

      expect(result.pairs.get('server')?.normalized).toBe('localhost');
      expect(result.pairs.get('database')?.normalized).toBe('mydb');
    });
  });

  // T039 - Quoted/braced value handling
  describe('quoted and braced values', () => {
    it('should parse quoted values with semicolons', () => {
      const result = parse(fixtures.QUOTED_VALUE);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('pass;word');
      expect(result.pairs.get('password')?.wasQuoted).toBe(true);
    });

    it('should parse braced values with semicolons', () => {
      const result = parse(fixtures.BRACED_VALUE);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('pass;word');
      expect(result.pairs.get('password')?.wasQuoted).toBe(true);
    });

    it('should handle embedded quotes in quoted values', () => {
      const input = 'Server=localhost;Password="pass""word";Database=mydb;';
      const result = parse(input);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('pass"word');
    });
  });

  // T040 - Whitespace normalization (FR-019)
  describe('whitespace normalization', () => {
    it('should normalize whitespace around delimiters', () => {
      const result = parse(fixtures.WHITESPACE_DELIMITERS);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('server')?.normalized).toBe('localhost');
      expect(result.pairs.get('database')?.normalized).toBe('mydb');
      expect(result.pairs.get('userid')?.normalized).toBe('sa');
    });

    it('should handle leading and trailing whitespace', () => {
      const input = '  Server=localhost;Database=mydb;  ';
      const result = parse(input);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('server')?.normalized).toBe('localhost');
    });

    it('should preserve whitespace inside values', () => {
      const input = 'Server=localhost;Application Name=My App Name;';
      const result = parse(input);

      expect(result.pairs.get('applicationname')?.normalized).toBe('My App Name');
    });
  });

  // T041 - Nested braces (FR-017)
  describe('nested braces handling', () => {
    it('should handle escaped braces (}} = literal })', () => {
      const result = parse(fixtures.NESTED_BRACES);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('pass}word');
    });

    it('should handle multiple escaped braces', () => {
      const input = 'Server=localhost;Password={pass}}}}word};';
      const result = parse(input);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('pass}}word');
    });
  });

  // T042 - Best-effort parsing (FR-018)
  describe('best-effort parsing', () => {
    it('should extract valid pairs even with partial errors', () => {
      // Malformed but should still extract Server
      const input = 'Server=localhost;Password="unclosed;Database=mydb;';
      const result = parse(input);

      // Should have error for unclosed quote
      expect(result.errors.some((e) => e.code === 'UNMATCHED_QUOTE')).toBe(true);
      // But should still extract Server
      expect(result.pairs.get('server')?.normalized).toBe('localhost');
    });

    it('should handle empty values', () => {
      const result = parse(fixtures.EMPTY_VALUE);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('password')?.normalized).toBe('');
    });

    it('should warn about duplicate keywords (first wins)', () => {
      const result = parse(fixtures.DUPLICATE_KEYWORDS);

      expect(result.pairs.get('server')?.normalized).toBe('first');
      expect(result.warnings.some((w) => w.code === 'DUPLICATE_KEYWORD')).toBe(true);
    });

    it('should warn about unknown keywords', () => {
      const result = parse(fixtures.UNKNOWN_KEYWORD);

      expect(result.warnings.some((w) => w.code === 'UNKNOWN_KEYWORD')).toBe(true);
    });
  });

  // Input size validation (FR-021)
  describe('input size validation', () => {
    it('should accept connection strings up to 32KB', () => {
      const largeInput = 'Server=localhost;Extra=' + 'x'.repeat(30000) + ';';
      const result = parse(largeInput);

      expect(result.errors.every((e) => e.code !== 'INPUT_TOO_LARGE')).toBe(true);
    });

    it('should reject connection strings over 32KB', () => {
      const hugeInput = 'Server=localhost;Extra=' + 'x'.repeat(40000) + ';';
      const result = parse(hugeInput);

      expect(result.errors.some((e) => e.code === 'INPUT_TOO_LARGE')).toBe(true);
    });
  });

  // Error detection
  describe('error detection', () => {
    it('should detect unmatched quotes', () => {
      const result = parse(fixtures.MALFORMED_UNMATCHED_QUOTE);

      expect(result.errors.some((e) => e.code === 'UNMATCHED_QUOTE')).toBe(true);
    });

    it('should detect unmatched braces', () => {
      const result = parse(fixtures.MALFORMED_UNMATCHED_BRACE);

      expect(result.errors.some((e) => e.code === 'UNMATCHED_BRACE')).toBe(true);
    });

    it('should handle empty input', () => {
      const result = parse('');

      expect(result.errors.some((e) => e.code === 'EMPTY_INPUT')).toBe(true);
    });

    it('should handle whitespace-only input', () => {
      const result = parse('   ');

      expect(result.errors.some((e) => e.code === 'EMPTY_INPUT')).toBe(true);
    });
  });

  // NEW SQLCLIENT V5.0+ KEYWORDS
  describe('SqlClient v5.0+ keywords', () => {
    it('should parse IPAddressPreference keyword', () => {
      const result = parse(fixtures.IP_ADDRESS_PREFERENCE);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('ipaddresspreference')?.normalized).toBe('IPv6First');
    });

    it('should parse PoolBlockingPeriod keyword', () => {
      const result = parse(fixtures.POOL_BLOCKING_PERIOD);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('poolblockingperiod')?.normalized).toBe('NeverBlock');
    });

    it('should parse Enclave Attestation keywords', () => {
      const result = parse(fixtures.ENCLAVE_ATTESTATION);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('attestationprotocol')?.normalized).toBe('HGS');
      expect(result.pairs.get('enclaveattestationurl')?.normalized).toBe('https://attestation.example.com');
    });

    it('should parse ServerCertificate keyword', () => {
      const result = parse(fixtures.SERVER_CERTIFICATE);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('servercertificate')?.normalized).toBe('/path/to/cert.pem');
    });

    it('should parse Server SPN keywords', () => {
      const result = parse(fixtures.SERVER_SPN);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('serverspn')?.normalized).toBe('MSSQLSvc/server.domain.com:1433');
      expect(result.pairs.get('failoverpartnerspn')?.normalized).toBe('MSSQLSvc/failover.domain.com:1433');
    });

    it('should parse TransparentNetworkIPResolution keyword', () => {
      const result = parse(fixtures.TRANSPARENT_NETWORK_IP);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('transparentnetworkipresolution')?.normalized).toBe('False');
    });

    it('should parse Network Library keyword', () => {
      const result = parse(fixtures.NETWORK_LIBRARY);

      expect(result.errors).toHaveLength(0);
      expect(result.pairs.get('networklibrary')?.normalized).toBe('dbmssocn');
    });
  });
});
