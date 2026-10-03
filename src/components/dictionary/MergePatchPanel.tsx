'use client';
/**
 * 导入 / 合并 / 入库补丁（T24 导入导出 · T20 合并入库 UI）
 * @file src/components/dictionary/MergePatchPanel.tsx
 * @version 1.13.12
 * @description 粘贴或上传词典 JSON，解析后：① 生成合并结果（T24，供手动入库）；
 *   ② 一键生成「入库补丁」（T20，added / updated 分离），预览 diff 并可下载。
 *   遵循「本地优先·离线可用」：不写服务器词典文件，仅产出结果供用户入库到 src/dictionaries/。
 */
import { useRef, useState, type ChangeEvent } from 'react';
import {
  parseImportedDictionary,
  mergeDictionaries,
  buildDictionaryPatch,
  renderDiffPreview,
} from '@/lib/dictionary-io';

interface MergePatchPanelProps {
  dictionary: Record<string, string>;
}

function downloadJson(filename: string, data: unknown): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function MergePatchPanel({ dictionary }: MergePatchPanelProps) {
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<{
    ok: boolean;
    count?: number;
    error?: string;
  } | null>(null);
  const [patch, setPatch] = useState<{
    addedCount: number;
    updatedCount: number;
    preview: string;
    data: { added: Record<string, string>; updated: Record<string, string> };
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImport() {
    const res = parseImportedDictionary(importText);
    setImportResult(res.ok ? { ok: true, count: res.count } : { ok: false, error: res.error });
    setPatch(null);
  }
  function downloadMerge() {
    const res = parseImportedDictionary(importText);
    if (!res.ok || !res.data) return;
    downloadJson('dictionary-merged.json', mergeDictionaries(dictionary, res.data));
  }
  function generatePatch() {
    const res = parseImportedDictionary(importText);
    if (!res.ok || !res.data) {
      setImportResult(res.ok ? { ok: true, count: res.count } : { ok: false, error: res.error });
      return;
    }
    const p = buildDictionaryPatch(dictionary, res.data);
    const addedCount = Object.keys(p.added).length;
    const updatedCount = Object.keys(p.updated).length;
    setPatch({
      addedCount,
      updatedCount,
      preview: renderDiffPreview(p),
      data: p,
    });
  }
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImportText(String(reader.result ?? ''));
    reader.readAsText(f);
  }

  return (
    <section id='dict-import' className='card' aria-labelledby='h-import'>
      <div className='card-head'>
        <h2 className='card-title' id='h-import'>
          导入 / 合并 / 入库补丁
        </h2>
      </div>
      <p className='card-desc'>
        粘贴或上传词典 JSON（扁平对象或 [{'{'}(key, value){'}'}
        ]）：解析后仅生成合并结果与入库补丁供手动入库， 不写服务器词典文件。
      </p>
      <div className='field-stack'>
        <label htmlFor='dict-import-text' className='sr-only'>
          导入词典文本
        </label>
        <textarea
          id='dict-import-text'
          className='field'
          rows={4}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='{"Settings":"设置"} 或 [{"key":"Settings","value":"设置"}]'
        />
        <div className='btn-row'>
          <button id='dict-import-btn' type='button' className='btn' onClick={handleImport}>
            解析
          </button>
          <button
            id='dict-import-file'
            type='button'
            className='btn'
            onClick={() => fileRef.current?.click()}
          >
            选择文件
          </button>
          <button
            id='dict-merge-btn'
            type='button'
            className='btn'
            onClick={downloadMerge}
            disabled={!importResult?.ok}
          >
            下载合并结果
          </button>
          <button
            id='dict-patch-btn'
            type='button'
            className='btn btn-primary'
            onClick={generatePatch}
            disabled={!importResult?.ok}
          >
            生成入库补丁
          </button>
          <input
            ref={fileRef}
            type='file'
            accept='application/json,.json'
            onChange={onFile}
            hidden
          />
        </div>
      </div>

      {importResult &&
        (importResult.ok ? (
          <p className='dict-import-ok'>
            已解析 {importResult.count} 条，可下载合并结果或生成入库补丁。
          </p>
        ) : (
          <p className='dict-error'>{importResult.error}</p>
        ))}

      {patch && (
        <div className='patch-preview' aria-live='polite'>
          <p className='meta'>
            入库补丁：新增 <b>{patch.addedCount}</b> 条 · 更新 <b>{patch.updatedCount}</b> 条
          </p>
          <pre className='diff-block'>{patch.preview}</pre>
          <div className='btn-row'>
            <button
              id='dict-patch-dl'
              type='button'
              className='btn'
              onClick={() => downloadJson('dictionary-patch.json', patch.data)}
            >
              下载补丁
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
