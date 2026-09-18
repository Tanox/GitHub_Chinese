/**
 * 选择器与页面匹配模式配置
 * @file src/config/selectors.js
 */

export const selectorsConfig = {
  primary: [
    'h1, h2, h3, h4, h5, h6',
    'p, span, a, button',
    'label, strong, em',
    'li, td, th',
    '.btn, .button',
    '.link, .text',
    '.nav-item, .menu-item',
  ],
  popupMenus: ['.dropdown-menu', '.menu-dropdown', '.context-menu', '.notification-popover'],
};

export const pagePatternsConfig = {
  search: /\/search/,
  repository: /\/[\w-]+\/[\w-]+/,
  issues: /\/[\w-]+\/[\w-]+\/issues/,
  pullRequests: /\/[\w-]+\/[\w-]+\/pull/,
  settings: /\/settings/,
  dashboard: /^\/$/,
  explore: /\/explore/,
  codespaces: /\/codespaces/,
  notifications: /\/notifications/,
  profile: /\/[\w-]+$/,
  organizations: /\/organizations/,
  projects: /\/[\w-]+\/[\w-]+\/projects/,
  wiki: /\/[\w-]+\/[\w-]+\/wiki/,
  actions: /\/[\w-]+\/[\w-]+\/actions/,
  packages: /\/[\w-]+\/[\w-]+\/packages/,
  security: /\/[\w-]+\/[\w-]+\/security/,
  insights: /\/[\w-]+\/[\w-]+\/insights/,
  marketplace: /\/marketplace/,
  topics: /\/topics/,
  stars: /\/stars/,
  trending: /\/trending/,
};
