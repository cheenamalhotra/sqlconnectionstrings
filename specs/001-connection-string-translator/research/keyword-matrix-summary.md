# SQL Server Connection String Keywords - Consolidated Matrix

**Created**: 2026-01-29  
**Last Updated**: 2026-02-04 
**Purpose**: Single comprehensive matrix of all connection string keywords across all 7 SQL Server drivers  
**Reference**: See [driver-keyword-mapping.md](driver-keyword-mapping.md) for detailed descriptions

> **Source Code Verified**: All keywords verified against actual driver source code via Bluebird MCP servers.

---

## Master Keywords × Drivers Matrix

> **Legend**: ✓ = Supported | N/A = Not Available | Keywords are **case-insensitive** except Rust struct fields

| # | Category | Keyword | SqlClient | ODBC | OLEDB | JDBC | PHP | Python | Rust (mssql-tds) |
|---|----------|---------|-----------|------|-------|------|-----|--------|------------------|
| **1** | **Connection** | Server/Host | `Server`¹ | `Server` | `Data Source`¹ | URL: `//host:port` | `Server` | `Server` | `transport_context.host` |
| **2** | **Connection** | Port | In Server | In Server | In Data Source | `portNumber` | In Server | In Server | `transport_context.port` |
| **3** | **Connection** | Database | `Database`² | `Database` | `Initial Catalog`² | `databaseName` | `Database` | `Database` | `database` |
| **4** | **Connection** | Instance Name | In Server | In Server | In Data Source | `instanceName` | In Server | In Server | `database_instance` |
| **5** | **Auth** | User ID | `User ID`³ | `UID`³ | `User ID`³ | `user` | `UID` | `UID`³ | `user_name` |
| **6** | **Auth** | Password | `Password`⁴ | `PWD`⁴ | `Password`⁴ | `password` | `PWD` | `PWD`⁴ | `password` |
| **7** | **Auth** | Integrated Security | `Integrated Security`⁵ | `Trusted_Connection` | `Integrated Security`⁵ | `integratedSecurity` | `Trusted_Connection` | `Trusted_Connection` | `tds_authentication_method` |
| **8** | **Auth** | Authentication | `Authentication` | `Authentication` | `Authentication` | `authentication` | `Authentication` | `Authentication` | `tds_authentication_method` |
| **9** | **Auth** | Access Token | N/A (use SqlCredential) | SQL_COPT_SS_ACCESS_TOKEN | N/A | `accessToken` | `AccessToken` | N/A | `access_token` |
| **10** | **Auth** | Domain (NTLM) | N/A | N/A | N/A | `domain` | N/A | N/A | N/A |
| **11** | **Auth** | Realm (Kerberos) | N/A | N/A | N/A | `realm` | N/A | N/A | N/A |
| **12** | **Security** | Encrypt | `Encrypt` | `Encrypt` | `Use Encryption for Data`⁶ | `encrypt` | `Encrypt` | `Encrypt` | `encryption_options.mode` |
| **13** | **Security** | Trust Server Certificate | `TrustServerCertificate` | `TrustServerCertificate` | `Trust Server Certificate`⁷ | `trustServerCertificate` | `TrustServerCertificate` | `TrustServerCertificate` | `encryption_options.trust_server_certificate` |
| **14** | **Security** | Host Name In Certificate | `Host Name In Certificate` | `HostnameInCertificate` | `Host Name In Certificate` | `hostNameInCertificate` | `HostNameInCertificate` | `HostnameInCertificate` | `encryption_options.host_name_in_cert` |
| **15** | **Security** | Server Certificate | `Server Certificate` | `ServerCertificate` | `Server Certificate` | `serverCertificate` | N/A | `ServerCertificate` | N/A |
| **16** | **Security** | Client Certificate | N/A | `ClientCertificate` | N/A | `clientCertificate` | N/A | N/A | N/A |
| **17** | **Security** | Client Key | N/A | `ClientKey` | N/A | `clientKey` | N/A | N/A | N/A |
| **18** | **Security** | Client Key Password | N/A | N/A | N/A | `clientKeyPassword` | N/A | N/A | N/A |
| **19** | **Security** | Column Encryption | `Column Encryption Setting` | `ColumnEncryption` | `Column Encryption Setting` | `columnEncryptionSetting` | `ColumnEncryption` | N/A* | N/A |
| **20** | **Security** | Enclave Attestation URL | `Enclave Attestation Url` | N/A | N/A | `enclaveAttestationUrl` | N/A | N/A | N/A |
| **21** | **Security** | Attestation Protocol | `Attestation Protocol` | N/A | N/A | `enclaveAttestationProtocol` | N/A | N/A | N/A |
| **22** | **Security** | Persist Security Info | `Persist Security Info` | N/A | `Persist Security Info` | N/A | N/A | N/A | N/A |
| **23** | **Security** | SSL Protocol | N/A | N/A | N/A | `sslProtocol` | N/A | N/A | N/A |
| **24** | **Security** | FIPS Mode | N/A | N/A | N/A | `fips` | N/A | N/A | N/A |
| **25** | **Timeout** | Connection Timeout | `Connect Timeout`⁸ | `Connection Timeout` | `Connect Timeout` | `loginTimeout` | `LoginTimeout` | N/A* | `connect_timeout` |
| **26** | **Timeout** | Command Timeout | `Command Timeout` | N/A | N/A | N/A | N/A | N/A | N/A |
| **27** | **Timeout** | Lock Timeout | N/A | N/A | N/A | `lockTimeout` | N/A | N/A | N/A |
| **28** | **Timeout** | Socket Timeout | N/A | N/A | N/A | `socketTimeout` | N/A | N/A | N/A |
| **29** | **Timeout** | Query Timeout | N/A | N/A | N/A | `queryTimeout` | N/A | N/A | N/A |
| **30** | **Timeout** | Cancel Query Timeout | N/A | N/A | N/A | `cancelQueryTimeout` | N/A | N/A | N/A |
| **31** | **App Info** | Application Name | `Application Name`⁹ | `APP`⁹ | `Application Name` | `applicationName` | `APP` | `APP`⁹ | `application_name` |
| **32** | **App Info** | Application Intent | `ApplicationIntent` | `ApplicationIntent` | `Application Intent` | `applicationIntent` | `ApplicationIntent` | `ApplicationIntent` | `application_intent` |
| **33** | **App Info** | Workstation ID | `Workstation ID`, `WSID` | `WSID` | `Workstation ID` | `workstationID` | `WSID` | N/A* | `workstation_id` |
| **34** | **HA/DR** | MultiSubnetFailover | `MultiSubnetFailover` | `MultiSubnetFailover` | `MultiSubnetFailover` | `multiSubnetFailover` | `MultiSubnetFailover` | `MultiSubnetFailover` | N/A |
| **35** | **HA/DR** | Failover Partner | `Failover Partner` | `Failover_Partner` | `Failover Partner` | `failoverPartner` | `Failover_Partner` | N/A* | `failover_partner` |
| **36** | **HA/DR** | Failover Partner SPN | `Failover Partner SPN` | `FailoverPartnerSPN` | `Failover Partner SPN` | N/A | N/A | N/A* | N/A |
| **37** | **HA/DR** | Server SPN | `Server SPN` | `ServerSPN` | `Server SPN` | `serverSpn` | N/A | `ServerSPN` | N/A |
| **38** | **HA/DR** | Transparent Network IP | `Transparent Network IP Resolution` | `TransparentNetworkIPResolution` | `TransparentNetworkIPResolution` | `transparentNetworkIPResolution` | `TransparentNetworkIPResolution` | N/A* | N/A |
| **39** | **HA/DR** | IP Address Preference | `IP Address Preference` | `IpAddressPreference` | N/A | `iPAddressPreference` | N/A | `IpAddressPreference` | `ipaddress_preference` |
| **40** | **Network** | Packet Size | `Packet Size` | `PacketSize` | `Packet Size` | `packetSize` | N/A | `PacketSize` | `packet_size` |
| **41** | **Network** | Network Library | `Network Library`, `Net` | `Network` | `Network Library` | N/A | N/A | N/A | N/A |
| **42** | **Network** | Keep Alive | N/A | `KeepAlive` | N/A | N/A | N/A | `KeepAlive` | N/A |
| **43** | **Network** | Keep Alive Interval | N/A | `KeepAliveInterval` | N/A | N/A | N/A | `KeepAliveInterval` | N/A |
| **44** | **Features** | MARS | `MultipleActiveResultSets` | `MARS_Connection` | `MARS Connection`¹⁰ | *(always on)* | `MultipleActiveResultSets` | N/A* | `mars_enabled` |
| **45** | **Features** | Enlist | `Enlist` | N/A | `Enlist` | N/A | N/A | N/A | `enlist` |
| **46** | **Features** | Replication | `Replication` | `Replication` | N/A | `replication` | N/A | N/A* | `replication` |
| **47** | **Database** | Attach DB Filename | `AttachDBFilename` | `AttachDBFileName` | `AttachDBFileName` | N/A | `AttachDBFileName` | N/A* | `attach_db_file` |
| **48** | **Database** | Current Language | `Current Language` | `Language` | `Current Language` | N/A | `Language` | N/A* | `language` |
| **49** | **Database** | User Instance | `User Instance` | N/A | N/A | N/A | N/A | N/A | `user_instance` |
| **50** | **Pooling** | Pooling | `Pooling` | N/A | N/A | N/A | `ConnectionPooling` | N/A | `pooling` |
| **51** | **Pooling** | Min Pool Size | `Min Pool Size` | N/A | N/A | N/A | N/A | N/A | N/A |
| **52** | **Pooling** | Max Pool Size | `Max Pool Size` | N/A | N/A | N/A | N/A | N/A | N/A |
| **53** | **Pooling** | Load Balance Timeout | `Load Balance Timeout`¹¹ | N/A | N/A | N/A | N/A | N/A | N/A |
| **54** | **Pooling** | Pool Blocking Period | `Pool Blocking Period` | N/A | N/A | N/A | N/A | N/A | N/A |
| **55** | **Resiliency** | Connect Retry Count | `Connect Retry Count` | `ConnectRetryCount` | `Connect Retry Count` | `connectRetryCount` | `ConnectRetryCount` | `ConnectRetryCount` | `connect_retry_count` |
| **56** | **Resiliency** | Connect Retry Interval | `Connect Retry Interval` | `ConnectRetryInterval` | `Connect Retry Interval` | `connectRetryInterval` | `ConnectRetryInterval` | `ConnectRetryInterval` | N/A |
| **57** | **Driver** | Driver/Provider | N/A | `Driver` | `Provider`⁽ᴹᴬᴺᴰᴬᵀᴼᴿʸ⁾ | N/A | `Driver` | `Driver` | N/A |
| **58** | **Driver** | Type System Version | `Type System Version` | N/A | N/A | N/A | N/A | N/A | N/A |
| **59** | **Driver** | Transaction Binding | `Transaction Binding` | N/A | N/A | N/A | N/A | N/A | N/A |
| **60** | **Driver** | Context Connection | `Context Connection` | N/A | N/A | N/A | N/A | N/A | N/A |
| **61** | **Driver** | Connection Reset | `Connection Reset` | N/A | N/A | N/A | N/A | N/A | N/A |
| **62** | **Behavior** | Response Buffering | N/A | N/A | N/A | `responseBuffering` | N/A | N/A | N/A |
| **63** | **Behavior** | Select Method | N/A | N/A | N/A | `selectMethod` | N/A | N/A | N/A |
| **64** | **Behavior** | Send String As Unicode | N/A | N/A | N/A | `sendStringParametersAsUnicode` | N/A | N/A | N/A |
| **65** | **Behavior** | Send Time As Datetime | N/A | N/A | N/A | `sendTimeAsDatetime` | N/A | N/A | N/A |
| **66** | **Behavior** | Datetime Parameter Type | N/A | N/A | N/A | `datetimeParameterType` | N/A | N/A | N/A |
| **67** | **Behavior** | Last Update Count | N/A | N/A | N/A | `lastUpdateCount` | N/A | N/A | N/A |
| **68** | **Behavior** | XOpen States | N/A | N/A | N/A | `xopenStates` | N/A | N/A | N/A |
| **69** | **Behavior** | Quoted Identifier | N/A | `QuotedId` | N/A | `QUOTED_IDENTIFIER` | `QuotedId` | N/A* | N/A |
| **70** | **Behavior** | ANSI NPW | N/A | `AnsiNPW` | N/A | N/A | N/A | N/A | N/A |
| **71** | **Behavior** | Regional | N/A | `Regional` | N/A | N/A | N/A | N/A | N/A |
| **72** | **Behavior** | Auto Translate | N/A | `AutoTranslate` | `Auto Translate` | N/A | N/A | N/A* | N/A |
| **73** | **Behavior** | Use FMTONLY | N/A | `UseFMTONLY` | `Use FMTONLY` | `useFmtOnly` | N/A | N/A* | N/A |
| **74** | **Behavior** | Long As Max | N/A | `LongAsMax` | N/A | N/A | N/A | N/A | N/A |
| **75** | **Behavior** | Get Data Extensions | N/A | `GetDataExtensions` | N/A | N/A | N/A | N/A | N/A |
| **76** | **Behavior** | Concat Null Yields Null | N/A | `ConcatNullYieldsNull` | N/A | N/A | N/A | N/A | N/A |
| **77** | **Behavior** | Server Name As ACE | N/A | N/A | N/A | `serverNameAsACE` | N/A | N/A | N/A |
| **78** | **Bulk Copy** | Use Bulk Copy For Batch | N/A | N/A | N/A | `useBulkCopyForBatchInsert` | N/A | N/A | N/A |
| **79** | **Bulk Copy** | Delay Loading LOBs | N/A | N/A | N/A | `delayLoadingLobs` | N/A | N/A | N/A |
| **80** | **Bulk Copy** | Send Temporal As String | N/A | N/A | N/A | `sendTemporalDataTypesAsStringForBulkCopy` | N/A | N/A | N/A |
| **81** | **Statement** | Disable Statement Pooling | N/A | N/A | N/A | `disableStatementPooling` | N/A | N/A | N/A |
| **82** | **Statement** | Statement Pooling Cache Size | N/A | N/A | N/A | `statementPoolingCacheSize` | N/A | N/A | N/A |
| **83** | **Statement** | Enable Prepare On First Call | N/A | N/A | N/A | `enablePrepareOnFirstPreparedStatementCall` | N/A | N/A | N/A |
| **84** | **Statement** | Prepared Statement Discard Threshold | N/A | N/A | N/A | `serverPreparedStatementDiscardThreshold` | N/A | N/A | N/A |
| **85** | **Statement** | Prepare Method | N/A | N/A | N/A | `prepareMethod` | N/A | N/A | N/A |
| **86** | **Statement** | Max Result Buffer | N/A | N/A | N/A | `maxResultBuffer` | N/A | N/A | N/A |
| **87** | **Trust Store** | Trust Store | N/A | N/A | N/A | `trustStore` | N/A | N/A | N/A |
| **88** | **Trust Store** | Trust Store Password | N/A | N/A | N/A | `trustStorePassword` | N/A | N/A | N/A |
| **89** | **Trust Store** | Trust Store Type | N/A | N/A | N/A | `trustStoreType` | N/A | N/A | N/A |
| **90** | **Trust Store** | Trust Manager Class | N/A | N/A | N/A | `trustManagerClass` | N/A | N/A | N/A |
| **91** | **Trust Store** | Trust Manager Constructor Arg | N/A | N/A | N/A | `trustManagerConstructorArg` | N/A | N/A | N/A |
| **92** | **Key Vault** | Keystore Authentication | N/A | `KeystoreAuthentication` | N/A | `keyStoreAuthentication` | `KeyStoreAuthentication` | N/A* | N/A |
| **93** | **Key Vault** | Keystore Principal ID | N/A | `KeystorePrincipalId` | N/A | `keyStorePrincipalId` | `KeyStorePrincipalId` | N/A* | N/A |
| **94** | **Key Vault** | Keystore Secret | N/A | `KeystoreSecret` | N/A | `keyStoreSecret` | `KeyStoreSecret` | N/A* | N/A |
| **95** | **Key Vault** | Keystore Location | N/A | `KeystoreLocation` | N/A | `keyStoreLocation` | N/A | N/A | N/A |
| **96** | **Key Vault** | Key Vault Provider Client ID | N/A | N/A | N/A | `keyVaultProviderClientId` | N/A | N/A | N/A |
| **97** | **Key Vault** | Key Vault Provider Client Key | N/A | N/A | N/A | `keyVaultProviderClientKey` | N/A | N/A | N/A |
| **98** | **Azure AD** | MSI Client ID | N/A | N/A | N/A | `msiClientId` | N/A | N/A | N/A |
| **99** | **Azure AD** | AAD Secure Principal ID | N/A | N/A | N/A | `AADSecurePrincipalId` | N/A | N/A | N/A |
| **100** | **Azure AD** | AAD Secure Principal Secret | N/A | N/A | N/A | `AADSecurePrincipalSecret` | N/A | N/A | N/A |
| **101** | **JAAS** | JAAS Configuration Name | N/A | N/A | N/A | `jaasConfigurationName` | N/A | N/A | N/A |
| **102** | **JAAS** | Use Default JAAS Config | N/A | N/A | N/A | `useDefaultJaasConfig` | N/A | N/A | N/A |
| **103** | **JAAS** | Use Default GSS Credential | N/A | N/A | N/A | `useDefaultGSSCredential` | N/A | N/A | N/A |
| **104** | **Socket** | Socket Factory Class | N/A | N/A | N/A | `socketFactoryClass` | N/A | N/A | N/A |
| **105** | **Socket** | Socket Factory Constructor Arg | N/A | N/A | N/A | `socketFactoryConstructorArg` | N/A | N/A | N/A |
| **106** | **PHP Only** | Return Dates As Strings | N/A | N/A | N/A | N/A | `ReturnDatesAsStrings` | N/A | N/A |
| **107** | **PHP Only** | Format Decimals | N/A | N/A | N/A | N/A | `FormatDecimals` | N/A | N/A |
| **108** | **PHP Only** | Decimal Places | N/A | N/A | N/A | N/A | `DecimalPlaces` | N/A | N/A |
| **109** | **PHP Only** | Character Set | N/A | N/A | N/A | N/A | `CharacterSet` | N/A | N/A |
| **110** | **PHP Only** | Transaction Isolation | N/A | N/A | N/A | N/A | `TransactionIsolation` | N/A | N/A |
| **111** | **PHP Only** | Compute Pool | N/A | N/A | N/A | N/A | `ComputePool` | N/A | N/A |
| **112** | **Tracing** | Trace File | N/A | N/A | N/A | N/A | `TraceFile` | N/A | N/A |
| **113** | **Tracing** | Trace On | N/A | N/A | N/A | N/A | `TraceOn` | N/A | N/A |
| **114** | **ODBC Logging** | Query Log On | N/A | `QueryLog_On` | N/A | N/A | N/A | N/A | N/A |
| **115** | **ODBC Logging** | Query Log File | N/A | `QueryLogFile` | N/A | N/A | N/A | N/A | N/A |
| **116** | **ODBC Logging** | Query Log Time | N/A | `QueryLogTime` | N/A | N/A | N/A | N/A | N/A |
| **117** | **ODBC Logging** | Stats Log On | N/A | `StatsLog_On` | N/A | N/A | N/A | N/A | N/A |
| **118** | **ODBC Logging** | Stats Log File | N/A | `StatsLogFile` | N/A | N/A | N/A | N/A | N/A |
| **119** | **ODBC DSN** | DSN | N/A | `DSN` | N/A | N/A | N/A | N/A | N/A |
| **120** | **ODBC DSN** | File DSN | N/A | `FileDSN` | N/A | N/A | N/A | N/A | N/A |
| **121** | **ODBC DSN** | Save File | N/A | `SaveFile` | N/A | N/A | N/A | N/A | N/A |
| **122** | **ODBC DSN** | Description | N/A | `Description` | N/A | N/A | N/A | N/A | N/A |
| **123** | **ODBC Advanced** | Retry Exec | N/A | `RetryExec` | N/A | N/A | N/A | N/A | N/A |
| **124** | **ODBC Advanced** | Vector Type Support | N/A | `vectorTypeSupport` | N/A | N/A | N/A | N/A | N/A |
| **125** | **Rust Only** | Change Password | N/A | N/A | N/A | N/A | N/A | N/A | `change_password` |
| **126** | **Rust Only** | New Password | N/A | N/A | N/A | N/A | N/A | N/A | `new_password` |
| **127** | **Rust Only** | Library Name | N/A | N/A | N/A | N/A | N/A | N/A | `library_name` |
| **128** | **Rust Only** | Transport Protocol | N/A | N/A | N/A | N/A | N/A | N/A | `TransportContext` (enum) |

> **Python (*)**: mssql-python uses a restricted allowlist. Many ODBC keywords are NOT supported in the Python driver's allowlist.

---

## Keyword Synonyms Reference

| # | Synonym Group | Equivalent Keywords |
|---|---------------|---------------------|
| ¹ | Server | `Server`, `Data Source`, `Address`, `Addr`, `Network Address` |
| ² | Database | `Database`, `Initial Catalog` |
| ³ | User ID | `User ID`, `UID`, `User` |
| ⁴ | Password | `Password`, `PWD` |
| ⁵ | Integrated Security | `Integrated Security`, `Trusted_Connection` |
| ⁶ | Encrypt (OLEDB) | `Use Encryption for Data`, `Encrypt` |
| ⁷ | Trust Cert (OLEDB) | `Trust Server Certificate`, `TrustServerCertificate` |
| ⁸ | Timeout | `Connect Timeout`, `Connection Timeout`, `Timeout` |
| ⁹ | App Name | `Application Name`, `App`, `APP` |
| ¹⁰ | MARS (OLEDB) | `MARS Connection`, `MarsConn` |
| ¹¹ | Load Balance Timeout | `Load Balance Timeout`, `Connection Lifetime` |
| ⁽ᴹᴬᴺᴰᴬᵀᴼᴿʸ⁾ | **OLEDB Provider** | **REQUIRED**: Must be first parameter. Default: `MSOLEDBSQL` for SQL Server |

---

## Driver Support Summary (Source Code Verified)

| Driver | Total Keywords | Source Repo | Notes |
|--------|---------------|-------------|-------|
| **SqlClient** | 44 | dotnet/SqlClient | Most comprehensive, .NET native, 34 synonyms |
| **ODBC** | 58 | microsoft/msodbc | Cross-platform, 3 synonyms, 7 deprecated |
| **OLEDB** | 38 | — | ⚠️ Windows-centric, COM-based, **Provider keyword MANDATORY** |
| **JDBC** | 65+ | microsoft/mssql-jdbc | Java ecosystem, camelCase, most feature-rich |
| **PHP** | 35 | microsoft/msphpsql | SQLSRV + PDO_SQLSRV, ODBC-based |
| **Python** | 22 | microsoft/mssql-python | Restricted allowlist, many ODBC keywords blocked |
| **Rust (mssql-tds)** | 30 | mssql-tds | Struct-based, native TDS, EncryptionOptions nested |

---

## Python Driver Restrictions

The mssql-python driver uses a **restricted allowlist** (`_ALLOWED_CONNECTION_STRING_PARAMS`). The following commonly-used keywords are **NOT supported**:

| Blocked Keyword | ODBC Equivalent | Workaround |
|-----------------|-----------------|------------|
| Connection Timeout | `Connection Timeout` | Use `loginTimeout` in ODBC string |
| MARS_Connection | `MARS_Connection` | Not available |
| ColumnEncryption | `ColumnEncryption` | Not available |
| Failover_Partner | `Failover_Partner` | Not available |
| WSID | `WSID` | Not available |
| Language | `Language` | Not available |
| AttachDBFileName | `AttachDBFileName` | Not available |
| Keystore* | Various | Not available |

---

## JDBC-Specific Features (Not in Other Drivers)

| Category | Property | Description |
|----------|----------|-------------|
| **Trust Store** | `trustStore`, `trustStorePassword`, `trustStoreType` | Java keystore support |
| **Trust Manager** | `trustManagerClass`, `trustManagerConstructorArg` | Custom trust validation |
| **Statement Pooling** | `disableStatementPooling`, `statementPoolingCacheSize` | Prepared statement caching |
| **Bulk Copy** | `useBulkCopyForBatchInsert`, `delayLoadingLobs` | Performance optimization |
| **JAAS** | `jaasConfigurationName`, `useDefaultJaasConfig` | Kerberos configuration |
| **Socket Factory** | `socketFactoryClass`, `socketFactoryConstructorArg` | Custom socket implementation |
| **Azure AD** | `msiClientId`, `AADSecurePrincipalId` | Managed Identity support |

---

## ODBC-Specific Features (Not in Other Drivers)

| Category | Keyword | Description |
|----------|---------|-------------|
| **DSN** | `DSN`, `FileDSN`, `SaveFile` | Data Source Name support |
| **Logging** | `QueryLog_On`, `QueryLogFile`, `StatsLog_On` | Query/stats logging |
| **Behavior** | `LongAsMax`, `GetDataExtensions`, `ConcatNullYieldsNull` | Data handling |
| **Advanced** | `RetryExec`, `vectorTypeSupport` | Retry rules, vector types |
| **Client Auth** | `ClientCertificate`, `ClientKey` | Mutual TLS |

---

## Rust-Specific Features (mssql-tds)

| Field Path | Type | Notes |
|------------|------|-------|
| `transport_context` | `TransportContext` enum | Tcp, NamedPipe, SharedMemory variants |
| `encryption_options.mode` | `EncryptionSetting` | PreferOff, On, Required, Strict |
| `change_password` / `new_password` | String | Password change support |
| `database_instance` | String | Default: "MSSQLServer" |
| `library_name` | String | Default: "TdsX" |
| `tds_authentication_method` | Enum | 12 authentication variants |

---

## Boolean Values Quick Reference

| Driver | True Values | False Values |
|--------|-------------|--------------|
| SqlClient | `True`, `Yes`, `1` | `False`, `No`, `0` |
| ODBC | `Yes`, `1` | `No`, `0` |
| OLEDB | `True`, `Yes`, `1`, `SSPI`* | `False`, `No`, `0` |
| JDBC | `true` | `false` |
| PHP | `true`, `1`, `"1"` | `false`, `0`, `"0"` |
| Python | `Yes`, `1` | `No`, `0` |
| Rust | `true` | `false` |

*SSPI is used specifically for Integrated Security

---

## Encryption Values Quick Reference

| Driver | Off | On/Mandatory | Strict |
|--------|-----|--------------|--------|
| SqlClient | `False`, `Optional` | `True`, `Mandatory` | `Strict` |
| ODBC | `no`, `Optional` | `yes`, `Mandatory` | `strict` |
| OLEDB | `Optional` | `Mandatory` | `Strict` |
| JDBC | `false` | `true` | `strict` |
| PHP | `false`, `0` | `true`, `1` | N/A |
| Python | `no` | `yes` | N/A |
| Rust | `PreferOff` | `On`, `Required` | `Strict` |

---

## Authentication Method Values

| Method | SqlClient | ODBC | JDBC | PHP |
|--------|-----------|------|------|-----|
| SQL Password | `Sql Password` | `SqlPassword` | `SqlPassword` | `SqlPassword` |
| Windows/SSPI | `True`, `SSPI` | `Yes` | `true` | `Yes` |
| AD Password | `Active Directory Password` | `ActiveDirectoryPassword` | `ActiveDirectoryPassword` | `ActiveDirectoryPassword` |
| AD Interactive | `Active Directory Interactive` | `ActiveDirectoryInteractive` | `ActiveDirectoryInteractive` | N/A |
| AD Integrated | `Active Directory Integrated` | `ActiveDirectoryIntegrated` | `ActiveDirectoryIntegrated` | N/A |
| AD Service Principal | `Active Directory Service Principal` | `ActiveDirectoryServicePrincipal` | `ActiveDirectoryServicePrincipal` | `ActiveDirectoryServicePrincipal` |
| AD Managed Identity | `Active Directory Managed Identity` | `ActiveDirectoryMsi` | `ActiveDirectoryManagedIdentity` | `ActiveDirectoryMsi` |
| AD Default | `Active Directory Default` | N/A | `ActiveDirectoryDefault` | N/A |
| AD Device Code Flow | `Active Directory Device Code Flow` | N/A | `ActiveDirectoryDeviceCodeFlow` | N/A |
| AD Workload Identity | `Active Directory Workload Identity` | N/A | `ActiveDirectoryWorkloadIdentity` | N/A |

---

## Rust TdsAuthenticationMethod Enum Values

| Variant | Description |
|---------|-------------|
| `Password` | SQL Server authentication (default) |
| `SSPI` | Integrated Authentication with AD |
| `ActiveDirectoryPassword` | Azure AD password |
| `ActiveDirectoryInteractive` | Azure AD interactive |
| `ActiveDirectoryDeviceCodeFlow` | Azure AD device code flow |
| `ActiveDirectoryServicePrincipal` | Azure AD service principal |
| `ActiveDirectoryManagedIdentity` | Azure AD managed identity |
| `ActiveDirectoryDefault` | Azure AD default |
| `ActiveDirectoryMSI` | Azure AD MSI (alias) |
| `ActiveDirectoryWorkloadIdentity` | Azure AD workload identity |
| `ActiveDirectoryIntegrated` | Azure AD integrated |
| `AccessToken` | Pre-fetched access token |

---

## Default Values Reference (Source Code Verified)

| Keyword | SqlClient | ODBC | JDBC | Rust |
|---------|-----------|------|------|------|
| Encrypt | `Mandatory` | `Yes` | `true` | `Strict` |
| Trust Server Certificate | `false` | `No` | `false` | `false` |
| Connect Timeout | `15` | `0` | `30` | `15` |
| Packet Size | `8000` | `4096` | `8000` | `8000` |
| Connect Retry Count | `1` | `1` | `1` | `0` |
| Connect Retry Interval | `10` | `10` | `10` | N/A |
| Pooling | `true` | N/A | N/A | `false` |
| Max Pool Size | `100` | N/A | N/A | N/A |
| Min Pool Size | `0` | N/A | N/A | N/A |
| MARS | `false` | `No` | *(always on)* | `false` |
| Application Intent | `ReadWrite` | `READWRITE` | `readwrite` | `ReadWrite` |
| IP Address Preference | `IPv4First` | `IPv4First` | `IPv4First` | `UsePlatformDefault` |

---

## OLEDB-Specific Features (Provider Keyword Required)

| Category | Keyword | Description |
|----------|---------|-------------|
| **Driver** | Provider ⚠️ **MANDATORY** | Must be first parameter in connection string |
| **Connection** | Data Source | Maps to `Server` in other drivers |
| **Connection** | Initial Catalog | Maps to `Database` in other drivers |
| **Security** | Use Encryption for Data | Maps to `Encrypt` in other drivers |
| **Security** | Trust Server Certificate | Space-separated variant |
| **Features** | MARS Connection | Maps to `MultipleActiveResultSets` in SqlClient |
| **Behavior** | Auto Translate | Automatic character set translation |

### ⚠️ CRITICAL: Provider Keyword Requirement

**Mandatory Format**: `Provider=<ProviderName>;[additional properties...]`

**Common Providers**:
- `MSOLEDBSQL` (✅ Recommended for SQL Server 2012+)
- `SQLNCLI11` (⚠️ Deprecated, SQL Server 2012-2019)
- `SQLOLEDB` (⚠️ Deprecated, legacy only)
- `Microsoft.Jet.OLEDB.4.0` (Legacy, for Access databases)

**Translation Rules**:
- **TO OLEDB**: Translator MUST inject `Provider=MSOLEDBSQL;` as first parameter
- **FROM OLEDB**: Translator MUST remove Provider keyword
- **Keyword Mapping**: `Data Source` ↔ `Server`, `Initial Catalog` ↔ `Database`, `Use Encryption for Data` ↔ `Encrypt`, `MARS Connection` ↔ `MultipleActiveResultSets`
- **Position**: Provider must always be first; connection strings without it are invalid

**Valid Examples**:
```
✅ Provider=MSOLEDBSQL;Data Source=server;Initial Catalog=db;User ID=user;Password=pass;
❌ Data Source=server;Provider=MSOLEDBSQL;... (Provider not first - INVALID)
❌ Data Source=server;Initial Catalog=db;... (Missing Provider - INVALID)
```

---

*Generated from driver source code via Bluebird MCP servers. Last updated: 2026-02-04*
