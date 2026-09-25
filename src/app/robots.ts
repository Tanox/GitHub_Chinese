/**
 * 站点抓取规则
 * @file src/app/robots.ts
 * @version 1.10.1
 * @description 为公开站点提供 robots 规则与 sitemap 索引
 */

import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanox.github.io/GitHub_i18n';
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${base}/sitemap.xml`,
  };
}
