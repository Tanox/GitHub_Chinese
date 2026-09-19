'use client';
import React from 'react';

export default function ScriptInjector() {
  const scriptContent = `const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
while(walker.nextNode()) {
    const text = walker.currentNode.textContent.trim();
    if (text.length > 2 && !/^\\s*$/.test(text)) {
        textNodes.push(text);
    }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptContent);
    // Add logic to show "已复制"
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title"><span className="step-badge">1</span>探针脚本</h2>
        <button className="btn btn-copy" onClick={copyToClipboard}>复制脚本</button>
      </div>
      <p className="card-desc">在 GitHub 页面控制台执行下方脚本，引擎会提取当前视图中的全部有效 UI 文本块。</p>
      <div className="code-block">
        <pre>{scriptContent}</pre>
      </div>
    </section>
  );
}
