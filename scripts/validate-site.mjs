#!/usr/bin/env node
// Lightweight static-site check: HTML sanity, local asset existence and
// same-page anchor targets. No dependencies, no network, deterministic.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = "index.html";
const errors = [];

function fail(message) {
  errors.push(message);
}

const html = readFileSync(join(root, entry), "utf8");

// --- Basic document sanity -------------------------------------------------
if (!/^\s*<!DOCTYPE html>/i.test(html)) fail(`${entry}: missing <!DOCTYPE html>`);
if (!/<html\b[^>]*\blang="[^"]+"/i.test(html)) fail(`${entry}: <html> is missing a lang attribute`);
if (!/<title>\s*[^<\s][^<]*<\/title>/i.test(html)) fail(`${entry}: missing or empty <title>`);
if (!/<meta\b[^>]*name="viewport"/i.test(html)) fail(`${entry}: missing viewport meta tag`);
if (!/<meta\b[^>]*name="description"\s+content="[^"]+"/i.test(html)) fail(`${entry}: missing meta description`);

// --- Collect ids and detect duplicates -------------------------------------
const ids = new Map();
for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
  const id = match[1];
  ids.set(id, (ids.get(id) ?? 0) + 1);
}
for (const [id, count] of ids) {
  if (count > 1) fail(`${entry}: duplicate id "${id}" (${count}x)`);
}

// --- Local references must exist on disk -----------------------------------
const localRefs = new Set();
for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  const value = match[1];
  if (!value || value.startsWith("#")) continue;
  if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(value)) continue;
  localRefs.add(value.split(/[?#]/)[0]);
}
for (const ref of localRefs) {
  if (!existsSync(join(root, ref))) fail(`${entry}: local reference not found: ${ref}`);
}

// --- Same-page anchors must resolve ----------------------------------------
const anchors = new Set();
for (const match of html.matchAll(/href="#([^"]+)"/g)) anchors.add(match[1]);
for (const anchor of anchors) {
  if (!ids.has(anchor)) fail(`${entry}: anchor "#${anchor}" has no matching id`);
}

// --- Images need an alt attribute ------------------------------------------
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  if (!/\balt=/.test(match[0])) fail(`${entry}: <img> without alt: ${match[0].slice(0, 80)}`);
}

// --- Report ----------------------------------------------------------------
if (errors.length > 0) {
  console.error(`FAIL: ${errors.length} problem(s) found`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `PASS: ${entry} valid — ${ids.size} ids, ${localRefs.size} local refs, ${anchors.size} anchors checked`
);
