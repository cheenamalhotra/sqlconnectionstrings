/**
 * Validator Unit Tests
 *
 * Tests for connection string syntax validation.
 */
import { validate, validateSyntax } from '../../src/translator/validator';
import { parse } from '../../src/translator/parser';
import * as fixtures from '../fixtures/connection-strings';

describe('Validator', () => {
  // T083 - Unmatched quote detection
  describe('unmatched quote detection', () => {
    it('should detect unmatched double quote', () => {
      const result = validateSyntax(fixtures.MALFORMED_UNMATCHED_QUOTE);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNMATCHED_QUOTE')).toBe(true);
    });

    it('should detect unmatched single quote', () => {
      const result = validateSyntax("Server=localhost;Password='pass;Database=mydb;");

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNMATCHED_QUOTE')).toBe(true);
    });

    it('should accept properly quoted values', () => {
      const result = validateSyntax('Server=localhost;Password="pass;word";');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle escaped quotes', () => {
      const result = validateSyntax('Server=localhost;Password="pass""word";');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // T084 - Unmatched brace detection
  describe('unmatched brace detection', () => {
    it('should detect unmatched opening brace', () => {
      const result = validateSyntax(fixtures.MALFORMED_UNMATCHED_BRACE);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === 'UNMATCHED_BRACE')).toBe(true);
    });

    it('should accept properly braced values', () => {
      const result = validateSyntax(fixtures.BRACED_VALUE);

      expect(result.isValid).toBe(true);
    });

    it('should accept escaped braces', () => {
      const result = validateSyntax(fixtures.NESTED_BRACES);

      expect(result.isValid).toBe(true);
    });
  });

  // T085 - Unknown keyword warning
  describe('unknown keyword warning', () => {
    it('should warn about unknown keywords', () => {
      const parsed = parse(fixtures.UNKNOWN_KEYWORD);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) =>
            w.code === 'UNKNOWN_KEYWORD' && w.keyword?.toLowerCase().includes('unknownoption')
        )
      ).toBe(true);
    });

    it('should not warn about known keywords', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const result = validate(parsed);

      expect(result.warnings.filter((w) => w.code === 'UNKNOWN_KEYWORD')).toHaveLength(0);
    });
  });

  // T086 - Missing required parameter
  describe('missing required parameter', () => {
    it('should warn about missing server', () => {
      const parsed = parse('Database=mydb;User ID=sa;Password=pass;');
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('server')
        )
      ).toBe(true);
    });

    it('should warn about missing authentication', () => {
      const parsed = parse('Server=localhost;Database=mydb;');
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('authentication')
        )
      ).toBe(true);
    });

    it('should not warn when Integrated Security is used', () => {
      const parsed = parse(fixtures.SQLCLIENT_INTEGRATED);
      const result = validate(parsed);

      expect(
        result.warnings.filter(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('authentication')
        )
      ).toHaveLength(0);
    });

    it('should not warn when User ID and Password are present', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const result = validate(parsed);

      expect(
        result.warnings.filter(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('authentication')
        )
      ).toHaveLength(0);
    });
  });

  // Conflicting keywords
  describe('conflicting keywords', () => {
    it('should warn about Integrated Security + User ID conflict', () => {
      const input =
        'Server=localhost;Database=mydb;Integrated Security=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(result.warnings.some((w) => w.code === 'CONFLICTING_KEYWORDS')).toBe(true);
    });

    it('should warn about Encrypt=False + TrustServerCertificate', () => {
      const input =
        'Server=localhost;Database=mydb;Encrypt=False;TrustServerCertificate=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'CONFLICTING_KEYWORDS' && w.keyword === 'trustservercertificate'
        )
      ).toBe(true);
    });

    it('should not warn when Encrypt=True and TrustServerCertificate', () => {
      const input =
        'Server=localhost;Database=mydb;Encrypt=True;TrustServerCertificate=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'CONFLICTING_KEYWORDS' && w.keyword === 'trustservercertificate'
        )
      ).toBe(false);
    });
  });

  // Value type validation
  describe('value type validation', () => {
    it('should warn about invalid boolean value', () => {
      // TrustServerCertificate is a boolean type in SqlClient
      const input = 'Server=localhost;Database=mydb;TrustServerCertificate=maybe;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.message.toLowerCase().includes('invalid') && w.message.toLowerCase().includes('boolean')
        )
      ).toBe(true);
    });

    it('should warn about invalid integer value', () => {
      const input = 'Server=localhost;Database=mydb;Connect Timeout=abc;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) =>
            w.message.toLowerCase().includes('invalid') && w.message.toLowerCase().includes('integer')
        )
      ).toBe(true);
    });

    it('should accept valid boolean values', () => {
      // TrustServerCertificate is a boolean type in SqlClient
      const input = 'Server=localhost;Database=mydb;TrustServerCertificate=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.message.toLowerCase().includes('invalid') && w.message.toLowerCase().includes('boolean')
        )
      ).toBe(false);
    });

    it('should accept valid integer values', () => {
      const input = 'Server=localhost;Database=mydb;Connect Timeout=30;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) =>
            w.message.toLowerCase().includes('invalid') && w.message.toLowerCase().includes('integer')
        )
      ).toBe(false);
    });
  });

  // Driver-specific validation
  describe('driver-specific validation', () => {
    it('should warn about missing ODBC Driver', () => {
      // Parse a string that is detected as ODBC but missing Driver
      const parsed = parse('DSN=mydsn;Database=mydb;User ID=sa;Password=pass;');
      // Force driver type for testing
      parsed.driver = 'odbc';
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('driver')
        )
      ).toBe(true);
    });

    it('should warn about missing OLEDB Provider', () => {
      // Create a parsed string without provider
      const parsed = parse('Data Source=localhost;Initial Catalog=mydb;User ID=sa;Password=pass;');
      // Force driver type for testing
      parsed.driver = 'oledb';
      const result = validate(parsed);

      expect(
        result.warnings.some(
          (w) => w.code === 'MISSING_REQUIRED' && w.message.toLowerCase().includes('provider')
        )
      ).toBe(true);
    });
  });

  // Syntax validation standalone
  describe('syntax validation', () => {
    it('should return isValid=true for valid connection strings', () => {
      const result = validateSyntax(fixtures.SQLCLIENT_BASIC);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should provide position information for errors', () => {
      const result = validateSyntax(fixtures.MALFORMED_UNMATCHED_QUOTE);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].position).toBeDefined();
      expect(result.errors[0].position?.start).toBeGreaterThanOrEqual(0);
    });

    it('should provide suggestions for fixing errors', () => {
      const result = validateSyntax(fixtures.MALFORMED_UNMATCHED_QUOTE);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].suggestion).toBeDefined();
    });
  });
});
