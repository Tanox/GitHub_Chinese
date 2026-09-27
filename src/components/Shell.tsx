/**
 * 工作台外壳
 * @file src/components/Shell.tsx
 * @version 1.12.3
 * @description 服务端组件：侧栏 + 顶栏 + 移动端导航 + 内容区的公共骨架，供四个页面复用。
 *              contentClass 仅用于采集页承接 prototype.css 的组件级视觉对齐，不改变应用外壳本身。
 */

import type { ReactNode } from 'react';
import Rail from './Rail';
import MobileNav from './MobileNav';
import type { RailSection } from './navItems';

interface ShellProps {
  /** 当前激活的侧栏导航项 */
  active: RailSection;
  /** 标准顶栏标题 */
  title: string;
  /** 标准顶栏副标题 */
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
      <Rail active={active} />

      <main id='collector-main' className='workspace'>
        <div
          id='toastContainer'
          className='toast-wrap'
          role='status'
          aria-live='polite'
          aria-atomic='true'
        ></div>

        <header className='topbar'>
          <div>
            <h1>{title}</h1>
            <p className='topbar-sub'>{subtitle}</p>
          </div>
          {badge ?? (
            <div className='status-pill'>
              <span className='dot' aria-hidden='true'></span>
              本地优先 · 离线可用
            </div>
          )}
        </header>

        {/* 窄屏替代侧栏，保证四个页面互通 */}
        <MobileNav active={active} />

        <div id='collector-content' className='content scroll'>
          <div className={`content-inner ${contentClass}`}>{children}</div>
        </div>

        <footer className='footer'>
          <div className='footer-inner'>
            <span className='fnote'>GitHub 中文 · 采集工作台</span>
            <nav className='flinks' aria-label='页脚链接'>
              <a href='/overview'>项目概览</a>
              <a href='/coverage'>覆盖率</a>
              <a href='/design'>设计系统</a>
            </nav>
          </div>
        </footer>
      </main>
    </div>
  );
}
