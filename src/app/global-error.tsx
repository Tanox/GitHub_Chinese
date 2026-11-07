'use client';

/**
 * 根错误边界（Global Error Boundary）
 * @file src/app/global-error.tsx
 * @version 1.13.28
 * @description 捕获根布局 layout.tsx 及全站未捕获错误，必须自带 <html> 与 <body>；
 *   与 error.tsx 一致，生产环境仅展示错误参考码，不泄露原始异常信息
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isProd = process.env.NODE_ENV === 'production';
  const detail = isProd
    ? error?.digest
      ? `错误参考码：${error.digest}`
      : '应用程序发生未知错误，请稍后重试'
    : error?.message || '应用程序发生未知错误';

  return (
    <html lang='zh-CN'>
      <body id='global-error-body'>
        <div
          id='global-error-root'
          style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}
        >
          <h2>系统出现严重异常</h2>
          <p id='global-error-detail'>{detail}</p>
          <button
            type='button'
            onClick={() => reset()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#0969da',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
