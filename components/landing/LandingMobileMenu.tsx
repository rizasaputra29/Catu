'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LandingMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: { label: string; href: string }[];
  activeSection?: string;
}

export function LandingMobileMenu({
  isOpen,
  onClose,
  menuItems,
  activeSection,
}: LandingMobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 z-70 h-full w-[85%] max-w-sm bg-white shadow-2xl md:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--brand-blue)]/10">
              <span className="font-sans text-xl font-semibold tracking-tight text-[var(--brand-blue)]">
                Menu
              </span>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-[var(--brand-blue)]/10 flex items-center justify-center hover:bg-[var(--brand-blue)]/20 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} className="text-[var(--brand-blue)]" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-6">
              <ul className="space-y-1">
                {menuItems.map((item, index) => {
                  const isActive = item.href === activeSection;
                  return (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'block py-4 text-2xl font-medium transition-colors border-b border-[var(--brand-blue)]/10',
                          isActive
                            ? 'text-[var(--brand-blue)]'
                            : 'text-gray-900 hover:text-[var(--brand-blue)]'
                        )}
                      >
                        {item.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Auth Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: menuItems.length * 0.05 + 0.2 }}
                className="mt-8 flex flex-col gap-3"
              >
                <Link href="/auth/login" onClick={onClose}>
                  <Button
                    variant="outline"
                    className="w-full border-[var(--brand-blue)] text-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/10 rounded-full"
                  >
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={onClose}>
                  <Button className="w-full bg-[var(--brand-lime)] text-[var(--brand-blue)] hover:bg-[var(--brand-lime)]/90 rounded-full font-semibold">
                    Daftar
                  </Button>
                </Link>
              </motion.div>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--brand-blue)]/10">
              <p className="text-sm text-[var(--brand-blue)]/60 text-center">
                &copy; 2025 CATU. Hak cipta dilindungi.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
