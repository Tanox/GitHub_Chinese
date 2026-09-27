/**
 * 建议来源 → 中文标签（T21）
 * @file src/components/dictionary/sourceLabel.ts
 * @version 1.12.7
 */

export function sourceLabel(source: string): string {
  switch (source) {
    case 'memory-exact':
      return '精确记忆';
    case 'memory-ci':
      return '大小写记忆';
    case 'memory-composed':
      return '组合记忆';
    case 'llm':
      return 'LLM';
    default:
      return source;
  }
}
