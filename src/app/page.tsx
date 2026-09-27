/**
 * 词典采集工作台首页（采集工具）
 * @file src/app/page.tsx
 * @version 1.12.2
 * @description 服务端页面：整页复刻原型，渲染 proto 外壳 + hero，交互逻辑收敛在 CollectorConsole
 */

import Shell from '@/components/Shell';
import CollectorConsole from '@/components/CollectorConsole';

export default function CollectorPage() {
  return (
    <Shell prototype active='console'>
      <div className='proto-hero'>
        <span className='proto-eyebrow'>PROTOTYPE · COLLECTOR</span>
        <h1 className='proto-title'>GitHub 页面字符串采集工具</h1>
        <p className='proto-lede'>
          从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典。原型覆盖探针植入、文本 / 批量 URL
          采集、实时处理中心与 JSON 导出全流程。
        </p>
      </div>
      <CollectorConsole />
    </Shell>
  );
}
