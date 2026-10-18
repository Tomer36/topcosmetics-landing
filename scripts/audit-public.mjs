// Read-only diagnostics. No credentials, submissions, DNS changes or TLS bypass.
// Usage: node scripts/audit-public.mjs > audit-evidence.json
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);
const startedAt = new Date().toISOString();
const origin = 'topcosmeticsclinic.com';
const hosts = [origin, `www.${origin}`, `crm.${origin}`, `book.${origin}`, `intake.${origin}`];
const tasks = [];
const add = (label, file, args) => tasks.push({ label, file, args });
const curl = (label, args) => add(label, process.platform === 'win32' ? 'curl.exe' : 'curl',
  ['--silent', '--show-error', '--connect-timeout', '5', '--max-time', '12', ...args]);
for (const host of hosts) {
  for (const type of ['A', 'AAAA']) {
    curl(`Google DNS ${host} ${type}`, [`https://dns.google/resolve?name=${host}&type=${type}`]);
  }
  curl(`Cloudflare DNS ${host} A`, ['-H', 'accept: application/dns-json', `https://cloudflare-dns.com/dns-query?name=${host}&type=A`]);
  curl(`HTTPS ${host}`, ['-I', `https://${host}/`]);
  curl(`HTTP ${host}`, ['-I', `http://${host}/`]);
  const ip = host === origin || host.startsWith('www.') ? '147.93.73.209' : '81.28.7.42';
  curl(`Origin HTTPS ${host} (${ip}, TLS verified)`, ['--resolve', `${host}:443:${ip}`, '-I', `https://${host}/`]);
}
for (const type of ['NS', 'DS', 'DNSKEY', 'CAA']) {
  curl(`Google DNS ${origin} ${type}`, [`https://dns.google/resolve?name=${origin}&type=${type}`]);
}
curl('Registry RDAP', [`https://rdap.verisign.com/com/v1/domain/${origin}`]);
curl('Existing URLScan records (no scan submitted)', [`https://urlscan.io/api/v1/search/?q=domain%3A${origin}`]);
curl('Public HTTP CRM response body (may be filtering page)', [`http://crm.${origin}/`]);
if (process.platform === 'win32') {
  // DNS answers only, without printing the machine's network configuration.
  add('System DNS', `${process.env.SystemRoot ?? 'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`, ['-NoProfile', '-Command',
    `$ErrorActionPreference = 'Stop'; @(${hosts.map((host) => `'${host}'`).join(',')}) | ForEach-Object { Resolve-DnsName -Name $_ -DnsOnly } | Select-Object Name,Type,TTL,NameHost,IPAddress | ConvertTo-Json -Depth 3`]);
}
// Preserve evidence that a filtering cookie exists without publishing its value.
const redactCookies = (text) => text.replace(/^(Set-Cookie:\s*)[^\r\n]*/gim, '$1[REDACTED]');
const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < tasks.length) {
    const { label, file, args } = tasks[cursor++];
    try {
      const { stdout, stderr } = await exec(file, args, { timeout: 20000, maxBuffer: 1024 * 1024, windowsHide: true });
      results.push({ label, checkedAt: new Date().toISOString(), exitCode: 0, stdout: redactCookies(stdout), stderr });
    } catch (error) {
      results.push({ label, checkedAt: new Date().toISOString(), exitCode: error.code, stdout: redactCookies(error.stdout ?? ''), stderr: error.stderr || error.message });
    }
  }
}));
console.log(JSON.stringify({ startedAt, completedAt: new Date().toISOString(), note: 'Network-specific observations; failures do not prove origin downtime.', results }, null, 2));
