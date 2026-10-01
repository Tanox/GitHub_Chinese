/**
 * 错误处理单测
 * @file tests/error-handler.test.mjs
 * @description 覆盖 init、handleError 计数、resetErrorCounts 单类型与全部
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { ErrorHandler } from '../src/userscript/core/errorHandler/index.js';

test('init 后所有错误类型计数为 0', () => {
  ErrorHandler.init();
  const stats = ErrorHandler.getErrorStats();
  for (const type of Object.values(ErrorHandler.ERROR_TYPES)) {
    assert.equal(stats[type], 0, `类型 ${type} 应为 0`);
  }
});

test('handleError 增加对应类型计数', () => {
  ErrorHandler.init();
  const t = ErrorHandler.ERROR_TYPES.TRANSLATION;
  ErrorHandler.handleError('ctx', new Error('boom'), t);
  assert.equal(ErrorHandler.getErrorStats()[t], 1);
});

test('resetErrorCounts 支持单类型与全部重置', () => {
  ErrorHandler.init();
  const dom = ErrorHandler.ERROR_TYPES.DOM_OPERATION;
  const net = ErrorHandler.ERROR_TYPES.NETWORK;
  ErrorHandler.handleError('ctx', new Error('x'), dom);
  ErrorHandler.resetErrorCounts(dom);
  assert.equal(ErrorHandler.getErrorStats()[dom], 0);
  ErrorHandler.handleError('ctx', new Error('y'), net);
  ErrorHandler.resetErrorCounts();
  assert.equal(ErrorHandler.getErrorStats()[net], 0);
});
