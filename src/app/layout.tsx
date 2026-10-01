/**
 * 全局布局
 * @file src/app/layout.tsx
 * @version 1.12.9
 * @description 加载 Tailwind 入口与 src/app/styles 下的自包含样式模块（经 Next 打包，不再依赖 public 静态目录），提供全站元数据
 */

import type { Metadata } from 'next';
import './globals.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/sidebar.css';
import './styles/cards.css';
import './styles/buttons.css';
import './styles/code.css';
import './styles/terms.css';
import './styles/progress.css';
import './styles/terminal.css';
import './styles/toast.css';
import './styles/showcase.css';
import './styles/coverage.css';
import './styles/prototype.css';
import './styles/dictionary.css';

/** 站点基础地址（可由 NEXT_PUBLIC_SITE_URL 覆盖，用于生成绝对 OG URL） */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanox.github.io/GitHub_i18n';

const SITE_TITLE = '词典采集工作台 · GitHub 中文';
const SITE_DESCRIPTION = '从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'GitHub Chinese 简体中文',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN'>
      <body>{children}</body>
    </html>
  );
}
