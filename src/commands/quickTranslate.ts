/**
 * Quick Translate Command Handler
 *
 * Quick translation with input box.
 */
import * as vscode from 'vscode';
import { translate } from '../translator';
import { DriverType } from '../translator/types';
import { showDriverPicker } from './translate';

export function registerQuickTranslateCommand(
  _context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'connectionStringTranslator.quickTranslate',
    async () => {
      // Get connection string input
      const input = await vscode.window.showInputBox({
        prompt: 'Enter connection string to translate',
        placeHolder: 'Server=localhost;Database=mydb;...',
        ignoreFocusOut: true,
      });

      if (!input) return;

      // Select target format
      const targetDriver = await vscode.window.showQuickPick(
        [
          { label: 'SqlClient (.NET)', value: 'sqlclient' },
          { label: 'ODBC', value: 'odbc' },
          { label: 'OLEDB', value: 'oledb' },
          { label: 'JDBC', value: 'jdbc' },
          { label: 'PHP (sqlsrv)', value: 'php' },
          { label: 'Python (mssql)', value: 'python' },
          { label: 'Rust (mssql-tds)', value: 'rust' },
        ],
        { placeHolder: 'Select target driver format' }
      );

      if (!targetDriver) return;

      try {
        const result = translate(input, targetDriver.value as DriverType);

        // Show result in quick pick with copy option
        const action = await vscode.window.showInformationMessage(
          `Translated to ${targetDriver.label}`,
          'Copy to Clipboard',
          'Show Details'
        );

        if (action === 'Copy to Clipboard') {
          await vscode.env.clipboard.writeText(result.connectionString);
          vscode.window.showInformationMessage('Copied!');
        } else if (action === 'Show Details') {
          const outputChannel = vscode.window.createOutputChannel('Connection String Translator');
          outputChannel.clear();
          outputChannel.appendLine('=== Translation Result ===\n');
          outputChannel.appendLine('Input:');
          outputChannel.appendLine(input);
          outputChannel.appendLine('\nOutput (' + targetDriver.label + '):');
          outputChannel.appendLine(result.connectionString);

          if (result.warnings.length > 0) {
            outputChannel.appendLine('\nWarnings:');
            result.warnings.forEach((w) => outputChannel.appendLine(`  ⚠️ ${w.message}`));
          }

          if (result.untranslatableKeywords.length > 0) {
            outputChannel.appendLine('\nUntranslatable Keywords:');
            result.untranslatableKeywords.forEach((k) =>
              outputChannel.appendLine(`  ℹ️ ${k.keyword}: ${k.reason}`)
            );
          }

          outputChannel.show();
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
 * Quick translate with input box workflow (legacy function for backwards compatibility)
 */
export async function quickTranslateCommand(): Promise<void> {
  // Get connection string
  const input = await vscode.window.showInputBox({
    prompt: 'Enter connection string to translate',
    placeHolder: 'Server=localhost;Database=mydb;...',
    ignoreFocusOut: true,
  });
  if (!input) return;

  // Use static import from top of file

  // Get target driver
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return;

  // Translate and copy
  const result = translate(input, targetDriver);

  if (result.success) {
    await vscode.env.clipboard.writeText(result.connectionString);
    vscode.window.showInformationMessage('Translated and copied to clipboard!');
  } else {
    vscode.window.showErrorMessage(
      `Translation failed: ${result.errors.map((e) => e.message).join(', ')}`
    );
  }
}
