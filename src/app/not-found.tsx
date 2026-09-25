/**
 * 全局未找到页（根段）
 * @file src/app/not-found.tsx
 * @version 1.10.1
 * @description 访问不存在路由时的兜底页面，引导返回工作台
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='content-inner'>
      <section className='card'>
        <h2 className='section-title'>页面不存在</h2>
        <p className='section-desc'>你访问的页面可能已被移动或删除。</p>
        <div className='btn-row' style={{ marginTop: '1rem' }}>
          <Link href='/' className='btn btn-primary'>
            返回工作台
          </Link>
        </div>
      </section>
    </div>
  );
}
