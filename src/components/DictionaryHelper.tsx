'use client';
/**
 * 词典助手客户端岛（T21）
 * @file src/components/DictionaryHelper.tsx
 * @version 1.12.5
 * @description 输入英文词条 → 调用 /api/dictionary/suggest 获取建议；采纳后存入 localStorage 待入库（含导出/清空）。
 */
import { useEffect, useState } from 'react';

interface SuggestResult {
  suggestion: string | null;
  source: string;
  confidence: number;
  llmEnabled?: boolean;
}

interface PendingItem {
  key: string;
  value: string;
  source: string;
}

/** 本地持久化的待入库建议键名 */
const STORAGE_KEY = 'ghzh:dict-pending';

/** 建议来源 → 中文标签 */
function sourceLabel(source: string): string {
  switch (source) {
    case 'memory-exact':
      return '精确记忆';
    case 'memory-ci':
      return '大小写记忆';
    case 'memory-composed':
      return '组合记忆';
    case 'llm':
      return 'LLM';
    default:
      return source;
  }
}

export default function DictionaryHelper({
  samples,
  totalEntries,
}: {
  samples: string[];
  totalEntries: number;
}) {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SuggestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<PendingItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPending(JSON.parse(raw));
    } catch {
      // 忽略损坏的本地数据
    }
  }, []);

  function persist(next: PendingItem[]) {
    setPending(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 存储不可用时静默
    }
  }

  async function handleSuggest(target?: string) {
    const q = (target ?? term).trim();
    if (!q) {
      setError('请输入英文词条');
      return;
    }
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const resp = await fetch(`/api/dictionary/suggest?term=${encodeURIComponent(q)}`);
      const data = await resp.json();
      if (!resp.ok) {
        setError(data?.error ?? '请求失败');
      } else {
        setResult({
          suggestion: data.suggestion,
          source: data.source,
          confidence: data.confidence,
          llmEnabled: data.llmEnabled,
        });
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  function accept() {
    if (!result?.suggestion || !term.trim()) return;
    persist([
      ...pending,
      { key: term.trim(), value: result.suggestion, source: result.source },
    ]);
    setResult(null);
    setTerm('');
  }

  function removeAt(i: number) {
    persist(pending.filter((_, idx) => idx !== i));
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(pending, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionary-suggestions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className='dict-wrap'>
      <section className='card' id='dict-suggest' aria-label='翻译建议'>
        <div className='card-head'>
          <h2 className='card-title'>翻译建议</h2>
        </div>
        <p className='card-desc'>
          输入 GitHub 界面英文词条，基于 {totalEntries} 条现有词典（翻译记忆）给出建议译文；
          配置 LLM 密钥时额外调用模型增强。采纳的建议暂存于本地，可导出后人工入库。
        </p>
        <div className='dict-row'>
          <label htmlFor='dict-input' className='sr-only'>
            英文词条
          </label>
          <input
            id='dict-input'
            className='dict-input'
            type='text'
            placeholder='例如：Open a new issue'
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSuggest();
            }}
          />
          <button
            type='button'
            className='btn btn-primary'
            onClick={() => handleSuggest()}
            disabled={loading}
          >
            {loading ? '查询中…' : '获取建议'}
          </button>
        </div>
        {error && (
          <p className='dict-error' role='alert'>
            {error}
          </p>
        )}
        <div aria-live='polite'>
          {result && (
            <div className='dict-result'>
              {result.suggestion ? (
                <>
                  <span className='dict-suggestion'>{result.suggestion}</span>
                  <span className='badge'>{sourceLabel(result.source)}</span>
                  <button type='button' className='btn btn-copy' onClick={accept}>
                    采纳
                  </button>
                </>
              ) : (
                <span className='dict-empty'>
                  未找到建议（词典中无匹配，且未配置 LLM）
                </span>
              )}
            </div>
          )}
        </div>
        {samples.length > 0 && (
          <div className='dict-samples'>
            <span className='dict-samples-label'>示例试一试：</span>
            {samples.map((s) => (
              <button
                key={s}
                type='button'
                className='btn btn-copy'
                onClick={() => {
                  setTerm(s);
                  handleSuggest(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className='card' id='dict-pending' aria-label='待入库建议'>
        <div className='card-head'>
          <h2 className='card-title'>待入库（本地 {pending.length}）</h2>
          <div className='btn-row'>
            <button
              type='button'
              className='btn'
              onClick={exportJson}
              disabled={pending.length === 0}
            >
              导出 JSON
            </button>
            <button
              type='button'
              className='btn'
              onClick={() => persist([])}
              disabled={pending.length === 0}
            >
              清空
            </button>
          </div>
        </div>
        {pending.length === 0 ? (
          <p className='card-desc'>暂无采纳的建议。</p>
        ) : (
          <ul className='spec-list'>
            {pending.map((p, i) => (
              <li key={`${p.key}-${i}`} className='pending-item'>
                <code>{p.key}</code>
                <span className='arrow' aria-hidden='true'>
                  →
                </span>
                <span>{p.value}</span>
                <button
                  type='button'
                  className='btn btn-copy'
                  onClick={() => removeAt(i)}
                  aria-label={`移除 ${p.key}`}
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
