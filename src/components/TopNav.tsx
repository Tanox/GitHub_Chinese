/**
 * 工作台顶部导航
 * @file src/components/TopNav.tsx
 * @description 服务端组件：上下布局的全局顶栏，承载品牌、页面导航（Next Link 预取）与引擎状态，
 *              替代原左侧 Rail 侧栏。窄屏下导航链接横向滚动，无需独立的移动端导航组件。
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { VERSION } from '@/userscript/version';
import { NAV_ITEMS } from './navItems';
import type { NavSection } from './navItems';

interface TopNavProps {
  /** 当前激活的导航项 */
  active: NavSection;
  /** 顶栏右侧徽标，缺省为「本地优先 · 离线可用」+ 引擎版本 / 采集模式 */
  badge?: ReactNode;
}

export default function TopNav({ active, badge }: TopNavProps) {
  // 未配置独立采集服务时走本地回退，状态文案随之调整，避免误导
  const collectServiceConfigured = Boolean(process.env.COLLECT_SERVICE_URL);
  return (
    <header id='collector-topnav' className='topnav'>
      <div className='topnav-inner'>
        <Link href='/' className='topnav-brand' aria-label='GitHub 中文 · 采集工作台 首页'>
          <span className='topnav-mark' aria-hidden='true'>
            中
          </span>
          <span className='topnav-name'>GitHub 中文</span>
        </Link>

        <nav className='topnav-links' aria-label='工作台导航'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                id={`topnav-link-${item.key}`}
                href={item.href}
                prefetch
                className={`topnav-link ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='topnav-right'>
          {badge ?? (
            <div className='status-pill'>
              <span className='dot' aria-hidden='true'></span>
              本地优先 · 离线可用
            </div>
          )}
          <span className='topnav-meta'>
            v{VERSION} · {collectServiceConfigured ? '采集服务' : '本地采集'}
          </span>
        </div>
      </div>
    </header>
  );
}
