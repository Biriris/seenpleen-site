import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const publicAdminDir = path.join(rootDir, 'public', 'admin');
const cachedAdminDir = path.join(rootDir, 'dist', 'admin');

const adminSourcePrefixes = [
  'sanity/',
  'sanity.config.ts',
  'sanity.cli.ts',
  'scripts/patch-sanity-admin-paths.mjs',
];

function runNpmScript(scriptName) {
  execSync(`npm run ${scriptName}`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function getChangedFiles() {
  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD~1', 'HEAD'], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output
      .split(/\r?\n/)
      .map((file) => file.trim().replace(/\\/g, '/'))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function hasAdminSourceChanges() {
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    return false;
  }

  return changedFiles.some((file) =>
    adminSourcePrefixes.some((prefix) => file === prefix || file.startsWith(prefix))
  );
}

function copyCachedAdmin() {
  fs.rmSync(publicAdminDir, { recursive: true, force: true });
  fs.cpSync(cachedAdminDir, publicAdminDir, { recursive: true });
}

const forceAdminBuild = process.env.FORCE_ADMIN_BUILD === 'true';
const canReuseCachedAdmin = fs.existsSync(cachedAdminDir);
const shouldBuildAdmin = forceAdminBuild || !canReuseCachedAdmin || hasAdminSourceChanges();

if (shouldBuildAdmin) {
  console.log('Building Sanity Studio admin files.');
  runNpmScript('sanity:build:admin');
} else {
  console.log('Reusing cached Sanity Studio admin files from the previous Cloudflare build.');
  copyCachedAdmin();
}

runNpmScript('build:site');
