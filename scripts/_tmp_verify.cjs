const https = require('https');
const fs = require('fs');
https
  .get(
    'https://api.github.com/repos/Tanox/GitHub_Chinese',
    { headers: { 'User-Agent': 'verify', Accept: 'application/vnd.github+json' } },
    (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => {
        const d = JSON.parse(b);
        fs.writeFileSync(
          'scripts/_tmp_verify.out.txt',
          'description: ' + d.description + '\n' + 'topics: ' + JSON.stringify(d.topics) + '\n' + 'homepage: ' + d.homepage + '\n',
        );
      });
    },
  )
  .on('error', (e) => fs.writeFileSync('scripts/_tmp_verify.out.txt', 'ERR ' + e.message));
