/**
 * 统一临时目录路径工具（CommonJS，供 scripts/*.cjs 使用）
 * @file scripts/temp-paths.cjs
 * @version 1.13.33
 * @description 所有瞬时产物统一写入项目根 `.tmp/`：自动创建、git 忽略、一键清理。
 *   禁止在项目根目录或其它位置散落临时文件（日志、缓存、中间产物、测试输出、下载文件）。
 *   与 ESM 版本 src/lib/temp-paths.js 共享同一约定，二者根目录须一致（由单测守住）。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

/** 统一临时目录：项目根 .tmp/（由本模块位置反推，避免 cwd 漂移） */
const TEMP_ROOT = path.resolve(__dirname, '..', '.tmp');

/** 确保临时目录存在（幂等），返回其绝对路径 */
function ensureTempDir() {
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  return TEMP_ROOT;
}

/** 在临时目录内解析路径（不自动创建目录；需要落盘时先 ensureTempDir） */
function tempPath(...segments) {
  return path.join(TEMP_ROOT, ...segments);
}

/** 生成临时目录内唯一路径（自动建目录），用于并发请求隔离 */
function makeTempPath(prefix, ext = '') {
  ensureTempDir();
  return path.join(TEMP_ROOT, `${prefix}-${randomUUID()}${ext}`);
}

/** 清空整个临时目录（幂等） */
function cleanTempDir() {
  fs.rmSync(TEMP_ROOT, { recursive: true, force: true });
}

module.exports = { TEMP_ROOT, ensureTempDir, tempPath, makeTempPath, cleanTempDir };

if (require.main === module) {
  const arg = process.argv[2];
  if (arg === '--clean') {
    cleanTempDir();
    console.log('已清理临时目录:', TEMP_ROOT);
  } else if (arg === '--ensure') {
    console.log(ensureTempDir());
  } else {
    console.log(TEMP_ROOT);
  }
}
