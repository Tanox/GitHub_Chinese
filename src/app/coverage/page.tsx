/**
 * 覆盖率 / 缺口看板（T22）
 * @file src/app/coverage/page.tsx
 * @version 1.11.16
 * @description 服务端页面：展示词典翻译覆盖率、按文件细分、Top-N 缺口与重复/冲突检测。
 *   数据由 @/lib/coverage-report 实时扫描磁盘词典计算，无需浏览器（规避 W5 架构约束）。
 */
import type { Metadata } from 'next';
import Shell from '@/components/Shell';
import { getCoverageReport } from '@/lib/coverage-report';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '覆盖率看板 · GitHub 中文',
};

/** 缺口列表最大展示条数 */
const MAX_GAPS = 30;

/** 数字格式化为百分比字符串 */
function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export default function CoveragePage() {
  const report = getCoverageReport();

  const summary = [
    {
      label: '整体覆盖率',
      value: pct(report.rate),
      hint: `${report.translated}/${report.total} 词条已翻译`,
    },
    { label: '词典词条', value: String(report.total), hint: '合并后总条目' },
    {
      label: '待翻译缺口',
      value: String(report.untranslated),
      hint: '值为「待翻译: 」占位的条目',
    },
    {
      label: '跨模块重复键',
      value: String(report.duplicateKeys),
      hint: `其中冲突 ${report.conflicts.length} 个`,
    },
  ];

  const topGaps = report.gaps.slice(0, MAX_GAPS);

  return (
    <Shell
      active='coverage'
      title='覆盖率看板'
      subtitle='词典翻译覆盖率、缺口与重复/冲突检测'
      badge={
        <div className='status-pill'>
          <span className='dot' aria-hidden='true'></span>
          基于磁盘词典实时统计
        </div>
      }
    >
      <section className='stat-grid' id='coverage-summary' aria-label='覆盖率概览'>
        {summary.map((s) => (
          <div key={s.label} className='stat-card'>
            <p className='stat-label'>{s.label}</p>
            <p className='stat-value'>{s.value}</p>
            <p className='stat-hint'>{s.hint}</p>
          </div>
        ))}
      </section>

      <section className='card' id='coverage-by-file' aria-label='按词典文件覆盖率'>
        <div className='card-head'>
          <h2 className='card-title'>按词典文件覆盖率</h2>
        </div>
        <p className='card-desc'>各词典模块的已翻译占比，定位缺口集中的文件。</p>
        <div className='file-coverage-list'>
          {report.byFile.map((f) => (
            <div key={f.name} className='file-coverage-row'>
              <div className='file-coverage-meta'>
                <span className='file-name'>{f.name}</span>
                <span className='file-rate'>{pct(f.rate)}</span>
              </div>
              <div
                className='progress-track'
                role='progressbar'
                aria-valuenow={Math.round(f.rate * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${f.name} 覆盖率 ${pct(f.rate)}`}
              >
                <div
                  className={`progress-fill ${f.rate < 1 ? 'is-error' : ''}`}
                  style={{ width: pct(f.rate) }}
                ></div>
              </div>
              <span className='file-detail'>
                {f.translated} 已译 · {f.untranslated} 待译 · 共 {f.total}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className='card' id='coverage-gaps' aria-label='Top-N 缺口'>
        <div className='card-head'>
          <h2 className='card-title'>Top-N 采集缺口</h2>
        </div>
        <p className='card-desc'>
          {report.hasCorpus
            ? `来自 docs/untranslated-terms.txt 的最近一次采集未翻译词条（前 ${topGaps.length} 条）。
               运行一次「批量 URL 采集」可刷新真实缺口。`
            : '尚无采集语料：运行一次「批量 URL 采集」后将展示真实缺口。'}
        </p>
        {topGaps.length > 0 && (
          <ul className='spec-list'>
            {topGaps.map((term) => (
              <li key={term}>
                <code>{term}</code>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className='card' id='coverage-conflicts' aria-label='重复与冲突检测'>
        <div className='card-head'>
          <h2 className='card-title'>重复 / 冲突检测</h2>
        </div>
        <p className='card-desc'>
          跨模块同名键：值一致为冗余重复，值不同为冲突（合并时后者覆盖前者，存在不一致风险）。
          {report.nearDuplicates.length > 0 &&
            ` 另发现 ${report.nearDuplicates.length} 组近似键（大小写/空白/标点差异）。`}
        </p>
        {report.conflicts.length > 0 ? (
          <ul className='spec-list'>
            {report.conflicts.map((c) => (
              <li key={c.key} className='conflict-item'>
                <code>{c.key}</code>
                <span className='conflict-meta'>
                  {c.values.map((v, i) => (
                    <span key={i} className='conflict-value'>
                      {v}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='section-desc'>未发现跨模块冲突（重复键均为一致值）。</p>
        )}
        {report.nearDuplicates.length > 0 && (
          <ul className='spec-list' style={{ marginTop: '1rem' }}>
            {report.nearDuplicates.map((nd) => (
              <li key={nd.norm} className='conflict-item'>
                <code>{nd.norm}</code>
                <span className='conflict-meta'>
                  {nd.keys.map((k) => (
                    <span key={k} className='conflict-value'>
                      {k}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
