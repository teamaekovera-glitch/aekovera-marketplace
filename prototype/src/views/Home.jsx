/**
 * / — the Aekovera platform shell with the exact live nav plus the new
 * Ingredients surface beside Packaging (in TopNav). The hero presents the
 * ingredient-supplier finder with the catalog's real counts — 268 rows
 * researched, 258 listed, 10 withheld — computed from the dataset, never
 * hardcoded. Every platform link keeps its live destination in a new tab.
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  datasetTotal,
  ingredientSuggestions,
  listedCount,
  regionMeta,
  withheldCount,
} from '../lib/catalog.js'
import { ArrowRightIcon, SearchIcon, ShieldCheckIcon } from '../components/icons.jsx'

export default function Home() {
  const [brief, setBrief] = useState('')
  const navigate = useNavigate()

  const search = () => {
    const q = brief.trim()
    navigate(q ? `/ingredients?q=${encodeURIComponent(q)}` : '/ingredients')
  }

  return (
    <section className="hero">
      <div className="hero__texture bg-grid mask-radial" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__content">
          <p className="eyebrow eyebrow--center">
            <span className="eyebrow__dash" /> Aekovera · Ingredient sourcing
          </p>
          <h1 className="hero__title">
            Ingredient suppliers,
            <br />
            <em className="serif-accent">with the receipts.</em>
          </h1>
          <p className="hero__lead">
            Where CPG brands find ingredient suppliers — provenance first.
          </p>
          <p className="hero__sub">
            A researched catalog of ingredient manufacturers, growers, exporters, traders, and
            e-commerce sellers across six regions. Every fact links to the page it was read from,
            with the date it was read — anything without a source stays Unknown.
          </p>

          <div className="hero__form">
            <form
              className="brief-form"
              onSubmit={(e) => {
                e.preventDefault()
                search()
              }}
            >
              <div className="brief-bar">
                <SearchIcon size={20} className="brief-bar__spark" />
                <input
                  aria-label="Search ingredient suppliers"
                  placeholder="Search ingredients — e.g. coconut, citric acid, xanthan gum…"
                  className="brief-bar__input"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                />
                <button type="submit" className="btn btn--navy btn--submit">
                  <span className="btn__submit-label">Search</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            </form>
            <p className="hero__form-note">
              Instant search over the full catalog — ranking is deterministic, and every result
              carries its own evidence.
            </p>
            <div className="hero__chips" role="list" aria-label="Example searches">
              <span className="hero__chips-label">Try</span>
              {ingredientSuggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  role="listitem"
                  className={`chip ${i === 0 ? 'chip--accent' : ''}`}
                  onClick={() => navigate(`/ingredients?q=${encodeURIComponent(s)}`)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="ing-hero__strip-row">
            <div className="mkt-strip" role="status">
              <span className="dot dot--success" />
              <span>
                <strong>{datasetTotal}</strong> suppliers researched
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>{listedCount}</strong> listed
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>{withheldCount}</strong> withheld pending verification
              </span>
              <span className="badge-brand">
                <ShieldCheckIcon size={11} /> Claim-level provenance
              </span>
            </div>
          </div>

          <div className="ing-hero__regions">
            <p className="hero__chips-label">Research corpus by region</p>
            <div className="ing-hero__region-row">
              {regionMeta.map((r) => (
                <Link
                  key={r.regionId}
                  className="chip"
                  to={`/ingredients?region=${encodeURIComponent(r.region)}`}
                  title={`Research corpus retrieved ${r.retrieved}`}
                >
                  {r.region} <span className="mkt-chip__count">{r.suppliers}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
