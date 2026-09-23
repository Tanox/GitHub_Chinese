/**
 * 采集错误码常量测试
 * @file tests/collect-codes.test.mjs
 * @version 1.9.30
 * @description 校验服务端与前端共用的 CollectErrorCode 契约稳定
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CollectErrorCode } from '../src/lib/collect-codes.js';

test('CollectErrorCode 已冻结且各错误码取值唯一', () => {
  assert.ok(Object.isFrozen(CollectErrorCode));
  const values = Object.values(CollectErrorCode);
  assert.equal(new Set(values).size, values.length);
});

test('CollectErrorCode 覆盖全部关键错误场景', () => {
  const expected = [
    'UNKNOWN',
    'MISSING_DEPENDENCY',
    'FETCH_FAILED',
    'SUBPROCESS_FAILED',
    'INPUT_INVALID',
  ];
  for (const key of expected) {
    assert.equal(typeof CollectErrorCode[key], 'number', `缺少错误码：${key}`);
  }
});
