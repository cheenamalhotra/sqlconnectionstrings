# SQL Server Driver Connection String Keyword Mapping

**Created**: 2026-01-29  
**Last Updated**: 2026-01-29 (Source Code Review via Bluebird MCP)  
**Purpose**: Comprehensive mapping of connection string keywords across all 7 supported SQL Server drivers  
**Source**: Microsoft Learn Documentation + Driver Source Code

> **Source Code Verified**: All keywords verified against actual driver source repositories:
> - SqlClient: `dotnet/SqlClient` (DbConnectionStringKeywords.cs, DbConnectionStringSynonyms.cs)
> - ODBC: `microsoft/msodbc` (sqlcconn.cpp)
> - JDBC: `microsoft/mssql-jdbc` (fxSqlServerDriver.java)
> - PHP: `microsoft/msphpsql` (conn.cpp, shared_constants.h)
> - Python: `microsoft/mssql-python` (constants.py)
> - Rust: `mssql-tds` (client_context.rs, core.rs)

---

## Table of Contents

1. [Quick Reference Matrix](#quick-reference-matrix)
2. [Connection String Format Summary](#connection-string-format-summary)
3. [Case Sensitivity Rules](#case-sensitivity-rules)
4. [Core Keywords Mapping](#core-keywords-mapping)
5. [Extended Keywords Matrix](#extended-keywords-matrix)
6. [Driver-Specific Details](#driver-specific-details)
7. [Special Character Escaping Rules](#special-character-escaping-rules)
8. [Authentication Methods](#authentication-methods)

---

## Quick Reference Matrix

### Keywords × Drivers Comparison Table

This matrix shows the primary keyword for each driver. All keywords are **case-insensitive** for comparison purposes (except Rust struct fields which are fixed).

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust (mssql-tds) |
|---------|-----------|------|-------|------|-----|--------|------------------|
| **Server/Host** | `Server`¹ | `Server` | `Data Source`¹ | URL: `//host:port` | `Server` | `Server` | `transport_context.host` |
| **Port** | In Server string | In Server string | In Data Source | URL: `:port` | In Server string | In Server string | `transport_context.port` |
| **Database** | `Database`² | `Database` | `Initial Catalog`² | `databaseName` | `Database` | `Database` | `database` |
| **User ID** | `User ID`³ | `UID`³ | `User ID`³ | `user` | `UID` | `UID`³ | `user_name` |
| **Password** | `Password`⁴ | `PWD`⁴ | `Password`⁴ | `password` | `PWD` | `PWD`⁴ | `password` |
| **Integrated Security** | `Integrated Security`⁵ | `Trusted_Connection` | `Integrated Security`⁵ | `integratedSecurity` | `Trusted_Connection` | `Trusted_Connection` | `tds_authentication_method` |
| **Encrypt** | `Encrypt` | `Encrypt` | `Use Encryption for Data`⁶ | `encrypt` | `Encrypt` | `Encrypt` | `encryption_options.mode` |
| **Trust Server Cert** | `TrustServerCertificate` | `TrustServerCertificate` | `Trust Server Certificate`⁷ | `trustServerCertificate` | `TrustServerCertificate` | `TrustServerCertificate` | `encryption_options.trust_server_certificate` |
| **Connection Timeout** | `Connect Timeout`⁸ | `Connection Timeout` | `Connect Timeout` | `loginTimeout` | `LoginTimeout` | N/A* | `connect_timeout` |
| **Application Name** | `Application Name`⁹ | `APP`⁹ | `Application Name` | `applicationName` | `APP` | `APP`⁹ | `application_name` |
| **Application Intent** | `ApplicationIntent` | `ApplicationIntent` | `Application Intent` | `applicationIntent` | `ApplicationIntent` | `ApplicationIntent` | `application_intent` |
| **MARS** | `MultipleActiveResultSets` | `MARS_Connection` | `MARS Connection`¹⁰ | *(always on)* | `MultipleActiveResultSets` | N/A* | `mars_enabled` |
| **Packet Size** | `Packet Size` | `PacketSize` | `Packet Size` | `packetSize` | *(N/A)* | `PacketSize` | `packet_size` |
| **Failover Partner** | `Failover Partner` | `Failover_Partner` | `Failover Partner` | `failoverPartner` | `Failover_Partner` | N/A* | `failover_partner` |
| **MultiSubnetFailover** | `MultiSubnetFailover` | `MultiSubnetFailover` | `MultiSubnetFailover` | `multiSubnetFailover` | `MultiSubnetFailover` | `MultiSubnetFailover` | *(N/A)* |

> **Python (*)**: mssql-python uses a restricted allowlist. Many common keywords are blocked.

**Synonyms**:
- ¹ Server: `Server`, `Data Source`, `Address`, `Addr`, `Network Address`
- ² Database: `Database`, `Initial Catalog`
- ³ User ID: `User ID`, `UID`, `User`
- ⁴ Password: `Password`, `PWD`
- ⁵ Integrated Security: `Integrated Security`, `Trusted_Connection`
- ⁶ OLEDB Encrypt: `Use Encryption for Data`, `Encrypt`
- ⁷ OLEDB Trust Cert: `Trust Server Certificate`, `TrustServerCertificate`
- ⁸ Timeout: `Connect Timeout`, `Connection Timeout`, `Timeout`
- ⁹ App Name: `Application Name`, `App`, `APP`
- ¹⁰ OLEDB MARS: `MARS Connection`, `MarsConn`

### Boolean Values Comparison

| Driver | True Values | False Values | Notes |
|--------|-------------|--------------|-------|
| SqlClient | `True`, `Yes`, `1` | `False`, `No`, `0` | Case-insensitive |
| ODBC | `Yes`, `1` | `No`, `0` | Case-insensitive |
| OLEDB | `True`, `Yes`, `1`, `SSPI`* | `False`, `No`, `0` | Case-insensitive |
| JDBC | `true` | `false` | Case-insensitive |
| PHP | `true`, `1`, `"1"` | `false`, `0`, `"0"` | PHP boolean or numeric |
| Python | `Yes`, `1` | `No`, `0` | ODBC-style, case-insensitive |
| Rust | `true` | `false` | Rust boolean literal |

*SSPI is used specifically for Integrated Security

---

## Case Sensitivity Rules

### Keywords (Property Names)

| Driver | Case Sensitivity | Notes |
|--------|-----------------|-------|
| SqlClient | **Case-insensitive** | `Server` = `server` = `SERVER` |
| ODBC | **Case-insensitive** | `UID` = `uid` = `Uid` |
| OLEDB | **Case-insensitive** | `Data Source` = `data source` |
| JDBC | **Case-insensitive** | `databaseName` = `DATABASENAME` |
| PHP | **Case-insensitive** | `Database` = `database` |
| Python | **Case-insensitive** | Uses ODBC rules |
| Rust | **Case-sensitive** | Struct fields must match exactly: `database`, `password` |

### Values

| Driver | Case Sensitivity | Notes |
|--------|-----------------|-------|
| SqlClient | **Case-insensitive** for booleans/keywords; **Case-sensitive** for passwords/names | `True` = `true`; passwords are verbatim |
| ODBC | **Case-insensitive** for booleans/keywords; **Case-sensitive** for passwords/names | `Yes` = `yes` |
| OLEDB | **Case-insensitive** for booleans/keywords; **Case-sensitive** for passwords/names | `Mandatory` = `mandatory` |
| JDBC | **Case-insensitive** for booleans/keywords; **Case-sensitive** for passwords/names | `true` = `TRUE` |
| PHP | **Case-insensitive** for booleans; **Case-sensitive** for passwords/names | PHP type coercion applies |
| Python | **Case-insensitive** for booleans/keywords; **Case-sensitive** for passwords/names | ODBC rules apply |
| Rust | **Case-sensitive** | Enum variants must match exactly: `EncryptionSetting::Strict` |

> **Implementation Note**: When translating between drivers, normalize keywords to lowercase for comparison, then output in the target driver's conventional casing (e.g., camelCase for JDBC, PascalCase for SqlClient).

---

## Connection String Format Summary

| Driver | Format Pattern | Example |
|--------|---------------|---------|
| **SqlClient** | `Keyword=Value;Keyword2=Value2;` | `Server=myserver;Database=mydb;User ID=user;Password=pass;` |
| **ODBC** | `Driver={...};Keyword=Value;` | `Driver={ODBC Driver 18 for SQL Server};Server=myserver;Database=mydb;UID=user;PWD=pass;` |
| **OLEDB** | `Provider=...;Keyword=Value;` | `Provider=MSOLEDBSQL19;Data Source=myserver;Initial Catalog=mydb;User ID=user;Password=pass;` |
| **JDBC** | `jdbc:sqlserver://server:port;prop=val;` | `jdbc:sqlserver://myserver:1433;databaseName=mydb;user=user;password=pass;` |
| **PHP** | `sqlsrv_connect($server, array(...))` | `sqlsrv_connect("myserver", array("Database"=>"mydb", "UID"=>"user", "PWD"=>"pass"))` |
| **Python** | ODBC-style or `mssql-python.connect()` | `Server=myserver;Database=mydb;UID=user;PWD=pass;Encrypt=yes;` |
| **Rust (mssql-tds)** | ClientContext struct builder | `ClientContext { transport_context: TransportContext::Tcp { host: "myserver", port: 1433 }, database: "mydb", ... }` |

---

## Core Keywords Mapping

### Server / Host

| Driver | Keyword(s) | Notes |
|--------|-----------|-------|
| SqlClient | `Server`, `Data Source`, `Address`, `Addr`, `Network Address` | All synonyms |
| ODBC | `Server`, `Addr`, `Address`, `Network Address` | - |
| OLEDB | `Data Source`, `Server`, `Address`, `Addr`, `Network Address` | - |
| JDBC | URL path: `//server:port` or `serverName` property | Port default: 1433 |
| PHP | `Server` (first parameter to sqlsrv_connect) | Format: `server\instance,port` |
| Python | `Server` | Via ODBC connection string |
| Rust | `transport_context: TransportContext::Tcp { host, port }` | Struct field with TransportContext enum |

### Database

| Driver | Keyword(s) | Notes |
|--------|-----------|-------|
| SqlClient | `Database`, `Initial Catalog` | Synonyms |
| ODBC | `Database` | - |
| OLEDB | `Initial Catalog`, `Database` | - |
| JDBC | `databaseName` | In connection properties |
| PHP | `Database` | Array key |
| Python | `Database` | - |
| Rust | `database` | Struct field (String) |

### User ID / Username

| Driver | Keyword(s) | Notes |
|--------|-----------|-------|
| SqlClient | `User ID`, `UID`, `User` | Synonyms |
| ODBC | `UID`, `User ID` | - |
| OLEDB | `User ID`, `UID` | - |
| JDBC | `user` | Lowercase |
| PHP | `UID` | Array key |
| Python | `UID`, `User ID` | - |
| Rust | `user_name` | Struct field (String) |

### Password

| Driver | Keyword(s) | Notes |
|--------|-----------|-------|
| SqlClient | `Password`, `PWD` | Synonyms |
| ODBC | `PWD`, `Password` | - |
| OLEDB | `Password`, `PWD` | - |
| JDBC | `password` | Lowercase |
| PHP | `PWD` | Array key |
| Python | `PWD`, `Password` | - |
| Rust | `password` | Struct field (String) |

### Integrated Security / Windows Auth

| Driver | Keyword(s) | Values | Notes |
|--------|-----------|--------|-------|
| SqlClient | `Integrated Security`, `Trusted_Connection` | `True`, `False`, `SSPI` | SSPI = Windows Auth |
| ODBC | `Trusted_Connection` | `Yes`, `No` | - |
| OLEDB | `Integrated Security`, `Trusted_Connection` | `SSPI`, `yes`, `no` | - |
| JDBC | `integratedSecurity` | `true`, `false` | Requires native auth library |
| PHP | `Trusted_Connection` | `Yes`, `No` (Windows only) | - |
| Python | `Trusted_Connection` | `Yes`, `No` | Windows only |
| Rust | `tds_authentication_method: TdsAuthenticationMethod::SSPI` | Enum variant | Set auth method to SSPI |

### Encrypt

| Driver | Keyword(s) | Values | Default |
|--------|-----------|--------|---------|
| SqlClient | `Encrypt` | `True`, `False`, `Strict`, `Optional`, `Mandatory` | `True` (v4.0+) |
| ODBC | `Encrypt` | `yes`, `no`, `strict`, `Optional`, `Mandatory` | `Mandatory` (v18+) |
| OLEDB | `Use Encryption for Data`, `Encrypt` | `Optional`, `Mandatory`, `Strict` | `Mandatory` |
| JDBC | `encrypt` | `true`, `false`, `strict` | `true` (v10.2+) |
| PHP | `Encrypt` | `true`, `false`, 1, 0 | `false` |
| Python | `Encrypt` | `yes`, `no` | - |
| Rust | `encryption_options.mode` | `PreferOff`, `On`, `Required`, `Strict` | EncryptionSetting enum |

### Trust Server Certificate

| Driver | Keyword(s) | Values |
|--------|-----------|--------|
| SqlClient | `TrustServerCertificate` | `True`, `False` |
| ODBC | `TrustServerCertificate` | `yes`, `no` |
| OLEDB | `Trust Server Certificate`, `TrustServerCertificate` | `true`, `false`, `yes`, `no` |
| JDBC | `trustServerCertificate` | `true`, `false` |
| PHP | `TrustServerCertificate` | `true`, `false`, 1, 0 |
| Python | `TrustServerCertificate` | `yes`, `no` |
| Rust | `encryption_options.trust_server_certificate` | `true`, `false` |

### Connection Timeout

| Driver | Keyword(s) | Notes |
|--------|-----------|-------|
| SqlClient | `Connect Timeout`, `Connection Timeout`, `Timeout` | In seconds |
| ODBC | `Connection Timeout` | In seconds |
| OLEDB | `Connect Timeout` | In seconds |
| JDBC | `loginTimeout` | In seconds |
| PHP | `LoginTimeout` | In seconds |
| Python | `Connection Timeout` | - |
| Rust | `connect_timeout` | u32 (seconds) |

### Application Name

| Driver | Keyword(s) |
|--------|-----------|
| SqlClient | `Application Name`, `App` |
| ODBC | `APP`, `Application Name` |
| OLEDB | `Application Name` |
| JDBC | `applicationName` |
| PHP | `APP` |
| Python | `Application Name`, `APP` |
| Rust | `application_name` | String field |

### MultiSubnetFailover

| Driver | Keyword(s) | Values |
|--------|-----------|--------|
| SqlClient | `MultiSubnetFailover` | `True`, `False` |
| ODBC | `MultiSubnetFailover` | `Yes`, `No` |
| OLEDB | `MultiSubnetFailover` | `True`, `False` |
| JDBC | `multiSubnetFailover` | `true`, `false` |
| PHP | `MultiSubnetFailover` | `Yes`, `No` |
| Python | `MultiSubnetFailover` | - |
| Rust | N/A | Not directly supported |

### Application Intent

| Driver | Keyword(s) | Values |
|--------|-----------|--------|
| SqlClient | `ApplicationIntent` | `ReadOnly`, `ReadWrite` |
| ODBC | `ApplicationIntent` | `ReadOnly`, `ReadWrite` |
| OLEDB | `Application Intent` | `ReadOnly`, `ReadWrite` |
| JDBC | `applicationIntent` | `ReadOnly`, `ReadWrite` |
| PHP | `ApplicationIntent` | `ReadOnly`, `ReadWrite` |
| Python | `ApplicationIntent` | - |
| Rust | `application_intent` | `ReadWrite`, `ReadOnly` (ApplicationIntent enum) |

### Packet Size

| Driver | Keyword(s) | Default |
|--------|-----------|---------|
| SqlClient | `Packet Size` | 8000 |
| ODBC | `Packet Size` | - |
| OLEDB | `Packet Size` | Server determined |
| JDBC | `packetSize` | 8000 |
| PHP | N/A | - |
| Python | `Packet Size` | - |
| Rust | `packet_size` | 8000 (i16) |

### MARS (Multiple Active Result Sets)

| Driver | Keyword(s) | Values | Default |
|--------|-----------|--------|---------|
| SqlClient | `MultipleActiveResultSets` | `True`, `False` | `False` |
| ODBC | `MARS_Connection` | `Yes`, `No` | `No` |
| OLEDB | `MARS Connection`, `MarsConn` | `yes`, `no`, `true`, `false` | `no` |
| JDBC | N/A | Always enabled | - |
| PHP | `MultipleActiveResultSets` | `true`, `false`, 1, 0 | `true` |
| Python | `MARS_Connection` | - | - |
| Rust | `mars_enabled` | `true`, `false` | `false` |

---

## Extended Keywords Matrix

### Security & Encryption Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Column Encryption** | `Column Encryption Setting` | `ColumnEncryption` | `Column Encryption Setting` | `columnEncryptionSetting` | `ColumnEncryption` | `ColumnEncryption` | N/A |
| **Attestation URL** | `Enclave Attestation Url` | N/A | N/A | `enclaveAttestationUrl` | N/A | N/A | N/A |
| **Attestation Protocol** | `Attestation Protocol` | N/A | N/A | `enclaveAttestationProtocol` | N/A | N/A | N/A |
| **Host Name In Cert** | `Host Name In Certificate` | `HostnameInCertificate` | `Host Name In Certificate` | `hostNameInCertificate` | N/A | `HostnameInCertificate` | `encryption_options.host_name_in_cert` |
| **Server Certificate** | `Server Certificate` | `ServerCertificate` | `Server Certificate` | `serverCertificate` | N/A | `ServerCertificate` | N/A |
| **Persist Security Info** | `Persist Security Info` | N/A | `Persist Security Info` | N/A | N/A | N/A | N/A |

### Connection Pooling Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Pooling** | `Pooling` | N/A | N/A | N/A | `ConnectionPooling` | N/A | `pooling` |
| **Min Pool Size** | `Min Pool Size` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Max Pool Size** | `Max Pool Size` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Connection Lifetime** | `Connection Lifetime`, `Load Balance Timeout` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Pool Blocking Period** | `Pool Blocking Period` | N/A | N/A | N/A | N/A | N/A | N/A |

### Connection Resiliency Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Connect Retry Count** | `Connect Retry Count` | `ConnectRetryCount` | `Connect Retry Count` | `connectRetryCount` | `ConnectRetryCount` | `ConnectRetryCount` | `connect_retry_count` |
| **Connect Retry Interval** | `Connect Retry Interval` | `ConnectRetryInterval` | `Connect Retry Interval` | `connectRetryInterval` | `ConnectRetryInterval` | `ConnectRetryInterval` | N/A |
| **Transparent Network IP** | `Transparent Network IP Resolution` | `TransparentNetworkIPResolution` | `TransparentNetworkIPResolution` | `transparentNetworkIPResolution` | `TransparentNetworkIPResolution` | `TransparentNetworkIPResolution` | N/A |
| **IP Address Preference** | `IP Address Preference` | `IpAddressPreference` | N/A | N/A | N/A | `IpAddressPreference` | `ipaddress_preference` |

### Failover & High Availability Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Failover Partner** | `Failover Partner` | `Failover_Partner` | `Failover Partner` | `failoverPartner` | `Failover_Partner` | `Failover_Partner` | `failover_partner` |
| **Failover Partner SPN** | `Failover Partner SPN` | `FailoverPartnerSPN` | `Failover Partner SPN` | N/A | N/A | `FailoverPartnerSPN` | N/A |
| **Server SPN** | `Server SPN` | `ServerSPN` | `Server SPN` | `serverSpn` | N/A | `ServerSPN` | N/A |

### Database & Session Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Attach DB Filename** | `AttachDBFilename` | `AttachDBFileName` | `AttachDBFileName` | N/A | `AttachDBFileName` | `AttachDBFileName` | `attach_db_file` |
| **Current Language** | `Current Language` | `Language` | `Current Language` | N/A | `Language` | `Language` | `language` |
| **Workstation ID** | `Workstation ID`, `WSID` | `WSID` | `Workstation ID` | `workstationID` | `WSID` | `WSID` | `workstation_id` |
| **Enlist** | `Enlist` | N/A | `Enlist` | N/A | N/A | N/A | `enlist` |
| **Replication** | `Replication` | `Replication` | N/A | `replication` | N/A | `Replication` | `replication` |
| **User Instance** | `User Instance` | N/A | N/A | N/A | N/A | N/A | `user_instance` |

### Timeout Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Command Timeout** | `Command Timeout` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Login Timeout** | `Connect Timeout` | `Connection Timeout` | `Connect Timeout` | `loginTimeout` | `LoginTimeout` | `Connection Timeout` | `connect_timeout` |
| **Lock Timeout** | N/A | N/A | N/A | `lockTimeout` | N/A | N/A | N/A |
| **Socket Timeout** | N/A | N/A | N/A | `socketTimeout` | N/A | N/A | N/A |
| **Query Timeout** | N/A | N/A | N/A | `queryTimeout` | N/A | N/A | N/A |
| **Cancel Query Timeout** | N/A | N/A | N/A | `cancelQueryTimeout` | N/A | N/A | N/A |

### Network & Protocol Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Network Library** | `Network Library`, `Net` | `Network` | `Network Library` | N/A | N/A | `Network` | N/A |
| **Instance Name** | In Server string | In Server string | In Data Source | `instanceName` | In Server string | In Server string | In transport_context |
| **Keep Alive** | N/A | `KeepAlive` | N/A | N/A | N/A | `KeepAlive` | N/A |
| **Keep Alive Interval** | N/A | `KeepAliveInterval` | N/A | N/A | N/A | `KeepAliveInterval` | N/A |

### Driver-Specific Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Type System Version** | `Type System Version` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Transaction Binding** | `Transaction Binding` | N/A | N/A | N/A | N/A | N/A | N/A |
| **Response Buffering** | N/A | N/A | N/A | `responseBuffering` | N/A | N/A | N/A |
| **Select Method** | N/A | N/A | N/A | `selectMethod` | N/A | N/A | N/A |
| **Send String As Unicode** | N/A | N/A | N/A | `sendStringParametersAsUnicode` | N/A | N/A | N/A |
| **Return Dates As Strings** | N/A | N/A | N/A | N/A | `ReturnDatesAsStrings` | N/A | N/A |
| **Format Decimals** | N/A | N/A | N/A | N/A | `FormatDecimals` | N/A | N/A |
| **Decimal Places** | N/A | N/A | N/A | N/A | `DecimalPlaces` | N/A | N/A |
| **Character Set** | N/A | N/A | N/A | N/A | `CharacterSet` | N/A | N/A |
| **Quoted ID** | N/A | `QuotedId` | N/A | `QUOTED_IDENTIFIER` | `QuotedId` | `QuotedId` | N/A |
| **Auto Translate** | N/A | `AutoTranslate` | `Auto Translate` | N/A | N/A | `AutoTranslate` | N/A |
| **Use FMTONLY** | N/A | `UseFMTONLY` | `Use FMTONLY` | `useFmtOnly` | N/A | `UseFMTONLY` | N/A |

### Azure Key Vault Keywords

| Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust |
|---------|-----------|------|-------|------|-----|--------|------|
| **Keystore Authentication** | N/A | `KeystoreAuthentication` | N/A | N/A | `KeyStoreAuthentication` | `KeystoreAuthentication` | N/A |
| **Keystore Principal ID** | N/A | `KeystorePrincipalId` | N/A | N/A | `KeyStorePrincipalId` | `KeystorePrincipalId` | N/A |
| **Keystore Secret** | N/A | `KeystoreSecret` | N/A | N/A | `KeyStoreSecret` | `KeystoreSecret` | N/A |

---

## Driver-Specific Details

### SqlClient (Microsoft.Data.SqlClient)

**Format**: `Keyword=Value;Keyword2=Value2;`

**Full Keyword List** (50+ keywords):
- Server connection: `Data Source`, `Server`, `Address`, `Addr`, `Network Address`
- Database: `Initial Catalog`, `Database`
- Auth: `User ID`, `UID`, `User`, `Password`, `PWD`, `Integrated Security`, `Trusted_Connection`
- Security: `Encrypt`, `TrustServerCertificate`, `Column Encryption Setting`, `Enclave Attestation Url`
- Connection: `Connect Timeout`, `Connection Timeout`, `Timeout`, `Pooling`, `Connection Lifetime`, `Min Pool Size`, `Max Pool Size`
- Advanced: `MultiSubnetFailover`, `ApplicationIntent`, `Application Name`, `Workstation ID`, `Current Language`
- Failover: `Failover Partner`, `Failover Partner SPN`
- Authentication: `Authentication` (ActiveDirectoryPassword, ActiveDirectoryIntegrated, ActiveDirectoryInteractive, etc.)

**Special Notes**:
- Values with semicolons must be enclosed in double quotes: `Password="pass;word"`
- Boolean values: `True`/`False` or `Yes`/`No`

### ODBC

**Format**: `Driver={ODBC Driver 18 for SQL Server};Keyword=Value;`

**Driver Options**:
- `ODBC Driver 18 for SQL Server` (latest)
- `ODBC Driver 17 for SQL Server`
- `ODBC Driver 13 for SQL Server`
- `SQL Server Native Client 11.0`
- `SQL Server` (legacy)

**Key Keywords**:
- `Server`, `Database`, `UID`, `PWD`
- `Trusted_Connection=Yes|No`
- `Encrypt=yes|no|strict`
- `TrustServerCertificate=yes|no`
- `Authentication=ActiveDirectoryIntegrated|ActiveDirectoryPassword|ActiveDirectoryInteractive|ActiveDirectoryMsi|ActiveDirectoryServicePrincipal|SqlPassword`
- `ColumnEncryption=Enabled|Disabled`

### OLEDB (MSOLEDBSQL)

**Format**: `Provider=MSOLEDBSQL19;Keyword=Value;`

**Provider Options**:
- `MSOLEDBSQL19` (v19, latest)
- `MSOLEDBSQL` (v18)
- `SQLOLEDB` (legacy, deprecated)

**Key Keywords**:
- `Data Source`, `Initial Catalog`, `User ID`, `Password`
- `Integrated Security=SSPI`
- `Use Encryption for Data=Optional|Mandatory|Strict`
- `Trust Server Certificate=true|false`
- `MARS Connection=true|false`
- `Auto Translate=true|false`
- `Application Intent=ReadOnly|ReadWrite`

### JDBC (mssql-jdbc)

**Format**: `jdbc:sqlserver://serverName[\instanceName][:portNumber][;property=value...]`

**URL Structure**:
```
jdbc:sqlserver://myserver.database.windows.net:1433;databaseName=mydb;user=user;password=pass;encrypt=true;
```

**Key Properties**:
- `databaseName` (not `database`)
- `user`, `password` (lowercase)
- `encrypt=true|false|strict`
- `trustServerCertificate=true|false`
- `integratedSecurity=true` (requires mssql-jdbc_auth DLL on Windows)
- `authentication=ActiveDirectoryPassword|ActiveDirectoryIntegrated|ActiveDirectoryInteractive|ActiveDirectoryServicePrincipal|ActiveDirectoryManagedIdentity|SqlPassword`
- `hostNameInCertificate`
- `applicationName`
- `loginTimeout`
- `multiSubnetFailover=true|false`
- `applicationIntent=ReadOnly|ReadWrite`

**Escaping**: Use `{` and `}` to escape special characters in values (JDBC 8.4+): `password={my;pass}`

### PHP (sqlsrv / PDO_SQLSRV)

**Format** (SQLSRV):
```php
$conn = sqlsrv_connect($serverName, array(
    "Database" => "mydb",
    "UID" => "user",
    "PWD" => "pass",
    "Encrypt" => true,
    "TrustServerCertificate" => false
));
```

**Format** (PDO_SQLSRV):
```php
$conn = new PDO("sqlsrv:Server=myserver;Database=mydb", "user", "pass");
```

**Key Options**:
- `Server` (first param), `Database`, `UID`, `PWD`
- `Encrypt` (true/false or 1/0)
- `TrustServerCertificate`
- `LoginTimeout`
- `MultiSubnetFailover=Yes|No`
- `ApplicationIntent=ReadOnly|ReadWrite`
- `Authentication=SqlPassword|ActiveDirectoryPassword|ActiveDirectoryMsi|ActiveDirectoryServicePrincipal`
- `Driver` - specifies ODBC driver to use
- `ConnectionPooling=true|false`
- `MultipleActiveResultSets=true|false`

### Python (mssql-python / pyodbc)

**Format** (mssql-python):
```python
from mssql_python import connect
conn = connect("Server=myserver;Database=mydb;UID=user;PWD=pass;Encrypt=yes;")
```

**Format** (pyodbc):
```python
import pyodbc
conn = pyodbc.connect(
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=myserver;"
    "Database=mydb;"
    "UID=user;"
    "PWD=pass;"
    "Encrypt=yes;"
)
```

**Notes**:
- Uses ODBC connection string syntax
- mssql-python accepts the same ODBC keywords
- Supports `Authentication=ActiveDirectoryInteractive` for Azure AD

### Rust (mssql-tds)

**Format** (ClientContext Struct):
```rust
use mssql_tds::connection::client_context::{ClientContext, TdsAuthenticationMethod, TransportContext};
use mssql_tds::core::{EncryptionOptions, EncryptionSetting};

let context = ClientContext {
    transport_context: TransportContext::Tcp {
        host: "myserver.database.windows.net".to_string(),
        port: 1433,
    },
    database: "mydb".to_string(),
    user_name: "user".to_string(),
    password: "password".to_string(),
    tds_authentication_method: TdsAuthenticationMethod::Password,
    encryption_options: EncryptionOptions {
        mode: EncryptionSetting::Required,
        trust_server_certificate: false,
        host_name_in_cert: None,
    },
    application_name: "MyApp".to_string(),
    connect_timeout: 30,
    ..ClientContext::default()
};
```

**ClientContext Fields** (from mssql-tds source):

| Field | Type | Description |
|-------|------|-------------|
| `transport_context` | `TransportContext` | Server connection: `Tcp { host, port }`, `NamedPipe { pipe_name }`, or `SharedMemory { instance_name }` |
| `database` | `String` | Database name |
| `user_name` | `String` | User name for SQL authentication |
| `password` | `String` | Password for SQL authentication |
| `tds_authentication_method` | `TdsAuthenticationMethod` | Authentication method enum |
| `encryption_options` | `EncryptionOptions` | Encryption settings (mode, trust_server_certificate, host_name_in_cert) |
| `application_name` | `String` | Application identifier |
| `application_intent` | `ApplicationIntent` | `ReadWrite` or `ReadOnly` |
| `connect_timeout` | `u32` | Connection timeout in seconds |
| `connect_retry_count` | `u32` | Number of connection retries |
| `packet_size` | `i16` | TDS packet size (default: 8000) |
| `mars_enabled` | `bool` | Multiple Active Result Sets |
| `failover_partner` | `String` | Failover partner server |
| `attach_db_file` | `String` | Database file to attach |
| `language` | `String` | Language setting (default: us_english) |
| `workstation_id` | `String` | Client workstation identifier |
| `pooling` | `bool` | Connection pooling |
| `access_token` | `Option<String>` | Access token for Azure AD auth |

**TdsAuthenticationMethod Enum**:
- `Password` - SQL Server authentication
- `SSPI` - Windows/Integrated authentication
- `ActiveDirectoryPassword` - Azure AD password
- `ActiveDirectoryInteractive` - Azure AD interactive
- `ActiveDirectoryServicePrincipal` - Azure AD service principal
- `ActiveDirectoryManagedIdentity` - Azure AD managed identity
- `ActiveDirectoryMSI` - Azure AD MSI
- `ActiveDirectoryIntegrated` - Azure AD integrated
- `ActiveDirectoryDeviceCodeFlow` - Azure AD device code flow
- `ActiveDirectoryDefault` - Azure AD default
- `ActiveDirectoryWorkloadIdentity` - Azure AD workload identity
- `AccessToken` - Pre-obtained access token

**EncryptionSetting Enum**:
- `PreferOff` - Don't use encryption if server allows
- `On` - Use encryption after prelogin
- `Required` - Same as On (writes different TDS value)
- `Strict` - Encrypt entire stream including prelogin (TDS 8.0)

**TransportContext Variants**:
- `Tcp { host: String, port: u16 }` - TCP/IP connection
- `NamedPipe { pipe_name: String }` - Named pipe connection
- `SharedMemory { instance_name: String }` - Shared memory (local only)

---

## Special Character Escaping Rules

| Driver | Escape Method | Example |
|--------|--------------|---------|
| SqlClient | Double quotes around value | `Password="pass;word"` |
| ODBC | Curly braces | `PWD={pass;word}` |
| OLEDB | Double quotes or single quotes | `Password="pass;word"` |
| JDBC | Curly braces (v8.4+) | `password={pass;word}` |
| PHP | No escaping needed (array values) | `"PWD" => "pass;word"` |
| Python | Curly braces (ODBC style) | `PWD={pass;word}` |
| Rust | Handled by struct fields (no escaping needed) | Direct String assignment |

**Characters requiring escaping**: `;`, `=`, `{`, `}`, `'`, `"`

---

## Authentication Methods

### SQL Server Authentication
All drivers support username/password authentication.

### Windows/Integrated Authentication
| Driver | Support | Notes |
|--------|---------|-------|
| SqlClient | ✅ | `Integrated Security=True` |
| ODBC | ✅ | `Trusted_Connection=Yes` |
| OLEDB | ✅ | `Integrated Security=SSPI` |
| JDBC | ✅ | Requires native auth DLL |
| PHP | ✅ | Windows only |
| Python | ✅ | Windows only via ODBC |
| Rust | ✅ | `tds_authentication_method: TdsAuthenticationMethod::SSPI` |

### Azure AD / Entra ID Authentication

| Method | SqlClient | ODBC | OLEDB | JDBC | PHP |
|--------|-----------|------|-------|------|-----|
| Interactive | ✅ | ✅ | ✅ | ✅ | ❌ |
| Password | ✅ (deprecated) | ✅ (deprecated) | ✅ (deprecated) | ✅ (deprecated) | ✅ (deprecated) |
| Integrated | ✅ | ✅ | ✅ | ✅ | ❌ |
| Service Principal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Managed Identity | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Implementation Notes

### Detection Patterns

| Driver | Detection Pattern |
|--------|------------------|
| JDBC | Starts with `jdbc:sqlserver://` |
| ODBC | Contains `Driver={` or `Driver=` |
| OLEDB | Contains `Provider=MSOLEDB` or `Provider=SQLOLEDB` |
| PHP | Contains `sqlsrv:` (PDO) or array syntax |
| SqlClient | Contains `Data Source=` or `Server=` (without Driver/Provider) |
| Python | ODBC format with Python context |
| Rust | ClientContext struct initialization (code context detection) |

### Boolean Value Normalization

| Input Values | Normalized Output by Driver |
|--------------|----------------------------|
| `True`, `true`, `TRUE`, `Yes`, `yes`, `1` | SqlClient: `True` / ODBC: `Yes` / JDBC: `true` / PHP: `true` / Rust: `true` |
| `False`, `false`, `FALSE`, `No`, `no`, `0` | SqlClient: `False` / ODBC: `No` / JDBC: `false` / PHP: `false` / Rust: `false` |

> **Note**: All drivers accept boolean values case-insensitively during parsing. Output should use the conventional casing for each driver.

### Keyword Comparison Strategy

When comparing keywords across drivers:
1. **Normalize to lowercase** for matching
2. **Use synonym lookup table** to find equivalent keywords
3. **Output in target driver's conventional casing**:
   - SqlClient/OLEDB: Pascal Case (`TrustServerCertificate`)
   - ODBC: Mixed (`Trusted_Connection`, `UID`)
   - JDBC: camelCase (`trustServerCertificate`, `databaseName`)
   - PHP: Mixed (`Database`, `UID`, `PWD`)
   - Rust: snake_case struct fields (`trust_server_certificate`)
- **ODBC/SqlClient keywords**: Typically Pascal_Case or Title Case

---

## Source Code Review Summary

### Review Date: 2026-01-29

All driver keywords were verified against actual source code repositories using Bluebird MCP servers.

### Key Findings

| Driver | Source Files | Total Keywords | Key Discoveries |
|--------|-------------|----------------|-----------------|
| **SqlClient** | DbConnectionStringKeywords.cs, DbConnectionStringSynonyms.cs | 44 + 34 synonyms | `Context Connection`, `Connection Reset` (NETFRAMEWORK only) |
| **ODBC** | sqlcconn.cpp | 58 | `vectorTypeSupport` (new), `RetryExec`, 7 deprecated keywords |
| **JDBC** | fxSqlServerDriver.java | 65+ | Trust store, JAAS, socket factory, bulk copy options |
| **PHP** | conn.cpp, shared_constants.h | 35 | `ComputePool`, `HostNameInCertificate`, `TransactionIsolation` |
| **Python** | constants.py | 22 (restricted) | Many ODBC keywords explicitly BLOCKED in allowlist |
| **Rust** | client_context.rs, core.rs | 30 | `change_password`, `new_password`, `library_name`, TransportContext enum |

### Python Driver Restrictions

The mssql-python driver intentionally restricts allowed keywords for security. These commonly-used keywords are **NOT in the allowlist**:
- Connection Timeout, MARS_Connection, ColumnEncryption, Failover_Partner
- WSID, Language, AttachDBFileName, AutoTranslate, UseFMTONLY
- All Keystore* parameters

### JDBC Unique Features (Not in Other Drivers)
- Trust store management: `trustStore`, `trustStorePassword`, `trustStoreType`
- Custom trust validation: `trustManagerClass`, `trustManagerConstructorArg`
- Statement pooling: `disableStatementPooling`, `statementPoolingCacheSize`
- Bulk copy optimization: `useBulkCopyForBatchInsert`, `delayLoadingLobs`
- JAAS configuration: `jaasConfigurationName`, `useDefaultJaasConfig`
- Socket customization: `socketFactoryClass`, `socketFactoryConstructorArg`

### ODBC Unique Features
- DSN support: `DSN`, `FileDSN`, `SaveFile`, `Description`
- Query logging: `QueryLog_On`, `QueryLogFile`, `QueryLogTime`
- Stats logging: `StatsLog_On`, `StatsLogFile`
- Client certificates: `ClientCertificate`, `ClientKey`
- Advanced: `RetryExec`, `vectorTypeSupport`, `LongAsMax`, `GetDataExtensions`

### Deprecated/Platform-Specific Keywords

| Keyword | Driver | Status |
|---------|--------|--------|
| `Connection Reset` | SqlClient | NETFRAMEWORK only |
| `Network Library` | SqlClient | NETFRAMEWORK only |
| `Transparent Network IP Resolution` | SqlClient | NETFRAMEWORK only |
| `OemToAnsi` | ODBC | Deprecated |
| `TranslationName` | ODBC | Deprecated |
| `TranslationOption` | ODBC | Deprecated |
| `TranslationDLL` | ODBC | Deprecated |
| `FastConnectOption` | ODBC | Deprecated |
| `UseProcForPrepare` | ODBC | Deprecated |
| `Fallback` | ODBC | Deprecated |

---

*This document is generated from Microsoft Learn documentation and driver source code. Last verified: 2026-01-29 via Bluebird MCP servers.*
