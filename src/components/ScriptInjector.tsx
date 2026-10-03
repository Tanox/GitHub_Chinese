'use client';
/**
 * 探针脚本面板
 * @file src/components/ScriptInjector.tsx
 * @version 1.13.16
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
    <section id='script-injector-card' className='card script-injector-card'>
      <div className='card-head'>
        <div className='card-title-group'>
          <h2 className='card-title'>
            <span className='step-badge'>1</span>探针脚本
          </h2>
          <p className='card-desc-inline'>GitHub 控制台 DOM 文本智能提取探针</p>
        </div>
        <button
          id='copy-probe-script-btn'
          type='button'
          className={`btn btn-copy ${isCopied ? 'is-copied' : ''}`}
          onClick={handleCopy}
        >
          {isCopied ? '✓ 已复制' : '📋 复制脚本'}
        </button>
      </div>

      <div className='probe-instruction-box'>
        <p className='probe-instruction-title'>💡 使用说明：</p>
        <ol className='probe-instruction-list'>
          <li>点击右上角<strong>「复制脚本」</strong>按钮</li>
          <li>打开 GitHub 任意页面，按下 <kbd>F12</kbd> 打开开发者工具控制台 (Console)</li>
          <li>粘贴执行脚本，将自动复制提取到的文本，并在右侧选择<strong>「文本粘贴」</strong>完成清洗</li>
        </ol>
      </div>

      <div className='code-block probe-code-wrapper'>
        <div className='code-block-header'>
          <span className='code-lang'>JavaScript (Browser Console)</span>
        </div>
        <pre id='probe-script-code'>{PROBE_SCRIPT}</pre>
      </div>
    </section>
  );
}
