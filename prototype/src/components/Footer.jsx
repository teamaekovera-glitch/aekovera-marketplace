// Footer note differs from the aeko-demo demo-data disclaimer: this surface
// renders the real researched catalog, so the honest framing is provenance,
// not fiction.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">
          <span className="brand__mark brand__mark--sm" aria-hidden="true">
            <span className="brand__mark-glow" />
            <span className="brand__mark-glyph">Æ</span>
          </span>
          Aekovera
        </span>
        <span className="site-footer__note">
          Ingredients prototype · real researched catalog · every fact links to the page it was
          read from — prices are dated snapshots, not live quotes
        </span>
        <span className="site-footer__copy">© 2026 Aekovera</span>
      </div>
    </footer>
  )
}
