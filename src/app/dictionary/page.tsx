/**
 * 词典助手（T21 翻译建议）
 * @file src/app/dictionary/page.tsx
 * @version 1.12.6
 * @description 服务端页面：翻译建议助手，复用 Shell 外壳 + 客户端岛 DictionaryHelper。
 */
import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import DictionaryHelper from '@/components/DictionaryHelper';
import { mergeAllDictionaries } from '@/dictionaries/index';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: '词典助手 · GitHub 中文' };

/** 示例试词条数量上限 */
const MAX_SAMPLES = 12;

export default function DictionaryPage() {
  const dictionary = mergeAllDictionaries();
  const translated = Object.entries(dictionary).filter(([, v]) => !String(v).startsWith('待翻译'));
  const totalEntries = translated.length;
  // 取若干已译词条作为示例，便于用户一键试跑翻译记忆
  const samples = translated.slice(0, MAX_SAMPLES).map(([k]) => k);

  return (
    <Shell
      active='dictionary'
      title='词典助手'
      subtitle='基于现有词典的翻译记忆，为待翻译词条给出建议译文'
      badge={
        <div className='status-pill'>
          <span className='dot' aria-hidden='true'></span>
          本地优先 · 离线可用
        </div>
      }
    >
      <DictionaryHelper samples={samples} totalEntries={totalEntries} />
    </Shell>
  );
}
