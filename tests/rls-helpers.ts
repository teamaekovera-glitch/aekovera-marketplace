import { Client } from "pg";
import crypto from "node:crypto";

/**
 * RLS test scaffolding (F-04).
 *
 * The client roles (anon/authenticated/service_role) are created NOLOGIN by
 * migration 0001 (Supabase manages them in production), so tests open a
 * superuser connection and SET ROLE into the client role. PostgreSQL
 * evaluates RLS, grants, and BYPASSRLS against the *effective* role after
 * SET ROLE, so every assertion still runs as the client identity — the
 * hygiene test pins current_user to prove it.
 *
 * Per-request JWT claims are staged with set_config('request.jwt.claims'),
 * mirroring how Supabase exposes auth.uid() to policies.
 */

export const DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/aekovera_test";

export type ClientRole = "anon" | "authenticated" | "service_role";

export interface RoleSession {
  client: Client;
  role: ClientRole;
  userId: string | null;
}

/** Open a connection evaluating RLS as the given client role. */
export async function connectAs(
  role: ClientRole,
  userId: string | null = null,
): Promise<RoleSession> {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  await client.query(`SET ROLE ${role}`);
  const session: RoleSession = { client, role, userId };
  await applySession(session);
  return session;
}

/**
 * Stage request.jwt_claims so auth.uid() resolves to the given user
 * (same mechanism Supabase uses per request).
 */
export async function applySession(session: RoleSession): Promise<void> {
  const claims = session.userId
    ? {
        sub: session.userId,
        role: session.role,
        aud: "authenticated",
      }
    : null;
  await session.client.query(
    "SELECT set_config('request.jwt.claims', $1, false)",
    [JSON.stringify(claims)],
  );
}

/** Re-identity an open connection as a different user (same role). */
export async function switchUser(
  session: RoleSession,
  userId: string | null,
): Promise<void> {
  session.userId = userId;
  await applySession(session);
}

export async function closeSession(session: RoleSession): Promise<void> {
  await session.client.end();
}

export function newUserId(): string {
  return crypto.randomUUID();
}

/** Deterministic fixture user ids (tests/rls-seed.sql). */
export const SEED = {
  brandA: "11111111-1111-4111-8111-111111111111",
  brandB: "22222222-2222-4222-8222-222222222222",
  buyerA: "33333333-3333-4333-8333-333333333333",
  buyerB: "44444444-4444-4444-8444-444444444444",
  admin: "55555555-5555-4555-8555-555555555555",
};
