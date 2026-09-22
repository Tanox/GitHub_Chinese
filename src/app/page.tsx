/**
 * 词典采集工作台首页
 * @file src/app/page.tsx
 * @version 1.9.26
 * @description 服务端页面：仅渲染公共外壳，交互逻辑收敛在 CollectorConsole 客户端组件
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
