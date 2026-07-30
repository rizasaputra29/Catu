'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/BrandLogo';
import { LandingMobileMenu } from './LandingMobileMenu';

interface LandingNavbarProps {
  menuItems: { label: string; href: string }[];
}

export function LandingNavbar({ menuItems }: LandingNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(menuItems[0]?.href ?? '');

  const handleToggle = () => setIsMobileMenuOpen((prev) => !prev);
  const handleCloseMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      if (scrollY < 100) {
        setActiveSection('#home');
        return;
      }

      for (const item of menuItems) {
        if (!item.href.startsWith('#')) continue;
        const element = document.querySelector(item.href);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(item.href);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menuItems]);

  return (
    <>
      {/* Mobile Header: Standard (top of page) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BrandLogo href="/" theme="dark" size="md" />

            <button
              onClick={handleToggle}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-1.5 shadow-sm hover:bg-white/30 transition-colors"
              aria-label="Toggle menu"
            >
              <div className="w-5 h-[1.5px] bg-white" />
              <div className="w-5 h-[1.5px] bg-white" />
            </button>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Header: Floating Pill (scrolled) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header
            className="fixed top-4 left-0 right-0 z-50 flex justify-center md:hidden pointer-events-none"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/50 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-4">
              <BrandLogo href="/" theme="light" size="sm" />

              <div className="w-px h-5 bg-[var(--brand-blue)]/20" />

              <button
                onClick={handleToggle}
                className="w-9 h-9 bg-[var(--brand-blue)]/10 rounded-full flex flex-col items-center justify-center gap-1 hover:bg-[var(--brand-blue)]/20 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-4 h-[1.5px] bg-[var(--brand-blue)]" />
                <div className="w-4 h-[1.5px] bg-[var(--brand-blue)]" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Desktop Header: Standard (top of page) */}
      <AnimatePresence>
        {!isScrolled && (
          <motion.header
            className="fixed top-0 left-0 right-0 z-40 hidden md:flex items-center justify-between px-8 lg:px-12 py-6 bg-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BrandLogo href="/" theme="dark" size="md" />

            <nav className="flex items-center gap-8">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 hover:text-white text-sm font-medium"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[var(--brand-lime)] text-[var(--brand-blue)] hover:bg-[var(--brand-lime)]/90 rounded-full px-6 text-sm font-semibold">
                  Daftar
                </Button>
              </Link>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Desktop Header: Floating Pill (scrolled) */}
      <AnimatePresence>
        {isScrolled && (
          <motion.header
            className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-white/50 p-1.5 rounded-full shadow-lg flex items-center gap-1">
              {menuItems.map((item) => {
                const isActive = item.href === activeSection;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      'px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-[var(--brand-lime)] text-[var(--brand-blue)] shadow-sm'
                        : 'text-[var(--brand-blue)]/70 hover:text-[var(--brand-blue)]'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className="w-px h-4 bg-[var(--brand-blue)]/20 mx-1" />

              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10 hover:text-[var(--brand-blue)] rounded-full text-sm font-medium px-5 py-2.5 h-auto"
                >
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-[var(--brand-lime)] text-[var(--brand-blue)] hover:bg-[var(--brand-lime)]/90 rounded-full text-sm font-semibold px-5 py-2.5 h-auto">
                  Daftar
                </Button>
              </Link>
            </nav>
          </motion.header>
        )}
      </AnimatePresence>

      <LandingMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        menuItems={menuItems}
        activeSection={activeSection}
      />
    </>
  );
}
