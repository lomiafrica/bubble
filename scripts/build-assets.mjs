#!/usr/bin/env node
/**
 * Copy embed SDK build output into plugin assets.
 * Run from apps/sdks/embed: npm run build:iife
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const embedDist = join(root, '..', '..', 'sdks', 'embed', 'dist', 'lomi.js');
const targetDir = join(root, 'assets', 'js');
const target = join(targetDir, 'lomi-embed.js');

mkdirSync(targetDir, { recursive: true });
copyFileSync(embedDist, target);
console.log('Copied', embedDist, '→', target);
