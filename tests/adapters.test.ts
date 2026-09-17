import { describe, expect, it } from "vitest";
import { MockAuthAdapter, MOCK_USERS } from "../src/lib/auth/mock";
import { InlineJobsAdapter } from "../src/lib/jobs/inline";
import { MockEmailAdapter } from "../src/lib/email/mock";
import { MockSearchAdapter } from "../src/lib/search/mock";
import { MockBillingAdapter } from "../src/lib/billing/mock";
import type { BillingAdapter } from "../src/lib/billing/types";
import type { BrandSearchRecord, ProductSearchRecord } from "../src/lib/search/types";

describe("MockAuthAdapter (F-05/F-06 mock mode)", () => {
  const adapter = new MockAuthAdapter();

  it("exposes seeded demo brand, buyer, and admin users", () => {
    expect(MOCK_USERS.map((u) => u.role).sort()).toEqual(["admin", "brand", "buyer"]);
  });

  it("signs in a demo brand user with password", async () => {
    const result = await adapter.signIn({
      email: "brand@demo.aekovera.com",
      password: "demo1234",
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.role).toBe("brand");
  });

  it("rejects a wrong password without leaking which failed", async () => {
    const result = await adapter.signIn({
      email: "brand@demo.aekovera.com",
      password: "nope",
    });
    expect(result.ok).toBe(false);
  });

  it("simulates Google OAuth as a demo user per role", async () => {
    const result = await adapter.signInWithOAuth("google");
    expect(result.ok).toBe(true);
  });
});

describe("MockSearchAdapter (F-07 mock mode)", () => {
  const adapter = new MockSearchAdapter();

  const brand: BrandSearchRecord = {
    objectID: "brand-1",
    brandId: "brand-1",
    name: "Harbor & Vine",
    tagline: "Coastal snacks",
    description: null,
    logoUrl: null,
    categories: ["Snacks"],
    subcategories: [],
    certifications: ["USDA Organic"],
    distributionRegions: ["US"],
    moq: null,
    profileTier: "full_verified",
    searchVisibility: "boosted",
    isVerified: true,
  };

  it("indexes and finds brands by name", async () => {
    await adapter.indexBrand(brand);
    const hits = await adapter.searchBrands("harbor", {});
    expect(hits).toHaveLength(1);
    const [hit] = hits;
    expect(hit?.record.brandId).toBe("brand-1");
  });

  it("filters brands by category facet", async () => {
    expect(await adapter.searchBrands("harbor", { categories: ["Beverages"] })).toHaveLength(0);
    expect(await adapter.searchBrands("harbor", { categories: ["Snacks"] })).toHaveLength(1);
  });

  it("removes brands from the index", async () => {
    await adapter.removeBrand("brand-1");
    expect(await adapter.searchBrands("harbor", {})).toHaveLength(0);
  });

  it("round-trips products too", async () => {
    const product: ProductSearchRecord = {
      objectID: "product-1",
      productId: "product-1",
      brandId: "brand-1",
      brandName: "Harbor & Vine",
      name: "Sea Salt Kettle Chips",
      description: null,
      category: "Snacks",
      subcategory: null,
      imageUrl: null,
      certifications: [],
      status: "published",
    };
    await adapter.indexProduct(product);
    expect(await adapter.searchProducts("kettle", {})).toHaveLength(1);
    await adapter.removeProduct("product-1");
    expect(await adapter.searchProducts("kettle", {})).toHaveLength(0);
  });
});

describe("MockBillingAdapter (F-08/F-09 mock mode)", () => {
  it("returns a simulated checkout URL", async () => {
    // Typed through the adapter interface to pin contract conformance.
    const adapter: BillingAdapter = new MockBillingAdapter();
    const result = await adapter.createCheckoutSession({
      userId: "u1",
      email: "brand@demo.aekovera.com",
      plan: "pro",
      successUrl: "http://localhost:3000/billing/success",
      cancelUrl: "http://localhost:3000/billing",
    });
    expect(result.ok).toBe(true);
    // Mock checkout redirects to the caller's success URL carrying a
    // simulated Stripe session id, mirroring the real redirect contract.
    if (result.ok) {
      expect(result.url.startsWith("http://localhost:3000/billing/success?")).toBe(true);
      expect(result.url).toMatch(/mock_checkout=cs_mock_pro_/);
    }
  });

  it("parses a mock webhook payload without signature machinery", async () => {
    // Typed through the adapter interface: the mock accepts the same
    // (payload, signature) shape the Stripe adapter verifies.
    const adapter: BillingAdapter = new MockBillingAdapter();
    // Real Stripe wire format: the payload carries data.object and the mock
    // normalizes it the same way the signature-verified Stripe path does.
    const parsed = await adapter.verifyAndParseWebhook(
      JSON.stringify({
        id: "evt_mock_1",
        type: "checkout.session.completed",
        data: {
          object: {
            client_reference_id: "u1",
            customer: "cus_1",
            subscription: "sub_1",
            metadata: { plan: "pro" },
          },
        },
      }),
      "any-signature",
    );
    expect(parsed?.data.kind).toBe("checkout_completed");
    if (parsed?.data.kind === "checkout_completed") {
      expect(parsed.data.plan).toBe("pro");
      expect(parsed.data.userId).toBe("u1");
    }
  });
});

describe("InlineJobsAdapter (F-10 mock mode)", () => {
  it("runs the test job inline and reports success", async () => {
    const adapter = new InlineJobsAdapter();
    const result = await adapter.sendTestJob({ message: "hello phase 0" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mode).toBe("inline");
      expect(result.jobId).toMatch(/^inline_/);
    }
  });
});

describe("MockEmailAdapter (F-11 mock mode)", () => {
  it("logs instead of sending and returns a mock id", async () => {
    const adapter = new MockEmailAdapter();
    const sent = await adapter.send({
      to: "brand@demo.aekovera.com",
      subject: "Welcome to Aekovera",
      html: "<p>Welcome</p>",
    });
    expect(sent.mode).toBe("mock");
    expect(sent.to).toBe("brand@demo.aekovera.com");
    expect(sent.id).toBeTruthy();
  });
});
