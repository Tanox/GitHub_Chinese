/**
 * 抽取指定版本的 Release Notes（供 GitHub Release 自动发布）
 * @file scripts/extract-release-notes.cjs
 * @description 按版本号（支持 "1.13.10" 或 "v1.13.10"）从 CHANGELOG.md 抽取对应段落，
 *   写入仓库根 release-notes.md，供 softprops/action-gh-release 的 body_path 使用。
 *   段落边界：命中 "## [version]" 起，至下一个 "## [" 或 "\n---" 之前为止。
 *   用法：node scripts/extract-release-notes.cjs <version|vX.Y.Z>
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const raw = process.argv[2];
if (!raw) {
  console.error('用法: node scripts/extract-release-notes.cjs <version|vX.Y.Z>');
  process.exit(1);
}
const version = raw.replace(/^v/, '').trim();
const escaped = version.replace(/\./g, '\\.');

const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
const re = new RegExp(`^##\\s+\\[${escaped}\\][\\s\\S]*?(?=\\n##\\s+\\[|\\n---)`, 'm');
const m = re.exec(changelog);
if (!m) {
  console.error(`❌ CHANGELOG.md 中未找到版本 ${version} 的段落`);
  process.exit(1);
}

const notes = m[0].trim() + '\n';
fs.writeFileSync(path.join(ROOT, 'release-notes.md'), notes);
console.log(`✅ 已生成 release-notes.md（版本 ${version}，约 ${notes.length} 字符）`);
