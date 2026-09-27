/**
 * 可选 LLM 翻译建议（T21）
 * @file src/lib/llm-suggest.js
 * @version 1.12.6
 * @description 调用 OpenAI 兼容接口给出简体中文译文；无密钥或任何失败均降级返回 null，由调用方跳过。
 */

/** 默认端点（OpenAI 兼容） */
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * 调用 LLM 给出简体中文译文；任何失败均降级返回 null
 * @param {string} term 英文词条
 * @param {object} [opts]
 * @param {string} [opts.apiKey] 覆盖 process.env.GHZH_LLM_KEY
 * @param {string} [opts.endpoint] 覆盖 process.env.GHZH_LLM_ENDPOINT
 * @param {string} [opts.model] 覆盖 process.env.GHZH_LLM_MODEL
 * @returns {Promise<string|null>}
 */
export async function llmSuggest(term, opts = {}) {
  const apiKey = opts.apiKey ?? process.env.GHZH_LLM_KEY;
  if (!apiKey) return null;

  const endpoint = opts.endpoint ?? process.env.GHZH_LLM_ENDPOINT ?? DEFAULT_ENDPOINT;
  const model = opts.model ?? process.env.GHZH_LLM_MODEL ?? 'gpt-4o-mini';

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional English-to-Simplified-Chinese translator for GitHub UI strings. Return ONLY the Chinese translation, no quotes, no explanations.',
          },
          { role: 'user', content: term },
        ],
        temperature: 0.2,
        max_tokens: 64,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : null;
  } catch {
    return null;
  }
}
