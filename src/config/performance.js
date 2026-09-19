/**
 * 性能相关配置
 * @file src/config/performance.js
 */
import { importantElements, ignoreElements } from './elements.js';

export const performanceConfig = {
  enableDeepObserver: true,
  enablePartialMatch: true,
  maxDictSize: 2000,
  enableTranslationCache: true,
  batchSize: 50,
  batchDelay: 0,
  logTiming: false,
  cacheExpiration: 3600000, // 缓存过期时间（毫秒）
  minTextLengthToTranslate: 3, // 最小翻译文本长度
  minTranslateInterval: 500, // 最小翻译间隔（毫秒）
  observeAttributes: true, // 是否观察属性变化
  observeSubtree: true, // 是否观察子树变化
  importantAttributes: [
    'title',
    'alt',
    'aria-label',
    'placeholder',
    'data-hovercard-url',
    'data-hovercard-type',
  ], // 重要的属性列表
  importantElements,
  ignoreElements,
  mutationThreshold: 30, // 单次突变数量阈值
  contentChangeWeight: 1, // 内容变化权重
  importantChangeWeight: 2, // 重要变化权重
  translationTriggerRatio: 0.3, // 触发翻译的变化比例
  enableVirtualDom: true, // 是否启用虚拟DOM优化
  virtualDomCleanupInterval: 60000, // 虚拟DOM清理间隔（毫秒）
  virtualDomNodeTimeout: 3600000, // 虚拟DOM节点超时时间（毫秒）
  useSmartThrottling: true, // 启用智能节流
  ignoreCharacterDataMutations: false, // 是否忽略字符数据变化（用于性能优化）
  ignoreAttributeMutations: false, // 是否忽略属性变化（用于性能优化）
  minContentChangesToTrigger: 3, // 触发翻译的最小内容变化数
  maxMutationProcessing: 50, // 单次处理的最大突变数
  enableFullTranslation: true, // 是否启用完整翻译模式
  networkRequestInterval: 1000, // 网络请求间隔（毫秒）
  maxTranslationErrorCount: 10, // 最大翻译错误数
  maxDomErrorCount: 20, // 最大DOM操作错误数
  maxDictionaryErrorCount: 5, // 最大词典错误数
  maxNetworkErrorCount: 3, // 最大网络错误数
  maxPerformanceErrorCount: 15, // 最大性能错误数
  maxOtherErrorCount: 25, // 最大其他错误数
};
