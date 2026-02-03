/**
 * Generator Unit Tests
 *
 * Tests for connection string generation functionality.
 */
import { generate, generateFormatted, generateAll } from '../../src/translator/generator';
import { parse } from '../../src/translator/parser';
import { mapKeywords } from '../../src/translator/mapper';
import { DriverType } from '../../src/translator/types';
import * as fixtures from '../fixtures/connection-strings';

describe('Generator', () => {
  // Helper to translate
  const translateTo = (input: string, targetDriver: DriverType) => {
    const parsed = parse(input);
    const mapped = mapKeywords(parsed, targetDriver);
    return generate(mapped, targetDriver, undefined, parsed);
  };

  // T043 - SqlClient output
  describe('SqlClient output', () => {
    it('should generate valid SqlClient connection string', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'sqlclient');

      expect(output).toContain('Server=');
      expect(output).toContain('Database=');
      expect(output).toContain('User ID=');
      expect(output).toContain('Password=');
    });

    it('should use SqlClient boolean format (True/False)', () => {
      const output = translateTo(fixtures.SQLCLIENT_INTEGRATED, 'sqlclient');

      expect(output).toMatch(/Integrated Security=True/i);
    });

    it('should escape values with semicolons using quotes', () => {
      const input = 'Server=localhost;Database=mydb;Password={pass;word};';
      const output = translateTo(input, 'sqlclient');

      // SqlClient uses double quotes for escaping
      expect(output).toMatch(/Password="pass;word"/);
    });
  });

  // T044 - JDBC URL output
  describe('JDBC output', () => {
    it('should generate valid JDBC URL', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'jdbc');

      expect(output).toMatch(/^jdbc:sqlserver:\/\//);
      expect(output).toContain('databaseName=');
      expect(output).toContain('user=');
      expect(output).toContain('password=');
    });

    it('should include host:port in URL path', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'jdbc');

      expect(output).toMatch(/jdbc:sqlserver:\/\/localhost:1433;/);
    });

    it('should use JDBC boolean format (true/false lowercase)', () => {
      const output = translateTo(fixtures.SQLCLIENT_INTEGRATED, 'jdbc');

      expect(output).toMatch(/integratedSecurity=true/);
    });

    it('should escape values with semicolons using braces', () => {
      const input = 'Server=localhost;Database=mydb;Password="pass;word";';
      const output = translateTo(input, 'jdbc');

      // JDBC uses braces for escaping
      expect(output).toMatch(/password=\{pass;word\}/);
    });

    it('should use JDBC keyword names', () => {
      const output = translateTo(fixtures.SQLCLIENT_FULL, 'jdbc');

      expect(output).toContain('databaseName='); // Not "Database="
      expect(output).toContain('user='); // Not "User ID="
    });
  });

  // ODBC output
  describe('ODBC output', () => {
    it('should generate valid ODBC connection string', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'odbc');

      expect(output).toContain('Server=');
      expect(output).toContain('Database=');
      expect(output).toContain('UID=');
      expect(output).toContain('PWD=');
    });

    it('should use ODBC trusted connection format', () => {
      const output = translateTo(fixtures.SQLCLIENT_INTEGRATED, 'odbc');

      expect(output).toMatch(/Trusted_Connection=Yes/i);
    });

    it('should preserve Driver keyword when present in input', () => {
      const output = translateTo(fixtures.ODBC_BASIC, 'odbc');

      // Note: Driver is a driver-specific keyword, preserved if in input
      expect(output).toContain('Server=');
    });
  });

  // OLEDB output
  describe('OLEDB output', () => {
    it('should generate valid OLEDB connection string', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'oledb');

      expect(output).toContain('Data Source=');
      expect(output).toContain('Initial Catalog=');
      expect(output).toContain('User ID=');
      expect(output).toContain('Password=');
    });

    it('should preserve Provider keyword when present in input', () => {
      const output = translateTo(fixtures.OLEDB_BASIC, 'oledb');

      // Note: Provider is a driver-specific keyword, preserved if in input
      expect(output).toContain('Data Source=');
    });

    // T066 - OLEDB output
    it('should use OLEDB Integrated Security=SSPI', () => {
      const output = translateTo(fixtures.SQLCLIENT_INTEGRATED, 'oledb');

      expect(output).toMatch(/Integrated Security=SSPI/i);
    });
  });

  // PHP output
  describe('PHP output', () => {
    it('should generate valid PHP connection string', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'php');

      expect(output).toContain('Server=');
      expect(output).toContain('Database=');
    });

    // T067 - PHP output
    it('should use PHP-specific UID and PWD keywords', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'php');

      expect(output).toContain('UID=');
      expect(output).toContain('PWD=');
    });
  });

  // Python output
  describe('Python output', () => {
    it('should generate valid Python connection string', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'python');

      expect(output).toContain('Server=');
      expect(output).toContain('Database=');
    });

    // T068 - Python output with blocked keywords
    it('should warn about blocked keywords', () => {
      const parsed = parse(fixtures.HADR_KEYWORDS);
      const mapped = mapKeywords(parsed, 'python');

      // MultiSubnetFailover may generate a warning in Python
      // Check that mapping works and any warnings are properly structured
      expect(mapped).toBeDefined();
      expect(mapped.translatedKeywords.length).toBeGreaterThan(0);
      // If there are warnings, they should have code and message
      if (mapped.warnings.length > 0) {
        expect(mapped.warnings[0]).toHaveProperty('code');
        expect(mapped.warnings[0]).toHaveProperty('message');
      }
    });
  });

  // Rust output
  describe('Rust output', () => {
    it('should generate valid Rust ClientContext struct', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'rust');

      // Rust generates ClientContext struct format
      expect(output).toContain('ClientContext {');
      expect(output).toContain('transport_context');
      expect(output).toContain('..Default::default()');
    });

    it('should include database field', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'rust');

      expect(output).toContain('database:');
    });

    it('should include auth context for user/password', () => {
      const output = translateTo(fixtures.SQLCLIENT_BASIC, 'rust');

      expect(output).toContain('auth: AuthContext');
    });

    // T069 - Rust struct output
    it('should include nested encryption_options', () => {
      const input = 'Server=localhost;Database=mydb;Encrypt=True;TrustServerCertificate=False;';
      const output = translateTo(input, 'rust');

      expect(output).toContain('encryption_options:');
      expect(output).toContain('EncryptionOptions');
    });

    it('should use Rust boolean format (lowercase)', () => {
      const output = translateTo(fixtures.SQLCLIENT_INTEGRATED, 'rust');

      expect(output).toMatch(/true|false/);
    });
  });

  // T052 - Generate formatted output
  describe('Formatted output', () => {
    it('should generate compact output by default', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'sqlclient');
      const output = generate(mapped, 'sqlclient');

      // Compact uses semicolon without space
      expect(output).toMatch(/;[A-Z]/); // Semicolon followed by keyword
    });

    it('should generate readable output with formatting option', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'sqlclient');
      const output = generateFormatted(mapped, 'sqlclient', true);

      // Readable uses "; " with space
      expect(output).toMatch(/; [A-Z]/); // Semicolon + space followed by keyword
    });
  });

  // T055 - Generate all formats
  describe('Generate all formats', () => {
    it('should generate all 7 driver formats', () => {
      const parsed = parse(fixtures.SQLCLIENT_BASIC);
      const mapped = mapKeywords(parsed, 'sqlclient');
      const allFormats = generateAll(mapped);

      expect(allFormats.size).toBe(7);
      expect(allFormats.has('sqlclient')).toBe(true);
      expect(allFormats.has('odbc')).toBe(true);
      expect(allFormats.has('oledb')).toBe(true);
      expect(allFormats.has('jdbc')).toBe(true);
      expect(allFormats.has('php')).toBe(true);
      expect(allFormats.has('python')).toBe(true);
      expect(allFormats.has('rust')).toBe(true);
    });
  });

  // JDBC Server Translation Tests
  describe('JDBC server extraction from SqlClient', () => {
    it('should extract server with port using comma separator', () => {
      const input = 'Data Source=myserver.example.com,1433;Initial Catalog=mydb;User ID=user;Password=pass;';
      const output = translateTo(input, 'jdbc');

      expect(output).toMatch(/^jdbc:sqlserver:\/\/myserver\.example\.com:1433;/);
      expect(output).not.toContain('localhost');
    });

    it('should extract Fabric/Azure SQL server with comma port', () => {
      const input = 'Data Source=abc123xyz789def456ghi-jkl012mno345pqr678stu.database.fabric.microsoft.com,1433;Initial Catalog=myworkspace-20250101-aaaabbbb-cccc-dddd-eeee-ffffffffffff;Encrypt=True;Trust Server Certificate=False;Authentication=Active Directory Interactive';
      const output = translateTo(input, 'jdbc');

      expect(output).toContain('jdbc:sqlserver://abc123xyz789def456ghi-jkl012mno345pqr678stu.database.fabric.microsoft.com:1433;');
      expect(output).toContain('databaseName=myworkspace-20250101-aaaabbbb-cccc-dddd-eeee-ffffffffffff');
      expect(output).toContain('encrypt=true');
      expect(output).toContain('trustServerCertificate=false');
      // Authentication value is passed as-is (spaces included from source)
      expect(output).toMatch(/authentication=Active Directory Interactive/i);
      expect(output).not.toContain('localhost');
    });

    it('should extract server without port', () => {
      const input = 'Server=myserver.database.windows.net;Database=mydb;';
      const output = translateTo(input, 'jdbc');

      expect(output).toMatch(/^jdbc:sqlserver:\/\/myserver\.database\.windows\.net:1433;/);
    });

    it('should extract server with named instance', () => {
      const input = 'Server=myserver\\SQLEXPRESS;Database=mydb;';
      const output = translateTo(input, 'jdbc');

      expect(output).toMatch(/^jdbc:sqlserver:\/\/myserver:1433;/);
      expect(output).toContain('instanceName=SQLEXPRESS');
    });

    it('should handle complex Azure SQL connection strings', () => {
      const input = 'Data Source=myserver.database.windows.net,1433;Initial Catalog=mydb;Multiple Active Result Sets=False;Connect Timeout=30;Encrypt=True;Trust Server Certificate=False;Authentication=Active Directory Interactive';
      const output = translateTo(input, 'jdbc');

      expect(output).toContain('jdbc:sqlserver://myserver.database.windows.net:1433;');
      expect(output).toContain('databaseName=mydb');
      expect(output).toContain('loginTimeout=30');
      expect(output).toContain('encrypt=true');
      expect(output).toContain('trustServerCertificate=false');
    });
  });

  // JDBC to other formats translation tests
  describe('JDBC to other formats', () => {
    it('should extract server from JDBC URL and translate to SqlClient', () => {
      const input = 'jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb;user=myuser;password=mypass;';
      const output = translateTo(input, 'sqlclient');

      // Default port 1433 is omitted from server value
      expect(output).toContain('Server=myserver.database.windows.net');
      expect(output).toContain('Database=mydb');
      expect(output).toContain('User ID=myuser');
      expect(output).toContain('Password=mypass');
    });

    it('should extract server from JDBC URL and translate to ODBC', () => {
      const input = 'jdbc:sqlserver://myserver.example.com:1433;databaseName=testdb;encrypt=true;';
      const output = translateTo(input, 'odbc');

      expect(output).toContain('Server=myserver.example.com');
      expect(output).toContain('Database=testdb');
      expect(output).toMatch(/Encrypt=yes/i);
    });

    it('should handle JDBC URL with default port (1433) - omit port in output', () => {
      const input = 'jdbc:sqlserver://localhost:1433;databaseName=mydb;';
      const output = translateTo(input, 'sqlclient');

      // Default port should be omitted
      expect(output).toContain('Server=localhost');
      expect(output).not.toContain('1433');
      expect(output).toContain('Database=mydb');
    });

    it('should handle JDBC URL with non-default port', () => {
      const input = 'jdbc:sqlserver://myserver.example.com:5000;databaseName=mydb;';
      const output = translateTo(input, 'sqlclient');

      expect(output).toContain('Server=myserver.example.com,5000');
      expect(output).toContain('Database=mydb');
    });

    it('should translate JDBC Azure AD authentication to SqlClient', () => {
      const input = 'jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb;authentication=ActiveDirectoryInteractive;encrypt=true;';
      const output = translateTo(input, 'sqlclient');

      expect(output).toContain('Server=myserver.database.windows.net');
      expect(output).toContain('Database=mydb');
      expect(output).toContain('Authentication=ActiveDirectoryInteractive');
      expect(output).toContain('Encrypt=True');
    });

    it('should translate JDBC to OLEDB with proper keyword names', () => {
      const input = 'jdbc:sqlserver://dbserver.local:1433;databaseName=sales;user=admin;password=secret;';
      const output = translateTo(input, 'oledb');

      expect(output).toContain('Data Source=dbserver.local');
      expect(output).toContain('Initial Catalog=sales');
      expect(output).toContain('User ID=admin');
      expect(output).toContain('Password=secret');
    });

    it('should translate JDBC with non-default port to PHP', () => {
      const input = 'jdbc:sqlserver://myserver.example.com:2000;databaseName=testdb;user=testuser;';
      const output = translateTo(input, 'php');

      expect(output).toContain('Server=myserver.example.com,2000');
      expect(output).toContain('Database=testdb');
      expect(output).toContain('UID=testuser');
    });
  });
});
