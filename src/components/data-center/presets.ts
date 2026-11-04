/**
 * 数据中心预设与常量
 * @file src/components/data-center/presets.ts
 * @version 1.13.19
 * @description 文本粘贴 / 批量 URL 采集入口的快捷预设与共享常量，从 DataCenter.tsx 抽离以避免单文件超 200 行
 */

/** URL 前缀，用于过滤有效采集地址 */
export const URL_PREFIX = 'http';

/** 预设 GitHub 常用页面与样例文本 */
export const PRESETS = [
  {
    name: 'GitHub 首页 (Home)',
    type: 'url' as const,
    content: 'https://github.com/',
  },
  {
    name: 'Issues 页面',
    type: 'url' as const,
    content: 'https://github.com/issues',
  },
  {
    name: 'Pull Requests 页面',
    type: 'url' as const,
    content: 'https://github.com/pulls',
  },
  {
    name: 'Explore 探索',
    type: 'url' as const,
    content: 'https://github.com/explore',
  },
  {
    name: '常用 UI 词条 (文本样例)',
    type: 'manual' as const,
    content: [
      'Dashboard',
      'Repositories',
      'Pull requests',
      'Issues',
      'Marketplace',
      'Explore',
      'Settings',
      'Sign out',
      'Create a new repository',
      'Import repository',
      'New gist',
      'New organization',
      'New project',
      'Your profile',
      'Your repositories',
      'Your projects',
      'Your stars',
      'Your gists',
      'Upgrade',
      'Feature preview',
      'Help',
    ].join('\n'),
  },
];
