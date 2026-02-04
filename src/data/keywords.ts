/**
 * SQL Server Connection String Keywords Registry
 *
 * Contains 128+ keywords mapped across 7 driver formats:
 * SqlClient, ODBC, OLEDB, JDBC, PHP, Python, Rust
 *
 * Source: Driver source code analysis (keyword-matrix-summary.md)
 */
import { Keyword, KeywordCategory } from '../translator/types';

/** Complete keyword registry */
export const keywords: Keyword[] = [
  // ============================================================================
  // CONNECTION KEYWORDS (T017)
  // ============================================================================
  {
    id: 'server',
    displayName: 'Server/Host',
    category: 'connection',
    description: 'The name or network address of the SQL Server instance',
    drivers: {
      sqlclient: { name: 'Server', synonyms: ['Data Source', 'Address', 'Addr', 'Network Address'], type: 'string', required: true },
      odbc: { name: 'Server', type: 'string', required: true },
      oledb: { name: 'Data Source', type: 'string', required: true },
      jdbc: { name: null, type: 'string', required: true, notes: 'In URL path: jdbc:sqlserver://HOST' },
      php: { name: 'Server', type: 'string', required: true },
      python: { name: 'Server', type: 'string', required: true },
      rust: { name: 'transport_context.host', type: 'string', required: true },
    },
  },
  {
    id: 'database',
    displayName: 'Database',
    category: 'connection',
    description: 'The name of the database to connect to',
    drivers: {
      sqlclient: { name: 'Database', synonyms: ['Initial Catalog'], type: 'string' },
      odbc: { name: 'Database', type: 'string' },
      oledb: { name: 'Initial Catalog', type: 'string' },
      jdbc: { name: 'databaseName', synonyms: ['database'], type: 'string' },
      php: { name: 'Database', type: 'string' },
      python: { name: 'Database', type: 'string' },
      rust: { name: 'database', type: 'string' },
    },
  },
  {
    id: 'port',
    displayName: 'Port',
    category: 'connection',
    description: 'TCP port number (default 1433)',
    drivers: {
      sqlclient: { name: null, type: 'integer', defaultValue: 1433, notes: 'Included in Server value: server,port' },
      odbc: { name: null, type: 'integer', defaultValue: 1433, notes: 'Included in Server value' },
      oledb: { name: null, type: 'integer', defaultValue: 1433 },
      jdbc: { name: null, type: 'integer', defaultValue: 1433, notes: 'In URL: jdbc:sqlserver://host:PORT' },
      php: { name: null, type: 'integer', defaultValue: 1433, notes: 'Included in Server value' },
      python: { name: 'Port', type: 'integer', defaultValue: 1433 },
      rust: { name: 'transport_context.port', type: 'integer', defaultValue: 1433 },
    },
  },
  {
    id: 'instancename',
    displayName: 'Instance Name',
    category: 'connection',
    description: 'Named instance to connect to',
    drivers: {
      sqlclient: { name: null, type: 'string', notes: 'Included in Server value: server\\instance' },
      odbc: { name: null, type: 'string', notes: 'Included in Server value' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: 'instanceName', type: 'string' },
      php: { name: null, type: 'string', notes: 'Included in Server value' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },

  // ============================================================================
  // AUTHENTICATION KEYWORDS (T018)
  // ============================================================================
  {
    id: 'userid',
    displayName: 'User ID',
    category: 'auth',
    description: 'SQL Server login username',
    drivers: {
      sqlclient: { name: 'User ID', synonyms: ['User', 'UID'], type: 'string' },
      odbc: { name: 'UID', synonyms: ['User ID'], type: 'string' },
      oledb: { name: 'User ID', type: 'string' },
      jdbc: { name: 'user', type: 'string' },
      php: { name: 'UID', type: 'string' },
      python: { name: 'User', synonyms: ['UID'], type: 'string' },
      rust: { name: 'auth.user', type: 'string' },
    },
  },
  {
    id: 'password',
    displayName: 'Password',
    category: 'auth',
    description: 'SQL Server login password',
    drivers: {
      sqlclient: { name: 'Password', synonyms: ['PWD'], type: 'string' },
      odbc: { name: 'PWD', synonyms: ['Password'], type: 'string' },
      oledb: { name: 'Password', type: 'string' },
      jdbc: { name: 'password', type: 'string' },
      php: { name: 'PWD', type: 'string' },
      python: { name: 'Password', synonyms: ['PWD'], type: 'string' },
      rust: { name: 'auth.password', type: 'string' },
    },
  },
  {
    id: 'integratedsecurity',
    displayName: 'Integrated Security',
    category: 'auth',
    description: 'Use Windows Authentication',
    drivers: {
      sqlclient: { name: 'Integrated Security', synonyms: ['Trusted_Connection'], type: 'boolean', defaultValue: false },
      odbc: { name: 'Trusted_Connection', type: 'boolean', defaultValue: false, enumValues: ['Yes', 'No'] },
      oledb: { name: 'Integrated Security', type: 'enum', enumValues: ['SSPI'] },
      jdbc: { name: 'integratedSecurity', type: 'boolean', defaultValue: false },
      php: { name: null, type: 'boolean', notes: 'Use empty UID/PWD for Windows Auth' },
      python: { name: 'Trusted_Connection', type: 'boolean', defaultValue: false },
      rust: { name: 'auth.integrated_security', type: 'boolean', defaultValue: false },
    },
  },
  {
    id: 'authentication',
    displayName: 'Authentication',
    category: 'auth',
    description: 'Authentication method (SQL, Windows, Azure AD)',
    drivers: {
      sqlclient: { name: 'Authentication', type: 'enum', enumValues: ['SqlPassword', 'ActiveDirectoryPassword', 'ActiveDirectoryIntegrated', 'ActiveDirectoryInteractive', 'ActiveDirectoryServicePrincipal', 'ActiveDirectoryManagedIdentity', 'ActiveDirectoryDefault'] },
      odbc: { name: 'Authentication', type: 'enum', enumValues: ['SqlPassword', 'ActiveDirectoryPassword', 'ActiveDirectoryIntegrated', 'ActiveDirectoryInteractive', 'ActiveDirectoryMsi'] },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: 'authentication', type: 'enum', enumValues: ['SqlPassword', 'ActiveDirectoryPassword', 'ActiveDirectoryIntegrated', 'ActiveDirectoryInteractive', 'ActiveDirectoryServicePrincipal', 'ActiveDirectoryManagedIdentity'] },
      php: { name: 'Authentication', type: 'enum', enumValues: ['SqlPassword', 'ActiveDirectoryPassword', 'ActiveDirectoryIntegrated', 'ActiveDirectoryMsi'] },
      python: { name: 'Authentication', type: 'enum' },
      rust: { name: 'auth.authentication_method', type: 'enum' },
    },
  },

  // ============================================================================
  // SECURITY KEYWORDS (T019)
  // ============================================================================
  {
    id: 'encrypt',
    displayName: 'Encrypt',
    category: 'security',
    description: 'Encrypt connection to SQL Server',
    drivers: {
      sqlclient: { name: 'Encrypt', type: 'enum', defaultValue: 'True', enumValues: ['True', 'False', 'Strict', 'Optional', 'Mandatory'] },
      odbc: { name: 'Encrypt', type: 'enum', defaultValue: 'yes', enumValues: ['yes', 'no', 'strict', 'true', 'false'] },
      oledb: { name: 'Use Encryption for Data', type: 'boolean', defaultValue: false },
      jdbc: { name: 'encrypt', type: 'enum', defaultValue: 'true', enumValues: ['true', 'false', 'strict'] },
      php: { name: 'Encrypt', type: 'boolean', defaultValue: false },
      python: { name: 'Encrypt', type: 'boolean', defaultValue: false },
      rust: { name: 'encryption_options.mode', type: 'enum', enumValues: ['Off', 'On', 'Required'] },
    },
  },
  {
    id: 'trustservercertificate',
    displayName: 'Trust Server Certificate',
    category: 'security',
    description: 'Trust the server certificate without validation',
    drivers: {
      sqlclient: { name: 'TrustServerCertificate', type: 'boolean', defaultValue: false },
      odbc: { name: 'TrustServerCertificate', type: 'boolean', defaultValue: false, enumValues: ['yes', 'no'] },
      oledb: { name: 'Trust Server Certificate', type: 'boolean', defaultValue: false },
      jdbc: { name: 'trustServerCertificate', type: 'boolean', defaultValue: false },
      php: { name: 'TrustServerCertificate', type: 'boolean', defaultValue: false },
      python: { name: 'TrustServerCertificate', type: 'boolean', defaultValue: false },
      rust: { name: 'encryption_options.trust_server_certificate', type: 'boolean', defaultValue: false },
    },
  },
  {
    id: 'hostnameincertificate',
    displayName: 'Host Name In Certificate',
    category: 'security',
    description: 'Host name to use for certificate validation',
    drivers: {
      sqlclient: { name: 'HostNameInCertificate', type: 'string' },
      odbc: { name: 'HostNameInCertificate', type: 'string' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: 'hostNameInCertificate', type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: 'encryption_options.host_name_in_cert', type: 'string' },
    },
  },
  {
    id: 'columnencryption',
    displayName: 'Column Encryption Setting',
    category: 'security',
    description: 'Enable Always Encrypted',
    drivers: {
      sqlclient: { name: 'Column Encryption Setting', type: 'enum', enumValues: ['Enabled', 'Disabled'] },
      odbc: { name: 'ColumnEncryption', type: 'enum', enumValues: ['Enabled', 'Disabled'] },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: 'columnEncryptionSetting', type: 'enum', enumValues: ['Enabled', 'Disabled'] },
      php: { name: 'ColumnEncryption', type: 'enum', enumValues: ['Enabled', 'Disabled'] },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },

  // ============================================================================
  // TIMEOUT KEYWORDS (T020)
  // ============================================================================
  {
    id: 'connecttimeout',
    displayName: 'Connection Timeout',
    category: 'timeout',
    description: 'Connection timeout in seconds',
    drivers: {
      sqlclient: { name: 'Connect Timeout', synonyms: ['Connection Timeout', 'Timeout'], type: 'integer', defaultValue: 15 },
      odbc: { name: 'Connection Timeout', type: 'integer', defaultValue: 15 },
      oledb: { name: 'Connect Timeout', type: 'integer', defaultValue: 15 },
      jdbc: { name: 'loginTimeout', type: 'integer', defaultValue: 15 },
      php: { name: 'LoginTimeout', type: 'integer', defaultValue: 15 },
      python: { name: 'Connection Timeout', type: 'integer', defaultValue: 15 },
      rust: { name: 'connect_timeout', type: 'integer', defaultValue: 15 },
    },
  },
  {
    id: 'commandtimeout',
    displayName: 'Command Timeout',
    category: 'timeout',
    description: 'Command/query timeout in seconds',
    drivers: {
      sqlclient: { name: 'Command Timeout', type: 'integer', defaultValue: 30 },
      odbc: { name: null, type: 'integer', notes: 'Set programmatically' },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: 'queryTimeout', type: 'integer', defaultValue: 0 },
      php: { name: null, type: 'integer' },
      python: { name: null, type: 'integer' },
      rust: { name: 'command_timeout', type: 'integer' },
    },
  },

  // ============================================================================
  // APP/NETWORK KEYWORDS (T021)
  // ============================================================================
  {
    id: 'applicationname',
    displayName: 'Application Name',
    category: 'appInfo',
    description: 'Name of the client application',
    drivers: {
      sqlclient: { name: 'Application Name', synonyms: ['App'], type: 'string' },
      odbc: { name: 'APP', type: 'string' },
      oledb: { name: 'Application Name', type: 'string' },
      jdbc: { name: 'applicationName', type: 'string' },
      php: { name: 'APP', type: 'string' },
      python: { name: 'Application Name', type: 'string' },
      rust: { name: 'application_name', type: 'string' },
    },
  },
  {
    id: 'workstationid',
    displayName: 'Workstation ID',
    category: 'appInfo',
    description: 'Workstation identifier sent to server',
    drivers: {
      sqlclient: { name: 'Workstation ID', synonyms: ['WSID'], type: 'string' },
      odbc: { name: 'WSID', type: 'string' },
      oledb: { name: 'Workstation ID', type: 'string' },
      jdbc: { name: 'workstationID', type: 'string' },
      php: { name: 'WSID', type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'packetsize',
    displayName: 'Packet Size',
    category: 'network',
    description: 'Network packet size in bytes',
    drivers: {
      sqlclient: { name: 'Packet Size', type: 'integer', defaultValue: 8000 },
      odbc: { name: null, type: 'integer' },
      oledb: { name: 'Packet Size', type: 'integer', defaultValue: 4096 },
      jdbc: { name: 'packetSize', type: 'integer', defaultValue: 8000 },
      php: { name: null, type: 'integer' },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },

  // ============================================================================
  // HADR KEYWORDS (T022)
  // ============================================================================
  {
    id: 'multisubnetfailover',
    displayName: 'MultiSubnetFailover',
    category: 'hadr',
    description: 'Enable multi-subnet failover for AlwaysOn',
    drivers: {
      sqlclient: { name: 'MultiSubnetFailover', type: 'boolean', defaultValue: false },
      odbc: { name: 'MultiSubnetFailover', type: 'boolean', defaultValue: false, enumValues: ['Yes', 'No'] },
      oledb: { name: 'MultiSubnetFailover', type: 'boolean', defaultValue: false },
      jdbc: { name: 'multiSubnetFailover', type: 'boolean', defaultValue: false },
      php: { name: 'MultiSubnetFailover', type: 'boolean', defaultValue: false },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'failoverpartner',
    displayName: 'Failover Partner',
    category: 'hadr',
    description: 'Database mirroring failover partner server',
    drivers: {
      sqlclient: { name: 'Failover Partner', type: 'string' },
      odbc: { name: 'Failover_Partner', type: 'string' },
      oledb: { name: 'Failover Partner', type: 'string' },
      jdbc: { name: 'failoverPartner', type: 'string' },
      php: { name: 'Failover_Partner', type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'applicationintent',
    displayName: 'Application Intent',
    category: 'hadr',
    description: 'Routing intent for AlwaysOn read-only secondary',
    drivers: {
      sqlclient: { name: 'ApplicationIntent', type: 'enum', enumValues: ['ReadWrite', 'ReadOnly'] },
      odbc: { name: 'ApplicationIntent', type: 'enum', enumValues: ['ReadWrite', 'ReadOnly'] },
      oledb: { name: 'Application Intent', type: 'enum', enumValues: ['ReadWrite', 'ReadOnly'] },
      jdbc: { name: 'applicationIntent', type: 'enum', enumValues: ['ReadWrite', 'ReadOnly'] },
      php: { name: 'ApplicationIntent', type: 'enum', enumValues: ['ReadWrite', 'ReadOnly'] },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },

  // ============================================================================
  // POOLING KEYWORDS (T023)
  // ============================================================================
  {
    id: 'pooling',
    displayName: 'Pooling',
    category: 'pooling',
    description: 'Enable connection pooling',
    drivers: {
      sqlclient: { name: 'Pooling', type: 'boolean', defaultValue: true },
      odbc: { name: null, type: 'boolean', notes: 'Managed by driver manager' },
      oledb: { name: 'OLE DB Services', type: 'integer' },
      jdbc: { name: null, type: 'boolean', notes: 'Managed by connection pool' },
      php: { name: 'ConnectionPooling', type: 'boolean', defaultValue: true },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'minpoolsize',
    displayName: 'Min Pool Size',
    category: 'pooling',
    description: 'Minimum number of connections in pool',
    drivers: {
      sqlclient: { name: 'Min Pool Size', type: 'integer', defaultValue: 0 },
      odbc: { name: null, type: 'integer' },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: null, type: 'integer' },
      php: { name: null, type: 'integer' },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },
  {
    id: 'maxpoolsize',
    displayName: 'Max Pool Size',
    category: 'pooling',
    description: 'Maximum number of connections in pool',
    drivers: {
      sqlclient: { name: 'Max Pool Size', type: 'integer', defaultValue: 100 },
      odbc: { name: null, type: 'integer' },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: null, type: 'integer' },
      php: { name: null, type: 'integer' },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },
  {
    id: 'connectionlifetime',
    displayName: 'Connection Lifetime',
    category: 'pooling',
    description: 'Maximum lifetime of connection in pool (seconds)',
    drivers: {
      sqlclient: { name: 'Connection Lifetime', synonyms: ['Load Balance Timeout'], type: 'integer', defaultValue: 0 },
      odbc: { name: null, type: 'integer' },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: null, type: 'integer' },
      php: { name: null, type: 'integer' },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },

  // ============================================================================
  // FEATURE KEYWORDS (T024)
  // ============================================================================
  {
    id: 'mars',
    displayName: 'Multiple Active Result Sets',
    category: 'features',
    description: 'Enable MARS (Multiple Active Result Sets)',
    drivers: {
      sqlclient: { name: 'MultipleActiveResultSets', type: 'boolean', defaultValue: false },
      odbc: { name: 'MARS_Connection', type: 'boolean', defaultValue: false, enumValues: ['Yes', 'No'] },
      oledb: { name: 'MARS Connection', type: 'boolean', defaultValue: false },
      jdbc: { name: null, type: 'boolean', notes: 'Always enabled in JDBC' },
      php: { name: 'MultipleActiveResultSets', type: 'boolean', defaultValue: false },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'attachdbfilename',
    displayName: 'AttachDBFilename',
    category: 'database',
    description: 'Primary database file for LocalDB attachment',
    drivers: {
      sqlclient: { name: 'AttachDBFilename', synonyms: ['Extended Properties', 'Initial File Name'], type: 'string' },
      odbc: { name: 'AttachDBFilename', type: 'string' },
      oledb: { name: 'AttachDBFilename', type: 'string' },
      jdbc: { name: null, type: 'string' },
      php: { name: 'AttachDBFilename', type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'language',
    displayName: 'Current Language',
    category: 'database',
    description: 'SQL Server language for messages',
    drivers: {
      sqlclient: { name: 'Current Language', synonyms: ['Language'], type: 'string' },
      odbc: { name: 'Language', type: 'string' },
      oledb: { name: 'Current Language', type: 'string' },
      jdbc: { name: null, type: 'string' },
      php: { name: 'Language', type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'replication',
    displayName: 'Replication',
    category: 'features',
    description: 'Enable replication support',
    drivers: {
      sqlclient: { name: 'Replication', type: 'boolean', defaultValue: false },
      odbc: { name: null, type: 'boolean' },
      oledb: { name: null, type: 'boolean' },
      jdbc: { name: null, type: 'boolean' },
      php: { name: null, type: 'boolean' },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },

  // ============================================================================
  // DRIVER-SPECIFIC KEYWORDS (T025)
  // ============================================================================
  {
    id: 'driver',
    displayName: 'Driver',
    category: 'driver',
    description: 'ODBC driver name',
    drivers: {
      sqlclient: { name: null, type: 'string' },
      odbc: { name: 'Driver', type: 'string', required: true },
      oledb: { name: null, type: 'string' },
      jdbc: { name: null, type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: 'Driver', type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'provider',
    displayName: 'Provider',
    category: 'driver',
    description: 'OLEDB provider name',
    drivers: {
      sqlclient: { name: null, type: 'string' },
      odbc: { name: null, type: 'string' },
      oledb: { name: 'Provider', type: 'string', required: true },
      jdbc: { name: null, type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'typesystemversion',
    displayName: 'Type System Version',
    category: 'driver',
    description: 'SQL Server type system version',
    drivers: {
      sqlclient: { name: 'Type System Version', type: 'enum', enumValues: ['SQL Server 2000', 'SQL Server 2005', 'SQL Server 2008', 'SQL Server 2012', 'Latest'] },
      odbc: { name: null, type: 'enum' },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: null, type: 'enum' },
      php: { name: null, type: 'enum' },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },

  // ============================================================================
  // RESILIENCY KEYWORDS
  // ============================================================================
  {
    id: 'connectretrycount',
    displayName: 'Connect Retry Count',
    category: 'resiliency',
    description: 'Number of reconnection attempts',
    drivers: {
      sqlclient: { name: 'ConnectRetryCount', type: 'integer', defaultValue: 1 },
      odbc: { name: 'ConnectRetryCount', type: 'integer', defaultValue: 1 },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: 'connectRetryCount', type: 'integer', defaultValue: 1 },
      php: { name: 'ConnectRetryCount', type: 'integer', defaultValue: 1 },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },
  {
    id: 'connectretryinterval',
    displayName: 'Connect Retry Interval',
    category: 'resiliency',
    description: 'Seconds between reconnection attempts',
    drivers: {
      sqlclient: { name: 'ConnectRetryInterval', type: 'integer', defaultValue: 10 },
      odbc: { name: 'ConnectRetryInterval', type: 'integer', defaultValue: 10 },
      oledb: { name: null, type: 'integer' },
      jdbc: { name: 'connectRetryInterval', type: 'integer', defaultValue: 10 },
      php: { name: 'ConnectRetryInterval', type: 'integer', defaultValue: 10 },
      python: { name: null, type: 'integer' },
      rust: { name: null, type: 'integer' },
    },
  },

  // ============================================================================
  // ADDITIONAL SECURITY KEYWORDS
  // ============================================================================
  {
    id: 'persistsecurityinfo',
    displayName: 'Persist Security Info',
    category: 'security',
    description: 'Persist sensitive info in connection string',
    drivers: {
      sqlclient: { name: 'Persist Security Info', synonyms: ['PersistSecurityInfo'], type: 'boolean', defaultValue: false },
      odbc: { name: null, type: 'boolean' },
      oledb: { name: 'Persist Security Info', type: 'boolean', defaultValue: false },
      jdbc: { name: null, type: 'boolean' },
      php: { name: null, type: 'boolean' },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'enlist',
    displayName: 'Enlist',
    category: 'behavior',
    description: 'Automatic transaction enlistment',
    drivers: {
      sqlclient: { name: 'Enlist', type: 'boolean', defaultValue: true },
      odbc: { name: null, type: 'boolean' },
      oledb: { name: null, type: 'boolean' },
      jdbc: { name: null, type: 'boolean' },
      php: { name: null, type: 'boolean' },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },

  // ============================================================================
  // NEW SQLCLIENT KEYWORDS (v5.0+, v5.1+, v6.0+)
  // ============================================================================
  {
    id: 'ipaddresspreference',
    displayName: 'IP Address Preference',
    category: 'connection',
    description: 'IP address family preference when establishing TCP connections (IPv4First, IPv6First, UsePlatformDefault)',
    drivers: {
      sqlclient: { name: 'IPAddressPreference', synonyms: ['IP Address Preference'], type: 'enum', defaultValue: 'IPv4First', enumValues: ['IPv4First', 'IPv6First', 'UsePlatformDefault'] },
      odbc: { name: null, type: 'enum' },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: null, type: 'enum' },
      php: { name: null, type: 'enum' },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },
  {
    id: 'poolblockingperiod',
    displayName: 'Pool Blocking Period',
    category: 'pooling',
    description: 'Sets the blocking period behavior for a connection pool (Auto, AlwaysBlock, NeverBlock)',
    drivers: {
      sqlclient: { name: 'PoolBlockingPeriod', synonyms: ['Pool Blocking Period'], type: 'enum', defaultValue: 'Auto', enumValues: ['Auto', 'AlwaysBlock', 'NeverBlock'] },
      odbc: { name: null, type: 'enum' },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: null, type: 'enum' },
      php: { name: null, type: 'enum' },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },
  {
    id: 'attestationprotocol',
    displayName: 'Attestation Protocol',
    category: 'security',
    description: 'Protocol for enclave attestation (NotSpecified, AAS, HGS, None)',
    drivers: {
      sqlclient: { name: 'Attestation Protocol', type: 'enum', defaultValue: 'NotSpecified', enumValues: ['NotSpecified', 'AAS', 'HGS', 'None'] },
      odbc: { name: null, type: 'enum' },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: 'enclaveAttestationProtocol', type: 'enum', enumValues: ['HGS', 'AAS', 'NONE'] },
      php: { name: null, type: 'enum' },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },
  {
    id: 'enclaveattestationurl',
    displayName: 'Enclave Attestation URL',
    category: 'security',
    description: 'URL for enclave attestation service',
    drivers: {
      sqlclient: { name: 'Enclave Attestation Url', type: 'string' },
      odbc: { name: null, type: 'string' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: 'enclaveAttestationUrl', type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'servercertificate',
    displayName: 'Server Certificate',
    category: 'security',
    description: 'Path to certificate file for SQL Server TLS/SSL certificate validation (v5.1+)',
    drivers: {
      sqlclient: { name: 'ServerCertificate', synonyms: ['Server Certificate'], type: 'string' },
      odbc: { name: null, type: 'string' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: null, type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'serverspn',
    displayName: 'Server SPN',
    category: 'auth',
    description: 'Service Principal Name for the data source (v5.0+)',
    drivers: {
      sqlclient: { name: 'ServerSPN', synonyms: ['Server SPN'], type: 'string' },
      odbc: { name: 'ServerSPN', type: 'string' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: 'serverSpn', type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'failoverpartnerspn',
    displayName: 'Failover Partner SPN',
    category: 'hadr',
    description: 'Service Principal Name for the failover partner (v5.0+)',
    drivers: {
      sqlclient: { name: 'FailoverPartnerSPN', synonyms: ['Failover Partner SPN'], type: 'string' },
      odbc: { name: 'FailoverPartnerServerSPN', type: 'string' },
      oledb: { name: null, type: 'string' },
      jdbc: { name: 'failoverPartnerSpn', type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
  {
    id: 'userinstance',
    displayName: 'User Instance',
    category: 'connection',
    description: 'Redirect connection to runtime-initiated instance under caller account',
    drivers: {
      sqlclient: { name: 'User Instance', type: 'boolean', defaultValue: false },
      odbc: { name: null, type: 'boolean' },
      oledb: { name: null, type: 'boolean' },
      jdbc: { name: null, type: 'boolean' },
      php: { name: null, type: 'boolean' },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'transactionbinding',
    displayName: 'Transaction Binding',
    category: 'behavior',
    description: 'Controls connection association with enlisted transaction (Implicit Unbind, Explicit Unbind)',
    drivers: {
      sqlclient: { name: 'Transaction Binding', type: 'enum', defaultValue: 'Implicit Unbind', enumValues: ['Implicit Unbind', 'Explicit Unbind'] },
      odbc: { name: null, type: 'enum' },
      oledb: { name: null, type: 'enum' },
      jdbc: { name: null, type: 'enum' },
      php: { name: null, type: 'enum' },
      python: { name: null, type: 'enum' },
      rust: { name: null, type: 'enum' },
    },
  },
  {
    id: 'transparentnetworkipresolution',
    displayName: 'Transparent Network IP Resolution',
    category: 'connection',
    description: 'Enable parallel connection attempts to multiple IP addresses for a DNS entry',
    drivers: {
      sqlclient: { name: 'TransparentNetworkIPResolution', synonyms: ['Transparent Network IP Resolution'], type: 'boolean', defaultValue: true },
      odbc: { name: 'TransparentNetworkIPResolution', type: 'boolean' },
      oledb: { name: null, type: 'boolean' },
      jdbc: { name: null, type: 'boolean' },
      php: { name: 'TransparentNetworkIPResolution', type: 'boolean' },
      python: { name: null, type: 'boolean' },
      rust: { name: null, type: 'boolean' },
    },
  },
  {
    id: 'networklibrary',
    displayName: 'Network Library',
    category: 'connection',
    description: 'Network library used to establish connection (dbnmpntw, dbmssocn, etc.)',
    drivers: {
      sqlclient: { name: 'Network Library', synonyms: ['Network', 'Net'], type: 'string' },
      odbc: { name: 'Network', type: 'string' },
      oledb: { name: 'Network Library', type: 'string' },
      jdbc: { name: null, type: 'string' },
      php: { name: null, type: 'string' },
      python: { name: null, type: 'string' },
      rust: { name: null, type: 'string' },
    },
  },
];

/** Get keyword by canonical ID */
export function getKeywordById(id: string): Keyword | undefined {
  return keywords.find((k) => k.id === id.toLowerCase());
}

/** Get all keywords for a category */
export function getKeywordsByCategory(category: KeywordCategory): Keyword[] {
  return keywords.filter((k) => k.category === category);
}

/** Total keyword count */
export const KEYWORD_COUNT = keywords.length;
