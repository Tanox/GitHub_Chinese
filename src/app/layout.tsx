/**
 * 全局布局
 * @file src/app/layout.tsx
 * @version 1.9.26
 * @description 加载 Tailwind 入口与 public/css 下的自包含样式模块，提供全站元数据
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '词典采集工作台 · GitHub 中文',
  description: '从 GitHub 原生界面抓取 UI 词条，沉淀中文本地化词典',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='zh-CN'>
      <head>
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
      </head>
      <body>{children}</body>
    </html>
  );
}
