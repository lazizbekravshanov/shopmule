export * from './enums';
export * from './logger';
export * from './interfaces';
export * from './transports';
export * from './formatters';

// Create a default logger instance for easy use
import { Logger } from './logger';

export const logger = new Logger({ name: 'ShopMule' });
