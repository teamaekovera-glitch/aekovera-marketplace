/**
 * /ingredients — the discovery system: instant client-side search over the
 * real build-time index, taxonomy facet chips (OR within a group, AND across
 * groups), result cards with verbatim price signals, live result counts, and
 * an explained empty state. Semantics ported from the marketplace's
 * SupplierDiscovery + SearchResults + filters; deep-link seeding (?q=,
 * ?region=) follows PR #15.
 */

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { catalogSuppliers, regionCounts, withheldCount } from '../lib/catalog.js'
import {
  buildCatalogIndex,
  buildCatalogRecords,
  searchCatalogIndex,
} from '../lib/search.js'
import { RESULTS_CAP, priceTierLabel } from '../lib/display.js'
import SupplierCard from '../components/catalog/SupplierCard.jsx'
import { SearchIcon } from '../components/icons.jsx'

/** Facet groups in the ported order; price tiers render their B1 labels. */
const FACET_GROUPS = [
  { field: 'regions', label: 'Region', facet: 'region' },
  { field: 'categories', label: 'Category', facet: 'category' },
  { field: 'subtypes', label: 'Subtype', facet: 'subtype' },
  { field: 'forms', label: 'Form', facet: 'form' },
  { field: 'certifications', label: 'Certification', facet: 'certification' },
  { field: 'moqBands', label: 'MOQ band', facet: 'moqBand' },
  { field: 'priceTiers', label: 'Price signal', facet: 'priceTiers', tierLabels: true },
]

/** Chip cap per group before "Show more" — long groups stay scannable. */
const CHIP_CAP = 12

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [selected, setSelected] = useState(() => {
    const regionParam = searchParams.get('region')
    return regionParam ? { regions: new Set(regionParam.split(',').filter(Boolean)) } : {}
  })
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  const client = useMemo(
    () =>
      buildCatalogIndex(
        buildCatalogRecords({
          suppliers: [...catalogSuppliers],
          regionCounts: [...regionCounts],
          totalCount: catalogSuppliers.length,
        }),
        regionCounts,
      ),
    [],
  )

  // Facet selection → ported filter shape (tiers stored as ids).
  const filters = useMemo(
    () => ({
      regions: [...(selected.regions ?? [])],
      categories: [...(selected.categories ?? [])],
      subtypes: [...(selected.subtypes ?? [])],
      forms: [...(selected.forms ?? [])],
      certifications: [...(selected.certifications ?? [])],
      moqBands: [...(selected.moqBands ?? [])],
      priceTiers: [...(selected.priceTiers ?? [])],
    }),
    [selected],
  )

  // Local index resolves synchronously; same call shape as the search client.
  const response = useMemo(
    () => searchCatalogIndex(client, query, filters),
    [client, query, filters],
  )

  const suppliersById = useMemo(() => new Map(catalogSuppliers.map((s) => [s.id, s])), [])

  // Keep the URL in step with query + regions so deep links stay shareable.
  useEffect(() => {
    const next = new URLSearchParams()
    if (query.trim()) next.set('q', query.trim())
    const regions = [...(selected.regions ?? [])]
    if (regions.length > 0) next.set('region', regions.join(','))
    setSearchParams(next, { replace: true })
  }, [query, selected, setSearchParams])

  const toggleFacet = (groupKey, value) =>
    setSelected((prev) => {
      const set = new Set(prev[groupKey] ?? [])
      if (set.has(value)) {
        set.delete(value)
      } else {
        set.add(value)
      }
      return { ...prev, [groupKey]: set }
    })

  const toggleExpanded = (groupKey) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupKey)) {
        next.delete(groupKey)
      } else {
        next.add(groupKey)
      }
      return next
    })

  const clearAll = () => {
    setQuery('')
    setSelected({})
  }

  const hasActiveFacets = Object.values(selected).some((set) => set.size > 0)
  const activeFacetCount = Object.values(selected).reduce((sum, set) => sum + set.size, 0)

  const items = response.hits.flatMap((hit) => {
    const supplier = suppliersById.get(hit.record.supplierId)
    return supplier ? [{ supplier }] : []
  })

  const shown = items.slice(0, RESULTS_CAP)
  const truncated = response.totalHits > shown.length

  return (
    <section className="marketplace">
      <div className="marketplace__texture bg-grid mask-radial" aria-hidden="true" />
      <div className="marketplace__inner">
        <div className="mkt-head">
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dash" /> Ingredients · Supplier catalog
            </p>
            <h1 className="mkt-head__title">
              Find the source,
              <em className="serif-accent"> not just a supplier.</em>
            </h1>
            <p className="mkt-head__note">
              {catalogSuppliers.length.toLocaleString('en-US')} listed suppliers ·{' '}
              <strong>every fact links to the page it was read from</strong> — with the date it was
              read. Anything without a source stays Unknown.
            </p>
          </div>
        </div>

        <div className="mkt-filters">
          <div className="brief-bar mkt-search">
            <SearchIcon size={18} className="brief-bar__spark" />
            <input
              className="brief-bar__input"
              aria-label="Search ingredient suppliers"
              placeholder="Search — e.g. coconut, vitamin C, GMP…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {(query || hasActiveFacets) && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearAll}>
                Clear
              </button>
            )}
          </div>

          <div className="facet-groups" role="group" aria-label="Filters">
            {FACET_GROUPS.map((group) => {
              const options = response.facetCounts[group.facet] ?? []
              if (options.length === 0) return null
              const active = selected[group.field] ?? new Set()
              const expanded = expandedGroups.has(group.field)
              const capped = expanded ? options : options.slice(0, CHIP_CAP)
              const hidden = options.length - capped.length
              return (
                <div key={group.field} className="facet-group">
                  <p className="facet-group__label">{group.label}</p>
                  <div className="mkt-chips">
                    {capped.map((option) => {
                      const value = group.tierLabels ? priceTierLabel(option.value) : option.value
                      const isSelected = active.has(option.value)
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          className={`chip ${isSelected ? 'chip--accent' : ''}`}
                          onClick={() => toggleFacet(group.field, option.value)}
                        >
                          {value}
                          <span className="mkt-chip__count">{option.count}</span>
                        </button>
                      )
                    })}
                    {hidden > 0 && (
                      <button
                        type="button"
                        className="facet-group__more"
                        onClick={() => toggleExpanded(group.field)}
                        aria-expanded={false}
                      >
                        Show {hidden} more
                      </button>
                    )}
                    {expanded && options.length > CHIP_CAP && (
                      <button
                        type="button"
                        className="facet-group__more"
                        onClick={() => toggleExpanded(group.field)}
                        aria-expanded={true}
                      >
                        Show fewer
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {activeFacetCount > 0 && (
            <p className="facet-active-note" role="status">
              {activeFacetCount} filter{activeFacetCount === 1 ? '' : 's'} active — OR within a
              group, AND across groups.
            </p>
          )}
        </div>

        {response.totalHits === 0 ? (
          <div className="mkt-empty" data-slot="search-empty">
            <span className="placeholder__icon">
              <SearchIcon size={22} />
            </span>
            <p className="mkt-empty__title">
              {query.trim() ? (
                <>
                  No supplier matches <em className="serif-accent">“{query.trim()}”</em>
                </>
              ) : (
                'No supplier passes the selected filters.'
              )}
            </p>
            <p className="mkt-empty__sub">
              {query.trim() ? (
                <>
                  No indexed field — name, ingredient, category, or certification — matches. Results
                  require at least one matching term.
                </>
              ) : (
                'Every search field is sourced; nothing is inferred to fill a result set.'
              )}
            </p>
            <button type="button" className="btn btn--ghost" onClick={clearAll}>
              Clear search &amp; filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count" data-result-count role="status">
              {response.totalHits.toLocaleString('en-US')}{' '}
              {response.totalHits === 1 ? 'supplier' : 'suppliers'}
              {query.trim() ? (
                <>
                  {' '}
                  for <em className="serif-accent">“{query.trim()}”</em>
                </>
              ) : null}
              {' · '}
              <span className="results-count__rank">
                ranked by coverage of your terms — what the row is outweighs where it is
              </span>
            </p>

            <div className="ing-grid" data-result-list>
              {shown.map(({ supplier }) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>

            {truncated ? (
              <p className="truncated-note" data-truncated-note>
                Showing the first {shown.length} of {response.totalHits.toLocaleString('en-US')}{' '}
                results — refine your search or filters to narrow the set. Nothing is hidden by
                ranking; the count above is the full matched set.
              </p>
            ) : null}
          </>
        )}

        <p className="mkt-endnote">
          Region counts reflect the full research corpus. {withheldCount} rows are withheld pending
          verification and are not searchable.
        </p>
      </div>
    </section>
  )
}
