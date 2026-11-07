/**
 * 客户端 JSON 下载工具
 * @file src/lib/download-json.ts
 * @version 1.13.28
 * @description 统一三处导出入口的 Blob 下载逻辑；`revokeObjectURL` 延后到下一个任务，
 *   避免部分浏览器在 a.click() 后立即释放 URL 导致下载被取消。
 */

/** Blob URL 释放延迟（毫秒，0 表示下一个宏任务） */
const REVOKE_DELAY_MS = 0;

/**
 * 触发浏览器下载 JSON 文件
 * @param filename - 下载文件名
 * @param data - 可 JSON 序列化的数据
 * @returns 是否成功发起下载（SSR / 无 DOM 时返回 false）
 */
export function downloadJson(filename: string, data: unknown): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // 立即 revoke 会与下载竞争，延后一个任务再释放
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
  return true;
}
