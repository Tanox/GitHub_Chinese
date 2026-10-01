/**
 * 词典导入 / 导出 / 合并 / 筛选（纯函数，可在 Node 与浏览器复用）
 * @file src/lib/dictionary-io.js
 * @version 1.13.9
 * @description 供「词库管理台」使用的无副作用工具：扁平对象 ↔ 条目数组转换、
 *   关键字筛选、排序、浅合并与容错解析。下载（依赖 DOM）由调用方负责。
 */

/**
 * 将词典对象转为有序条目数组
 * @param {Record<string, string>} dict
 * @returns {{ key: string, value: string }[]}
 */
export function toEntries(dict) {
  return Object.keys(dict).map((key) => ({ key, value: dict[key] }));
}

/**
 * 按关键字（key 或 value，大小写不敏感）筛选
 * @param {{ key: string, value: string }[]} entries
 * @param {string} query
 * @returns {{ key: string, value: string }[]}
 */
export function filterEntries(entries, query) {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return entries;
  return entries.filter(
    (e) => e.key.toLowerCase().includes(q) || String(e.value).toLowerCase().includes(q),
  );
}

/**
 * 按字段与方向排序
 * @param {{ key: string, value: string }[]} entries
 * @param {'key' | 'value'} by
 * @param {'asc' | 'desc'} dir
 * @returns {{ key: string, value: string }[]}
 */
export function sortEntries(entries, by = 'key', dir = 'asc') {
  const sorted = [...entries].sort((a, b) =>
    by === 'value' ? a.value.localeCompare(b.value) : a.key.localeCompare(b.key),
  );
  return dir === 'desc' ? sorted.reverse() : sorted;
}

/**
 * 浅合并词典（incoming 覆盖 base），返回新对象
 * @param {Record<string, string>} base
 * @param {Record<string, string>} incoming
 * @returns {Record<string, string>}
 */
export function mergeDictionaries(base, incoming) {
  return { ...base, ...incoming };
}

/**
 * 容错解析导入文本，支持：扁平对象 { en: zh } / 条目数组 [{ key, value }]。
 * @param {string} text
 * @returns {{ ok: true, data: Record<string, string>, count: number }
 *   | { ok: false, error: string }}
 */
export function parseImportedDictionary(text) {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return { ok: false, error: '内容为空' };
  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, error: 'JSON 解析失败' };
  }
  const out = {};
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (item && typeof item === 'object' && 'key' in item && 'value' in item) {
        out[String(item.key)] = String(item.value);
      }
    }
  } else if (parsed && typeof parsed === 'object') {
    for (const k of Object.keys(parsed)) {
      out[k] = String(parsed[k]);
    }
  } else {
    return { ok: false, error: '不支持的词典格式' };
  }
  const count = Object.keys(out).length;
  if (count === 0) return { ok: false, error: '未解析到任何词条' };
  return { ok: true, data: out, count };
}

/**
 * 计算词典补丁（added / updated 分离，值相同跳过）
 * @param {Record<string, string>} base 当前合并词典
 * @param {Record<string, string>} incoming 待入库词典
 * @returns {{ added: Record<string, string>, updated: Record<string, string> }}
 */
export function buildDictionaryPatch(base, incoming) {
  const patch = { added: {}, updated: {} };
  const b = base || {};
  const i = incoming || {};
  for (const [k, v] of Object.entries(i)) {
    if (Object.prototype.hasOwnProperty.call(b, k)) {
      if (b[k] !== v) patch.updated[k] = v;
    } else {
      patch.added[k] = v;
    }
  }
  return patch;
}

/**
 * 应用补丁到词典（不可变，返回新对象）
 * @param {Record<string, string>} base
 * @param {{ added?: Record<string, string>, updated?: Record<string, string> }} patch
 * @returns {Record<string, string>}
 */
export function applyPatch(base, patch) {
  const next = { ...(base || {}) };
  for (const [k, v] of Object.entries(patch.added || {})) next[k] = v;
  for (const [k, v] of Object.entries(patch.updated || {})) next[k] = v;
  return next;
}

/**
 * 渲染 PR 式 diff 预览文本（供复制 / 下载）
 * @param {{ added?: Record<string, string>, updated?: Record<string, string> }} patch
 * @returns {string}
 */
export function renderDiffPreview(patch) {
  const lines = [];
  for (const [k, v] of Object.entries(patch.added || {})) lines.push(`+ "${k}": "${v}"`);
  for (const [k, v] of Object.entries(patch.updated || {})) lines.push(`~ "${k}": "${v}"`);
  return lines.length ? lines.join('\n') : '(无变更)';
}

/**
 * 词条级 diff 两轮词典（T23 历史对比）
 * @param {Record<string, string>} [prev]
 * @param {Record<string, string>} [curr]
 * @returns {{ added: Array<{ term: string, translation: string }>,
 *   removed: Array<{ term: string, translation: string }>,
 *   changed: Array<{ term: string, prev: string, curr: string }> }}
 */
export function diffDictionaries(prev, curr) {
  const p = prev || {};
  const c = curr || {};
  const added = [];
  const removed = [];
  const changed = [];
  const keys = new Set([...Object.keys(p), ...Object.keys(c)]);
  for (const term of keys) {
    const inP = term in p;
    const inC = term in c;
    if (inP && inC) {
      if (p[term] !== c[term]) changed.push({ term, prev: p[term], curr: c[term] });
    } else if (inC) {
      added.push({ term, translation: c[term] });
    } else {
      removed.push({ term, translation: p[term] });
    }
  }
  return { added, removed, changed };
}
