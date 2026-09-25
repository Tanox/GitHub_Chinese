/**
 * 全局加载占位（根段）
 * @file src/app/loading.tsx
 * @version 1.10.1
 * @description 路由切换/数据获取期间的 Suspense 占位，提供基础加载反馈
 */

export default function Loading() {
  return (
    <div className='content-inner'>
      <div className='card'>
        <div className='card-head'>
          <h2 className='card-title'>加载中…</h2>
        </div>
        <div
          className='progress-track'
          role='progressbar'
          aria-label='加载中'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={100}
        >
          <div className='progress-fill' style={{ width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
}
