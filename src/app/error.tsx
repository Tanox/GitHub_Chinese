'use client';

/**
 * 全局错误边界（根段）
 * @file src/app/error.tsx
 * @version 1.13.2
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

  // 生产环境不向用户暴露原始异常信息（避免泄露内部路径/栈），仅展示错误参考码；开发环境保留 message 便于排查
  const isProd = process.env.NODE_ENV === 'production';
  const detail = isProd
    ? error.digest
      ? `错误参考码：${error.digest}`
      : '请稍后重试，若持续失败请联系管理员'
    : error.message;

  return (
    <div className='content-inner' id='error-boundary'>
      <section className='card'>
        <h2 className='section-title'>出错了</h2>
        <p className='section-desc'>工作台在处理请求时遇到问题，可重试恢复。</p>
        <pre className='code-block' style={{ marginTop: '1rem' }} id='error-detail'>
          <code>{detail}</code>
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
