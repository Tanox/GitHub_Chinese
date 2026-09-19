/**
 * 翻译元素选择跳过模式
 * @file src/translation-core/selectorUtils/patterns.js
 * @version 1.9.24
 * @description 汇总跳过翻译的标签、class 与 id 模式（模式定义按类别拆分到同目录子模块）
 */

import { SKIP_TAGS, SKIP_CLASS_PATTERNS } from './skipTags.js';
import { SKIP_ID_ENTITY_PATTERNS } from './skipIdsEntity.js';
import { SKIP_ID_TECHNICAL_PATTERNS } from './skipIdsTechnical.js';

export { SKIP_TAGS, SKIP_CLASS_PATTERNS };

/** id 命中任一模式即跳过（实体标识在前、技术设施在后，保持匹配优先级） */
export const SKIP_ID_PATTERNS = [...SKIP_ID_ENTITY_PATTERNS, ...SKIP_ID_TECHNICAL_PATTERNS];
