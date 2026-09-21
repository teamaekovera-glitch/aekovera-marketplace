import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  EvidenceDrawer,
  ProvenanceBadge,
  SourceCitation,
  SourceLink,
  SourcedText,
} from "@/components/catalog";
import type { EvidenceClaim } from "@/components/catalog";
import { certificationChipLabel, priceTierLabel } from "@/lib/catalog/display";
import type { PriceSignal, SourcedValue, Supplier } from "@/lib/catalog/types";

/**
 * The /suppliers/[id] profile: commercial terms, certifications, and the
 * per-claim evidence drawer. Every displayed fact renders through the
 * provenance components — a claim links to the page it was read from, or
 * the field renders the Unknown label. No hooks: the page renders it on
 * the server.
 */
export function SupplierProfile({ supplier }: { supplier: Supplier }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <Link
            href="/suppliers"
            className="text-sm font-medium text-accent underline underline-offset-2 hover:opacity-80"
          >
            ← All suppliers
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            <SourceLink
              sourced={supplier.name}
              linkClassName="text-foreground no-underline hover:underline"
            />
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <ProvenanceBadge supplier={supplier} />
            <span className="text-sm text-muted-foreground" data-fact-field="country">
              <SourcedText sourced={supplier.country} />
            </span>
          </div>
          {supplier.note ? (
            <p className="mt-4 max-w-3xl rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium">Research note:</span> {supplier.note}
            </p>
          ) : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-8">
            <ProfileSection title="Overview">
              <FactGrid>
                <FactField label="HQ">
                  <SourcedText sourced={supplier.hq} />
                </FactField>
                <FactField label="Type">
                  <SourcedText sourced={supplier.type} />
                </FactField>
                <FactField label="Regions served">
                  <SourcedText sourced={supplier.regionsServed} />
                </FactField>
                <FactField label="Review presence">
                  <SourcedText sourced={supplier.reviewPresence} />
                </FactField>
                <FactField label="Ingredients" className="sm:col-span-2">
                  <SourcedChipList sourced={supplier.ingredients} />
                </FactField>
                <FactField label="Categories" className="sm:col-span-2">
                  <SourcedChipList sourced={supplier.categories} />
                </FactField>
              </FactGrid>
            </ProfileSection>

            <ProfileSection title="Commercial terms">
              <FactGrid>
                <FactField label="MOQ">
                  <SourcedText sourced={supplier.moq} />
                </FactField>
                <FactField label="Sample policy">
                  <SourcedText sourced={supplier.samplePolicy} />
                </FactField>
                <FactField label="Capacity" className="sm:col-span-2">
                  <SourcedText sourced={supplier.capacity} />
                </FactField>
              </FactGrid>

              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Price signals
                </h4>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {supplier.priceSignals.map((signal, index) => (
                    <PriceSignalRow key={index} signal={signal} index={index} />
                  ))}
                </ul>
              </div>
            </ProfileSection>

            <ProfileSection title="Certifications">
              {supplier.certifications.value.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  None listed on the reviewed page.
                </p>
              ) : (
                <ul className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                  {supplier.certifications.value.map((cert) => (
                    <li key={cert.name} className="flex items-center gap-1">
                      <Badge variant="outline" data-certification-chip>
                        {cert.name} · {certificationChipLabel(cert.status)}
                      </Badge>
                      <SourceCitation source={cert.source} />
                    </li>
                  ))}
                </ul>
              )}
            </ProfileSection>
          </div>

          <aside className="min-w-0">
            <div className="lg:sticky lg:top-6">
              <EvidenceDrawer
                claims={profileClaims(supplier)}
                title="Evidence — every claim and its source"
                className="lg:max-h-[80vh] lg:overflow-y-auto"
              />
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        Certifications are shown as the supplier states them — registry
        verification is not performed in v1. Withheld rows are excluded from
        this catalog pending verification.
      </footer>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-slot="profile-section"
      className="rounded-lg border bg-card p-5 shadow-sm"
    >
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FactGrid({ children }: { children: React.ReactNode }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
  );
}

function FactField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-fact-field={label} className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** A sourced list claim rendered as chips with the claim's citation. */
function SourcedChipList({ sourced }: { sourced: SourcedValue<string[]> }) {
  return (
    <span data-provenance="sourced" className="flex flex-wrap items-center gap-1.5">
      {sourced.value.map((item) => (
        <Badge key={item} variant="accent">
          {item}
        </Badge>
      ))}
      <SourceCitation source={sourced.source} />
    </span>
  );
}

function PriceSignalRow({ signal, index }: { signal: PriceSignal; index: number }) {
  return (
    <li
      data-fact-field={`price-signal-${index + 1}`}
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
    >
      <Badge variant="secondary">{priceTierLabel(signal.tier)}</Badge>
      {signal.value ? <span className="font-medium">{signal.value}</span> : null}
      {signal.staleness ? (
        <span className="text-xs text-muted-foreground">{signal.staleness}</span>
      ) : null}
      <SourceCitation source={signal.source} />
    </li>
  );
}

/**
 * The full claim audit trail for the profile: one entry per displayed
 * claim, each with its own source URL, retrieval date, and note. Claims
 * with no fetched source (null fields) render the Unknown label inline and
 * carry no entry — there is no source to cite.
 */
export function profileClaims(supplier: Supplier): EvidenceClaim[] {
  const claims: EvidenceClaim[] = [
    { label: "Name", source: supplier.name.source },
    { label: "Website", source: supplier.website.source },
    { label: "Country", source: supplier.country.source },
    { label: "Categories", source: supplier.categories.source },
    { label: "Ingredients", source: supplier.ingredients.source },
    { label: "Certifications", source: supplier.certifications.source },
  ];
  for (const [label, sourced] of [
    ["HQ", supplier.hq],
    ["Type", supplier.type],
    ["Regions served", supplier.regionsServed],
    ["Review presence", supplier.reviewPresence],
    ["MOQ", supplier.moq],
    ["Sample policy", supplier.samplePolicy],
    ["Capacity", supplier.capacity],
  ] as const) {
    if (sourced) claims.push({ label, source: sourced.source });
  }
  for (const cert of supplier.certifications.value) {
    claims.push({
      label: `Certification: ${cert.name} (${certificationChipLabel(cert.status)})`,
      source: cert.source,
    });
  }
  supplier.priceSignals.forEach((signal, index) => {
    claims.push({
      label: `Price signal ${index + 1} (${priceTierLabel(signal.tier)})`,
      source: signal.source,
    });
  });
  return claims;
}
