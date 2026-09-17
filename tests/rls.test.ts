import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  DATABASE_URL,
  SEED,
  closeSession,
  connectAs,
  newUserId,
  switchUser,
  type RoleSession,
} from "./rls-helpers";
import type { Client } from "pg";

/**
 * F-04: automated proof that RLS policies enforce tenant isolation.
 * Every assertion runs as a real PostgreSQL client role (anon /
 * authenticated / service_role), not as a superuser.
 */

let anon: RoleSession;
let brandA: RoleSession;
let brandB: RoleSession;
let buyerA: RoleSession;
let buyerB: RoleSession;
let service: RoleSession;
let adminConn: Client; // postgres superuser for fixture management only

beforeAll(async () => {
  // Postgres superuser applies fixtures + truncation; no assertions run as it.
  const { Client } = await import("pg");
  adminConn = new Client({ connectionString: DATABASE_URL });
  await adminConn.connect();

  const seedPath = path.join(__dirname, "rls-seed.sql");
  await adminConn.query(
    "TRUNCATE messages, conversations, submissions, opportunities, products, brand_profiles, buyer_profiles, user_profiles, auth.users CASCADE",
  );
  await adminConn.query(readFileSync(seedPath, "utf8"));

  anon = await connectAs("anon");
  brandA = await connectAs("authenticated", SEED.brandA);
  brandB = await connectAs("authenticated", SEED.brandB);
  buyerA = await connectAs("authenticated", SEED.buyerA);
  buyerB = await connectAs("authenticated", SEED.buyerB);
  service = await connectAs("service_role");
});

afterAll(async () => {
  await Promise.all([
    closeSession(anon),
    closeSession(brandA),
    closeSession(brandB),
    closeSession(buyerA),
    closeSession(buyerB),
    closeSession(service),
  ]);
  await adminConn.end();
});

async function scalar(session: RoleSession, sql: string): Promise<number> {
  const result = await session.client.query(sql);
  return Number(result.rows[0]?.count ?? result.rowCount ?? 0);
}

describe("role hygiene", () => {
  it("connections actually run as the intended client roles", async () => {
    expect((await brandA.client.query("select current_user")).rows[0].current_user).toBe("authenticated");
    expect((await anon.client.query("select current_user")).rows[0].current_user).toBe("anon");
    expect((await service.client.query("select current_user")).rows[0].current_user).toBe("service_role");
  });
});

describe("brand_profiles tenant isolation (spec 07 §3.1)", () => {
  it("a brand sees only its own profile plus published profiles", async () => {
    // Own row + the other published profile (public read policy) = both rows visible.
    const rows = await brandA.client.query(
      "select brand_name from brand_profiles order by brand_name",
    );
    expect(rows.rows.map((r) => r.brand_name).sort()).toEqual(["Brand A", "Brand B"]);
  });

  it("anon sees only published brand profiles", async () => {
    expect(await scalar(anon, "select count(*) from brand_profiles")).toBe(2);
  });

  it("a brand cannot update another brand's profile", async () => {
    await brandA.client.query(
      "update brand_profiles set tagline = 'hijack' where slug = 'brand-b'",
    );
    const check = await brandA.client.query(
      "select tagline from brand_profiles where slug = 'brand-b'",
    );
    expect(check.rows[0].tagline).not.toBe("hijack");
    expect(check.rows[0].tagline).toBeNull();
  });
});

describe("products tenant isolation (spec 07 §3.2)", () => {
  it("a brand reads only its own products plus published products (cross-tenant draft denied)", async () => {
    const rows = await brandA.client.query("select name from products");
    // Product B1 is a draft of another brand — must be invisible even to a
    // fellow authenticated brand.
    expect(rows.rows.map((r) => r.name)).toEqual(["Product A1"]);
  });

  it("a brand cannot modify another brand's product", async () => {
    const result = await brandA.client.query(
      "update products set name = 'hijacked' where name = 'Product B1'",
    );
    expect(result.rowCount).toBe(0);
  });

  it("a brand cannot delete another brand's product", async () => {
    const result = await brandA.client.query(
      "delete from products where name = 'Product B1'",
    );
    expect(result.rowCount).toBe(0);
  });

  it("anon reads published products of published brands only", async () => {
    // Draft Product B1 must not leak.
    expect(await scalar(anon, "select count(*) from products")).toBe(1);
  });
});

describe("buyer_profiles anonymity (spec 07 §3.3)", () => {
  it("brands cannot read buyer profiles at all", async () => {
    expect(await scalar(brandA, "select count(*) from buyer_profiles")).toBe(0);
  });

  it("a buyer reads only its own profile", async () => {
    const rows = await buyerA.client.query("select company_name from buyer_profiles");
    expect(rows.rows.map((r) => r.company_name)).toEqual(["Buyer A Co"]);
  });
});

describe("opportunities (spec 07 §3.4)", () => {
  it("the owning buyer sees all of its opportunities", async () => {
    expect(await scalar(buyerA, "select count(*) from opportunities")).toBe(1);
  });

  it("other users see only published public opportunities", async () => {
    // Brand A can see buyer A's published public opportunity; the draft
    // private one stays hidden.
    const rows = await brandA.client.query("select title from opportunities");
    expect(rows.rows.map((r) => r.title)).toEqual(["Opportunity A1"]);
  });

  it("a buyer cannot modify another buyer's opportunity", async () => {
    const result = await buyerB.client.query(
      "update opportunities set title = 'hijack' where title = 'Opportunity A1'",
    );
    expect(result.rowCount).toBe(0);
  });
});

describe("submissions (spec 07 §3.5)", () => {
  let submissionId: string;

  beforeAll(async () => {
    // Seed via service role: a submission from brand A to buyer A's opportunity.
    const result = await service.client.query(
      `insert into submissions (opportunity_id, brand_id, selected_product_ids, status)
       values (
         (select id from opportunities where title = 'Opportunity A1'),
         (select id from brand_profiles where slug = 'brand-a'),
         array[(select id from products where name = 'Product A1')],
         'submitted')
       returning id`,
    );
    submissionId = result.rows[0].id;
  });

  it("the submitting brand reads its own submission", async () => {
    expect(await scalar(brandA, "select count(*) from submissions")).toBe(1);
  });

  it("another brand cannot read the submission (cross-tenant isolation)", async () => {
    expect(await scalar(brandB, "select count(*) from submissions")).toBe(0);
  });

  it("the opportunity's buyer reads the submission", async () => {
    expect(await scalar(buyerA, "select count(*) from submissions")).toBe(1);
  });

  it("an unrelated buyer cannot read the submission", async () => {
    expect(await scalar(buyerB, "select count(*) from submissions")).toBe(0);
  });

  it("the buyer can shortlist (update status) on its own opportunity's submission", async () => {
    const result = await buyerA.client.query(
      "update submissions set status = 'shortlisted' where id = $1 returning status",
      [submissionId],
    );
    expect(result.rowCount).toBe(1);
  });

  it("the submitting brand cannot update submission status", async () => {
    const result = await brandA.client.query(
      "update submissions set status = 'accepted' where id = $1",
      [submissionId],
    );
    expect(result.rowCount).toBe(0);
  });
});

describe("messages and conversations (spec 07 §3.6)", () => {
  beforeAll(async () => {
    await service.client.query(
      `insert into messages (conversation_id, sender_user_id, body)
       values (
         (select id from conversations limit 1),
         '11111111-1111-4111-8111-111111111111',
         'hello from brand A')`,
    );
  });

  it("conversation participants read their messages", async () => {
    expect(await scalar(brandA, "select count(*) from messages")).toBe(1);
    expect(await scalar(buyerA, "select count(*) from messages")).toBe(1);
  });

  it("non-participants cannot read the conversation or its messages", async () => {
    expect(await scalar(brandB, "select count(*) from messages")).toBe(0);
    expect(await scalar(buyerB, "select count(*) from conversations")).toBe(0);
  });

  it("a user cannot insert a message impersonating another sender", async () => {
    // WITH CHECK (sender_user_id = auth.uid()) rejects brand B impersonating
    // brand A at the database level.
    await expect(
      brandB.client.query(
        `insert into messages (conversation_id, sender_user_id, body)
         values ((select id from conversations limit 1), '11111111-1111-4111-8111-111111111111', 'spoof')`,
      ),
    ).rejects.toThrow(/row-level security/i);
  });
});

describe("compliance tables are client-proof", () => {
  it("audit_log is invisible to anon and authenticated, readable by service_role", async () => {
    expect(await scalar(anon, "select count(*) from audit_log")).toBe(0);
    expect(await scalar(brandA, "select count(*) from audit_log")).toBe(0);
    expect(await scalar(service, "select count(*) from audit_log")).toBeGreaterThanOrEqual(0);
  });

  it("processed_webhook_events is invisible to clients", async () => {
    expect(await scalar(brandA, "select count(*) from processed_webhook_events")).toBe(0);
 expect(await scalar(anon, "select count(*) from processed_webhook_events")).toBe(0);
  });
});

describe("service role bypasses RLS", () => {
  it("service_role reads everything (admin/server context)", async () => {
    expect(await scalar(service, "select count(*) from products")).toBe(2); // includes other brands' drafts
    expect(await scalar(service, "select count(*) from submissions")).toBe(1);
    expect(await scalar(service, "select count(*) from buyer_profiles")).toBe(2);
  });
});

describe("unauthenticated access is denied on private data", () => {
  it("anon cannot read submissions, conversations, or buyer profiles", async () => {
    expect(await scalar(anon, "select count(*) from submissions")).toBe(0);
    expect(await scalar(anon, "select count(*) from conversations")).toBe(0);
    expect(await scalar(anon, "select count(*) from buyer_profiles")).toBe(0);
  });
});
