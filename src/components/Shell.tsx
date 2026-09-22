/**
 * 工作台外壳
 * @file src/components/Shell.tsx
 * @version 1.9.26
 * @description 服务端组件：侧栏 + 顶栏 + 内容区的公共骨架，供三个页面复用
 */

import type { ReactNode } from 'react';
import Rail from './Rail';
import type { RailSection } from './Rail';

interface ShellProps {
  /** 当前激活的侧栏导航项 */
  active: RailSection;
  title: string;
  subtitle: string;
  /** 顶栏右侧徽标，缺省为「本地优先 · 离线可用」 */
  badge?: ReactNode;
  children: ReactNode;
}

export default function Shell({ active, title, subtitle, badge, children }: ShellProps) {
  return (
    <div id='collector-workspace' className='app-shell'>
      <Rail active={active} />

      <main id='collector-main' className='workspace'>
        <div id='toastContainer' className='toast-wrap'></div>

        <header className='topbar'>
          <div>
            <h1>{title}</h1>
            <p className='topbar-sub'>{subtitle}</p>
          </div>
          {badge ?? (
            <div className='status-pill'>
              <span className='dot'></span>
              本地优先 · 离线可用
            </div>
          )}
        </header>

        <div id='collector-content' className='content scroll'>
          <div className='content-inner'>{children}</div>
        </div>
      </main>
    </div>
  );
}
