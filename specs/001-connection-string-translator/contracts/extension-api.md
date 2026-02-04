# VS Code Extension API Contract

**Created**: 2026-01-29  
**Phase**: 1 (Design)  
**Purpose**: Define the public API surface of the VS Code extension

---

## Extension Manifest (package.json)

### Activation Events

```json
{
  "activationEvents": [
    "onCommand:connectionStringTranslator.translate",
    "onCommand:connectionStringTranslator.translateSelection",
    "onCommand:connectionStringTranslator.translateClipboard",
    "onCommand:connectionStringTranslator.quickTranslate"
  ]
}
```

### Contribution Points

```json
{
  "contributes": {
    "commands": [
      {
        "command": "connectionStringTranslator.translate",
        "title": "Connection String: Open Translator",
        "category": "Connection String"
      },
      {
        "command": "connectionStringTranslator.translateSelection",
        "title": "Connection String: Translate Selection",
        "category": "Connection String"
      },
      {
        "command": "connectionStringTranslator.translateClipboard",
        "title": "Connection String: Translate from Clipboard",
        "category": "Connection String"
      },
      {
        "command": "connectionStringTranslator.quickTranslate",
        "title": "Connection String: Quick Translate to...",
        "category": "Connection String"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "connectionStringTranslator.translateSelection",
          "when": "editorHasSelection",
          "group": "1_modification"
        }
      ],
      "commandPalette": [
        {
          "command": "connectionStringTranslator.translate",
          "when": "true"
        },
        {
          "command": "connectionStringTranslator.translateSelection",
          "when": "editorHasSelection"
        },
        {
          "command": "connectionStringTranslator.translateClipboard",
          "when": "true"
        },
        {
          "command": "connectionStringTranslator.quickTranslate",
          "when": "true"
        }
      ]
    },
    "keybindings": [
      {
        "command": "connectionStringTranslator.translate",
        "key": "ctrl+shift+c ctrl+shift+t",
        "mac": "cmd+shift+c cmd+shift+t",
        "when": "editorTextFocus"
      }
    ]
  }
}
```

---

## Command Contracts

### `connectionStringTranslator.translate`

Opens the translator webview panel.

**Input**: None  
**Output**: Opens webview panel  
**Side Effects**: Creates/reveals webview panel

```typescript
async function translateCommand(): Promise<void> {
  // Creates or reveals the translator webview panel
  TranslatorPanel.createOrShow(context.extensionUri);
}
```

---

### `connectionStringTranslator.translateSelection`

Translates the currently selected text in the editor.

**Input**: None (uses editor selection)  
**Output**: Quick pick for target driver, then shows result  
**Precondition**: `editorHasSelection` is true

```typescript
async function translateSelectionCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showWarningMessage('No text selected');
    return;
  }
  
  const selectedText = editor.document.getText(editor.selection);
  
  // Show driver picker
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return; // User cancelled
  
  // Translate and show result
  const result = translate(selectedText, targetDriver);
  await showTranslationResult(result);
}
```

---

### `connectionStringTranslator.translateClipboard`

Translates connection string from clipboard.

**Input**: None (uses clipboard)  
**Output**: Quick pick for target driver, then shows result

```typescript
async function translateClipboardCommand(): Promise<void> {
  const clipboardText = await vscode.env.clipboard.readText();
  if (!clipboardText?.trim()) {
    vscode.window.showWarningMessage('Clipboard is empty');
    return;
  }
  
  // Show driver picker
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return;
  
  // Translate
  const result = translate(clipboardText, targetDriver);
  
  // Copy result to clipboard
  if (result.success) {
    await vscode.env.clipboard.writeText(result.connectionString);
    vscode.window.showInformationMessage(
      `Translated to ${targetDriver} and copied to clipboard`
    );
  }
}
```

---

### `connectionStringTranslator.quickTranslate`

Quick translate with input box workflow.

**Input**: Prompts for connection string and target driver  
**Output**: Result copied to clipboard

```typescript
async function quickTranslateCommand(): Promise<void> {
  // Get connection string
  const input = await vscode.window.showInputBox({
    prompt: 'Enter connection string to translate',
    placeHolder: 'Server=localhost;Database=mydb;...',
    ignoreFocusOut: true
  });
  if (!input) return;
  
  // Get target driver
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return;
  
  // Translate and copy
  const result = translate(input, targetDriver);
  if (result.success) {
    await vscode.env.clipboard.writeText(result.connectionString);
    vscode.window.showInformationMessage('Translated and copied!');
  }
}
```

---

## Helper Functions

### `showDriverPicker`

Shows quick pick for target driver selection.

```typescript
interface DriverPickItem extends vscode.QuickPickItem {
  driver: DriverType;
}

async function showDriverPicker(): Promise<DriverType | undefined> {
  const items: DriverPickItem[] = [
    { label: 'SqlClient', description: 'Microsoft.Data.SqlClient', driver: 'sqlclient' },
    { label: 'ODBC', description: 'ODBC Driver for SQL Server', driver: 'odbc' },
    { label: 'OLEDB', description: 'MSOLEDBSQL Provider', driver: 'oledb' },
    { label: 'JDBC', description: 'mssql-jdbc', driver: 'jdbc' },
    { label: 'PHP', description: 'sqlsrv / PDO_SQLSRV', driver: 'php' },
    { label: 'Python', description: 'mssql-python / pyodbc', driver: 'python' },
    { label: 'Rust', description: 'mssql-tds ClientContext', driver: 'rust' }
  ];
  
  const selected = await vscode.window.showQuickPick(items, {
    title: 'Select Target Driver Format',
    placeHolder: 'Choose the driver format to translate to'
  });
  
  return selected?.driver;
}
```

---

## Webview Panel Contract

### Panel Creation

```typescript
class TranslatorPanel {
  public static readonly viewType = 'connectionStringTranslator.translatorView';
  
  public static createOrShow(extensionUri: vscode.Uri): TranslatorPanel {
    // Singleton pattern - reuse existing panel or create new
  }
  
  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri
  ) {
    // Initialize webview content
    // Set up message handlers
  }
}
```

### Webview HTML Contract

The webview HTML must include:

1. **Input Area**: Text area for connection string input
2. **Driver Selector**: Buttons/dropdown for target driver selection
3. **Translate Button**: Triggers translation
4. **Output Area**: Displays translated connection string
5. **Copy Button**: Copies result to clipboard
6. **Warnings Area**: Shows translation warnings
7. **Detected Format**: Shows auto-detected source format

### CSS Variables for Theme Integration

```css
:root {
  /* Must use VS Code CSS variables for theme compatibility */
  --vscode-editor-background: var(--vscode-editor-background);
  --vscode-editor-foreground: var(--vscode-editor-foreground);
  --vscode-button-background: var(--vscode-button-background);
  --vscode-button-foreground: var(--vscode-button-foreground);
  --vscode-input-background: var(--vscode-input-background);
  --vscode-input-border: var(--vscode-input-border);
  --vscode-focusBorder: var(--vscode-focusBorder);
}
```

---

## Error Handling Contract

### User-Facing Errors

| Scenario | Message Type | Message |
|----------|--------------|---------|
| Empty input | Warning | "No connection string provided" |
| Parse error | Error | "Failed to parse: {details}" |
| Clipboard empty | Warning | "Clipboard is empty" |
| No selection | Warning | "No text selected" |
| Translation failed | Error | "Translation failed: {details}" |

### Success Notifications

| Scenario | Message Type | Message |
|----------|--------------|---------|
| Clipboard translation | Info | "Translated to {driver} and copied to clipboard" |
| Quick translate | Info | "Translated and copied!" |
| Copy from panel | Info | "Copied to clipboard" |

---

## Extension Lifecycle

### Activation

```typescript
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  // Register all commands
  context.subscriptions.push(
    vscode.commands.registerCommand('connectionStringTranslator.translate', translateCommand),
    vscode.commands.registerCommand('connectionStringTranslator.translateSelection', translateSelectionCommand),
    vscode.commands.registerCommand('connectionStringTranslator.translateClipboard', translateClipboardCommand),
    vscode.commands.registerCommand('connectionStringTranslator.quickTranslate', quickTranslateCommand)
  );
}
```

### Deactivation

```typescript
export function deactivate(): void {
  // Dispose webview panel if open
  TranslatorPanel.currentPanel?.dispose();
}
```

---

*Contract designed for VS Code Extension API 1.80+. All commands follow VS Code UX guidelines.*
