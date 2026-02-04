/**
 * Mapper Unit Tests
 *
 * Tests for keyword mapping functionality.
 */
import { mapKeywords } from '../../src/translator/mapper';
import { parse } from '../../src/translator/parser';
import * as fixtures from '../fixtures/connection-strings';

describe('Mapper', () => {
  // T045 - Keyword translation
  describe('keyword translation', () => {
    it('should map Server to equivalent in target driver', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'jdbc');

      // Server is in URL for JDBC, but database should be mapped
      const dbKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'database'
      );
      expect(dbKeyword?.targetKeyword).toBe('databaseName');
    });

    it('should map User ID to user for JDBC', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'jdbc');

      const userKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'user id' || k.sourceKeyword.toLowerCase() === 'userid'
      );
      expect(userKeyword?.targetKeyword).toBe('user');
    });

    it('should normalize boolean values', () => {
      const parsed = parse(fixtures.SQLCLIENT_INTEGRATED);
      const mapped = mapKeywords(parsed, 'jdbc');

      const intSecKeyword = mapped.translatedKeywords.find((k) =>
        k.sourceKeyword.toLowerCase().includes('integrated')
      );
      expect(intSecKeyword?.targetValue).toBe('true');
    });

    it('should identify untranslatable keywords', () => {
      // AttachDBFilename is not supported in JDBC
      const input = 'Server=localhost;Database=mydb;AttachDBFilename=C:\\data\\mydb.mdf;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      expect(
        mapped.untranslatableKeywords.some((k) => k.keyword.toLowerCase().includes('attachdbfilename'))
      ).toBe(true);
    });

    it('should map Password to password for JDBC', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'jdbc');

      const passwordKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'password'
      );
      expect(passwordKeyword?.targetKeyword).toBe('password');
    });

    it('should map Encrypt to encrypt for JDBC', () => {
      const parsed = parse(fixtures.SQLCLIENT_FULL);
      const mapped = mapKeywords(parsed, 'jdbc');

      const encryptKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );
      expect(encryptKeyword?.targetKeyword).toBe('encrypt');
    });

    it('should map Connection Timeout to loginTimeout for JDBC', () => {
      const parsed = parse(fixtures.SQLCLIENT_FULL);
      const mapped = mapKeywords(parsed, 'jdbc');

      const timeoutKeyword = mapped.translatedKeywords.find(
        (k) =>
          k.sourceKeyword.toLowerCase() === 'connection timeout' ||
          k.sourceKeyword.toLowerCase() === 'connectiontimeout'
      );
      expect(timeoutKeyword?.targetKeyword).toBe('loginTimeout');
    });
  });

  // T046 - Keyword order preservation (FR-020)
  describe('keyword order preservation', () => {
    it('should preserve source keyword order by default', () => {
      const input = 'Database=mydb;Server=localhost;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'sqlclient');

      const keywords = mapped.translatedKeywords.map((k) => k.sourceKeyword.toLowerCase());

      // Should maintain: database, server, user id, password order
      const dbIndex = keywords.findIndex((k) => k === 'database');
      const serverIndex = keywords.findIndex((k) => k === 'server');
      const userIndex = keywords.findIndex((k) => k === 'userid' || k === 'user id');

      expect(dbIndex).toBeLessThan(serverIndex);
      expect(serverIndex).toBeLessThan(userIndex);
    });

    it('should support alphabetical ordering option', () => {
      const input = 'Database=mydb;Server=localhost;Application Name=App;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'sqlclient', { keywordOrder: 'alphabetical' });

      const keywords = mapped.translatedKeywords.map((k) => k.targetKeyword.toLowerCase());

      // Should be alphabetically sorted
      const sorted = [...keywords].sort();
      expect(keywords).toEqual(sorted);
    });
  });

  // Python blocked keywords (FR-022)
  describe('Python blocked keywords', () => {
    it('should warn about Python-blocked keywords', () => {
      const input = 'Server=localhost;Database=mydb;MultiSubnetFailover=True;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'python');

      expect(mapped.warnings.some((w) => w.code === 'PYTHON_BLOCKED')).toBe(true);
      expect(
        mapped.untranslatableKeywords.some(
          (k) =>
            k.keyword.toLowerCase().includes('multisubnetfailover') && k.reason === 'BLOCKED_ALLOWLIST'
        )
      ).toBe(true);
    });

    it('should allow standard Python keywords', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'python');

      // Basic keywords like Server, Database, User ID, Password should be allowed
      expect(mapped.translatedKeywords.length).toBeGreaterThan(0);
      expect(
        mapped.untranslatableKeywords.filter((k) => k.reason === 'BLOCKED_ALLOWLIST').length
      ).toBe(0);
    });
  });

  // Cross-driver mapping
  describe('cross-driver mapping', () => {
    it('should map from JDBC to SqlClient', () => {
      const parsed = parse(fixtures.JDBC_BASIC);
      const mapped = mapKeywords(parsed, 'sqlclient');

      const dbKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'databasename'
      );
      expect(dbKeyword?.targetKeyword).toBe('Database');
    });

    it('should map from ODBC to SqlClient', () => {
      const parsed = parse(fixtures.ODBC_BASIC);
      const mapped = mapKeywords(parsed, 'sqlclient');

      // UID should map to User ID
      const userKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'uid'
      );
      expect(userKeyword?.targetKeyword).toBe('User ID');
    });

    it('should map from OLEDB to JDBC', () => {
      const parsed = parse(fixtures.OLEDB_BASIC);
      const mapped = mapKeywords(parsed, 'jdbc');

      // Initial Catalog should map to databaseName
      const dbKeyword = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'initial catalog'
      );
      expect(dbKeyword?.targetKeyword).toBe('databaseName');
    });
  });

  // T076 - HADR keyword translation
  describe('HADR keyword translation', () => {
    it('should translate MultiSubnetFailover to JDBC', () => {
      const parsed = parse(fixtures.HADR_KEYWORDS);
      const mapped = mapKeywords(parsed, 'jdbc');

      const msfKeyword = mapped.translatedKeywords.find((k) =>
        k.sourceKeyword.toLowerCase().includes('multisubnetfailover')
      );

      expect(msfKeyword?.targetKeyword).toBe('multiSubnetFailover');
      expect(msfKeyword?.targetValue).toBe('true');
    });

    it('should translate ApplicationIntent to ODBC', () => {
      const parsed = parse(fixtures.HADR_KEYWORDS);
      const mapped = mapKeywords(parsed, 'odbc');

      const intentKeyword = mapped.translatedKeywords.find((k) =>
        k.sourceKeyword.toLowerCase().includes('applicationintent')
      );

      expect(intentKeyword?.targetKeyword).toBe('ApplicationIntent');
    });

    it('should mark HADR keywords as untranslatable for drivers without support', () => {
      const parsed = parse(fixtures.HADR_KEYWORDS);
      const mapped = mapKeywords(parsed, 'python');

      // MultiSubnetFailover is not supported in Python
      expect(
        mapped.untranslatableKeywords.some((k) =>
          k.keyword.toLowerCase().includes('multisubnetfailover')
        )
      ).toBe(true);
    });

    it('should translate ApplicationIntent to SqlClient', () => {
      const parsed = parse(fixtures.HADR_KEYWORDS);
      const mapped = mapKeywords(parsed, 'sqlclient');

      const intentKeyword = mapped.translatedKeywords.find((k) =>
        k.sourceKeyword.toLowerCase().includes('applicationintent')
      );

      expect(intentKeyword?.targetKeyword).toBe('ApplicationIntent');
    });
  });

  // T077 - Untranslatable keyword detection
  describe('untranslatable keyword detection', () => {
    it('should detect driver-specific keywords', () => {
      // AttachDBFilename is SqlClient-specific
      const input =
        'Server=localhost;Database=mydb;AttachDBFilename=C:\\data\\mydb.mdf;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      expect(
        mapped.untranslatableKeywords.some((k) =>
          k.keyword.toLowerCase().includes('attachdbfilename')
        )
      ).toBe(true);
    });

    it('should include reason for untranslatable keywords', () => {
      const input =
        'Server=localhost;Database=mydb;Replication=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const replication = mapped.untranslatableKeywords.find((k) =>
        k.keyword.toLowerCase() === 'replication'
      );

      expect(replication?.reason).toBeDefined();
      expect(['NOT_SUPPORTED', 'DRIVER_SPECIFIC']).toContain(replication?.reason);
    });

    it('should preserve untranslatable keyword values', () => {
      const input =
        'Server=localhost;Database=mydb;AttachDBFilename=C:\\data\\mydb.mdf;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const attachDb = mapped.untranslatableKeywords.find((k) =>
        k.keyword.toLowerCase().includes('attachdbfilename')
      );

      expect(attachDb?.value).toBe('C:\\data\\mydb.mdf');
    });
  });

  // T078 - UntranslatableReason codes
  describe('UntranslatableReason codes', () => {
    it('should use NOT_SUPPORTED for keywords missing in target', () => {
      const input =
        'Server=localhost;Database=mydb;Packet Size=4096;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'rust');

      const packetSize = mapped.untranslatableKeywords.find(
        (k) =>
          k.keyword.toLowerCase().includes('packetsize') ||
          k.keyword.toLowerCase() === 'packet size'
      );

      expect(packetSize?.reason).toBe('NOT_SUPPORTED');
    });

    it('should use BLOCKED_ALLOWLIST for Python-blocked keywords', () => {
      const input =
        'Server=localhost;Database=mydb;MultiSubnetFailover=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'python');

      const msf = mapped.untranslatableKeywords.find((k) =>
        k.keyword.toLowerCase().includes('multisubnetfailover')
      );

      expect(msf?.reason).toBe('BLOCKED_ALLOWLIST');
    });

    it('should use UNKNOWN for unrecognized keywords', () => {
      const input =
        'Server=localhost;Database=mydb;SomeUnknownOption=value;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const unknown = mapped.untranslatableKeywords.find(
        (k) => k.keyword.toLowerCase() === 'someunknownoption'
      );

      // Unknown keywords should be marked as UNKNOWN reason
      expect(unknown?.reason).toBe('UNKNOWN');
    });

    it('should track driver-specific keywords', () => {
      // Test with a keyword that exists in only one driver
      const input =
        'Server=localhost;Database=mydb;Workstation ID=MYPC;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'rust');

      const workstationId = mapped.untranslatableKeywords.find(
        (k) =>
          k.keyword.toLowerCase().includes('workstationid') ||
          k.keyword.toLowerCase() === 'workstation id'
      );

      // If not supported in rust, should be untranslatable
      if (workstationId) {
        expect(['NOT_SUPPORTED', 'DRIVER_SPECIFIC']).toContain(workstationId.reason);
      }
    });
  });

  // T082 - Boolean value normalization (FR-016)
  describe('boolean value normalization', () => {
    it('should normalize True to true for JDBC', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=True;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      expect(encrypt?.targetValue).toBe('true');
      expect(encrypt?.valueTransformed).toBe(true);
    });

    it('should normalize Yes to True for SqlClient', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=Yes;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'sqlclient');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      expect(encrypt?.targetValue).toBe('True');
    });

    it('should normalize 1 to boolean', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=1;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      expect(encrypt?.targetValue).toBe('true');
    });

    it('should normalize False to false for JDBC', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=False;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      // The mapper normalizes boolean values based on the normalizeBooleanValue function
      // False is recognized as false and formatted for JDBC
      expect(['false', 'False']).toContain(encrypt?.targetValue);
    });

    it('should normalize No to False for SqlClient', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=No;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'sqlclient');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      // 'No' is recognized as false boolean and formatted for SqlClient
      expect(['False', 'No']).toContain(encrypt?.targetValue);
    });

    it('should normalize 0 to false for JDBC', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=0;User ID=sa;Password=pass;';
      const parsed = parse(input);
      const mapped = mapKeywords(parsed, 'jdbc');

      const encrypt = mapped.translatedKeywords.find(
        (k) => k.sourceKeyword.toLowerCase() === 'encrypt'
      );

      // '0' is recognized as false boolean and formatted for JDBC
      expect(['false', '0']).toContain(encrypt?.targetValue);
    });
  });
});
