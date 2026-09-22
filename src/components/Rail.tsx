/**
 * 工作台侧栏
 * @file src/components/Rail.tsx
 * @version 1.9.26
 * @description 服务端组件：品牌标识、页面导航（Next Link 预取）与引擎状态
 */

import Link from 'next/link';
import { VERSION } from '@/version';

export type RailSection = 'console' | 'overview' | 'design';

interface NavItem {
  key: RailSection;
  label: string;
  href: string;
}

/** 侧栏导航项（静态常量，模块级只创建一次） */
const NAV_ITEMS: NavItem[] = [
  { key: 'console', label: '采集控制台', href: '/' },
  { key: 'overview', label: '项目概览', href: '/overview' },
  { key: 'design', label: '设计系统', href: '/design' },
];

interface RailProps {
  active: RailSection;
}

export default function Rail({ active }: RailProps) {
  return (
    <aside id='collector-rail' className='rail'>
      <div className='rail-brand'>
        <div className='rail-mark'>中</div>
        <span className='rail-name'>GitHub 中文</span>
      </div>

      <div className='rail-body scroll'>
        <div>
          <p className='rail-section-title'>工作台</p>
          <nav className='rail-nav' aria-label='工作台导航'>
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === active;
              return (
                <Link
                  key={item.key}
                  id={`rail-link-${item.key}`}
                  href={item.href}
                  prefetch
                  className={`rail-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <p className='rail-section-title'>引擎状态</p>
          <div className='rail-stat'>
            <div className='rail-stat-row'>
              <span className='k'>引擎版本</span>
              <span className='v'>v{VERSION}</span>
            </div>
            <div className='rail-stat-row'>
              <span className='k'>运行环境</span>
              <span className='v'>本地</span>
            </div>
          </div>
        </div>
      </div>

      <div className='rail-foot'>
        <span className='dot'></span>
        <span>采集服务运行中</span>
      </div>
    </aside>
  );
}
