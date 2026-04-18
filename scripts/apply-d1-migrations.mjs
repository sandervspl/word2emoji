import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DATABASE_NAME = 'word2emoji';
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'drizzle');
const MIGRATIONS_TABLE_SQL = `CREATE TABLE IF NOT EXISTS d1_migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

const mode = process.argv.includes('--remote')
  ? '--remote'
  : process.argv.includes('--local')
    ? '--local'
    : undefined;

if (!mode) {
  console.error('Pass either --local or --remote.');
  process.exit(1);
}

function getPnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

function runWrangler(args, { expectJson = false } = {}) {
  const result = spawnSync(getPnpmCommand(), ['exec', 'wrangler', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }

    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    process.exit(result.status ?? 1);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (!expectJson) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }

    return undefined;
  }

  return JSON.parse(result.stdout);
}

function getMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right));
}

function getAppliedMigrations() {
  const response = runWrangler(
    [
      'd1',
      'execute',
      DATABASE_NAME,
      mode,
      '--command',
      'SELECT name FROM d1_migrations ORDER BY id;',
      '--json',
    ],
    { expectJson: true },
  );

  return new Set((response[0]?.results ?? []).map((row) => row.name));
}

function markMigrationApplied(fileName) {
  const escapedName = fileName.replaceAll("'", "''");

  runWrangler([
    'd1',
    'execute',
    DATABASE_NAME,
    mode,
    '--command',
    `INSERT INTO d1_migrations (name) VALUES ('${escapedName}');`,
  ]);
}

runWrangler(['d1', 'execute', DATABASE_NAME, mode, '--command', MIGRATIONS_TABLE_SQL]);

const appliedMigrations = getAppliedMigrations();
const pendingMigrations = getMigrationFiles().filter((fileName) => !appliedMigrations.has(fileName));

if (pendingMigrations.length === 0) {
  console.log(`No pending migrations for ${mode.slice(2)}.`);
  process.exit(0);
}

for (const fileName of pendingMigrations) {
  const migrationPath = path.join(MIGRATIONS_DIR, fileName);

  console.log(`Applying ${fileName} (${mode.slice(2)})`);
  runWrangler(['d1', 'execute', DATABASE_NAME, mode, '--file', migrationPath]);
  markMigrationApplied(fileName);
}

console.log(`Applied ${pendingMigrations.length} migration(s) to ${mode.slice(2)}.`);
