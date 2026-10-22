// Injects the Cloudflare Web Analytics beacon into index.html at deploy time.
//
// The token is never committed: index.html carries the ANALYTICS-BEACON
// placeholder below, and this script replaces it with the real beacon using
// the CF_BEACON_TOKEN environment variable. It runs:
//   - in deploy-pages.yml before the Pages artifact is uploaded, and
//   - in the Vercel mirror's buildCommand (vercel.json).
//
// When CF_BEACON_TOKEN is absent or empty — i.e. forks and anyone else
// building this repo without your variable/secret — the placeholder is
// removed and no analytics block is deployed, so foreign traffic can no
// longer reach your Cloudflare properties.
//
// Usage: node .github/scripts/inject-analytics.mjs [path-to-index.html]

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDER = '<!-- ANALYTICS-BEACON -->';
const file = process.argv[2]
    ?? path.resolve(fileURLToPath(import.meta.url), '../../..', 'index.html');
const token = (process.env.CF_BEACON_TOKEN ?? '').trim();

const html = readFileSync(file, 'utf8');
if (!html.includes(PLACEHOLDER)) {
    console.error(`inject-analytics: placeholder ${PLACEHOLDER} not found in ${file}`);
    process.exit(1);
}

const beacon = token
    ? `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${token}"}'></script>`
    : '';

writeFileSync(file, html.replace(PLACEHOLDER, beacon));
console.log(`inject-analytics: beacon ${token ? 'injected' : 'removed'} (${path.basename(file)})`);
