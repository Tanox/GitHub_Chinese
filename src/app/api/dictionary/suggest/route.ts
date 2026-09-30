/**
 * 翻译建议接口（T21）
 * @file src/app/api/dictionary/suggest/route.ts
 * @version 1.12.10
 * @date 2026-09-30
 * @description GET /api/dictionary/suggest?term=... 返回建议译文。
 *   翻译记忆优先；配置 GHZH_LLM_KEY 时额外调用 LLM 增强，无 key 则降级跳过。
 *   访问控制复用 checkApiAccess（与 collect/batch-collect 同门禁）：
 *   默认按 IP 限流，配置 COLLECT_API_TOKEN 后要求 Bearer 令牌，避免匿名请求消耗付费 LLM 额度。
 */
import { NextRequest } from 'next/server';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { suggestTranslation } from '@/lib/translation-suggest';
import { llmSuggest } from '@/lib/llm-suggest';
import { checkApiAccess } from '@/lib/api-guard';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // 先鉴权/限流再解析参数：配置令牌后拒绝匿名访问，默认开启每 IP 限流封顶 LLM 消耗
  const denied = checkApiAccess(req);
  if (denied) return denied;

  const term = req.nextUrl.searchParams.get('term')?.trim() ?? '';
  if (!term) {
    return new Response(JSON.stringify({ error: '缺少 term 参数' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dictionary = mergeAllDictionaries() as Record<string, string>;
  const llmEnabled = Boolean(process.env.GHZH_LLM_KEY);
  const result = await suggestTranslation(term, {
    dictionary,
    ...(llmEnabled ? { llm: (t: string) => llmSuggest(t) } : {}),
  });

  return new Response(JSON.stringify({ term, llmEnabled, ...result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
