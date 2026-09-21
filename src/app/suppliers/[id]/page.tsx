import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalogSuppliers } from "@/lib/catalog/merge";
import { getPublicSupplier } from "@/components/discovery/public-supplier";
import { SupplierProfile } from "@/components/discovery/supplier-profile";

/**
 * /suppliers/[id] — the supplier profile route (spec art_mGbk9PCA): full
 * profile with per-claim evidence. The route is static over the visible
 * catalog; unknown ids and withheld ids both render notFound(), so
 * quarantined rows have no URL on this surface.
 */

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams(): Promise<{ id: string }[]> {
  return catalogSuppliers.map((supplier) => ({ id: supplier.id }));
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const supplier = getPublicSupplier(id);
  if (!supplier) {
    return { title: "Supplier not found — Aekovera Marketplace" };
  }
  return {
    title: `${supplier.name.value} — supplier profile — Aekovera Marketplace`,
    description: `Supplier profile for ${supplier.name.value} (${supplier.country.value}). Every claim links to the page it was read from; anything unsourced is labeled Unknown.`,
  };
}

export default async function SupplierProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const supplier = getPublicSupplier(id);
  if (!supplier) notFound();
  return <SupplierProfile supplier={supplier} />;
}
