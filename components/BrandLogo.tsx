'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type BrandLogoSize = 'sm' | 'md' | 'lg';
type BrandLogoTheme = 'light' | 'dark';

interface BrandLogoProps {
  href?: string;
  size?: BrandLogoSize;
  theme?: BrandLogoTheme;
  className?: string;
  showSubtitle?: boolean;
}

const SIZE_CONFIG: Record<
  BrandLogoSize,
  { icon: number; padding: string; gap: string; title: string; subtitle: string }
> = {
  sm: { icon: 40, padding: 'p-0.5', gap: 'gap-2.5', title: 'text-base', subtitle: 'text-[10px]' },
  md: { icon: 56, padding: 'p-1', gap: 'gap-3', title: 'text-xl', subtitle: 'text-xs' },
  lg: { icon: 72, padding: 'p-1', gap: 'gap-3.5', title: 'text-3xl', subtitle: 'text-sm' },
};

const THEME_CONFIG: Record<BrandLogoTheme, { title: string; subtitle: string }> = {
  light: { title: 'text-foreground', subtitle: 'text-muted-foreground' },
  dark: { title: 'text-white', subtitle: 'text-white/80' },
};

export function BrandLogo({
  href,
  size = 'md',
  theme = 'light',
  className,
  showSubtitle = true,
}: BrandLogoProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const themeConfig = THEME_CONFIG[theme];

  const content = (
    <>
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-md',
          sizeConfig.padding
        )}
        style={{ width: sizeConfig.icon, height: sizeConfig.icon }}
      >
        <Image
          src="/apple-touch-icon.png"
          alt="CATU"
          width={sizeConfig.icon}
          height={sizeConfig.icon}
          className="object-contain rounded-md shadow-sm shadow-black/10 dark:shadow-black/20"
          priority={size === 'lg' || size === 'md'}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn('font-semibold tracking-tight', sizeConfig.title, themeConfig.title)}>
          CATU
        </span>
        {showSubtitle && (
          <span className={cn(sizeConfig.subtitle, themeConfig.subtitle)}>
            Catatan Keuangan
          </span>
        )}
      </div>
    </>
  );

  const wrapperClass = cn(
    'flex items-center group',
    sizeConfig.gap,
    className
  );

  if (href) {
    return (
      <Link href={href} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
