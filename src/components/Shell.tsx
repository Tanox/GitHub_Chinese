/**
 * 工作台外壳
 * @file src/components/Shell.tsx
 * @version 1.12.2
 * @description 服务端组件：侧栏 + 顶栏 + 移动端导航 + 内容区的公共骨架，供三个页面复用。
 *              prototype 模式用于采集页「整页复刻」原型：隐藏侧栏、改用 proto 顶栏 / 页脚，
 *              内容区加 .proto-page 作用域以承接 prototype.css 的组件覆盖。
 */

import type { ReactNode } from 'react';
import Rail from './Rail';
import MobileNav from './MobileNav';
import type { RailSection } from './navItems';

interface ShellProps {
  /** 当前激活的侧栏导航项 */
  active: RailSection;
  /** 标准顶栏标题（prototype 模式下忽略） */
  title?: string;
  /** 标准顶栏副标题（prototype 模式下忽略） */
  subtitle?: string;
  /** 顶栏右侧徽标，缺省为「本地优先 · 离线可用」 */
  badge?: ReactNode;
  /** 原型复刻模式：隐藏侧栏，启用 proto 顶栏 / 页脚与 .proto-page 作用域 */
  prototype?: boolean;
  /** 原型顶栏品牌文案 */
  brand?: string;
  children: ReactNode;
}

export default function Shell({
  active,
  title,
  subtitle,
  badge,
  prototype = false,
  brand = 'GitHub 中文 · 采集工具',
  children,
}: ShellProps) {
  return (
    <div id='collector-workspace' className='app-shell'>
      {!prototype && <Rail active={active} />}

      <main id='collector-main' className='workspace'>
        <div
          id='toastContainer'
          className='toast-wrap'
          role='status'
          aria-live='polite'
          aria-atomic='true'
        ></div>

        {prototype ? (
          <header className='proto-topbar'>
            <div className='proto-topbar-inner'>
              <span className='proto-topbar-brand'>{brand}</span>
              <button className='proto-icon-btn' type='button' aria-label='设置'>
                <svg
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  aria-hidden='true'
                >
                  <circle cx='12' cy='12' r='3'></circle>
                  <path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'></path>
                </svg>
              </button>
            </div>
          </header>
        ) : (
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
        )}

        {/* 窄屏替代侧栏，保证三个页面互通 */}
        <MobileNav active={active} />

        <div id='collector-content' className='content scroll'>
          <div className={`content-inner${prototype ? ' proto-page' : ''}`}>{children}</div>
        </div>

        {prototype ? (
          <footer className='footer'>
            <div className='footer-inner'>
              <span className='fnote'>高保真原型 · 仅供设计走查，不构成交付承诺</span>
              <nav className='flinks' aria-label='页脚链接'>
                <a href='/overview'>项目概览</a>
                <a href='/coverage'>覆盖率</a>
                <a href='/design'>设计系统</a>
              </nav>
            </div>
          </footer>
        ) : (
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
        )}
      </main>
    </div>
  );
}
