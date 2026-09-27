/**
 * 词典采集工作台首页（采集工具）
 * @file src/app/page.tsx
 * @version 1.12.3
 * @description 服务端页面：真实功能应用（探针 / 采集 / 预览 / 实时中心），组件级视觉对齐原型。
 */

import Shell from '@/components/Shell';
import CollectorConsole from '@/components/CollectorConsole';

export default function CollectorPage() {
  return (
    <Shell
      active='console'
      title='词典采集工作台'
      subtitle='从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典'
      contentClass='proto-page'
    >
      <div className='proto-hero'>
        <span className='proto-eyebrow'>采集工具 · COLLECTOR</span>
        <h1 className='proto-title'>GitHub 页面字符串采集工具</h1>
        <p className='proto-lede'>
          从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典。覆盖探针植入、文本 / 批量 URL
          采集、实时处理中心与 JSON 导出全流程。
        </p>
      </div>
      <CollectorConsole />
    </Shell>
  );
}
