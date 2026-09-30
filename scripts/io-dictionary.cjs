/**
 * 词典导入/导出增强（T24 数据层）
 * @file io-dictionary.cjs
 * @version 1.11.10
 * @description 与现有扁平词典结构 Object<string,string> 对齐的 CSV/JSON 双向转换，
 *   含 RFC4180 引号转义、重复键策略、空键/非字符串校验与归一。
 */
'use strict';

const HEADER = ['term', 'translation'];

/** CSV 字段转义（含逗号/引号/换行用双引号包围，内部引号加倍） */
function csvEscape(field) {
  const s = String(field);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** CSV 解析状态机（兼容引号字段内的逗号/换行/双引号转义，跳过 \r） */
function parseCsv(csv) {
  let s = String(csv);
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1); // 去除 UTF-8 BOM
  const records = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i += 1; continue;
      }
      field += c; i += 1; continue;
    }
    if (c === '"') { inQuotes = true; i += 1; continue; }
    if (c === ',') { row.push(field); field = ''; i += 1; continue; }
    if (c === '\r') { i += 1; continue; }
    if (c === '\n') { row.push(field); records.push(row); row = []; field = ''; i += 1; continue; }
    field += c; i += 1;
  }
  if (field !== '' || row.length > 0) { row.push(field); records.push(row); }
  return records;
}

/**
 * 词典 → CSV 字符串（首行表头 term,translation，RFC4180 行尾 \r\n）
 * @param {Object<string,string>} dict
 * @returns {string}
 */
function dictionaryToCsv(dict) {
  const rows = [HEADER.join(',')];
  for (const [k, v] of Object.entries(dict)) {
    rows.push(csvEscape(k) + ',' + csvEscape(v));
  }
  return rows.join('\r\n');
}

/**
 * CSV → 词典
 * @param {string} csv
 * @param {{header?:boolean, dedupe?:'error'|'last'|'first'}} [options]
 *   header: 是否跳过首行表头（默认 true）；dedupe: 重复键策略（默认 'last'）
 * @returns {Object<string,string>}
 */
function csvToDictionary(csv, options = {}) {
  const header = options.header !== false;
  const dedupe = options.dedupe || 'last';
  const records = parseCsv(csv);
  const dict = {};
  let start = 0;
  if (header && records.length && records[0][0] === HEADER[0] && records[0][1] === HEADER[1]) {
    start = 1;
  }
  for (let r = start; r < records.length; r += 1) {
    const rec = records[r];
    if (rec.length < 2) {
      throw new Error('CSV 行缺少 translation 列: ' + JSON.stringify(rec));
    }
    const term = rec[0];
    const translation = rec.slice(1).join(',');
    if (term === '') continue; // 跳过空键行
    if (Object.prototype.hasOwnProperty.call(dict, term)) {
      if (dedupe === 'error') throw new Error('CSV 重复词条: ' + term);
      if (dedupe === 'first') continue; // 保留首次出现
      // 'last' 覆盖（默认）
    }
    dict[term] = translation;
  }
  return dict;
}

/** 词典 → 美化 JSON 字符串 */
function dictionaryToJson(dict) {
  return JSON.stringify(dict, null, 2);
}

/**
 * JSON 字符串 → 词典（校验为对象且键值均为字符串）
 * @param {string} str
 * @returns {Object<string,string>}
 */
function jsonToDictionary(str) {
  const obj = JSON.parse(str);
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('词典 JSON 必须是对象');
  }
  const dict = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof k !== 'string' || typeof v !== 'string') {
      throw new Error('词条键与值必须为字符串: ' + String(k));
    }
    dict[k] = v;
  }
  return dict;
}

/**
 * 词典归一：trim 键/值、丢弃空键、重复键按策略合并
 * @param {Object<string,string>} dict
 * @param {{dedupe?:'first'|'last'}} [options]
 * @returns {{dictionary:Object<string,string>, stats:{dropped:number, merged:number}}}
 */
function normalizeDictionary(dict, options = {}) {
  const dedupe = options.dedupe || 'first';
  const out = {};
  let dropped = 0;
  let merged = 0;
  for (const [k, v] of Object.entries(dict)) {
    const nk = String(k).trim();
    const nv = String(v).trim();
    if (nk === '') { dropped += 1; continue; }
    if (Object.prototype.hasOwnProperty.call(out, nk)) {
      merged += 1;
      if (dedupe === 'first') continue;
    }
    out[nk] = nv;
  }
  return { dictionary: out, stats: { dropped, merged } };
}

module.exports = {
  dictionaryToCsv,
  csvToDictionary,
  dictionaryToJson,
  jsonToDictionary,
  normalizeDictionary,
};
