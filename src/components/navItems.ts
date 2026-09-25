/**
 * 工作台导航定义
 * @file src/components/navItems.ts
 * @version 1.11.16
 * @description 侧栏（桌面）与移动端导航共用的唯一导航数据源，避免两处各写一份而漂移
 */

export type RailSection = 'console' | 'overview' | 'design' | 'coverage';

export interface NavItem {
  key: RailSection;
  label: string;
  href: string;
}

/** 导航项（静态常量，模块级只创建一次） */
export const NAV_ITEMS: NavItem[] = [
  { key: 'console', label: '采集控制台', href: '/' },
  { key: 'overview', label: '项目概览', href: '/overview' },
  { key: 'coverage', label: '覆盖率', href: '/coverage' },
  { key: 'design', label: '设计系统', href: '/design' },
];
