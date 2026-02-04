/**
 * Rust Driver Configuration
 * mssql-tds (tiberius)
 * 
 * IMPORTANT: Rust uses struct-based configuration with nested fields.
 * Translation generates ClientContext struct initialization code.
 */
import { DriverConfig } from '../translator/types';

/** Mapping from canonical keyword IDs to Rust struct field paths */
export const RUST_FIELD_MAPPINGS: Record<string, string> = {
  // TransportContext fields
  server: 'transport_context.host',
  port: 'transport_context.port',
  
  // Main fields
  database: 'database',
  user: 'auth.user',
  password: 'auth.password',
  
  // EncryptionOptions fields
  encrypt: 'encryption_options.mode',
  trustservercertificate: 'encryption_options.trust_server_certificate',
  hostnameincertificate: 'encryption_options.host_name_in_cert',
  
  // Authentication
  integratedsecurity: 'auth.integrated_security',
  authentication: 'auth.authentication_method',
  
  // Timeouts
  connecttimeout: 'connect_timeout',
  commandtimeout: 'command_timeout',
  
  // Application info
  applicationname: 'application_name',
  
  // Trust
  trustservercertificateca: 'encryption_options.trust_cert_ca',
};

/** Get Rust struct field path for a keyword */
export function getRustFieldPath(keywordId: string): string | undefined {
  return RUST_FIELD_MAPPINGS[keywordId.toLowerCase().replace(/\s+/g, '')];
}

export const rustDriver: DriverConfig = {
  type: 'rust',
  displayName: 'Rust (mssql-tds)',
  detectionPatterns: [
    // Rust struct patterns
    /ClientContext\s*\{/,
    /transport_context\s*:/,
    /encryption_options\s*:/,
  ],
  detectionConfidence: 'high',
  escapeRules: {
    // Rust uses standard string escaping
    quoteChar: '"',
    escapeSequence: '\\"',
  },
};
