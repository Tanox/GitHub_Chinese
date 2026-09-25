/**
 * 设计系统页
 * @file src/app/design/page.tsx
 * @version 1.9.26
 * @description 服务端页面：展示 public/css/base.css 的设计令牌与核心组件样式
 */

import type { Metadata } from 'next';
import Shell from '@/components/Shell';

export const metadata: Metadata = {
  title: '设计系统 · GitHub 中文',
};

interface ColorToken {
  name: string;
  token: string;
  value: string;
}

/** 颜色令牌（与 base.css 的 :root 保持一致） */
const COLORS: ColorToken[] = [
  { name: '品牌绿', token: '--brand', value: '#2ea44f' },
  { name: '品牌绿·深', token: '--brand-strong', value: '#2c974b' },
  { name: '品牌绿·浅', token: '--brand-soft', value: '#dafbe1' },
  { name: '正文墨色', token: '--ink', value: '#1c2128' },
  { name: '次级文字', token: '--muted', value: '#59636e' },
  { name: '弱化文字', token: '--faint', value: '#6e7781' },
  { name: '边框', token: '--border', value: '#d1d9e0' },
  { name: '画布', token: '--canvas', value: '#f6f8fa' },
  { name: '卡面', token: '--surface', value: '#ffffff' },
  { name: '终端前景', token: '--term', value: '#3fb950' },
  { name: '终端底', token: '--term-bg', value: '#0d1117' },
  { name: '危险', token: '--danger', value: '#cf222e' },
];

/** 尺寸与字体令牌 */
const SIZES: ColorToken[] = [
  { name: '圆角', token: '--radius', value: '12px' },
  { name: '阴影', token: '--shadow', value: '0 1px 3px rgba(27,31,36,.08)' },
  { name: '正文字体', token: '--font', value: '系统字体栈（含 PingFang SC / Microsoft YaHei）' },
  { name: '等宽字体', token: '--mono', value: 'ui-monospace / SFMono-Regular / Menlo' },
];

export default function DesignPage() {
  return (
    <Shell
      active='design'
      title='设计系统'
      subtitle='设计令牌与核心组件样式，源码位于 public/css'
      badge={
        <div className='status-pill'>
          <span className='dot'></span>
          自包含 · 离线可用
        </div>
      }
    >
      <section className='card'>
        <h2 className='section-title'>颜色令牌</h2>
        <p className='section-desc'>全部取自 base.css 的 :root 自定义属性，组件只引用变量。</p>
        <div className='token-grid' style={{ marginTop: '1rem' }}>
          {COLORS.map((color) => (
            <div key={color.token} className='swatch'>
              <div className='chip' style={{ background: `var(${color.token})` }}></div>
              <div className='meta'>
                <strong>{color.name}</strong>
                <code>{color.token}</code>
                <code>{color.value}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='card'>
        <h2 className='section-title'>尺寸与字体</h2>
        <p className='section-desc'>统一圆角、阴影与字体栈，保证跨平台一致。</p>
        <ul className='spec-list' style={{ marginTop: '1rem' }}>
          {SIZES.map((size) => (
            <li key={size.token}>
              <span>{size.name}</span>
              <code>{size.value}</code>
            </li>
          ))}
        </ul>
      </section>

      <section className='card'>
        <h2 className='section-title'>按钮</h2>
        <p className='section-desc'>主行动按钮、次级按钮与复制按钮三种层级。</p>
        <div className='demo-row' style={{ marginTop: '1rem' }}>
          <button type='button' className='btn btn-primary'>
            主行动
          </button>
          <button type='button' className='btn'>
            次级按钮
          </button>
          <button type='button' className='btn btn-copy'>
            复制脚本
          </button>
          <button type='button' className='btn btn-copy is-copied'>
            已复制
          </button>
        </div>
      </section>

      <section className='card'>
        <h2 className='section-title'>徽标与状态</h2>
        <p className='section-desc'>词条计数徽标、流程步骤与状态指示。</p>
        <div className='demo-row' style={{ marginTop: '1rem' }}>
          <span className='term-badge'>459 词条</span>
          <span className='status-pill'>
            <span className='dot'></span>
            采集服务运行中
          </span>
          <span className='step-badge'>1</span>
          <div className='steps' aria-label='流程步骤示例'>
            <div className='step-node done'>
              <span className='step-num'>1</span>
              <span>植入探针</span>
            </div>
            <span className='step-line'></span>
            <div className='step-node done'>
              <span className='step-num'>2</span>
              <span>归集词条</span>
            </div>
          </div>
        </div>
      </section>

      <section className='card'>
        <h2 className='section-title'>数据与代码块</h2>
        <p className='section-desc'>代码块与词条表格共用的等宽排版。</p>
        <div className='code-block' style={{ marginTop: '1rem' }}>
          <pre>{`npm run build && npm run validate`}</pre>
        </div>
        <table className='terms' style={{ marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>序号</th>
              <th>采集词条</th>
              <th className='right'>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr className='term-row'>
              <td className='term-index'>1</td>
              <td className='term-text'>Pull requests</td>
              <td className='right'>
                <span className='badge untranslated'>待翻译</span>
              </td>
            </tr>
            <tr className='term-row'>
              <td className='term-index'>2</td>
              <td className='term-text'>Sign in</td>
              <td className='right'>
                <span className='badge translated'>已翻译</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </Shell>
  );
}
