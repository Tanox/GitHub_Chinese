/**
 * 词库管理台（T19 / T24 / T25 / T20 / T23 工作台 UI 接入）
 * @file src/app/dictionary/manage/page.tsx
 * @version 1.13.9
 * @description 服务端页面：加载合并词典与统计，读取采集历史（docs/collect-history.json，只读），
 *   交由客户端岛 Manager 提供搜索 / 审阅 / 导入导出 / 入库补丁 / 历史对比 UI。
 *   不直接写服务器词典文件。
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import Manager from '@/components/dictionary/Manager';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { DictionaryStats } from '@/utils/tools/dictionaryStats';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: '词库管理 · GitHub 中文' };

const HISTORY_FILE = path.join(process.cwd(), 'docs', 'collect-history.json');

export default function DictionaryManagePage() {
  const dictionary = mergeAllDictionaries() as Record<string, string>;
  const stats = DictionaryStats.validateDictionary() as {
    totalEntries: number;
    translatedEntries: number;
    completionRate: string;
  };

  let history: Array<{
    time: string;
    total: number;
    added: number;
    removed: number;
    changed: number;
    snapshot?: Record<string, string>;
  }> = [];
  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    if (Array.isArray(parsed)) history = parsed;
  } catch {
    history = [];
  }

  return (
    <Shell
      active='dict-manage'
      title='词库管理'
      subtitle='浏览、搜索、审阅、导入导出并对比采集历史（本地优先 · 离线可用）'
      badge={
        <div className='status-pill'>
          <span className='dot' aria-hidden='true'></span>
          本地优先 · 离线可用
        </div>
      }
    >
      <Manager dictionary={dictionary} stats={stats} history={history} />
    </Shell>
  );
}
