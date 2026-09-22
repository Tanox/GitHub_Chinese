/**
 * 项目概览页
 * @file src/app/overview/page.tsx
 * @version 1.9.26
 * @description 服务端页面：展示由磁盘实时统计的项目指标、已交付能力与剩余任务
 */

import Shell from '@/components/Shell';
import { projectMetrics } from '@/lib/project-metrics';

interface StatItem {
  label: string;
  value: string;
  hint: string;
}

interface SpecGroup {
  title: string;
  desc: string;
  items: string[];
}

/** 指标卡片数据（静态，模块级只构造一次） */
const STATS: StatItem[] = [
  {
    label: '当前版本',
    value: `v${projectMetrics.version}`,
    hint: '单一版本源 src/version.js',
  },
  {
    label: '词典词条',
    value: String(projectMetrics.dictionaryEntries),
    hint: `${projectMetrics.dictionaryModules} 个词典模块合并`,
  },
  {
    label: '源码规模',
    value: `${projectMetrics.sourceFiles} 文件`,
    hint: `${projectMetrics.sourceLines} 行（src 下 js/ts/tsx/css）`,
  },
  {
    label: '用户脚本产物',
    value: `${projectMetrics.artifactKB} KB`,
    hint: 'build/GitHub_i18n.user.js',
  },
  {
    label: '原型页面',
    value: `${projectMetrics.prototypePages} 个`,
    hint: 'prototype/ 设计系统与高保真原型',
  },
  {
    label: '工作台路由',
    value: '3 个',
    hint: '采集控制台 / 项目概览 / 设计系统',
  },
];

/** 能力清单（静态） */
const SPEC_GROUPS: SpecGroup[] = [
  {
    title: '用户脚本引擎',
    desc: 'Tampermonkey / Greasemonkey 单文件用户脚本，覆盖 GitHub 全部页面。',
    items: [
      '静态文本翻译 + MutationObserver 动态内容监听',
      'SPA 路由变化监听，切换后自动重译',
      'Trie 树部分匹配 + LRU 翻译缓存',
      '无匹配时不改动 DOM 的预检查优化',
      '分层错误处理与降级（阈值触发紧急策略）',
      '配置面板、浮动入口按钮与脚本菜单命令',
    ],
  },
  {
    title: '词典采集工作台',
    desc: 'Next.js 16 App Router 应用，与用户脚本共享同一份词典数据。',
    items: [
      '探针脚本一键复制（带复制反馈）',
      '文本粘贴采集 → SSE 实时流式日志',
      '批量 URL 采集（Headless 抓取）',
      '词条预览表与实时处理中心',
      '智能清洗与 JSON 导出',
    ],
  },
  {
    title: '工程化与质量门禁',
    desc: '构建即校验：依赖图自动解析、重名冲突检测与产物扫描。',
    items: [
      'npm run build：依赖图拓扑排序拼接用户脚本',
      'npm run validate：存在性 / 体积 / 语法 / 未定义引用',
      'ESLint（Flat Config）+ Prettier + Husky + lint-staged',
      'tsc --noEmit 严格类型检查',
      'CI/CD：lint → build → validate → artifact → release',
    ],
  },
];

export default function OverviewPage() {
  return (
    <Shell
      active='overview'
      title='项目概览'
      subtitle='交付形态、实时指标与能力清单'
      badge={
        <div className='status-pill'>
          <span className='dot'></span>
          指标实时统计
        </div>
      }
    >
      <section className='stat-grid' aria-label='项目指标'>
        {STATS.map((stat) => (
          <div key={stat.label} className='stat-card'>
            <p className='stat-label'>{stat.label}</p>
            <p className='stat-value'>{stat.value}</p>
            <p className='stat-hint'>{stat.hint}</p>
          </div>
        ))}
      </section>

      {SPEC_GROUPS.map((group) => (
        <section key={group.title} className='card'>
          <h2 className='section-title'>{group.title}</h2>
          <p className='section-desc'>{group.desc}</p>
          <ul className='spec-list' style={{ marginTop: '1rem' }}>
            {group.items.map((item) => (
              <li key={item}>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Shell>
  );
}
