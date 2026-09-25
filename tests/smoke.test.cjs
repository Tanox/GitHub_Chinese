/**
 * 用户脚本产物冒烟测试
 * @file tests/smoke.test.cjs
 * @version 1.9.31
 * @description 对构建产物做运行时加载前的冒烟校验：存在性 / 元数据 / 版本号 / 语法合法性
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const BUNDLE = path.join(ROOT, 'build', 'GitHub_zh-cn.user.js');
/** 产物体积下限（字节）——低于此值通常意味着构建异常 */
const MIN_BUNDLE_SIZE = 50 * 1024;

/**
 * 从版本单一来源读取当前版本号
 * @returns {string|null} 版本号
 */
function readVersion() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'version.js'), 'utf-8');
  const matched = src.match(/VERSION\s*=\s*'([^']+)'/);
  return matched ? matched[1] : null;
}

test('用户脚本产物存在且体积合理', () => {
  assert.ok(fs.existsSync(BUNDLE), '构建产物不存在，请先执行 npm run build');
  const size = fs.statSync(BUNDLE).size;
  assert.ok(size > MIN_BUNDLE_SIZE, `产物体积异常偏小：${size} 字节`);
});

test('产物包含 UserScript 元数据与当前版本号', () => {
  const content = fs.readFileSync(BUNDLE, 'utf-8');
  assert.match(content, /==UserScript==/);
  assert.match(content, /@match/);
  const version = readVersion();
  assert.ok(version, '无法从 src/version.js 读取版本号');
  assert.ok(content.includes(version), `产物未包含当前版本号 ${version}`);
});

test('产物为合法 JS（可被 vm 编译，无语法错误）', () => {
  const content = fs.readFileSync(BUNDLE, 'utf-8');
  assert.doesNotThrow(() => new vm.Script(content, { filename: 'GitHub_zh-cn.user.js' }));
});
