/**
 * 工作台导航定义
 * @file src/components/navItems.ts
 * @version 1.13.8
 * @description 顶部导航（桌面 / 移动端共用）的唯一导航数据源，避免两处各写一份而漂移
 */

export type NavSection =
  'console' | 'overview' | 'coverage' | 'dictionary' | 'dict-manage';

export interface NavItem {
  key: NavSection;
  label: string;
  href: string;
}

/** 导航项（静态常量） */
export const NAV_ITEMS: NavItem[] = [
  { key: 'console', label: '采集控制台', href: '/' },
  { key: 'overview', label: '项目概览', href: '/overview' },
  { key: 'coverage', label: '覆盖率', href: '/coverage' },
  { key: 'dictionary', label: '词典助手', href: '/dictionary' },
  { key: 'dict-manage', label: '词库管理', href: '/dictionary/manage' },
];

/** 页眉顶栏导航（包含全部 5 个项目板块） */
export const HEADER_NAV_ITEMS = NAV_ITEMS;

/** 页脚导航（如果为空，可作为灵活扩展项） */
export const FOOTER_NAV_ITEMS: NavItem[] = [];
