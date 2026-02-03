# Quickstart: SQL Server Connection String Translator

**Created**: 2026-01-29  
**Phase**: 1 (Design)  
**Purpose**: Getting started guide for developers

---

## Prerequisites

- **Node.js**: 18.x or later
- **VS Code**: 1.80 or later (for running/debugging the extension)
- **npm** or **pnpm**: Package manager

---

## Initial Setup

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd sqlconnectionstrings

# Install dependencies
npm install
```

### 2. Project Structure

```text
sqlconnectionstrings/
├── src/                     # Extension source code
│   ├── extension.ts        # Entry point
│   ├── translator/         # Core translation engine
│   ├── drivers/            # Driver configurations
│   ├── webview/            # Webview panel
│   └── commands/           # VS Code commands
├── test/                    # Test files
│   ├── unit/               # Jest unit tests
│   └── integration/        # VS Code integration tests
├── media/                   # Static assets
├── specs/                   # Specifications
└── package.json            # Extension manifest
```

---

## Development Workflow

### Compile TypeScript

```bash
# One-time compilation
npm run compile

# Watch mode (recommended during development)
npm run watch
```

### Run Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=parser
```

### Run Extension in Debug Mode

1. Open the project in VS Code
2. Press `F5` or select **Run > Start Debugging**
3. A new VS Code window opens with the extension loaded
4. Test commands via Command Palette (`Cmd/Ctrl+Shift+P`)

### Run Integration Tests

```bash
# Runs VS Code extension tests
npm run test:integration
```

---

## Key Development Tasks

### Adding a New Keyword

1. **Add to keyword registry** (`src/data/keywords.ts`):

```typescript
export const keywords: Keyword[] = [
  // ... existing keywords
  {
    id: 'newKeyword',
    displayName: 'New Keyword',
    category: 'security',
    drivers: {
      sqlclient: { name: 'NewKeyword', type: 'boolean', defaultValue: false },
      odbc: { name: 'NewKeyword', type: 'boolean', defaultValue: false },
      jdbc: { name: 'newKeyword', type: 'boolean', defaultValue: false },
      // ... other drivers
    }
  }
];
```

2. **Add test cases** (`test/unit/mapper.test.ts`):

```typescript
describe('newKeyword mapping', () => {
  it('should translate SqlClient to JDBC', () => {
    const result = translateKeyword('NewKeyword', 'true', 'sqlclient', 'jdbc');
    expect(result.targetKeyword).toBe('newKeyword');
    expect(result.targetValue).toBe('true');
  });
});
```

3. **Run tests** to verify:

```bash
npm test
```

### Adding a New Driver

1. **Add driver type** (`src/translator/types.ts`):

```typescript
export type DriverType = 
  | 'sqlclient'
  | 'newdriver'  // Add new driver
  // ...
```

2. **Create driver configuration** (`src/drivers/newdriver.ts`):

```typescript
import { DriverConfig } from './types';

export const newdriverConfig: DriverConfig = {
  name: 'newdriver',
  displayName: 'New Driver',
  format: 'keyvalue', // or 'url'
  separator: ';',
  keyValueSeparator: '=',
  // ... escaping rules
};
```

3. **Register in driver index** (`src/drivers/index.ts`):

```typescript
import { newdriverConfig } from './newdriver';
export const drivers = { ..., newdriver: newdriverConfig };
```

4. **Add keyword mappings** for the new driver in `src/data/keywords.ts`

5. **Add detection logic** in `src/translator/detector.ts`

6. **Add tests** for parsing, detection, and generation

---

## Building for Production

### Create VSIX Package

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package the extension
npm run package

# Output: connection-string-translator-x.x.x.vsix
```

### Install Locally

```bash
# Install the VSIX in VS Code
code --install-extension connection-string-translator-x.x.x.vsix
```

---

## Common Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile TypeScript |
| `npm run watch` | Compile in watch mode |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:integration` | Run VS Code integration tests |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |
| `npm run package` | Build VSIX package |

---

## Debugging Tips

### Debug Unit Tests in VS Code

1. Set breakpoints in test files
2. Open **Run and Debug** panel
3. Select "Debug Unit Tests" configuration
4. Press F5

### Debug Extension Host

1. Set breakpoints in extension code
2. Press F5 to launch Extension Development Host
3. Trigger commands in the new window
4. Breakpoints will hit in the original window

### View Extension Logs

In the Extension Development Host:
- Open **Output** panel (`Cmd/Ctrl+Shift+U`)
- Select "Connection String Translator" from dropdown

---

## Code Quality Checklist

Before submitting a PR:

- [ ] All tests pass (`npm test`)
- [ ] Coverage is 100% (`npm run test:coverage`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Integration tests pass (`npm run test:integration`)
- [ ] CHANGELOG updated (if applicable)

---

## Resources

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Webview API Guide](https://code.visualstudio.com/api/extension-guides/webview)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Feature Specification](./spec.md)
- [Data Model](./data-model.md)
- [Keyword Matrix](./research/keyword-matrix-summary.md)

---

*Quickstart guide for SQL Server Connection String Translator VS Code Extension*
