/**
 * SQL Server Connection String Translator - VS Code Extension
 *
 * Entry point for the extension. Registers all commands and handles
 * extension lifecycle (activation/deactivation).
 */
import * as vscode from 'vscode';
import { translateCommand } from './commands/translate';
import { translateSelectionCommand } from './commands/translateSelection';
import { translateClipboardCommand } from './commands/translateClipboard';
import { quickTranslateCommand } from './commands/quickTranslate';
import { TranslatorPanel } from './webview/panel';
import { TranslatorSidebarProvider } from './webview/sidebarProvider';

// Global reference to sidebar provider for adding history
let sidebarProvider: TranslatorSidebarProvider | undefined;

/**
 * Get the sidebar provider instance
 */
export function getSidebarProvider(): TranslatorSidebarProvider | undefined {
  return sidebarProvider;
}

/**
 * Extension activation function (T036)
 * Called when one of the activation events is triggered
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('SQL Connection String Translator is now active');

  // Create callback to open translator panel
  const openTranslator = (connectionString: string) => {
    TranslatorPanel.createOrShow(context.extensionUri, connectionString);
  };

  // Register sidebar webview provider
  sidebarProvider = new TranslatorSidebarProvider(context.extensionUri, context, openTranslator);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TranslatorSidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Register commands
  const commands = [
    vscode.commands.registerCommand(
      'connectionStringTranslator.translate',
      () => translateCommand(context)
    ),
    vscode.commands.registerCommand(
      'connectionStringTranslator.translateSelection',
      () => translateSelectionCommand()
    ),
    vscode.commands.registerCommand(
      'connectionStringTranslator.translateClipboard',
      () => translateClipboardCommand()
    ),
    vscode.commands.registerCommand(
      'connectionStringTranslator.quickTranslate',
      () => quickTranslateCommand()
    ),
  ];

  // Add all commands to subscriptions for proper disposal
  context.subscriptions.push(...commands);
}

/**
 * Extension deactivation function (T037)
 * Called when the extension is deactivated
 */
export function deactivate(): void {
  // Dispose webview panel if open
  TranslatorPanel.currentPanel?.dispose();
  console.log('SQL Connection String Translator has been deactivated');
}
