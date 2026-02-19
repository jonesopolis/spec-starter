#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PKG_DIR = path.join(__dirname, '..');
const TARGET_DIR = process.cwd();
const VERSION = require('../package.json').version;

const SCAFFOLD_DIRS = [
  '.claude/commands',
  '.claude/skills',
  '.claude/_templates',
  '.claude/hooks',
];

const SCAFFOLD_FILES = [
  '.claude/settings.json',
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy scaffold
for (const dir of SCAFFOLD_DIRS) {
  const src = path.join(PKG_DIR, dir);
  const dest = path.join(TARGET_DIR, dir);
  if (fs.existsSync(src)) copyDir(src, dest);
}

for (const file of SCAFFOLD_FILES) {
  const src = path.join(PKG_DIR, file);
  const dest = path.join(TARGET_DIR, file);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// Version tracking
const VERSION_FILE = path.join(TARGET_DIR, '.claude', '.spec-starter-version');
const CLAUDE_MD = path.join(TARGET_DIR, 'CLAUDE.md');

function readInstalledVersion() {
  try {
    return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8')).version;
  } catch {
    return null;
  }
}

function writeInstalledVersion() {
  fs.writeFileSync(VERSION_FILE, JSON.stringify({ version: VERSION }, null, 2));
}

// Bootstrap CLAUDE.md for fresh installs
function writeBootstrapClaudeMd() {
  const content = `<!-- spec-starter:bootstrap -->
Run the \`project-init\` skill now. Do not do anything else first.
<!-- /spec-starter:bootstrap -->
`;
  fs.writeFileSync(CLAUDE_MD, content);
}

// Inject update notice into existing CLAUDE.md
const NOTICE_START = '<!-- spec-starter:notice -->';
const NOTICE_END = '<!-- /spec-starter:notice -->';

function injectUpdateNotice() {
  const notice = `${NOTICE_START}
spec-starter was updated to v${VERSION}. Let the user know what changed, then remove this notice block from CLAUDE.md.
${NOTICE_END}`;

  const existing = fs.readFileSync(CLAUDE_MD, 'utf8');

  if (existing.includes(NOTICE_START)) {
    // Replace existing notice
    const updated = existing.replace(
      new RegExp(`${NOTICE_START}[\\s\\S]*?${NOTICE_END}`),
      notice
    );
    fs.writeFileSync(CLAUDE_MD, updated);
  } else {
    // Prepend notice
    fs.writeFileSync(CLAUDE_MD, notice + '\n\n' + existing);
  }
}

// Main
const installedVersion = readInstalledVersion();
const claudeMdExists = fs.existsSync(CLAUDE_MD);

if (!claudeMdExists) {
  writeBootstrapClaudeMd();
  console.log(`spec-starter v${VERSION} installed.`);
  console.log('Open Claude Code — project-init will run automatically.');
} else if (installedVersion !== VERSION) {
  injectUpdateNotice();
  console.log(`spec-starter updated to v${VERSION}.`);
  console.log('Claude will announce the update next time you open this project.');
} else {
  console.log(`spec-starter v${VERSION} refreshed.`);
}

writeInstalledVersion();
