/**
 * Translator Panel
 *
 * Webview panel for the connection string translator UI.
 * Implements:
 * - FR-010: Copy buttons
 * - FR-011: Keyboard shortcuts
 */
import * as vscode from 'vscode';
import {
  WebviewMessage,
  ExtensionMessage,
  DriverType,
  TranslationResult,
  ALL_DRIVERS,
} from '../translator/types';
import { translate, translateAll } from '../translator';
import { detect } from '../translator/detector';
import { validateSyntax } from '../translator/validator';

import { getSidebarProvider } from '../extension';

// Create output channel for logging
const outputChannel = vscode.window.createOutputChannel('Connection String Translator');

function log(message: string, data?: unknown): void {
  const timestamp = new Date().toISOString();
  outputChannel.appendLine(`[${timestamp}] ${message}`);
  if (data !== undefined) {
    outputChannel.appendLine(`  Data: ${JSON.stringify(data, null, 2)}`);
  }
}

export class TranslatorPanel {
  public static currentPanel: TranslatorPanel | undefined;
  public static readonly viewType = 'connectionStringTranslator';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;
  private _disposables: vscode.Disposable[] = [];
  private _initialConnectionString: string = '';

  /** Get the extension URI (for resource loading) */
  public get extensionUri(): vscode.Uri {
    return this._extensionUri;
  }

  public static createOrShow(extensionUri: vscode.Uri, initialConnectionString?: string) {
    log('createOrShow called', { extensionUri: extensionUri.toString(), initialConnectionString });
    outputChannel.show(true); // Show the output channel
    
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (TranslatorPanel.currentPanel) {
      log('Revealing existing panel');
      TranslatorPanel.currentPanel._panel.reveal(column);
      // If we have an initial connection string, send it to the webview
      if (initialConnectionString) {
        TranslatorPanel.currentPanel._setInitialInput(initialConnectionString);
      }
      return;
    }

    log('Creating new webview panel');
    const panel = vscode.window.createWebviewPanel(
      TranslatorPanel.viewType,
      'Connection String Translator',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    TranslatorPanel.currentPanel = new TranslatorPanel(panel, extensionUri, initialConnectionString);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, initialConnectionString?: string) {
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._initialConnectionString = initialConnectionString || '';

    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message: WebviewMessage) => {
        await this._handleMessage(message);
      },
      null,
      this._disposables
    );
  }

  public dispose() {
    TranslatorPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }

  /**
   * Set initial input and trigger translation
   */
  private _setInitialInput(connectionString: string) {
    this._panel.webview.postMessage({
      command: 'setInput',
      connectionString,
    });
  }

  private async _handleMessage(message: WebviewMessage) {
    log('Received message from webview', { command: message.command });
    try {
      switch (message.command) {
        case 'translate':
          await this._handleTranslate(message);
          break;
        case 'translateAll':
          await this._handleTranslateAll(message);
          break;
        case 'detect':
          await this._handleDetect(message);
          break;
        case 'validate':
          await this._handleValidate(message);
          break;
        case 'copy':
          await this._handleCopy(message);
          break;
        case 'copyWithDriver':
          await this._handleCopyWithDriver(message);
          break;
        default:
          log('Unknown command received', message);
      }
    } catch (error) {
      log('Error handling message', { error: error instanceof Error ? error.message : error });
      this._sendError(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async _handleTranslate(message: WebviewMessage & { command: 'translate' }) {
    log('_handleTranslate called', { input: message.input, targetDriver: message.targetDriver });
    try {
      const result = translate(
        message.input,
        message.targetDriver,
      );
      log('Translation result', result);
      this._sendResult(result);
    } catch (error) {
      log('Translation error', { error: error instanceof Error ? error.message : error });
      this._sendError(error instanceof Error ? error.message : 'Translation failed');
    }
  }

  private async _handleTranslateAll(message: WebviewMessage & { command: 'translateAll' }) {
    log('_handleTranslateAll called', { input: message.input });
    try {
      // Detect the source driver for history
      const detection = detect(message.input);
      
      const resultsArray = translateAll(message.input);
      log('TranslateAll results count', { count: resultsArray.length });
      const results: Record<DriverType, TranslationResult> = {} as Record<DriverType, TranslationResult>;
      resultsArray.forEach((result, index) => {
        results[ALL_DRIVERS[index]] = result;
      });
      log('Sending translateAllResult to webview');
      this._postMessage({
        command: 'translateAllResult',
        results,
      });
      
      // Add to history
      const sidebarProvider = getSidebarProvider();
      if (sidebarProvider && message.input.trim()) {
        sidebarProvider.addToHistory(message.input, detection.driver || 'unknown');
      }
    } catch (error) {
      log('TranslateAll error', { error: error instanceof Error ? error.message : error });
      this._sendError(error instanceof Error ? error.message : 'Translation failed');
    }
  }

  private async _handleDetect(message: WebviewMessage & { command: 'detect' }) {
    const detection = detect(message.input);
    this._postMessage({
      command: 'detectResult',
      detection: {
        driver: detection.driver,
        confidence: detection.confidence,
      },
    });
  }

  private async _handleValidate(message: WebviewMessage & { command: 'validate' }) {
    const syntaxResult = validateSyntax(message.input);
    this._postMessage({
      command: 'validateResult',
      validation: syntaxResult,
    });
  }

  private async _handleCopy(message: WebviewMessage & { command: 'copy' }) {
    await vscode.env.clipboard.writeText(message.input);
    vscode.window.showInformationMessage('Copied to clipboard!');
  }

  private async _handleCopyWithDriver(message: WebviewMessage & { command: 'copyWithDriver'; driver: string }) {
    await vscode.env.clipboard.writeText(message.input);
    vscode.window.showInformationMessage(`${message.driver} connection string copied to clipboard!`);
  }

  private _sendResult(result: TranslationResult) {
    this._postMessage({
      command: 'translateResult',
      result,
    });
  }

  private _sendError(message: string) {
    log('Sending error to webview', { message });
    this._postMessage({
      command: 'error',
      message,
    });
  }

  private _postMessage(message: ExtensionMessage) {
    log('_postMessage called', { command: message.command });
    const result = this._panel.webview.postMessage(message);
    log('postMessage result', { success: result });
  }

  private _update() {
    this._panel.title = 'Connection String Translator';
    this._panel.webview.html = this._getHtmlContent();
    
    // If we have an initial connection string, send it after a short delay to ensure webview is ready
    if (this._initialConnectionString) {
      setTimeout(() => {
        this._setInitialInput(this._initialConnectionString);
        this._initialConnectionString = ''; // Clear after use
      }, 100);
    }
  }

  private _getHtmlContent(): string {
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Connection String Translator</title>
    <style>
        :root {
            --vscode-font-family: var(--vscode-editor-font-family, 'Segoe UI', sans-serif);
        }
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        h1 {
            color: var(--vscode-titleBar-activeForeground);
            margin-bottom: 20px;
            font-size: 24px;
        }
        .section {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }
        textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            resize: vertical;
            border-radius: 4px;
        }
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        select {
            padding: 8px 12px;
            border: 1px solid var(--vscode-dropdown-border);
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            font-size: 13px;
            border-radius: 4px;
            min-width: 200px;
        }
        .driver-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
        }
        .driver-row > div {
            flex: 1;
        }
        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            margin-right: 8px;
            margin-top: 10px;
        }
        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .output-section {
            margin-top: 20px;
            padding: 15px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 4px;
        }
        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .output-header h3 {
            margin: 0;
            font-size: 16px;
        }
        .output-content {
            background-color: var(--vscode-editor-background);
            padding: 12px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 13px;
            word-break: break-all;
            white-space: pre-wrap;
            max-height: 200px;
            overflow-y: auto;
        }
        .output-content.rust-code {
            white-space: pre;
            word-break: normal;
            overflow-x: auto;
        }
        .code-block-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--vscode-editorGroupHeader-tabsBackground);
            padding: 4px 12px;
            border-radius: 4px 4px 0 0;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .code-block-header + .output-content {
            border-radius: 0 0 4px 4px;
        }
        /* Rust syntax highlighting */
        .rust-keyword { color: var(--vscode-symbolIcon-keywordForeground, #569cd6); }
        .rust-type { color: var(--vscode-symbolIcon-classForeground, #4ec9b0); }
        .rust-string { color: var(--vscode-symbolIcon-stringForeground, #ce9178); }
        .rust-field { color: var(--vscode-symbolIcon-fieldForeground, #9cdcfe); }
        .rust-bool { color: var(--vscode-symbolIcon-booleanForeground, #569cd6); }
        .rust-comment { color: var(--vscode-symbolIcon-commentForeground, #6a9955); }
        .warnings {
            margin-top: 15px;
            padding: 10px;
            background-color: var(--vscode-inputValidation-warningBackground);
            border: 1px solid var(--vscode-inputValidation-warningBorder);
            border-radius: 4px;
        }
        .warnings h4 {
            margin: 0 0 8px 0;
            color: var(--vscode-editorWarning-foreground);
        }
        .warnings ul {
            margin: 0;
            padding-left: 20px;
        }
        .errors {
            margin-top: 15px;
            padding: 10px;
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            border-radius: 4px;
        }
        .errors h4 {
            margin: 0 0 8px 0;
            color: var(--vscode-editorError-foreground);
        }
        .untranslatable {
            margin-top: 15px;
            padding: 10px;
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            border-radius: 4px;
        }
        .untranslatable h4 {
            margin: 0 0 8px 0;
            color: var(--vscode-editorInfo-foreground);
        }
        .detection-badge {
            display: inline-block;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 12px;
            margin-left: 8px;
        }
        .detection-high {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }
        .detection-medium {
            background-color: var(--vscode-testing-iconQueued);
            color: white;
        }
        .detection-low {
            background-color: var(--vscode-testing-iconUnset);
            color: white;
        }
        .all-formats {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .format-card {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
        }
        .format-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .format-card-header h4 {
            margin: 0;
            text-transform: uppercase;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .warning-icon {
            cursor: help;
            font-size: 14px;
        }
        .warning-icon[title] {
            position: relative;
        }
        .format-card-content {
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 12px;
            word-break: break-all;
            max-height: 100px;
            overflow-y: auto;
        }
        .copy-btn {
            padding: 4px 8px;
            font-size: 11px;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 SQL Server Connection String Translator</h1>
        
        <div class="section">
            <label for="inputString">Connection String</label>
            <textarea id="inputString" placeholder="Paste your connection string here..."></textarea>
        </div>

        <div class="driver-row">
            <div>
                <label for="sourceDriver">Source Format (auto-detected if empty)</label>
                <select id="sourceDriver">
                    <option value="">Auto-detect</option>
                    <option value="sqlclient">SqlClient (.NET)</option>
                    <option value="odbc">ODBC</option>
                    <option value="oledb">OLEDB</option>
                    <option value="jdbc">JDBC</option>
                    <option value="php">PHP (sqlsrv)</option>
                    <option value="python">Python (mssql)</option>
                    <option value="rust">Rust (mssql-tds)</option>
                </select>
                <span id="detectionBadge" class="detection-badge hidden"></span>
            </div>
            <div>
                <label for="targetDriver">Target Format</label>
                <select id="targetDriver">
                    <option value="sqlclient">SqlClient (.NET)</option>
                    <option value="odbc">ODBC</option>
                    <option value="oledb">OLEDB</option>
                    <option value="jdbc">JDBC</option>
                    <option value="php">PHP (sqlsrv)</option>
                    <option value="python">Python (mssql)</option>
                    <option value="rust">Rust (mssql-tds)</option>
                </select>
            </div>
        </div>

        <div class="section">
            <button id="translateBtn" class="btn-primary">Translate</button>
            <button id="translateAllBtn" class="btn-secondary">Translate to All Formats</button>
            <button id="validateBtn" class="btn-secondary">Validate Only</button>
            <button id="clearBtn" class="btn-secondary">Clear</button>
        </div>

        <div id="singleOutput" class="output-section hidden">
            <div class="output-header">
                <h3>Translated Connection String</h3>
                <button id="copySingleBtn" class="btn-secondary copy-btn">📋 Copy</button>
            </div>
            <div id="outputContent" class="output-content"></div>
            
            <div id="warningsSection" class="warnings hidden">
                <h4>⚠️ Warnings</h4>
                <ul id="warningsList"></ul>
            </div>
            
            <div id="untranslatableSection" class="untranslatable hidden">
                <h4>ℹ️ Untranslatable Keywords</h4>
                <ul id="untranslatableList"></ul>
            </div>
        </div>

        <div id="allOutput" class="output-section hidden">
            <div class="output-header">
                <h3>All Formats</h3>
            </div>
            <div id="allFormatsGrid" class="all-formats"></div>
        </div>

        <div id="errorsSection" class="errors hidden">
            <h4>❌ Errors</h4>
            <ul id="errorsList"></ul>
        </div>
    </div>

    <script nonce="${nonce}">
        console.log('[CST] *** SCRIPT TAG EXECUTING ***');
        (function() {
        try {
            console.log('[CST] Webview script initializing...');
            const vscode = acquireVsCodeApi();
            console.log('[CST] VS Code API acquired:', !!vscode);
            
            function logAndPost(msg) {
                console.log('[CST] Sending message to extension:', JSON.stringify(msg));
                vscode.postMessage(msg);
            }
            
            const inputEl = document.getElementById('inputString');
            const sourceDriverEl = document.getElementById('sourceDriver');
            const targetDriverEl = document.getElementById('targetDriver');
            const detectionBadge = document.getElementById('detectionBadge');
            const singleOutput = document.getElementById('singleOutput');
            const allOutput = document.getElementById('allOutput');
            const outputContent = document.getElementById('outputContent');
            const warningsSection = document.getElementById('warningsSection');
            const warningsList = document.getElementById('warningsList');
            const untranslatableSection = document.getElementById('untranslatableSection');
            
            console.log('[CST] DOM elements found:', {
                inputEl: !!inputEl,
                sourceDriverEl: !!sourceDriverEl,
                targetDriverEl: !!targetDriverEl,
                detectionBadge: !!detectionBadge,
                singleOutput: !!singleOutput,
                allOutput: !!allOutput,
                outputContent: !!outputContent,
            });
        const untranslatableList = document.getElementById('untranslatableList');
        const errorsSection = document.getElementById('errorsSection');
        const errorsList = document.getElementById('errorsList');
        const allFormatsGrid = document.getElementById('allFormatsGrid');

        // Auto-detect on input change
        let detectTimeout;
        inputEl.addEventListener('input', () => {
            console.log('[CST] Input changed, scheduling detect...');
            clearTimeout(detectTimeout);
            detectTimeout = setTimeout(() => {
                if (inputEl.value && sourceDriverEl.value === '') {
                    logAndPost({ command: 'detect', input: inputEl.value });
                }
            }, 300);
        });

        // Translate button
        document.getElementById('translateBtn').addEventListener('click', () => {
            console.log('[CST] Translate button clicked');
            if (!inputEl.value.trim()) {
                console.log('[CST] No input value, skipping');
                return;
            }
            hideErrors();
            logAndPost({
                command: 'translate',
                input: inputEl.value,
                sourceDriver: sourceDriverEl.value || undefined,
                targetDriver: targetDriverEl.value,
            });
        });

        // Translate All button
        document.getElementById('translateAllBtn').addEventListener('click', () => {
            console.log('[CST] Translate All button clicked');
            if (!inputEl.value.trim()) {
                console.log('[CST] No input value, skipping');
                return;
            }
            hideErrors();
            logAndPost({
                command: 'translateAll',
                input: inputEl.value,
                sourceDriver: sourceDriverEl.value || undefined,
            });
        });

        // Validate button
        document.getElementById('validateBtn').addEventListener('click', () => {
            console.log('[CST] Validate button clicked');
            if (!inputEl.value.trim()) {
                console.log('[CST] No input value, skipping');
                return;
            }
            hideErrors();
            logAndPost({ command: 'validate', input: inputEl.value });
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            console.log('[CST] Clear button clicked');
            inputEl.value = '';
            sourceDriverEl.value = '';
            detectionBadge.classList.add('hidden');
            singleOutput.classList.add('hidden');
            allOutput.classList.add('hidden');
            hideErrors();
        });

        // Copy single button
        document.getElementById('copySingleBtn').addEventListener('click', () => {
            console.log('[CST] Copy single button clicked');
            const targetDriver = targetDriverEl.value.toUpperCase();
            logAndPost({ command: 'copyWithDriver', input: outputContent.textContent, driver: targetDriver });
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            console.log('[CST] Received message from extension:', JSON.stringify(message));
            
            switch (message.command) {
                case 'setInput':
                    console.log('[CST] Processing setInput');
                    inputEl.value = message.connectionString || '';
                    if (message.connectionString) {
                        translateAllBtn.click();
                    }
                    break;
                case 'detectResult':
                    console.log('[CST] Processing detectResult');
                    showDetection(message.detection);
                    break;
                case 'translateResult':
                    console.log('[CST] Processing translateResult');
                    showTranslateResult(message.result);
                    break;
                case 'translateAllResult':
                    console.log('[CST] Processing translateAllResult');
                    showAllResults(message.results);
                    break;
                case 'validateResult':
                    console.log('[CST] Processing validateResult');
                    showValidation(message.validation);
                    break;
                case 'error':
                    console.log('[CST] Processing error');
                    showError(message.message);
                    break;
            }
        });

        function showDetection(detection) {
            if (detection.driver && detection.confidence !== 'low') {
                detectionBadge.textContent = detection.driver.toUpperCase() + ' (' + detection.confidence + ')';
                detectionBadge.className = 'detection-badge detection-' + detection.confidence;
                detectionBadge.classList.remove('hidden');
            } else {
                detectionBadge.classList.add('hidden');
            }
        }

        function showTranslateResult(result) {
            console.log('[CST] showTranslateResult called with:', JSON.stringify(result));
            try {
                if (!result) {
                    console.error('[CST] showTranslateResult: result is null/undefined');
                    showError('No result received');
                    return;
                }
                
                allOutput.classList.add('hidden');
                singleOutput.classList.remove('hidden');
                
                const targetDriver = targetDriverEl.value;
                const connStr = result.connectionString || '';
                console.log('[CST] Connection string:', connStr, 'Target:', targetDriver);
                
                if (targetDriver === 'rust') {
                    outputContent.classList.add('rust-code');
                    outputContent.innerHTML = highlightRustSyntax(connStr);
                } else {
                    outputContent.classList.remove('rust-code');
                    outputContent.textContent = connStr;
                }
                
                // Show warnings
                if (result.warnings && result.warnings.length > 0) {
                    console.log('[CST] Showing warnings:', result.warnings.length);
                    warningsSection.classList.remove('hidden');
                    warningsList.innerHTML = result.warnings
                        .map(w => '<li>' + escapeHtml(w.message) + '</li>')
                        .join('');
                } else {
                    warningsSection.classList.add('hidden');
                }
                
                // Show untranslatable
                if (result.untranslatableKeywords && result.untranslatableKeywords.length > 0) {
                    console.log('[CST] Showing untranslatable:', result.untranslatableKeywords.length);
                    untranslatableSection.classList.remove('hidden');
                    untranslatableList.innerHTML = result.untranslatableKeywords
                        .map(k => '<li><strong>' + escapeHtml(k.keyword) + '</strong>: ' + escapeHtml(k.reason) + '</li>')
                        .join('');
                } else {
                    untranslatableSection.classList.add('hidden');
                }
                console.log('[CST] showTranslateResult completed successfully');
            } catch (err) {
                console.error('[CST] Error in showTranslateResult:', err);
                showError('Error displaying result: ' + err.message);
            }
        }

        function showAllResults(results) {
            console.log('[CST] showAllResults called with:', Object.keys(results || {}));
            try {
                if (!results) {
                    console.error('[CST] showAllResults: results is null/undefined');
                    showError('No results received');
                    return;
                }
                
                singleOutput.classList.add('hidden');
                allOutput.classList.remove('hidden');
                
                const entries = Object.entries(results);
                console.log('[CST] Processing', entries.length, 'results');
                
                allFormatsGrid.innerHTML = entries
                    .map(([driver, result]) => {
                        console.log('[CST] Processing driver:', driver, 'result:', !!result);
                        if (!result) {
                            return '<div class="format-card"><h4>' + driver.toUpperCase() + '</h4><div class="format-card-content">Error: No result</div></div>';
                        }
                        
                        const hasWarnings = result.warnings && result.warnings.length > 0;
                        const isRust = driver === 'rust';
                        const connStr = result.connectionString || '';
                        const content = isRust 
                            ? highlightRustSyntax(connStr)
                            : escapeHtml(connStr);
                        const contentClass = isRust ? 'format-card-content rust-code' : 'format-card-content';
                        
                        // Build warning tooltip
                        let warningIcon = '';
                        if (hasWarnings) {
                            const warningText = result.warnings.map(w => w.message).join(' | ');
                            warningIcon = '<span class="warning-icon" title="' + escapeHtml(warningText) + '">⚠️</span>';
                        }
                        
                        return '<div class="format-card">' +
                            '<div class="format-card-header">' +
                            '<h4>' + driver.toUpperCase() + (isRust ? ' 🦀' : '') + warningIcon + '</h4>' +
                            '<button class="btn-secondary copy-btn" data-driver="' + driver.toUpperCase() + '">📋 Copy</button>' +
                            '</div>' +
                            '<div class="' + contentClass + '">' + content + '</div>' +
                            '</div>';
                    })
                    .join('');
                console.log('[CST] showAllResults completed successfully');
            } catch (err) {
                console.error('[CST] Error in showAllResults:', err);
                showError('Error displaying results: ' + err.message);
            }
        }

        function showValidation(validation) {
            if (!validation.isValid) {
                errorsSection.classList.remove('hidden');
                errorsList.innerHTML = validation.errors
                    .map(e => '<li>' + escapeHtml(e.message) + '</li>')
                    .join('');
            } else {
                hideErrors();
                // Show warnings if any
                if (validation.warnings && validation.warnings.length > 0) {
                    singleOutput.classList.remove('hidden');
                    outputContent.textContent = 'Validation passed with warnings.';
                    warningsSection.classList.remove('hidden');
                    warningsList.innerHTML = validation.warnings
                        .map(w => '<li>' + escapeHtml(w.message) + '</li>')
                        .join('');
                } else {
                    singleOutput.classList.remove('hidden');
                    outputContent.textContent = '✓ Connection string is valid!';
                    warningsSection.classList.add('hidden');
                }
                untranslatableSection.classList.add('hidden');
            }
        }

        function showError(message) {
            errorsSection.classList.remove('hidden');
            errorsList.innerHTML = '<li>' + escapeHtml(message) + '</li>';
        }

        function hideErrors() {
            errorsSection.classList.add('hidden');
        }

        function escapeHtml(text) {
            if (text === null || text === undefined) {
                console.warn('[CST] escapeHtml called with null/undefined');
                return '';
            }
            const div = document.createElement('div');
            div.textContent = String(text);
            return div.innerHTML;
        }

        // Rust syntax highlighting - simplified to avoid escaping issues
        function highlightRustSyntax(code) {
            if (!code) return '';
            // Just escape HTML and return - complex highlighting removed to fix syntax issues
            return escapeHtml(code);
        }

        // Event delegation for copy buttons in all formats grid
        allFormatsGrid.addEventListener('click', function(e) {
            const btn = e.target.closest('button[data-driver]');
            if (btn) {
                const driver = btn.getAttribute('data-driver');
                const content = btn.parentElement.nextElementSibling.textContent;
                console.log('[CST] Copy button clicked for driver:', driver);
                logAndPost({ command: 'copyWithDriver', input: content, driver: driver });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            console.log('[CST] Keydown event:', e.key, 'ctrl:', e.ctrlKey, 'meta:', e.metaKey);
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    console.log('[CST] Keyboard shortcut: Translate');
                    e.preventDefault();
                    document.getElementById('translateBtn').click();
                } else if (e.shiftKey && e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('translateAllBtn').click();
                }
            }
        });
        
        console.log('[CST] Script initialization complete!');
        } catch (err) {
            console.error('[CST] FATAL: Script initialization failed:', err);
        }
        })();
    </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
