const { spawn } = require('child_process');
const child = spawn('git', ['credential', 'fill'], { stdio: ['pipe', 'pipe', 'pipe'] });
child.stdin.write('protocol=https\nhost=github.com\n\n');
let out = '';
let err = '';
child.stdout.on('data', (d) => (out += d));
child.stderr.on('data', (d) => (err += d));
const fs = require('fs');
child.on('close', (code) => {
  if (err) fs.appendFileSync('scripts/_tmp_cred.out.txt', 'ERR:' + err);
  // mask the password/token before printing
  const masked = out.replace(/(password=)(.*)/, '$1****');
  fs.writeFileSync('scripts/_tmp_cred.out.txt', 'CRED_OUTPUT:\n' + masked);
});
