/**
 * 统一临时目录路径工具（ESM，供 src/ 与 tests/*.mjs 使用）
 * @file src/lib/temp-paths.js
 * @version 1.13.33
 * @description 与 CommonJS 版本 scripts/temp-paths.cjs 共享同一约定：所有瞬时产物写入项目根 .tmp/，
 *   自动创建、git 忽略、可一键清理。禁止把临时文件散落到根目录或其它位置。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

/** 统一临时目录：项目根 .tmp/（由模块自身位置反推，不依赖 cwd） */
export const TEMP_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '.tmp',
);

/** 确保临时目录存在（幂等），返回其绝对路径 */
export function ensureTempDir() {
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  return TEMP_ROOT;
}

/** 在临时目录内解析路径 */
export function tempPath(...segments) {
  return path.join(TEMP_ROOT, ...segments);
}

/** 生成临时目录内唯一路径（自动建目录），用于并发请求隔离 */
export function makeTempPath(prefix, ext = '') {
  ensureTempDir();
  return path.join(TEMP_ROOT, `${prefix}-${randomUUID()}${ext}`);
}

/** 清空整个临时目录（幂等） */
export function cleanTempDir() {
  fs.rmSync(TEMP_ROOT, { recursive: true, force: true });
}
