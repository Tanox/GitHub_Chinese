/**
 * 全局布局
 * @file src/app/layout.tsx
 * @version 1.10.1
 * @description 加载 Tailwind 入口与 public/css 下的自包含样式模块，提供全站元数据
 */

import type { Metadata } from 'next';
import './globals.css';

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
      <body>
        {/* 静态样式表位于 public/css，由 Next 自动提升到 <head> */}
        <link rel='stylesheet' href='/css/base.css' />
        <link rel='stylesheet' href='/css/layout.css' />
        <link rel='stylesheet' href='/css/sidebar.css' />
        <link rel='stylesheet' href='/css/cards.css' />
        <link rel='stylesheet' href='/css/buttons.css' />
        <link rel='stylesheet' href='/css/code.css' />
        <link rel='stylesheet' href='/css/terms.css' />
        <link rel='stylesheet' href='/css/progress.css' />
        <link rel='stylesheet' href='/css/terminal.css' />
        <link rel='stylesheet' href='/css/toast.css' />
        <link rel='stylesheet' href='/css/showcase.css' />
        {children}
      </body>
    </html>
  );
}
