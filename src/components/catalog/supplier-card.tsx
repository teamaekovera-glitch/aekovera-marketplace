import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { certificationChipLabel, priceTierLabel } from "@/lib/catalog/display";
import type {
  PriceSignal,
  Quarantine,
  SourcedValue,
  Supplier,
} from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { EvidenceDrawer, type EvidenceClaim } from "./evidence-drawer";
import { ProvenanceBadge } from "./provenance-badge";
import { SourceCitation, SourceLink, SourcedText } from "./source-link";

/**
 * The supplier summary card. Every rendered fact renders with its
 * claim-level source (SourceLink/SourceCitation) or the Unknown label —
 * enforced per field by the data-fact-field contract the tests assert.
 * A quarantined row renders a withheld notice and none of its facts.
 */
export function SupplierCard({
  supplier,
  compareSelected = false,
  onToggleCompare,
  className,
}: {
  supplier: Supplier;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  className?: string;
}) {
  if (supplier.quarantined) {
    return <WithheldNotice quarantined={supplier.quarantined} className={className} />;
  }

  return (
    <article
      data-slot="supplier-card"
      className={cn(
        "flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">
            <SourceLink
              sourced={supplier.name}
              linkClassName="text-foreground no-underline hover:underline"
            />
          </h3>
          <p className="mt-1 text-sm text-muted-foreground" data-fact-field="country">
            <SourcedText sourced={supplier.country} />
          </p>
        </div>
        {onToggleCompare ? (
          <Button
            type="button"
            variant={compareSelected ? "accent" : "outline"}
            size="sm"
            aria-pressed={compareSelected}
            onClick={() => onToggleCompare(supplier.id)}
          >
            {compareSelected ? "In comparison" : "Compare"}
          </Button>
        ) : null}
      </header>

      <ProvenanceBadge supplier={supplier} />

      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        <FactField label="HQ">
          <SourcedText sourced={supplier.hq} />
        </FactField>
        <FactField label="Type">
          <SourcedText sourced={supplier.type} />
        </FactField>
        <FactField label="MOQ">
          <SourcedText sourced={supplier.moq} />
        </FactField>
        <FactField label="Sample policy">
          <SourcedText sourced={supplier.samplePolicy} />
        </FactField>
        <FactField label="Capacity">
          <SourcedText sourced={supplier.capacity} />
        </FactField>
        <FactField label="Regions served">
          <SourcedText sourced={supplier.regionsServed} />
        </FactField>
        <FactField label="Ingredients" className="sm:col-span-2">
          <ChipList sourced={supplier.ingredients} />
        </FactField>
        <FactField label="Categories" className="sm:col-span-2">
          <ChipList sourced={supplier.categories} />
        </FactField>
      </dl>

      <section data-slot="price-signals">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price signals
        </h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {supplier.priceSignals.map((signal, index) => (
            <PriceSignalRow key={index} signal={signal} index={index} />
          ))}
        </ul>
      </section>

      <section data-slot="certifications">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Certifications
        </h4>
        {supplier.certifications.value.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            None listed on the reviewed page.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
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
      </section>

      <footer className="mt-auto">
        <EvidenceDrawer claims={claimsOf(supplier)} />
      </footer>
    </article>
  );
}

/** Field label + fact value; the fact is a SourceLink or the Unknown label. */
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
    <div data-fact-field={label} className={cn("min-w-0", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

/** A sourced list claim rendered as chips with the claim's citation. */
function ChipList({ sourced }: { sourced: SourcedValue<string[]> }) {
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
 * Quarantine is reason-bearing, never a silent drop: if a withheld row is
 * rendered directly, the notice replaces the card — no row facts leak.
 */
function WithheldNotice({
  quarantined,
  className,
}: {
  quarantined: Quarantine;
  className?: string;
}) {
  return (
    <article
      data-slot="supplier-card"
      data-withheld="true"
      className={cn(
        "rounded-lg border border-destructive/30 bg-destructive/5 p-4",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-destructive">
        Withheld pending verification
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{quarantined.reason}</p>
      {quarantined.note ? (
        <p className="mt-1 text-xs text-muted-foreground">{quarantined.note}</p>
      ) : null}
    </article>
  );
}

/** Every claim the card can display, with its own source — the audit trail. */
function claimsOf(supplier: Supplier): EvidenceClaim[] {
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
    ["MOQ", supplier.moq],
    ["Sample policy", supplier.samplePolicy],
    ["Capacity", supplier.capacity],
    ["Review presence", supplier.reviewPresence],
    ["Regions served", supplier.regionsServed],
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
