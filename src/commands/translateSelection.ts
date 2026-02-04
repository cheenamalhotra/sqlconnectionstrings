/**
 * Translate Selection Command Handler
 *
 * Translates the currently selected text.
 */
import * as vscode from 'vscode';
import { translate, translateAll } from '../translator';
import { DriverType } from '../translator/types';
import { showDriverPicker } from './translate';

export function registerTranslateSelectionCommand(
  _context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'connectionStringTranslator.translateSelection',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor');
        return;
      }

      const selection = editor.selection;
      const text = editor.document.getText(selection);

      if (!text.trim()) {
        vscode.window.showWarningMessage('No text selected');
        return;
      }

      // Show quick pick for target driver
      const targetDriver = await vscode.window.showQuickPick(
        [
          { label: 'SqlClient (.NET)', value: 'sqlclient' },
          { label: 'ODBC', value: 'odbc' },
          { label: 'OLEDB', value: 'oledb' },
          { label: 'JDBC', value: 'jdbc' },
          { label: 'PHP (sqlsrv)', value: 'php' },
          { label: 'Python (mssql)', value: 'python' },
          { label: 'Rust (mssql-tds)', value: 'rust' },
          { label: 'All Formats', value: 'all' },
        ],
        { placeHolder: 'Select target driver format' }
      );

      if (!targetDriver) return;

      try {
        if (targetDriver.value === 'all') {
          const results = translateAll(text);

          // Show results in output channel
          const outputChannel = vscode.window.createOutputChannel('Connection String Translator');
          outputChannel.clear();
          outputChannel.appendLine('=== Translation Results ===\n');

          for (const result of results) {
            outputChannel.appendLine(`--- ${result.targetDriver.toUpperCase()} ---`);
            outputChannel.appendLine(result.connectionString);
            if (result.warnings.length > 0) {
              outputChannel.appendLine('Warnings:');
              result.warnings.forEach((w) => outputChannel.appendLine(`  - ${w.message}`));
            }
            outputChannel.appendLine('');
          }

          outputChannel.show();
        } else {
          const result = translate(text, targetDriver.value as DriverType);

          // Replace selection with translated string
          const replaceOption = await vscode.window.showQuickPick(
            ['Replace Selection', 'Copy to Clipboard', 'Show in Output'],
            { placeHolder: 'What would you like to do with the result?' }
          );

          switch (replaceOption) {
            case 'Replace Selection':
              await editor.edit((editBuilder) => {
                editBuilder.replace(selection, result.connectionString);
              });
              break;
            case 'Copy to Clipboard':
              await vscode.env.clipboard.writeText(result.connectionString);
              vscode.window.showInformationMessage('Copied to clipboard!');
              break;
            case 'Show in Output':
              const outputChannel = vscode.window.createOutputChannel('Connection String Translator');
              outputChannel.clear();
              outputChannel.appendLine(result.connectionString);
              if (result.warnings.length > 0) {
                outputChannel.appendLine('\nWarnings:');
                result.warnings.forEach((w) => outputChannel.appendLine(`  - ${w.message}`));
              }
              outputChannel.show();
              break;
          }
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  );
}

/**
 * Translate the current editor selection (legacy function for backwards compatibility)
 */
export async function translateSelectionCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    vscode.window.showWarningMessage('No text selected');
    return;
  }

  const selectedText = editor.document.getText(editor.selection);
  // Use static import from top of file

  // Show driver picker
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return; // User cancelled

  // Translate
  const result = translate(selectedText, targetDriver);

  if (result.success) {
    // Copy to clipboard and show result
    await vscode.env.clipboard.writeText(result.connectionString);
    vscode.window.showInformationMessage(
      `Translated to ${result.targetDriver} and copied to clipboard`
    );
  } else {
    vscode.window.showErrorMessage(
      `Translation failed: ${result.errors.map((e) => e.message).join(', ')}`
    );
  }
}
