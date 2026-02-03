/**
 * Test Fixtures - Sample Connection Strings
 *
 * Provides sample connection strings for all 7 driver formats
 * for use in unit and integration tests.
 */

/** Basic SqlClient connection string */
export const SQLCLIENT_BASIC = 'Server=localhost;Database=mydb;User ID=sa;Password=pass123;';

/** SqlClient with all common options */
export const SQLCLIENT_FULL =
  'Server=myserver.database.windows.net;Database=mydb;User ID=user@myserver;Password=P@ssw0rd!;' +
  'Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;Application Name=MyApp;';

/** SqlClient with Integrated Security */
export const SQLCLIENT_INTEGRATED = 'Server=localhost;Database=mydb;Integrated Security=True;';

/** SqlClient with synonyms */
export const SQLCLIENT_SYNONYMS = 'Data Source=localhost;Initial Catalog=mydb;UID=sa;PWD=pass123;';

/** ODBC with driver specification */
export const ODBC_BASIC =
  'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=mydb;UID=sa;PWD=pass123;';

/** ODBC with trusted connection */
export const ODBC_TRUSTED =
  'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=mydb;Trusted_Connection=Yes;';

/** OLEDB with provider */
export const OLEDB_BASIC =
  'Provider=MSOLEDBSQL;Data Source=localhost;Initial Catalog=mydb;User ID=sa;Password=pass123;';

/** OLEDB with Integrated Security */
export const OLEDB_INTEGRATED =
  'Provider=MSOLEDBSQL;Data Source=localhost;Initial Catalog=mydb;Integrated Security=SSPI;';

/** JDBC URL format */
export const JDBC_BASIC = 'jdbc:sqlserver://localhost:1433;databaseName=mydb;user=sa;password=pass123;';

/** JDBC with options */
export const JDBC_FULL =
  'jdbc:sqlserver://myserver.database.windows.net:1433;' +
  'databaseName=mydb;user=user@myserver;password=P@ssw0rd!;' +
  'encrypt=true;trustServerCertificate=false;loginTimeout=30;';

/** PHP style */
export const PHP_BASIC = 'Server=localhost;Database=mydb;UID=sa;PWD=pass123;';

/** Python style */
export const PYTHON_BASIC = 'Server=localhost;Database=mydb;User=sa;Password=pass123;';

/** Quoted value with semicolon */
export const QUOTED_VALUE = 'Server=localhost;Database=mydb;Password="pass;word";User ID=sa;';

/** Braced value with semicolon */
export const BRACED_VALUE = 'Server=localhost;Database=mydb;Password={pass;word};User ID=sa;';

/** Nested braces (escaped) */
export const NESTED_BRACES = 'Server=localhost;Password={pass}}word};Database=mydb;';

/** Whitespace around delimiters */
export const WHITESPACE_DELIMITERS =
  'Server = localhost ; Database = mydb ; User ID = sa ; Password = pass123 ;';

/** Empty value */
export const EMPTY_VALUE = 'Server=localhost;Database=mydb;Password=;User ID=sa;';

/** Duplicate keywords (first occurrence wins) */
export const DUPLICATE_KEYWORDS = 'Server=first;Database=mydb;Server=second;User ID=sa;Password=pass;';

/** Unknown keyword */
export const UNKNOWN_KEYWORD =
  'Server=localhost;Database=mydb;UnknownOption=value;User ID=sa;Password=pass;';

/** Malformed - unmatched quote */
export const MALFORMED_UNMATCHED_QUOTE = 'Server=localhost;Password="pass;Database=mydb;';

/** Malformed - unmatched brace */
export const MALFORMED_UNMATCHED_BRACE = 'Server=localhost;Password={pass;Database=mydb;';

/** Azure AD Authentication */
export const AZURE_AD_PASSWORD =
  'Server=myserver.database.windows.net;Database=mydb;' +
  'Authentication=ActiveDirectoryPassword;User ID=user@domain.com;Password=pass;';

/** HADR keywords */
export const HADR_KEYWORDS =
  'Server=myserver;Database=mydb;MultiSubnetFailover=True;ApplicationIntent=ReadOnly;' +
  'User ID=sa;Password=pass;';

/** Large connection string for size limit testing */
export const LARGE_STRING =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;' + 'Extra=' + 'x'.repeat(1000) + ';';

/** Expected translations */
export const EXPECTED_TRANSLATIONS = {
  /** SQLCLIENT_BASIC → JDBC */
  sqlclientToJdbc: 'jdbc:sqlserver://localhost:1433;databaseName=mydb;user=sa;password=pass123;',

  /** JDBC_BASIC → SqlClient */
  jdbcToSqlclient: 'Server=localhost;Database=mydb;User ID=sa;Password=pass123;',

  /** SQLCLIENT_INTEGRATED → JDBC */
  integratedToJdbc: 'jdbc:sqlserver://localhost:1433;databaseName=mydb;integratedSecurity=true;',
};

/**
 * Additional Test Cases
 */

/** Pooling keywords */
export const POOLING_KEYWORDS =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;' +
  'Pooling=True;Min Pool Size=5;Max Pool Size=100;Connection Lifetime=300;';

/** All timeout types */
export const TIMEOUT_KEYWORDS =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;' +
  'Connect Timeout=30;Command Timeout=60;';

/** Multiple HADR options */
export const HADR_FULL =
  'Server=myserver;Database=mydb;User ID=sa;Password=pass;' +
  'MultiSubnetFailover=True;ApplicationIntent=ReadOnly;FailoverPartner=backup-server;';

/** Encrypt with all security options */
export const SECURITY_FULL =
  'Server=myserver.database.windows.net;Database=mydb;User ID=admin;Password=pass;' +
  'Encrypt=True;TrustServerCertificate=False;HostNameInCertificate=*.database.windows.net;';

/** Application metadata */
export const APPLICATION_METADATA =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;' +
  'Application Name=MyTestApp;Workstation ID=DEV-MACHINE-01;';

/** Azure AD with MFA */
export const AZURE_AD_INTERACTIVE =
  'Server=myserver.database.windows.net;Database=mydb;' +
  'Authentication=ActiveDirectoryInteractive;';

/** Azure AD with Managed Identity */
export const AZURE_AD_MANAGED_IDENTITY =
  'Server=myserver.database.windows.net;Database=mydb;' +
  'Authentication=ActiveDirectoryManagedIdentity;';

/** Special characters in password (quoted) */
export const SPECIAL_CHARS_QUOTED =
  'Server=localhost;Database=mydb;User ID=sa;Password="p@ss;w=rd!{}";';

/** Special characters in password (braced) */
export const SPECIAL_CHARS_BRACED =
  'Server=localhost;Database=mydb;User ID=sa;Password={p@ss;w=rd!""};';

/** IPv4 address as server */
export const IPV4_SERVER =
  'Server=192.168.1.100;Database=mydb;User ID=sa;Password=pass;';

/** IPv6 address as server */
export const IPV6_SERVER =
  'Server=[::1];Database=mydb;User ID=sa;Password=pass;';

/** Named instance */
export const NAMED_INSTANCE =
  'Server=localhost\\SQLEXPRESS;Database=mydb;User ID=sa;Password=pass;';

/** Port in server name */
export const SERVER_WITH_PORT =
  'Server=localhost,1434;Database=mydb;User ID=sa;Password=pass;';

/** Multiple Active Result Sets */
export const MARS_ENABLED =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;MultipleActiveResultSets=True;';

/** Attach database file */
export const ATTACH_DB_FILE =
  'Server=localhost;AttachDbFilename=C:\\Data\\mydb.mdf;User ID=sa;Password=pass;';

/** Replication setting */
export const REPLICATION =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Replication=True;';

/** Load Balance Timeout */
export const LOAD_BALANCE =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Load Balance Timeout=30;';

/** Packet size configuration */
export const PACKET_SIZE =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Packet Size=8192;';

/** Type system version */
export const TYPE_SYSTEM =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Type System Version=SQL Server 2012;';

/** Empty connection string */
export const EMPTY_STRING = '';

/** Whitespace only */
export const WHITESPACE_ONLY = '   \t\n  ';

/** Single keyword */
export const SINGLE_KEYWORD = 'Server=localhost';

/** No password (for testing optional fields) */
export const NO_PASSWORD = 'Server=localhost;Database=mydb;User ID=sa;';

/** Case variations */
export const CASE_VARIATIONS =
  'SERVER=localhost;DATABASE=mydb;USER ID=sa;PASSWORD=pass;ENCRYPT=true;';

// ============================================================================
// NEW SQLCLIENT V5.0+ / V5.1+ / V6.0+ KEYWORDS
// ============================================================================

/** IP Address Preference (SqlClient v5.0+) */
export const IP_ADDRESS_PREFERENCE =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;IPAddressPreference=IPv6First;';

/** Pool Blocking Period */
export const POOL_BLOCKING_PERIOD =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;PoolBlockingPeriod=NeverBlock;';

/** Attestation Protocol and Enclave URL (Always Encrypted with Secure Enclaves) */
export const ENCLAVE_ATTESTATION =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Column Encryption Setting=Enabled;Attestation Protocol=HGS;Enclave Attestation Url=https://attestation.example.com;';

/** Server Certificate (SqlClient v5.1+) */
export const SERVER_CERTIFICATE =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Encrypt=Strict;ServerCertificate=/path/to/cert.pem;';

/** Server SPN and Failover Partner SPN (SqlClient v5.0+) */
export const SERVER_SPN =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;ServerSPN=MSSQLSvc/server.domain.com:1433;FailoverPartnerSPN=MSSQLSvc/failover.domain.com:1433;';

/** User Instance (SQL Server Express) */
export const USER_INSTANCE =
  'Server=.\\SQLExpress;Database=mydb;Integrated Security=True;User Instance=True;AttachDBFilename=|DataDirectory|\\mydb.mdf;';

/** Transaction Binding */
export const TRANSACTION_BINDING =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;Transaction Binding=Explicit Unbind;';

/** Transparent Network IP Resolution */
export const TRANSPARENT_NETWORK_IP =
  'Server=localhost;Database=mydb;User ID=sa;Password=pass;TransparentNetworkIPResolution=False;';

/** Network Library */
export const NETWORK_LIBRARY =
  'Server=localhost,1433;Database=mydb;User ID=sa;Password=pass;Network Library=dbmssocn;';
