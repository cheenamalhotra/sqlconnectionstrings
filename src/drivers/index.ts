/**
 * Driver Registry - Central access to all driver configurations
 */
import { DriverType, DriverConfig } from '../translator/types';
import { sqlclientDriver } from './sqlclient';
import { odbcDriver } from './odbc';
import { oledbDriver } from './oledb';
import { jdbcDriver } from './jdbc';
import { phpDriver } from './php';
import { pythonDriver } from './python';
import { rustDriver } from './rust';

/** Registry of all driver configurations */
export const driverRegistry: Record<DriverType, DriverConfig> = {
  sqlclient: sqlclientDriver,
  odbc: odbcDriver,
  oledb: oledbDriver,
  jdbc: jdbcDriver,
  php: phpDriver,
  python: pythonDriver,
  rust: rustDriver,
};

/** Get driver configuration by type */
export function getDriverConfig(type: DriverType): DriverConfig {
  return driverRegistry[type];
}

/** Get all driver configurations */
export function getAllDriverConfigs(): DriverConfig[] {
  return Object.values(driverRegistry);
}

export { sqlclientDriver, odbcDriver, oledbDriver, jdbcDriver, phpDriver, pythonDriver, rustDriver };
