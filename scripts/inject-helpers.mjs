#!/usr/bin/env node
/**
 * Injects lib/lomi-server-helpers.js into Bubble server action files.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const helpersPath = join(root, 'lib', 'lomi-server-helpers.js');
const helpers = readFileSync(helpersPath, 'utf8').replace(
  /if \(typeof module[\s\S]*$/,
  '',
);
const start = '// === LOMI_HELPERS_START ===';
const end = '// === LOMI_HELPERS_END ===';
const block = `${start}\n${helpers}\n${end}\n\n`;

const actionsDir = join(root, 'actions');
for (const name of readdirSync(actionsDir)) {
  const serverPath = join(actionsDir, name, 'server.js');
  try {
    statSync(serverPath);
  } catch {
    continue;
  }
  let content = readFileSync(serverPath, 'utf8');
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if (startIdx !== -1 && endIdx !== -1) {
    content = block + content.slice(endIdx + end.length).replace(/^\s*\n/, '');
  } else if (!content.includes(start)) {
    content = block + content;
  }
  writeFileSync(serverPath, content);
  console.log('injected:', serverPath);
}
