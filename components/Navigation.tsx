'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BrandLogo } from './BrandLogo';
import { LayoutDashboard, TrendingUp, LogOut, BarChart3 } from 'lucide-react';

// --- Nav Items ---
const navItems = [
  { href: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: TrendingUp },
  { href: '/annual-recap', label: 'Rekap', icon: BarChart3 },
];

/**
 * =======================
 * Desktop Navigation
 * =======================
 */
function DesktopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
    <nav className="hidden lg:flex border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between h-16 items-center">
          
          {/* Left: Logo & Links */}
          <div className="flex items-center gap-8">
            
            {/* Logo */}
            <BrandLogo href="/dashboard" size="sm" theme="light" />

            {/* Navigation Links */}
            <div className="flex gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-base ease-in-out
                      ${isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Profile & Logout */}
          <div className="flex items-center gap-3">
              <Link href="/profile">
              <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-muted transition-all duration-base ease-in-out cursor-pointer group">
                <span className="text-sm font-medium hidden xl:block text-muted-foreground group-hover:text-foreground">
                    {user?.fullName.split(' ')[0]}
                </span>
                <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                    </AvatarFallback>
                </Avatar>
              </div>
            </Link>
            
            <Button
              onClick={logout}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-base ease-in-out w-10 h-10"
              title="Keluar"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          
        </div>
      </div>
    </nav>
  );
}

/**
 * =======================
 * Mobile Navigation
 * =======================
 */
function BottomNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-border bg-white/90 backdrop-blur-md lg:hidden pb-safe">
      <div className="grid h-16 grid-cols-5 items-center justify-around px-2 gap-1">
        
        {/* Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center h-full w-full"
            >
              <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-base ease-in-out
                ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex flex-col items-center justify-center h-full w-full"
        >
           <div className={`
                flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-base ease-in-out
                ${pathname.startsWith('/profile') 
                  ? 'bg-primary p-1' 
                  : 'p-1 hover:bg-muted'}
              `}>
            <Avatar className={`h-8 w-8 border ${pathname.startsWith('/profile') ? 'border-primary-foreground' : 'border-border'}`}>
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {userInitials}
                </AvatarFallback>
            </Avatar>
          </div>
        </Link>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logout()}
          className="flex flex-col items-center justify-center h-full w-full"
        >
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-base ease-in-out">
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </div>
        </button>

      </div>
    </nav>
  );
}

export function Navigation() {
  return (
    <>
      <DesktopNav />
      <BottomNav />
    </>
  );
}
