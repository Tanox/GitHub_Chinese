/**
 * 移动端导航
 * @file src/components/MobileNav.tsx
 * @version 1.9.27
 * @description 服务端组件：窄屏（≤1024px）以横向标签条替代侧栏，保证三个页面互通
 */

import Link from 'next/link';
import { NAV_ITEMS } from './navItems';
import type { RailSection } from './navItems';

interface MobileNavProps {
  /** 当前激活的导航项 */
  active: RailSection;
}

export default function MobileNav({ active }: MobileNavProps) {
  return (
    <nav id='collector-mobile-nav' className='mobile-nav scroll' aria-label='工作台导航（移动端）'>
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            id={`mobile-link-${item.key}`}
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
  );
}
