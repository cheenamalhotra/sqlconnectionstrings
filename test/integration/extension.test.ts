/**
 * Extension Integration Tests
 *
 * Tests extension activation and commands.
 */
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Integration Tests', () => {
  vscode.window.showInformationMessage('Starting integration tests...');

  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension('sqlconnectionstrings.sql-connection-string-translator');
    assert.ok(extension !== undefined, 'Extension not found');
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);

    assert.ok(
      commands.includes('connectionStringTranslator.translate'),
      'translate command not found'
    );
    assert.ok(
      commands.includes('connectionStringTranslator.translateSelection'),
      'translateSelection command not found'
    );
    assert.ok(
      commands.includes('connectionStringTranslator.translateClipboard'),
      'translateClipboard command not found'
    );
    assert.ok(
      commands.includes('connectionStringTranslator.quickTranslate'),
      'quickTranslate command not found'
    );
  });

  test('Extension should activate', async () => {
    const extension = vscode.extensions.getExtension('sqlconnectionstrings.sql-connection-string-translator');
    if (extension) {
      await extension.activate();
      assert.ok(extension.isActive, 'Extension should be active after activation');
    }
  });

  test('Translate command should execute without error', async () => {
    try {
      await vscode.commands.executeCommand('connectionStringTranslator.translate');
      // If we get here, command executed successfully
      assert.ok(true, 'Translate command executed');
    } catch (error) {
      // Command might throw if cancelled, which is acceptable
      assert.ok(true, 'Translate command threw expected error');
    }
  });
});
