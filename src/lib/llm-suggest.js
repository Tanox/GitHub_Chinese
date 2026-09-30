/**
 * 可选 LLM 翻译建议（T21）
 * @file src/lib/llm-suggest.js
 * @version 1.12.13
 * @date 2026-09-30
 * @description 调用 OpenAI 兼容接口给出简体中文译文；无密钥、超时或任何失败均降级返回 null，由调用方跳过。
 */

/** 默认端点（OpenAI 兼容） */
const DEFAULT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
/** 默认模型 */
const DEFAULT_MODEL = 'gpt-4o-mini';
/** 默认采样温度：翻译任务要求稳定，取低值 */
const DEFAULT_TEMPERATURE = 0.2;
/** 回复 token 上限：界面词条的译文很短，无需长输出 */
const MAX_TOKENS = 64;
/** 默认请求超时（毫秒），可用 GHZH_LLM_TIMEOUT_MS 或 opts.timeoutMs 覆盖 */
const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * 调用 LLM 给出简体中文译文；任何失败（含超时）均降级返回 null
 * @param {string} term 英文词条
 * @param {object} [opts]
 * @param {string} [opts.apiKey] 覆盖 process.env.GHZH_LLM_KEY
 * @param {string} [opts.endpoint] 覆盖 process.env.GHZH_LLM_ENDPOINT
 * @param {string} [opts.model] 覆盖 process.env.GHZH_LLM_MODEL
 * @param {number} [opts.timeoutMs] 覆盖 process.env.GHZH_LLM_TIMEOUT_MS 与默认超时
 * @returns {Promise<string|null>}
 */
export async function llmSuggest(term, opts = {}) {
  const apiKey = opts.apiKey ?? process.env.GHZH_LLM_KEY;
  if (!apiKey) return null;

  const endpoint = opts.endpoint ?? process.env.GHZH_LLM_ENDPOINT ?? DEFAULT_ENDPOINT;
  const model = opts.model ?? process.env.GHZH_LLM_MODEL ?? DEFAULT_MODEL;
  const timeoutMs =
    opts.timeoutMs ?? (Number(process.env.GHZH_LLM_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS);

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
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: MAX_TOKENS,
      }),
      // 无超时的 fetch 在端点挂起时会永久占用请求；超时随 catch 统一降级为 null
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : null;
  } catch {
    return null;
  }
}
