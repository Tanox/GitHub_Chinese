/**
 * 站点地图
 * @file src/app/sitemap.ts
 * @version 1.10.1
 * @description 列举工作台公开路由，便于搜索引擎收录
 */

import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tanox.github.io/GitHub_i18n';
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/overview`, lastModified: now },
    { url: `${base}/design`, lastModified: now },
  ];
}
