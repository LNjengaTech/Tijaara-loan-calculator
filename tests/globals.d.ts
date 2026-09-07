/**
 * Ambient type declarations for test runner globals.
 * Allows type checking for describe, test, expect without requiring external packages installed.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
declare function describe(name: string, fn: () => void): void;
declare function test(name: string, fn: () => void | Promise<void>): void;
declare function expect(actual: any): {
  toBe(expected: any): void;
  toEqual(expected: any): void;
  toBeLessThan(expected: number): void;
  toBeLessThanOrEqual(expected: number): void;
  toBeGreaterThan(expected: number): void;
  toContain(expected: string): void;
  [key: string]: any;
};
