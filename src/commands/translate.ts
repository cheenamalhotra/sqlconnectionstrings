/**
 * Translate Command Handler
 *
 * Opens the translator panel.
 */
import * as vscode from 'vscode';
import { TranslatorPanel } from '../webview/panel';
import { DriverType, DRIVER_DISPLAY_NAMES, ALL_DRIVERS } from '../translator/types';

export function registerTranslateCommand(context: vscode.ExtensionContext): vscode.Disposable {
  return vscode.commands.registerCommand(
    'connectionStringTranslator.translate',
    () => {
      TranslatorPanel.createOrShow(context.extensionUri);
    }
  );
}

/**
 * Open the translator webview panel
 */
export async function translateCommand(context: vscode.ExtensionContext): Promise<void> {
  TranslatorPanel.createOrShow(context.extensionUri);
}

/**
 * Show quick pick for target driver selection
 */
export async function showDriverPicker(): Promise<DriverType | undefined> {
  const items: (vscode.QuickPickItem & { driver: DriverType })[] = ALL_DRIVERS.map((driver) => ({
    label: DRIVER_DISPLAY_NAMES[driver],
    description: getDriverDescription(driver),
    driver,
  }));

  const selected = await vscode.window.showQuickPick(items, {
    title: 'Select Target Driver Format',
    placeHolder: 'Choose the driver format to translate to',
  });

  return selected?.driver;
}

/**
 * Get description for driver in picker
 */
function getDriverDescription(driver: DriverType): string {
  switch (driver) {
    case 'sqlclient':
      return 'Microsoft.Data.SqlClient';
    case 'odbc':
      return 'ODBC Driver for SQL Server';
    case 'oledb':
      return 'MSOLEDBSQL Provider';
    case 'jdbc':
      return 'mssql-jdbc';
    case 'php':
      return 'sqlsrv / PDO_SQLSRV';
    case 'python':
      return 'mssql-python / pyodbc';
    case 'rust':
      return 'mssql-tds';
    default:
      return '';
  }
}
