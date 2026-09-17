import { describe, expect, it } from "vitest";
import {
  SESSION_COOKIE,
  decodeSessionCookie,
  decodeSupabaseCookieRole,
  encodeSessionCookie,
} from "../src/lib/session-cookie";
import type { AuthUser } from "../src/lib/types";

const brandUser: AuthUser = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "brand@demo.aekovera.com",
  role: "brand",
  displayName: "Harbor & Vine Foods",
  avatarUrl: null,
  plan: "pro",
  subscriptionStatus: "active",
  onboardingCompleted: true,
};

describe("session cookie (F-06 role routing)", () => {
  it("round-trips the signed-in role", () => {
    const cookie = encodeSessionCookie(brandUser);
    expect(decodeSessionCookie(cookie)).toEqual({
      present: true,
      role: "brand",
      userId: brandUser.id,
    });
  });

  it("uses the documented cookie name", () => {
    expect(SESSION_COOKIE).toBe("aeko_session");
  });

  it("treats missing or malformed cookies as anonymous", () => {
    expect(decodeSessionCookie(undefined)).toEqual({ present: false });
    expect(decodeSessionCookie("not-a-cookie")).toEqual({ present: false });
    // Valid base64 but invalid JSON payload.
    expect(decodeSessionCookie(Buffer.from("nope", "utf8").toString("base64url"))).toEqual({
      present: false,
    });
    // JSON with an unknown role.
    const forged = Buffer.from(
      JSON.stringify({ id: "u1", role: "superadmin" }),
      "utf8",
    ).toString("base64url");
    expect(decodeSessionCookie(forged)).toEqual({ present: false });
  });
});

describe("supabase cookie role extraction", () => {
  it("reads the role from a base64-encoded Supabase session", () => {
    const payload = Buffer.from(
      JSON.stringify({
        sub: brandUser.id,
        user_metadata: { role: "buyer" },
      }),
      "utf8",
    ).toString("base64url");
    const raw = Buffer.from(
      JSON.stringify({ access_token: `header.${payload}.signature` }),
      "utf8",
    ).toString("base64");
    expect(decodeSupabaseCookieRole(raw)).toEqual({
      present: true,
      role: "buyer",
      userId: brandUser.id,
    });
  });

  it("returns absent for junk input", () => {
    expect(decodeSupabaseCookieRole(undefined)).toEqual({ present: false });
    expect(decodeSupabaseCookieRole("garbage")).toEqual({ present: false });
  });
});
