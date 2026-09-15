'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
}

interface HeaderProps {
  siteTitle?: string;
  siteTagline?: string;
  siteLogo?: string;
  showAds?: boolean;
  menuItems?: MenuItem[];
}

// Default fallback menu (used only if settings not available)
const DEFAULT_MENU: MenuItem[] = [
  { title: 'Home', url: '/' },
  { title: 'Notification', url: '/notification' },
  { title: 'Answer Key', url: '/answer-key' },
  { title: 'Admit Card', url: '/admit-card' },
  { title: 'Result', url: '/result' },
  { title: 'Syllabus', url: '/syllabus' },
];

export default function Header({
  siteTitle = 'RRB Group D Answer Key',
  siteTagline = 'Notification,Answer key,Result',
  siteLogo = 'https://rrbgroupdanswerkey.rusikakisku.workers.dev/uploads/logo_1784561384_6a5e3ee8e7bad.png',
  showAds = false,
  menuItems,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Use settings-driven menu or fallback to defaults
  const navItems = menuItems && menuItems.length > 0 ? menuItems : DEFAULT_MENU;

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!mounted) return;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, mounted]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">

          {/* Site Branding */}
          <div className="site-branding-container" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
            {siteLogo && (
              <Link href="/" className="logo-link" style={{ display: 'inline-block', textDecoration: 'none' }}>
                <img
                  src={siteLogo}
                  alt={siteTitle}
                  className="site-logo-img"
                  style={{ maxHeight: '48px', width: 'auto', display: 'block' }}
                />
              </Link>
            )}
            <div className="site-branding-text" style={{ display: 'flex', flexDirection: 'column' }}>
              {pathname === '/' ? (
                <h1 className="site-title">
                  <Link href="/" rel="home" style={siteLogo ? { gap: 0 } : undefined}>
                    {siteTitle}
                  </Link>
                </h1>
              ) : (
                <span className="site-title">
                  <Link href="/" rel="home" style={siteLogo ? { gap: 0 } : undefined}>
                    {siteTitle}
                  </Link>
                </span>
              )}
              <span className="site-tagline">{siteTagline}</span>
            </div>
          </div>

          {/* Main Navigation (Desktop) */}
          <nav className="main-navigation">
            <ul className="nav-menu" id="nav-menu">
              {navItems.map((item) => {
                const isActive =
                  item.url === '/'
                    ? pathname === '/'
                    : pathname.toLowerCase().startsWith(item.url.toLowerCase());
                return (
                  <li key={item.title} className="nav-item">
                    <Link
                      href={item.url}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Toggle Button */}
          <div className="header-gadgets">
            <button
              className="hm-mobile-menu-toggle"
              id="nav-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen
                ? <X style={{ width: '24px', height: '24px', color: '#ffffff' }} />
                : <Menu style={{ width: '24px', height: '24px', color: '#ffffff' }} />
              }
            </button>
          </div>

        </div>
      </header>

      {/* Ad Strip 728x90 (Only rendered if showAds is true) */}
      {showAds && (
        <div className="ad-strip">
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="ad-card-728">
              <div className="ad-title">Google AdSense</div>
              <div className="ad-size">728x90</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      <div
        className={`hm-overlay-mask${mobileOpen ? ' active' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer Sidebar */}
      <div className={`hm-mobile-sidebar${mobileOpen ? ' active' : ''}`} role="dialog" aria-label="Navigation menu">
        <div className="hm-mobile-sidebar-header">
          <div className="hm-mobile-sidebar-brand">
            {siteLogo && (
              <img src={siteLogo} alt={siteTitle} style={{ height: '36px', width: 'auto' }} />
            )}
            <span className="hm-mobile-sidebar-title">{siteTitle}</span>
          </div>
          <button
            className="hm-mobile-sidebar-close"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
        <ul className="hm-mobile-sidebar-menu">
          {navItems.map((item) => {
            const isActive =
              item.url === '/'
                ? pathname === '/'
                : pathname.toLowerCase().startsWith(item.url.toLowerCase());
            return (
              <li key={item.title}>
                <Link
                  href={item.url}
                  className={isActive ? 'active' : ''}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
