/**
 * 其他杂项翻译
 * @file src/dictionaries/common/misc.js
 * @version 1.9.24
 * @description 按主题合并组织/探索/提示、首页/产品/方案、操作/状态三组杂项词典
 */

import { miscOrganizationDictionary } from './miscOrganization.js';
import { miscMarketingDictionary } from './miscMarketing.js';
import { miscActionsDictionary } from './miscActions.js';

export const miscDictionary = {
  ...miscOrganizationDictionary,
  ...miscMarketingDictionary,
  ...miscActionsDictionary,
};
