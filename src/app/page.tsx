/**
 * 词典采集工作台首页（采集工具）
 * @file src/app/page.tsx
 * @version 1.13.16
 * @description 服务端页面：真实功能应用（探针 / 采集 / 预览 / 实时中心）。
 */

import Shell from '@/components/Shell';
import CollectorConsole from '@/components/CollectorConsole';

export default function CollectorPage() {
  return (
    <Shell
      active='console'
      title='词典采集工作台'
      subtitle='从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典'
    >
      <CollectorConsole />
    </Shell>
  );
}
