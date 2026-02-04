/**
 * Clipboard Helper
 *
 * Utilities for clipboard operations in VS Code.
 */
import * as vscode from 'vscode';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  await vscode.env.clipboard.writeText(text);
}

/**
 * Read text from clipboard
 */
export async function readFromClipboard(): Promise<string> {
  return await vscode.env.clipboard.readText();
}

/**
 * Copy text and show notification
 */
export async function copyWithNotification(text: string, message?: string): Promise<void> {
  await copyToClipboard(text);
  vscode.window.showInformationMessage(message || 'Copied to clipboard');
}

/**
 * Copy multiple items to clipboard with selection
 */
export async function copyWithQuickPick(
  items: { label: string; value: string }[],
  title: string = 'Select item to copy'
): Promise<boolean> {
  const selected = await vscode.window.showQuickPick(
    items.map((item) => ({
      label: item.label,
      description: item.value.length > 50 ? item.value.substring(0, 50) + '...' : item.value,
      value: item.value,
    })),
    {
      placeHolder: title,
      title,
    }
  );

  if (selected) {
    await copyWithNotification((selected as { value: string }).value, `Copied ${selected.label} to clipboard`);
    return true;
  }

  return false;
}

/**
 * Check if clipboard has content
 */
export async function hasClipboardContent(): Promise<boolean> {
  const content = await readFromClipboard();
  return content.trim().length > 0;
}

/**
 * Get clipboard content with validation
 */
export async function getClipboardContent(): Promise<string | undefined> {
  const content = await readFromClipboard();
  if (!content || content.trim().length === 0) {
    vscode.window.showWarningMessage('Clipboard is empty');
    return undefined;
  }
  return content;
}
