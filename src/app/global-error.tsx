'use client';

/**
 * 根错误边界（Global Error Boundary）
 * @file src/app/global-error.tsx
 * @description 捕获根布局 layout.tsx 及全站未捕获错误，必须自带 <html> 与 <body>
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='zh-CN'>
      <body>
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h2>系统出现严重异常</h2>
          <p>{error?.message || '应用程序发生未知错误'}</p>
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
