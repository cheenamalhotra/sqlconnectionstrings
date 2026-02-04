/**
 * Sidebar History Provider
 *
 * Shows history of translated connection strings in the Activity Bar sidebar.
 * Clicking on a history item opens the translator panel with that connection string.
 */
import * as vscode from 'vscode';

export interface HistoryItem {
  id: string;
  connectionString: string;
  detectedDriver: string;
  timestamp: number;
  label: string;
}

export class TranslatorSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'connectionStringTranslator.sidebarView';

  private _view?: vscode.WebviewView;
  private _history: HistoryItem[] = [];
  private _onOpenTranslator: (connectionString: string) => void;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext,
    onOpenTranslator: (connectionString: string) => void
  ) {
    this._onOpenTranslator = onOpenTranslator;
    // Load history from global state
    this._history = this._context.globalState.get<HistoryItem[]>('connectionStringHistory', []);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview();

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case 'openTranslator':
          this._onOpenTranslator(message.connectionString);
          break;
        case 'deleteItem':
          this._deleteHistoryItem(message.id);
          break;
        case 'clearHistory':
          this._clearHistory();
          break;
        case 'newTranslation':
          this._onOpenTranslator('');
          break;
      }
    });
  }

  /**
   * Add a connection string to history
   */
  public addToHistory(connectionString: string, detectedDriver: string): void {
    // Don't add duplicates
    const existing = this._history.find(h => h.connectionString === connectionString);
    if (existing) {
      // Move to top
      this._history = this._history.filter(h => h.id !== existing.id);
      existing.timestamp = Date.now();
      this._history.unshift(existing);
    } else {
      // Create label from connection string (extract server/database if possible)
      const label = this._createLabel(connectionString, detectedDriver);
      
      const item: HistoryItem = {
        id: Date.now().toString(),
        connectionString,
        detectedDriver,
        timestamp: Date.now(),
        label,
      };
      this._history.unshift(item);
      
      // Keep only last 20 items
      if (this._history.length > 20) {
        this._history = this._history.slice(0, 20);
      }
    }

    this._saveHistory();
    this._updateView();
  }

  private _createLabel(connectionString: string, driver: string): string {
    // Try to extract server and database
    const serverMatch = connectionString.match(/(?:Server|Data Source|Host)=([^;]+)/i);
    const dbMatch = connectionString.match(/(?:Database|Initial Catalog)=([^;]+)/i);
    
    let label = '';
    if (serverMatch) {
      label = serverMatch[1].substring(0, 20);
    }
    if (dbMatch) {
      label += label ? '/' + dbMatch[1].substring(0, 15) : dbMatch[1].substring(0, 20);
    }
    
    if (!label) {
      label = connectionString.substring(0, 30) + (connectionString.length > 30 ? '...' : '');
    }
    
    return `[${driver.toUpperCase()}] ${label}`;
  }

  private _deleteHistoryItem(id: string): void {
    this._history = this._history.filter(h => h.id !== id);
    this._saveHistory();
    this._updateView();
  }

  private _clearHistory(): void {
    this._history = [];
    this._saveHistory();
    this._updateView();
  }

  private _saveHistory(): void {
    this._context.globalState.update('connectionStringHistory', this._history);
  }

  private _updateView(): void {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview();
    }
  }

  private _getHtmlForWebview(): string {
    const historyHtml = this._history.length === 0
      ? '<div class="empty-state">No translation history yet.<br><br>Use the "New Translation" button or translate a connection string to get started.</div>'
      : this._history.map(item => `
        <div class="history-item" data-id="${item.id}" data-conn="${this._escapeAttr(item.connectionString)}">
          <div class="item-content">
            <div class="item-label">${this._escapeHtml(item.label)}</div>
            <div class="item-time">${this._formatTime(item.timestamp)}</div>
          </div>
          <button class="delete-btn" data-id="${item.id}" title="Remove from history">×</button>
        </div>
      `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Translation History</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 8px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header h3 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--vscode-sideBarSectionHeader-foreground);
    }
    .new-btn {
      padding: 4px 10px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }
    .new-btn:hover { background: var(--vscode-button-hoverBackground); }
    .history-list { }
    .history-item {
      display: flex;
      align-items: center;
      padding: 8px;
      margin-bottom: 4px;
      background: var(--vscode-list-inactiveSelectionBackground);
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .history-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .item-content {
      flex: 1;
      overflow: hidden;
    }
    .item-label {
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-time {
      font-size: 10px;
      color: var(--vscode-descriptionForeground);
      margin-top: 2px;
    }
    .delete-btn {
      background: none;
      border: none;
      color: var(--vscode-descriptionForeground);
      cursor: pointer;
      font-size: 16px;
      padding: 0 4px;
      opacity: 0;
      transition: opacity 0.1s;
    }
    .history-item:hover .delete-btn { opacity: 1; }
    .delete-btn:hover { color: var(--vscode-errorForeground); }
    .empty-state {
      text-align: center;
      padding: 20px;
      color: var(--vscode-descriptionForeground);
      font-size: 12px;
    }
    .clear-btn {
      display: block;
      width: 100%;
      margin-top: 12px;
      padding: 6px;
      background: none;
      border: 1px solid var(--vscode-panel-border);
      color: var(--vscode-descriptionForeground);
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }
    .clear-btn:hover {
      background: var(--vscode-list-hoverBackground);
      color: var(--vscode-foreground);
    }
  </style>
</head>
<body>
  <div class="header">
    <h3>History</h3>
    <button class="new-btn" id="newBtn">+ New</button>
  </div>
  <div class="history-list">
    ${historyHtml}
  </div>
  ${this._history.length > 0 ? '<button class="clear-btn" id="clearBtn">Clear History</button>' : ''}

  <script>
    const vscode = acquireVsCodeApi();

    document.getElementById('newBtn').addEventListener('click', () => {
      vscode.postMessage({ command: 'newTranslation' });
    });

    document.querySelector('.history-list').addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-btn');
      if (deleteBtn) {
        e.stopPropagation();
        vscode.postMessage({ command: 'deleteItem', id: deleteBtn.dataset.id });
        return;
      }
      
      const item = e.target.closest('.history-item');
      if (item) {
        vscode.postMessage({ command: 'openTranslator', connectionString: item.dataset.conn });
      }
    });

    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        vscode.postMessage({ command: 'clearHistory' });
      });
    }
  </script>
</body>
</html>`;
  }

  private _escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private _escapeAttr(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private _formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }
}
