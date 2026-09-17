#!/usr/bin/env node
/**
 * Minimal numbered plain-SQL migration runner.
 *
 * - Applies supabase/migrations/*.sql in filename order, each in a transaction,
 *   tracked in schema_migrations.
 * - The same files apply on Supabase (psql / supabase db push) — this runner
 *   exists for local dev and CI, not as a Supabase replacement.
 *
 * CLI:  node supabase/migrate.mjs            (uses DATABASE_URL, defaulting
 *                                             to .env / .env.local)
 * API:  runMigrations(connectionString)
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "pg";

const MIGRATIONS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "migrations",
);

/** Parse a .env-style file into process.env (no overwrite). Returns count set. */
export function loadDotEnv(file = ".env") {
  let count = 0;
  try {
    const raw = readFileSync(path.resolve(process.cwd(), file), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
        count += 1;
      }
    }
  } catch {
    // No .env file is fine; environment variables win.
  }
  return count;
}

export async function runMigrations(databaseUrl, { logger = () => {} } = {}) {
  if (!databaseUrl) {
    throw new Error(
      "runMigrations: no database URL. Set DATABASE_URL (or TEST_DATABASE_URL).",
    );
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         filename   TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
    );

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const filename of files) {
      const alreadyApplied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [filename],
      );
      if (alreadyApplied.rowCount > 0) {
        logger(`skip  ${filename} (already applied)`);
        continue;
      }

      const sql = readFileSync(path.join(MIGRATIONS_DIR, filename), "utf8");
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations(filename) VALUES ($1)",
          [filename],
        );
        await client.query("COMMIT");
        logger(`apply ${filename}`);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`migration ${filename} failed: ${err.message}`, {
          cause: err,
        });
      }
    }

    return files;
  } finally {
    await client.end();
  }
}

const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  loadDotEnv();
  loadDotEnv(".env.local");
  runMigrations(process.env.DATABASE_URL, {
    logger: (msg) => console.log(msg),
  })
    .then((files) => {
      console.log(`done — ${files.length} migration file(s) considered`);
    })
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
