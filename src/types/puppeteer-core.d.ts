/**
 * puppeteer-core 最小类型声明
 * @file src/types/puppeteer-core.d.ts
 * @version 1.9.32
 * @description puppeteer-core 为可选运行时依赖（配合系统已安装的 Chrome / Edge），
 *   此处仅声明采集逻辑用到的 API 契约
 */
declare module 'puppeteer-core' {
  export interface EvaluateOptions {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
  }

  export interface Page {
    goto(url: string, options?: EvaluateOptions): Promise<unknown>;
    evaluate<T, A extends unknown[]>(fn: (...args: A) => T, ...args: A): Promise<T>;
    close(): Promise<void>;
  }

  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  export interface LaunchOptions {
    headless?: boolean;
    args?: string[];
    executablePath?: string;
  }

  export function launch(options?: LaunchOptions): Promise<Browser>;
}
