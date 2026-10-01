/**
 * 版本一致性校验（CI 发布前门禁）
 * @file scripts/check-version-consistency.cjs
 * @description 确保 package.json 的 version 与 CHANGELOG.md 顶部版本一致，
 *   避免「手工 bump 版本却漏改其中一处」导致发布说明/产物版本错乱。
 *   exit 0 = 一致；exit 1 = 不一致或解析失败。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');

const m = /^##\s+\[(\d+\.\d+\.\d+)\]/m.exec(changelog);
if (!m) {
  console.error('❌ CHANGELOG.md 未找到形如 "## [x.y.z]" 的版本标题');
  process.exit(1);
}
const top = m[1];

if (top !== pkg.version) {
  console.error(
    `❌ 版本不一致：package.json=${pkg.version} ，CHANGELOG 顶部=${top}\n` +
      `   请同步二者后再发布。`,
  );
  process.exit(1);
}

console.log(`✅ 版本一致：${pkg.version}`);
