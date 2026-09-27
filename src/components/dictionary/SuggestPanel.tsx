'use client';
/**
 * 翻译建议面板（T21 子组件）
 * @file src/components/dictionary/SuggestPanel.tsx
 * @version 1.12.7
 */
import type { SuggestResult } from './types';
import { sourceLabel } from './sourceLabel';

interface SuggestPanelProps {
  term: string;
  onTermChange: (value: string) => void;
  onSuggest: (target?: string) => void;
  loading: boolean;
  result: SuggestResult | null;
  error: string;
  samples: string[];
  onAccept: () => void;
  totalEntries: number;
}

export function SuggestPanel({
  term,
  onTermChange,
  onSuggest,
  loading,
  result,
  error,
  samples,
  onAccept,
  totalEntries,
}: SuggestPanelProps) {
  return (
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
          onChange={(e) => onTermChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSuggest();
          }}
        />
        <button
          type='button'
          className='btn btn-primary'
          onClick={() => onSuggest()}
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
                <button type='button' className='btn btn-copy' onClick={onAccept}>
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
                onTermChange(s);
                onSuggest(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
