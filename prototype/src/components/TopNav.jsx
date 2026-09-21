import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowRightIcon } from './icons.jsx'
import { LIVE_PLATFORM_URL } from '../lib/catalog.js'

/**
 * Platform extension header — the aeko-demo shell verbatim (site-header /
 * brand__mark glow+glyph / site-nav / pill-navy CTA). Discover, Outreach and
 * Packaging keep their live-platform destinations in new tabs; the new
 * Ingredients surface is the internal NavLink beside Packaging.
 */

const PLATFORM_LINKS = [
  { href: `${LIVE_PLATFORM_URL}/`, label: 'Discover' },
  { href: `${LIVE_PLATFORM_URL}/outreach`, label: 'Outreach' },
  { href: `${LIVE_PLATFORM_URL}/marketplace`, label: 'Packaging' },
]

export default function TopNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <span className="brand__mark" aria-hidden="true">
            <span className="brand__mark-glow" />
            <span className="brand__mark-glyph">Æ</span>
          </span>
          Aekovera
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {PLATFORM_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-nav__link"
            >
              {link.label}
            </a>
          ))}
          <NavLink
            to="/ingredients"
            className={({ isActive }) =>
              `site-nav__link ${isActive ? 'site-nav__link--active' : ''}`
            }
          >
            Ingredients
          </NavLink>
        </nav>

        <div className="site-nav__actions">
          <a
            href={`${LIVE_PLATFORM_URL}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="site-nav__link"
          >
            Sign in
          </a>
          <a
            href={`${LIVE_PLATFORM_URL}/outreach`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--pill btn--navy"
          >
            Book a demo
            <ArrowRightIcon size={16} className="btn__arrow" />
          </a>
        </div>
      </div>
    </header>
  )
}
