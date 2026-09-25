/**
 * SSE 事件流解析（纯函数，无 React 依赖）
 * @file src/hooks/collector-sse.ts
 * @version 1.11.6
 * @description 将 `fetch` 响应体解析为 `StreamEvent` 并回调，便于单测与复用
 */

import type { StreamEvent } from './collector-types';

/**
 * 读取并解析 SSE 流
 * @param response - fetch 响应
 * @param onEvent - 成功解析单条事件时回调
 * @param onError - 遇到异常状态或解析失败时回调
 */
export async function readSseStream(
  response: Response,
  onEvent: (event: StreamEvent) => void,
  onError: (message: string) => void,
): Promise<void> {
  if (!response.ok || !response.body) {
    onError(`服务端返回异常状态: ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() ?? '';

    chunks.forEach((chunk) => {
      if (!chunk.startsWith('data: ')) return;
      try {
        onEvent(JSON.parse(chunk.slice(6)) as StreamEvent);
      } catch {
        onError('收到无法解析的事件流数据');
      }
    });
  }
}
