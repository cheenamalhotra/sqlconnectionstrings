/**
 * Translate Clipboard Command Handler
 *
 * Translates content from clipboard.
 */
import * as vscode from 'vscode';
import { translate, translateAll } from '../translator';
import { TranslatorPanel } from '../webview/panel';
import { ALL_DRIVERS, TranslationResult, TranslationError } from '../translator/types';
import { showDriverPicker } from './translate';

export function registerTranslateClipboardCommand(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.commands.registerCommand(
    'connectionStringTranslator.translateClipboard',
    async () => {
      const clipboardText = await vscode.env.clipboard.readText();

      if (!clipboardText.trim()) {
        vscode.window.showWarningMessage('Clipboard is empty');
        return;
      }

      try {
        // Open panel and populate with clipboard content
        TranslatorPanel.createOrShow(context.extensionUri);

        // Show quick translation in notification
        const resultsArray = translateAll(clipboardText);
        const results: Record<string, TranslationResult> = {};
        resultsArray.forEach((result, index) => {
          results[ALL_DRIVERS[index]] = result;
        });

        const drivers = Object.keys(results);

        const selected = await vscode.window.showQuickPick(
          drivers.map((d) => ({
            label: d.toUpperCase(),
            description: results[d].connectionString.substring(0, 50) + '...',
            value: d,
          })),
          { placeHolder: 'Select format to copy' }
        );

        if (selected) {
          const result = results[selected.value];
          await vscode.env.clipboard.writeText(result.connectionString);
          vscode.window.showInformationMessage(`${selected.label} connection string copied!`);
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
 * Translate from clipboard and copy result back (legacy function for backwards compatibility)
 */
export async function translateClipboardCommand(): Promise<void> {
  const clipboardText = await vscode.env.clipboard.readText();
  if (!clipboardText?.trim()) {
    vscode.window.showWarningMessage('Clipboard is empty');
    return;
  }

  // Use static imports from top of file

  // Show driver picker
  const targetDriver = await showDriverPicker();
  if (!targetDriver) return; // User cancelled

  // Translate
  const result = translate(clipboardText, targetDriver);

  if (result.success) {
    await vscode.env.clipboard.writeText(result.connectionString);
    vscode.window.showInformationMessage(
      `Translated to ${result.targetDriver} and copied to clipboard`
    );
  } else {
    vscode.window.showErrorMessage(
      `Translation failed: ${result.errors.map((e: TranslationError) => e.message).join(', ')}`
    );
  }
}
