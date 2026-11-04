// Temporary script: enrich GitHub repo About section (description + topics).
// Uses the Git Credential Manager stored token; never prints the token.
const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');

const REPO = 'Tanox/GitHub_Chinese';
const NEW_DESCRIPTION =
  '🌟 让 GitHub 全站界面秒变简体中文的浏览器用户脚本。本地词典即时翻译，覆盖仓库 / Issues / PR / 设置 / 通知等页面，无需联网、不破坏布局，并附带 Next.js 词典采集工作台。';
const NEW_TOPICS = [
  'github', 'chinese', 'localization', 'i18n', 'translation', 'userscript',
  'tampermonkey', 'greasemonkey', 'browser-extension', 'github-translation',
  'zh-cn', 'web', 'javascript',
];

function getToken() {
  return new Promise((resolve) => {
    const child = spawn('git', ['credential', 'fill'], { stdio: ['pipe', 'pipe', 'pipe'] });
    child.stdin.write('protocol=https\nhost=github.com\n\n');
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('close', () => {
      const m = out.match(/password=(.*)/);
      resolve(m ? m[1].trim() : null);
    });
  });
}

function api(method, path, token, body) {
  return new Promise((resolve) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname: 'api.github.com',
        path,
        headers: {
          'User-Agent': 'repo-update-script',
          Authorization: 'Bearer ' + token,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(data ? { 'Content-Type': 'application/json' } : {}),
        },
      },
      (res) => {
        let b = '';
        res.on('data', (d) => (b += d));
        res.on('end', () => resolve({ status: res.statusCode, body: b }));
      },
    );
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  const token = await getToken();
  if (!token) {
    fs.writeFileSync('scripts/_tmp_update.out.txt', JSON.stringify({ error: 'no token' }, null, 2));
    return;
  }
  const results = {};
  results.patch = await api('PATCH', `/repos/${REPO}`, token, { description: NEW_DESCRIPTION });
  results.topics = await api('PUT', `/repos/${REPO}/topics`, token, { names: NEW_TOPICS });
  fs.writeFileSync('scripts/_tmp_update.out.txt', JSON.stringify(results, null, 2));
})();
