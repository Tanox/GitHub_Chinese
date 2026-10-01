/**
 * 词库管理台（T19 / T24 / T25 工作台 UI 接入）
 * @file src/app/dictionary/manage/page.tsx
 * @version 1.13.8
 * @description 服务端页面：加载合并词典与统计，交由客户端岛 Manager 提供搜索 / 审阅 /
 *   导入导出 UI。不直接写服务器词典文件。
 */
import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import Manager from '@/components/dictionary/Manager';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { DictionaryStats } from '@/utils/tools/dictionaryStats';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: '词库管理 · GitHub 中文' };

export default function DictionaryManagePage() {
  const dictionary = mergeAllDictionaries();
  const stats = DictionaryStats.validateDictionary();

  return (
    <Shell
      active='dict-manage'
      title='词库管理'
      subtitle='浏览、搜索、审阅并导入导出词库（本地优先 · 离线可用）'
      badge={
        <div className='status-pill'>
          <span className='dot' aria-hidden='true'></span>
          本地优先 · 离线可用
        </div>
      }
    >
      <Manager dictionary={dictionary} stats={stats} />
    </Shell>
  );
}
