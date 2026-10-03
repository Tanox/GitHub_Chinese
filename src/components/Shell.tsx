/**
 * 工作台外壳
 * @file src/components/Shell.tsx
 * @description 服务端组件：顶部导航（上下布局）+ 内容区的公共骨架，供各页面复用。
 *              contentClass 仅用于采集页承接 prototype.css 的组件级视觉对齐，不改变应用外壳本身。
 */

import type { ReactNode } from 'react';
import Link from 'next/link';
import TopNav from './TopNav';
import { FOOTER_NAV_ITEMS } from './navItems';
import type { NavSection } from './navItems';
import { VERSION } from '@/userscript/version';

interface ShellProps {
  /** 当前激活的顶栏导航项 */
  active: NavSection;
  /** 标准页头标题 */
  title: string;
  /** 标准页头副标题 */
  subtitle: string;
  /** 顶栏右侧徽标，缺省为「本地优先 · 离线可用」 */
  badge?: ReactNode;
  /** 内容区附加类名（如 proto-page：采集页组件对齐原型视觉，不影响应用外壳） */
  contentClass?: string;
  children: ReactNode;
}

export default function Shell({
  active,
  title,
  subtitle,
  badge,
  contentClass = '',
  children,
}: ShellProps) {
  return (
    <div id='collector-workspace' className='app-shell'>
      <TopNav active={active} badge={badge} />

      <main id='collector-main' className='workspace'>
        <div
          id='toastContainer'
          className='toast-wrap'
          role='status'
          aria-live='polite'
          aria-atomic='true'
        ></div>

        <header className='topbar'>
          <div className='topbar-inner'>
            <div>
              <h1>{title}</h1>
              <p className='topbar-sub'>{subtitle}</p>
            </div>
          </div>
        </header>

        <div id='collector-content' className='content scroll'>
          <div className={`content-inner ${contentClass}`}>{children}</div>
        </div>

        <footer id='site-footer' className='footer'>
          <div className='footer-inner'>
            <div className='footer-meta'>
              <span className='fnote'>GitHub 中文 · 采集工作台</span>
              <span className='fnote-ver'>v{VERSION}</span>
              <span className='fnote-date'>更新时间：2026-10-03</span>
            </div>
            {FOOTER_NAV_ITEMS.length > 0 && (
              <nav className='flinks' aria-label='页脚快捷导航'>
                {FOOTER_NAV_ITEMS.map((item) => (
                  <Link
                    key={`footer-${item.key}`}
                    href={item.href}
                    className={`footer-link ${item.key === active ? 'active' : ''}`}
                    prefetch
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
