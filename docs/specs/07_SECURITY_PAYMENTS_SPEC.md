# SECURITY_PAYMENTS_SPEC.md — Auth, RBAC, RLS, Billing & Compliance

**Version:** 1.0.0  
**Depends on:** `02_ARCHITECTURE.md`, `03_DATA_MODEL.md`

---

## 1. Authentication

### 1.1 Provider
Supabase Auth with:
- Email/password (with email verification).
- Google OAuth (social sign-in).
- Magic link (passwordless — v2).

### 1.2 Account Creation Rules

| Rule | Enforcement |
|------|-------------|
| Email must be unique | Supabase Auth constraint |
| Buyer accounts blocked on free email domains | Server-side check before registration: reject `@gmail.com`, `@yahoo.com`, `@hotmail.com`, `@outlook.com`, `@aol.com`, `@icloud.com`, `@protonmail.com` |
| Brand accounts allow any email | No domain restriction |
| Password minimum 8 characters, 1 number, 1 uppercase | Supabase Auth config |
| Email verification required before login | Supabase Auth config |

### 1.3 Session Management
- JWT tokens via Supabase Auth.
- Access token expiry: 1 hour (auto-refresh).
- Refresh token expiry: 30 days.
- Sessions revoked on password change.

---

## 2. Role-Based Access Control (RBAC)

### 2.1 Roles

| Role | Access |
|------|--------|
| `brand` | Own brand profile, own products, own submissions, messaging (paid), analytics (own) |
| `buyer` | All published brands/products (read), own buyer profile, own opportunities, own submissions review, search, messaging, samples |
| `admin` | Everything: all users, all profiles, all content, verification, moderation, analytics, billing |

### 2.2 Permission Matrix

| Resource | Brand (own) | Brand (other) | Buyer (verified) | Buyer (unverified) | Admin |
|----------|-------------|---------------|-------------------|--------------------|-------|
| Brand profile (read) | ✓ | Published only | Published only | Published only (limited) | ✓ |
| Brand profile (write) | ✓ | ✗ | ✗ | ✗ | ✓ |
| Products (read) | ✓ | Published only | Published only | ✗ | ✓ |
| Products (write) | ✓ | ✗ | ✗ | ✗ | ✓ |
| Buyer profile (read) | ✗ | ✗ | Own only | Own only | ✓ |
| Buyer profile (write) | ✗ | ✗ | Own only | Own only | ✓ |
| Opportunities (read) | Published (public) | — | ✓ | ✗ | ✓ |
| Opportunities (write) | ✗ | — | Own only | ✗ | ✓ |
| Submissions (create) | Own to any opportunity (paid) | ✗ | ✗ | ✗ | ✓ |
| Submissions (read) | Own only | ✗ | Own opportunities only | ✗ | ✓ |
| Messages (read/write) | Own conversations (paid) | ✗ | Own conversations | ✗ | ✓ |
| Analytics | Own | ✗ | ✗ | ✗ | ✓ (all) |
| Admin panel | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## 3. Row-Level Security (RLS) Policies

### 3.1 `brand_profiles`

```sql
-- Brands can read their own profile
CREATE POLICY brand_own_read ON brand_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Anyone can read published brand profiles
CREATE POLICY brand_public_read ON brand_profiles FOR SELECT
  USING (status = 'published');

-- Brands can update their own profile
CREATE POLICY brand_own_update ON brand_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Brands can insert their own profile
CREATE POLICY brand_own_insert ON brand_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admin can do everything (via service role key, bypasses RLS)
```

### 3.2 `products`

```sql
-- Brand can CRUD their own products
CREATE POLICY product_own_all ON products FOR ALL
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Anyone can read products of published brands
CREATE POLICY product_public_read ON products FOR SELECT
  USING (
    status = 'published' AND
    brand_id IN (SELECT id FROM brand_profiles WHERE status = 'published')
  );
```

### 3.3 `buyer_profiles`

```sql
-- Buyers can read/update their own profile
CREATE POLICY buyer_own ON buyer_profiles FOR ALL
  USING (user_id = auth.uid());

-- Brands cannot read buyer profiles (buyers are anonymous to brands unless they message)
-- No public read policy for buyer_profiles
```

### 3.4 `opportunities`

```sql
-- Buyer can CRUD their own opportunities
CREATE POLICY opp_own ON opportunities FOR ALL
  USING (buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid()));

-- Published public opportunities are readable by all authenticated users
CREATE POLICY opp_public_read ON opportunities FOR SELECT
  USING (status = 'published' AND visibility = 'public');
```

### 3.5 `submissions`

```sql
-- Brand can read their own submissions
CREATE POLICY sub_brand_read ON submissions FOR SELECT
  USING (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Brand can create submissions (plan check happens in application layer)
CREATE POLICY sub_brand_create ON submissions FOR INSERT
  WITH CHECK (brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()));

-- Buyer can read submissions to their own opportunities
CREATE POLICY sub_buyer_read ON submissions FOR SELECT
  USING (opportunity_id IN (
    SELECT id FROM opportunities WHERE buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  ));

-- Buyer can update submission status (shortlist, decline)
CREATE POLICY sub_buyer_update ON submissions FOR UPDATE
  USING (opportunity_id IN (
    SELECT id FROM opportunities WHERE buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  ));
```

### 3.6 `messages`

```sql
-- Users can read messages in their own conversations
CREATE POLICY msg_read ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE
      brand_id IN (SELECT id FROM brand_profiles WHERE user_id = auth.uid()) OR
      buyer_id IN (SELECT id FROM buyer_profiles WHERE user_id = auth.uid())
  ));

-- Users can insert messages in their own conversations
CREATE POLICY msg_insert ON messages FOR INSERT
  WITH CHECK (sender_user_id = auth.uid());
```

---

## 4. Stripe Billing

### 4.1 Subscription Plans

| Plan | Stripe Price ID | Billing | Features |
|------|----------------|---------|----------|
| Free | — | — | Basic profile, 5 products, view opportunities |
| Starter | `price_starter_yearly` | $99/year | Unlimited products, 10 submissions/mo, messaging, full analytics |
| Pro | `price_pro_yearly` | $249/year | Everything in Starter + unlimited submissions, boosted visibility, buyer insights |
| Enterprise | `price_enterprise_yearly` | $499/year | Everything in Pro + priority ranking, dedicated support, competitive intel |

### 4.2 Stripe Integration Flow

```
Brand clicks "Upgrade" →
  Create Stripe Checkout Session (mode: subscription) →
    Redirect to Stripe Checkout →
      Payment success → Stripe fires webhook →
        webhook handler updates user_profiles.subscription_plan + subscription_status →
          Brand redirected back to dashboard with paid features unlocked
```

### 4.3 Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Set subscription_plan, subscription_status = 'active' |
| `customer.subscription.updated` | Update plan if changed (upgrade/downgrade) |
| `customer.subscription.deleted` | Set subscription_plan = 'free', subscription_status = 'canceled' |
| `invoice.payment_failed` | Set subscription_status = 'past_due', send email warning |
| `invoice.paid` | Set subscription_status = 'active' (after past_due recovery) |

### 4.4 Plan Enforcement

Feature gating happens at two layers:

**Server-side (API/Server Actions):**
```typescript
async function assertPlanFeature(userId: string, feature: string) {
  const user = await getUserProfile(userId);
  const allowed = PLAN_FEATURES[user.subscription_plan][feature];
  if (!allowed) {
    throw new ForbiddenError(`Upgrade to access ${feature}`);
  }
}
```

**Client-side (UI):**
```tsx
function UpgradeGate({ feature, children, fallback }) {
  const { user } = useUser();
  const hasAccess = PLAN_FEATURES[user.subscription_plan][feature];
  return hasAccess ? children : fallback || <UpgradePrompt feature={feature} />;
}
```

### 4.5 Downgrade Behavior
When a paid subscription is canceled:
- Profile stays published (not unpublished).
- Products beyond 5 stay published but cannot be edited until count is reduced.
- Pending submissions stay but brand cannot create new ones.
- Messages are read-only (cannot send new).
- Analytics revert to basic (views count only).
- All brand data is retained. Nothing is deleted.

---

## 5. Security Hardening

### 5.1 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|------------|
| Injection (SQL/XSS) | Supabase parameterized queries, React auto-escaping, DOMPurify for rich text |
| Broken Auth | Supabase Auth handles token management, CSRF protection via SameSite cookies |
| Sensitive Data Exposure | HTTPS everywhere, encrypted at rest (Supabase), no PII in URLs |
| Broken Access Control | RLS policies (Section 3), server-side permission checks |
| Security Misconfiguration | No exposed Supabase service role key in client, env validation at build time |
| SSRF | No user-controllable URL fetching on server |
| Mass Assignment | Zod schema validation on all API inputs, allowlisted fields only |

### 5.2 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Sign up | 5 per IP per hour |
| Login | 10 per IP per hour |
| Search | 60 per user per minute |
| Submission create | 20 per user per hour |
| Message send | 30 per user per hour |
| AI content generation | 10 per user per hour |
| File upload | 50 per user per hour |

### 5.3 File Upload Security

- Accepted MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Max file size: 5MB (images), 10MB (documents).
- Files are scanned for MIME type mismatch (extension vs. actual content).
- Files stored in Supabase Storage with private access policies.
- Public URLs generated via signed URLs with 1-hour expiry for display.

---

## 6. Compliance

### 6.1 CCPA / GDPR

| Requirement | Implementation |
|-------------|----------------|
| Right to access | User can export their data from Settings → "Download my data" (JSON export) |
| Right to delete | User can request account deletion from Settings → "Delete my account" (soft delete, hard delete after 30 days) |
| Data minimization | Only collect data needed for marketplace function |
| Consent | Clear terms of service and privacy policy accepted at sign-up |
| Data processing agreement | Supabase DPA covers database hosting |

### 6.2 Audit Trail

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL, -- 'profile_update', 'submission_create', 'login', 'plan_change', etc.
  resource_type TEXT, -- 'brand_profile', 'product', 'opportunity', etc.
  resource_id UUID,
  metadata JSONB, -- Action-specific data
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
