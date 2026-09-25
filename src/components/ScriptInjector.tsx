/**
 * 探针脚本面板
 * @file src/components/ScriptInjector.tsx
 * @version 1.9.24
 * @description 提供在 GitHub 页面控制台执行的文本采集探针脚本与一键复制
 */

import React, { useEffect, useRef, useState } from 'react';

const PROBE_SCRIPT = `const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
while (walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text.length > 2 && !/^\\s*$/.test(text)) {
        textNodes.push(text);
    }
}
console.log(textNodes.join('\\n'));
copy(textNodes.join('\\n'));
`;

const COPY_RESET_DELAY_MS = 2000;

/**
 * 复制文本到剪贴板（带降级方案）
 * @param text - 待复制文本
 * @returns 是否复制成功
 */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ScriptInjector() {
  const [isCopied, setIsCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
      }
    },
    [],
  );

  const handleCopy = async () => {
    const copied = await copyText(PROBE_SCRIPT);
    setIsCopied(copied);

    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
    }
    resetTimer.current = setTimeout(() => setIsCopied(false), COPY_RESET_DELAY_MS);
  };

  return (
    <section id='script-injector-card' className='card'>
      <div className='card-head'>
        <h2 className='card-title'>
          <span className='step-badge'>1</span>探针脚本
        </h2>
        <button
          id='copy-probe-script-btn'
          type='button'
          className={`btn btn-copy ${isCopied ? 'is-copied' : ''}`}
          onClick={handleCopy}
        >
          {isCopied ? '已复制' : '复制脚本'}
        </button>
      </div>
      <p className='card-desc'>
        在 GitHub 页面控制台执行下方脚本，引擎会提取当前视图中的全部有效 UI 文本块。
      </p>
      <div className='code-block'>
        <pre id='probe-script-code'>{PROBE_SCRIPT}</pre>
      </div>
    </section>
  );
}
