import { TestConfig } from './types';
/**
 * Export Tester
 * @version 0.9.0
 */
declare function test(n: TestConfig, tests: { [name: string]: Function }): void;
export = test;
