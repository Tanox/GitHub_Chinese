/**
 * 翻译建议接口（T21）
 * @file src/app/api/dictionary/suggest/route.ts
 * @version 1.12.5
 * @description GET /api/dictionary/suggest?term=... 返回建议译文。
 *   翻译记忆优先；配置 GHZH_LLM_KEY 时额外调用 LLM 增强，无 key 则降级跳过。
 */
import { NextRequest } from 'next/server';
import { mergeAllDictionaries } from '@/dictionaries/index';
import { suggestTranslation } from '@/lib/translation-suggest';
import { llmSuggest } from '@/lib/llm-suggest';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
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

  return new Response(
    JSON.stringify({ term, llmEnabled, ...result }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}
