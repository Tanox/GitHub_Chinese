/**
 * 版本一致性校验（CI 发布前门禁）
 * @file scripts/check-version-consistency.cjs
 * @description 确保 package.json、src/userscript/version.js（构建产物内联版本）
 *   与 CHANGELOG.md 顶部版本三者一致，避免「只改其中一处」导致发布标签
 *   与用户脚本头部版本不符、更新检查误判。
 *   exit 0 = 一致；exit 1 = 不一致或解析失败。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const versionSource = fs.readFileSync(path.join(ROOT, 'src', 'userscript', 'version.js'), 'utf8');
const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');

const m = /^##\s+\[(\d+\.\d+\.\d+)\]/m.exec(changelog);
if (!m) {
  console.error('❌ CHANGELOG.md 未找到形如 "## [x.y.z]" 的版本标题');
  process.exit(1);
}
const top = m[1];
const sourceMatch = /export\s+const\s+VERSION\s*=\s*['"]([^'"]+)['"]/.exec(versionSource);
if (!sourceMatch) {
  console.error('❌ 无法从 src/userscript/version.js 解析 VERSION 常量');
  process.exit(1);
}
const sourceVersion = sourceMatch[1];

if (top !== pkg.version || sourceVersion !== pkg.version) {
  console.error(
    `❌ 版本不一致：package.json=${pkg.version} ，version.js=${sourceVersion} ，CHANGELOG 顶部=${top}\n` +
      `   请同步三者后再发布。`,
  );
  process.exit(1);
}

console.log(`✅ 版本一致：${pkg.version}（package.json / version.js / CHANGELOG）`);
