import {
  baseSupplier,
  quarantinedSupplier,
  supplierWithUnknowns,
} from "@/lib/catalog/fixtures";
import { catalogDataset } from "@/lib/catalog/merge";
import { ComponentPreview } from "./component-preview";

export const metadata = {
  title: "Component preview — marketplace v1",
};

/** Dev-only surface: every catalog component against SEA data + mock fixtures. */
export default function ComponentPreviewPage() {
  return (
    <ComponentPreview
      suppliers={catalogDataset.suppliers}
      regionCounts={catalogDataset.regionCounts}
      totalCount={catalogDataset.totalCount}
      edgeSuppliers={[baseSupplier, supplierWithUnknowns, quarantinedSupplier]}
    />
  );
}
