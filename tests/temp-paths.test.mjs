/**
 * 统一临时目录约定回归测试
 * @file tests/temp-paths.test.mjs
 * @version 1.13.33
 * @description 校验 ESM/CJS 两侧 helper 指向同一 .tmp 根、自动创建、唯一命名，
 *   并回归「根目录不再产生旧式临时文件」。不调用 cleanTempDir 全局清理，避免与并行测试互相干扰。
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { TEMP_ROOT, ensureTempDir, tempPath, makeTempPath } from '../src/lib/temp-paths.js';

const require = createRequire(import.meta.url);
const cjs = require('../scripts/temp-paths.cjs');

test('ESM 与 CJS helper 指向同一临时根目录', () => {
  assert.equal(cjs.TEMP_ROOT, TEMP_ROOT);
  assert.equal(path.basename(TEMP_ROOT), '.tmp');
});

test('临时路径统一落在 .tmp/ 内且命名唯一', () => {
  const a = makeTempPath('unit-a', '.txt');
  const b = makeTempPath('unit-b', '.txt');
  assert.equal(path.dirname(a), TEMP_ROOT);
  assert.equal(path.dirname(b), TEMP_ROOT);
  assert.notEqual(a, b);
  try {
    assert.equal(fs.existsSync(TEMP_ROOT), true);
    assert.equal(tempPath('nested', 'x.log'), path.join(TEMP_ROOT, 'nested', 'x.log'));
  } finally {
    fs.rmSync(a, { force: true });
    fs.rmSync(b, { force: true });
  }
});

test('ensureTempDir 幂等创建', () => {
  assert.equal(ensureTempDir(), TEMP_ROOT);
  assert.equal(ensureTempDir(), TEMP_ROOT);
  assert.equal(fs.statSync(TEMP_ROOT).isDirectory(), true);
});

test('根目录不再产生旧式临时文件', () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (const name of [
    'release-notes.md',
    '.tmp-integration-history.json',
    '.build-out.txt',
    '.test-out.txt',
    '.lint-out.txt',
  ]) {
    assert.equal(fs.existsSync(path.join(projectRoot, name)), false, `根目录残留临时文件：${name}`);
  }
});
