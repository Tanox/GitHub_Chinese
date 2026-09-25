/**
 * 词典导入/导出测试
 * @file tests/io-dictionary.test.cjs
 * @version 1.11.16
 * @description 校验 io-dictionary.cjs 的 CSV/JSON 双向、引号转义往返、去重策略与归一校验
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  dictionaryToCsv,
  csvToDictionary,
  dictionaryToJson,
  jsonToDictionary,
  normalizeDictionary,
} = require('../io-dictionary.cjs');

const SAMPLE = { Sign: '登录', 'New issue': '新建议题', '待翻译: Foo': '待翻译: Foo' };

test('dictionaryToCsv 基本输出含表头', () => {
  const csv = dictionaryToCsv(SAMPLE);
  const lines = csv.split('\r\n');
  assert.equal(lines[0], 'term,translation');
  assert.ok(lines.includes('Sign,登录'));
});

test('dictionaryToCsv 引号/逗号/换行转义并可往返', () => {
  const dict = { 'a,b': '含,逗号', 'q"x': '引"号', 'multi\nline': '多行' };
  const csv = dictionaryToCsv(dict);
  assert.ok(csv.includes('"a,b"'));
  assert.ok(csv.includes('"q""x"'));
  assert.ok(csv.includes('"multi\nline"'));
  const back = csvToDictionary(csv);
  assert.deepEqual(back, dict);
});

test('csvToDictionary 默认跳过表头且还原', () => {
  const csv = dictionaryToCsv(SAMPLE);
  const dict = csvToDictionary(csv);
  assert.deepEqual(dict, SAMPLE);
});

test('csvToDictionary 无表头模式 (header:false)', () => {
  const csv = 'Sign,登录\nNew issue,新建议题';
  const dict = csvToDictionary(csv, { header: false });
  assert.deepEqual(dict, { Sign: '登录', 'New issue': '新建议题' });
});

test('csvToDictionary 重复键策略 error/last/first', () => {
  const csv = 'term,translation\nA,1\nA,2\nA,3';
  assert.throws(() => csvToDictionary(csv, { header: false, dedupe: 'error' }), /重复词条/);
  assert.equal(csvToDictionary(csv, { header: false, dedupe: 'last' }).A, '3');
  assert.equal(csvToDictionary(csv, { header: false, dedupe: 'first' }).A, '1');
});

test('csvToDictionary 缺少列抛错', () => {
  assert.throws(() => csvToDictionary('term\nonly', { header: false }), /缺少 translation/);
});

test('dictionaryToJson / jsonToDictionary 往返', () => {
  const json = dictionaryToJson(SAMPLE);
  assert.deepEqual(jsonToDictionary(json), SAMPLE);
});

test('jsonToDictionary 拒绝非对象/非字符串值', () => {
  assert.throws(() => jsonToDictionary('[1,2]'), /必须是对象/);
  assert.throws(() => jsonToDictionary('{"a":1}'), /必须为字符串/);
});

test('normalizeDictionary 去空白、丢空键、去重', () => {
  const dirty = { '  Sign  ': ' 登录 ', '': 'x', A: '1', a: '2' };
  const { dictionary, stats } = normalizeDictionary(dirty);
  assert.deepEqual(dictionary, { Sign: '登录', A: '1', a: '2' });
  assert.equal(stats.dropped, 1);
  assert.equal(stats.merged, 0); // 大小写不同视为不同键（匹配词典大小写敏感契约）
  // 同名重复键（dedupe first）
  // 字面量同名键在 JS 解析时合并为 X:'2'（避免 no-dupe-keys）
  const dup = { X: '1' };
  dup.X = '2';
  const r2 = normalizeDictionary(dup, { dedupe: 'first' });
  assert.equal(r2.dictionary.X, '2');
});
