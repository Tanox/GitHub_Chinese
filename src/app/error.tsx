'use client';

/**
 * 全局错误边界（根段）
 * @file src/app/error.tsx
 * @version 1.10.1
 * @description 捕获路由段渲染/数据获取阶段的未处理异常，提供重试出口，避免落到 Next 默认错误页
 */

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='content-inner'>
      <section className='card'>
        <h2 className='section-title'>出错了</h2>
        <p className='section-desc'>工作台在处理请求时遇到问题，可重试恢复。</p>
        <pre className='code-block' style={{ marginTop: '1rem' }}>
          <code>{error.message}</code>
        </pre>
        <div className='btn-row' style={{ marginTop: '1rem' }}>
          <button type='button' className='btn btn-primary' onClick={reset}>
            重试
          </button>
        </div>
      </section>
    </div>
  );
}
