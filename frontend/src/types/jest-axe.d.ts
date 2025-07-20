declare module 'jest-axe' {
  import { AxeResults } from 'axe-core';

  export interface JestAxeConfigureOptions {
    rules?: Object;
    checks?: Object;
    reporter?: Object;
  }

  export interface RunOptions {
    include?: string[];
    exclude?: string[];
    elementRef?: boolean;
    runOnly?: {
      type: 'rule' | 'rules' | 'tag' | 'tags';
      values: string[];
    };
    resultTypes?: string[];
    selectors?: boolean;
    ancestry?: boolean;
    xpath?: boolean;
    absolutePaths?: boolean;
    iframes?: boolean;
    frameWaitTime?: number;
    disableOtherRules?: boolean;
    rules?: Object;
  }

  export function configureAxe(options: JestAxeConfigureOptions): void;
  export function axe(html: Element | string, options?: RunOptions): Promise<AxeResults>;
  export const toHaveNoViolations: jest.CustomMatcher;
}