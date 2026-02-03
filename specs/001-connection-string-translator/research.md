# Research: SQL Server Connection String Translator

**Created**: 2026-01-29  
**Phase**: 0 (Research)  
**Purpose**: Resolve technical unknowns identified during planning

---

## Research Summary

All technical unknowns have been resolved through source code analysis and documentation review.

| Unknown | Decision | Rationale | Alternatives Considered |
|---------|----------|-----------|------------------------|
| VS Code Extension Structure | Standard webview + commands | Official pattern for rich UI extensions | Tree view (too limited), custom editor (overkill) |
| Keyword Data Source | Static TypeScript objects | Fast, no I/O, compile-time type safety | JSON files (requires async load), database (overkill) |
| Parser Strategy | Regex + state machine hybrid | Handles quoted values, escaping, special chars | Pure regex (too complex), full grammar (overkill) |
| Webview Communication | postMessage API | Standard VS Code pattern, secure | SharedWorker (not supported), direct calls (not possible) |
| Test Strategy | Jest (unit) + @vscode/test-electron (integration) | Industry standard for VS Code extensions | Vitest (less VS Code tooling) |
| Bundler | Webpack | Best VS Code extension support | esbuild (faster but less mature for extensions) |

---

## R1: VS Code Extension Architecture

### Decision: Webview Panel + Commands

**Research**: Evaluated VS Code extension UI patterns.

| Pattern | Pros | Cons | Fit |
|---------|------|------|-----|
| **Webview Panel** | Full HTML/CSS/JS, rich UI | Requires message passing | ✅ Best for translator UI |
| Tree View | Native look, lightweight | Limited to hierarchical data | ❌ Not suitable |
| Quick Pick | Native, fast | Limited to list selection | ✅ Good for target selection |
| Input Box | Native, simple | Single text input only | ✅ Good for quick input |
| Custom Editor | Full document editing | Overkill, complex lifecycle | ❌ Not suitable |

**Decision**: 
- **Primary UI**: Webview Panel for full translator interface
- **Secondary**: Quick Pick for target driver selection
- **Tertiary**: Input Box for quick translation without UI

### Key VS Code APIs Required

```typescript
// Core APIs needed
import * as vscode from 'vscode';

vscode.commands.registerCommand()     // Command registration
vscode.window.createWebviewPanel()    // Webview creation
vscode.window.showQuickPick()         // Driver selection
vscode.window.showInputBox()          // Connection string input
vscode.env.clipboard.readText()       // Clipboard read
vscode.env.clipboard.writeText()      // Clipboard write
vscode.window.showInformationMessage() // Notifications
```

---

## R2: Connection String Parsing Strategy

### Decision: Regex + State Machine Hybrid

**Research**: Analyzed connection string syntax complexity.

| Syntax Feature | Example | Parser Requirement |
|----------------|---------|-------------------|
| Basic key=value | `Server=localhost` | Simple regex |
| Quoted values | `Password="pass;word"` | State tracking for quote pairs |
| Brace escaping | `Password={pass;word}` | JDBC-specific, nested brace handling |
| Embedded semicolons | `Password=pass;;word` | Double-semicolon escape (some drivers) |
| Whitespace | `Server = localhost` | Normalize around = |
| Empty values | `Password=;` | Allow empty strings |
| JDBC URL prefix | `jdbc:sqlserver://host:port` | Special prefix parsing |

**Decision**: Two-phase parser:
1. **Tokenizer**: Character-by-character with quote/brace state tracking
2. **Key-Value Extractor**: Split tokens into normalized key-value pairs

### Parser Pseudocode

```typescript
interface ParseResult {
  driver: DriverType;
  pairs: Map<string, string>;
  errors: ParseError[];
  warnings: ParseWarning[];
}

function parse(input: string): ParseResult {
  // Phase 1: Detect driver format
  const driver = detectDriver(input);
  
  // Phase 2: Tokenize based on driver rules
  const tokens = tokenize(input, driver);
  
  // Phase 3: Extract key-value pairs
  const pairs = extractPairs(tokens);
  
  // Phase 4: Validate and warn
  const {errors, warnings} = validate(pairs, driver);
  
  return {driver, pairs, errors, warnings};
}
```

---

## R3: Keyword Mapping Architecture

### Decision: Static TypeScript Registry

**Research**: Evaluated data storage options for 128+ keywords.

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Static TS objects | Compile-time checks, fast, tree-shakable | Hardcoded | ✅ Selected |
| JSON files | Easy to edit | Requires async load, no type safety | ❌ |
| SQLite | Flexible queries | Overkill, adds dependency | ❌ |

### Data Structure Design

```typescript
// Canonical keyword with driver-specific names
interface Keyword {
  id: string;                    // Canonical identifier: "server"
  category: KeywordCategory;     // "connection", "auth", "security", etc.
  drivers: Partial<Record<DriverType, DriverKeyword>>;
}

interface DriverKeyword {
  name: string;                  // Driver-specific keyword name
  synonyms?: string[];           // Additional accepted names
  type: 'string' | 'boolean' | 'integer' | 'enum';
  defaultValue?: string | boolean | number;
  required?: boolean;
  deprecated?: boolean;
}

// Mapping example
const serverKeyword: Keyword = {
  id: 'server',
  category: 'connection',
  drivers: {
    sqlclient: { name: 'Server', synonyms: ['Data Source', 'Address', 'Addr', 'Network Address'], type: 'string' },
    odbc: { name: 'Server', type: 'string' },
    oledb: { name: 'Data Source', type: 'string' },
    jdbc: { name: null, type: 'string' }, // In URL, not key-value
    php: { name: 'Server', type: 'string' },
    python: { name: 'Server', type: 'string' },
    rust: { name: 'transport_context.host', type: 'string' }
  }
};
```

### Rust Struct Translation Strategy (CHK026)

Rust mssql-tds uses `ClientContext` struct with nested types. Translation to Rust generates struct initialization code:

**Input** (SqlClient):
```
Server=localhost;Database=mydb;Encrypt=True;TrustServerCertificate=False
```

**Output** (Rust):
```rust
ClientContext {
    transport_context: TransportContext::Tcp {
        host: "localhost".to_string(),
        port: 1433,
    },
    database: "mydb".to_string(),
    encryption_options: EncryptionOptions {
        mode: EncryptionSetting::On,
        trust_server_certificate: false,
        host_name_in_cert: None,
    },
    ..Default::default()
}
```

**Nested Field Mapping**:
| Dot Notation | Rust Struct Path |
|--------------|------------------|
| `transport_context.host` | `transport_context: TransportContext::Tcp { host: ... }` |
| `transport_context.port` | `transport_context: TransportContext::Tcp { port: ... }` |
| `encryption_options.mode` | `encryption_options: EncryptionOptions { mode: ... }` |
| `encryption_options.trust_server_certificate` | `encryption_options: EncryptionOptions { trust_server_certificate: ... }` |

---

## R4: Webview Panel Implementation

### Decision: Single HTML with Embedded CSS/JS

**Research**: Evaluated webview content strategies.

| Strategy | Pros | Cons | Decision |
|----------|------|------|----------|
| Single HTML template | Simple bundling, fast load | All in one file | ✅ Selected |
| Separate CSS/JS files | Clean separation | Complex resource loading | ❌ |
| React/Vue | Rich interactivity | Build complexity, size | ❌ Overkill |

### Webview Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ VS Code Extension Host                                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ TranslatorPanel (src/webview/panel.ts)                  ││
│  │  - Creates webview                                       ││
│  │  - Handles postMessage from webview                      ││
│  │  - Calls translator engine                               ││
│  │  - Sends results back to webview                         ││
│  └───────────────────────┬─────────────────────────────────┘│
│                          │ postMessage                       │
│  ┌───────────────────────▼─────────────────────────────────┐│
│  │ Webview (iframe)                                         ││
│  │  - index.html + styles.css + script.ts                   ││
│  │  - User input handling                                   ││
│  │  - Result display                                        ││
│  │  - Copy to clipboard                                     ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Message Protocol

```typescript
// Webview → Extension
type WebviewMessage = 
  | { command: 'translate'; input: string; targetDriver: DriverType }
  | { command: 'translateAll'; input: string }
  | { command: 'copy'; text: string };

// Extension → Webview
type ExtensionMessage =
  | { command: 'translationResult'; result: TranslationResult }
  | { command: 'translationError'; error: string }
  | { command: 'allResults'; results: TranslationResult[] };
```

---

## R5: Testing Strategy

### Decision: Jest + @vscode/test-electron

**Research**: Evaluated test frameworks for VS Code extensions.

| Component | Framework | Rationale |
|-----------|-----------|-----------|
| Core translator engine | Jest | Fast, no VS Code dependency, pure logic |
| VS Code commands | @vscode/test-electron | Official VS Code test runner |
| Webview | Manual + E2E if needed | Limited testability |

### Test Structure

```text
test/
├── unit/                      # Jest - runs fast, no VS Code
│   ├── parser.test.ts        # 100% coverage
│   ├── detector.test.ts      # All driver detection cases
│   ├── mapper.test.ts        # Keyword mapping logic
│   ├── generator.test.ts     # Output generation
│   └── validator.test.ts     # Validation rules
├── integration/               # @vscode/test-electron - slower
│   ├── commands.test.ts      # Command execution
│   └── webview.test.ts       # Panel creation (smoke test)
└── fixtures/
    ├── valid-strings.ts      # Known good connection strings
    ├── invalid-strings.ts    # Malformed inputs
    └── edge-cases.ts         # Special character handling
```

### Coverage Requirements (Constitution II)

- **Unit tests**: 100% line/branch coverage for `src/translator/`
- **Integration tests**: Smoke tests for all commands
- **Exception**: Webview HTML/CSS (not TypeScript)

---

## R6: Build and Bundling

### Decision: Webpack with Extension-Optimized Config

**Research**: VS Code extensions require specific bundling.

| Bundler | VS Code Support | Size Optimization | Decision |
|---------|-----------------|-------------------|----------|
| Webpack | Official template | Excellent | ✅ Selected |
| esbuild | Community support | Excellent | ❌ Less mature |
| Rollup | Possible | Good | ❌ Less tooling |
| None | Possible | Poor | ❌ Slow activation |

### Webpack Configuration Highlights

```javascript
// Key webpack config points
module.exports = {
  target: 'node',                    // Extension host runs in Node
  entry: './src/extension.ts',       // Single entry point
  externals: { vscode: 'commonjs vscode' }, // Don't bundle VS Code
  resolve: { extensions: ['.ts', '.js'] },
  module: { rules: [{ test: /\.ts$/, use: 'ts-loader' }] },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  }
};
```

---

## Dependencies Summary

### Runtime Dependencies

| Dependency | Version | Purpose | Size Impact |
|------------|---------|---------|-------------|
| vscode | API only | Extension host API | 0 (external) |

**Note**: Zero runtime dependencies. All translation logic is pure TypeScript.

### Development Dependencies

| Dependency | Purpose |
|------------|---------|
| typescript | Language |
| @types/vscode | VS Code API types |
| @types/node | Node.js types |
| webpack, webpack-cli | Bundling |
| ts-loader | TypeScript compilation |
| jest, @types/jest, ts-jest | Unit testing |
| @vscode/test-electron | Integration testing |
| eslint, @typescript-eslint/* | Linting |
| prettier | Formatting |

---

## Resolved: All Unknowns

No remaining "NEEDS CLARIFICATION" items. Ready for Phase 1 design.
