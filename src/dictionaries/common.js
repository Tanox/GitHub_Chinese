/**
 * 通用翻译词典
 * @file common.js
 */

import { navDictionary } from './common/nav.js';
import { repoDictionary } from './common/repo.js';
import { prDictionary } from './common/pr.js';
import { issueDictionary } from './common/issue.js';
import { miscDictionary } from './common/misc.js';

export const commonDictionary = {
  ...navDictionary,
  ...repoDictionary,
  ...prDictionary,
  ...issueDictionary,
  ...miscDictionary,
};
