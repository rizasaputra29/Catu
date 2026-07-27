'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Wallet } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/utils';
import { CreditCard, Wallet as WalletIcon, Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

interface WalletCarouselProps {
  wallets: Wallet[];
}

const WalletIconMap: Record<string, React.ReactNode> = {
  'cash': <WalletIcon className="w-6 h-6 text-primary" />,
  'bank': <Building2 className="w-6 h-6 text-primary" />,
  'e-wallet': <CreditCard className="w-6 h-6 text-primary" />,
};

export function WalletCarousel({ wallets }: WalletCarouselProps) {
  const router = useRouter();

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "center",
          dragFree: false,
          containScroll: 'trimSnaps',
          breakpoints: {
            '(min-width: 640px)': {
              align: "start",
              dragFree: true,
            }
          }
        }}
        plugins={[
          WheelGesturesPlugin({
             forceWheelAxis: 'x',
          })
        ]}
        className="w-full select-none"
      >
        <CarouselContent className="-ml-4 py-6 px-1 md:px-2">

          {/* Add New Wallet Card */}
          <CarouselItem className="pl-4 basis-full sm:basis-1/2 md:basis-1/3">
            <Button
              variant="outline"
              onClick={() => router.push('/wallets/new')}
              className="w-full h-full min-h-[200px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-muted/50 transition-all duration-base ease-in-out group whitespace-normal bg-white"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center group-hover:bg-white transition-all duration-base ease-in-out">
                  <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary" />
              </div>
              <span className="font-medium text-muted-foreground group-hover:text-foreground text-lg">Add New Wallet</span>
            </Button>
          </CarouselItem>

          {/* Wallet List */}
          {wallets.map((wallet) => (
            <CarouselItem key={wallet.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3">
              <Card
                  className="h-full min-h-[200px] rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-base ease-in-out cursor-pointer relative overflow-hidden group bg-white"
                  onClick={() => router.push(`/wallets/${wallet.id}`)}
              >
                <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                          {WalletIconMap[wallet.type] || <WalletIcon className="w-6 h-6 text-primary" />}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider bg-primary text-white px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-base ease-in-out">
                          Manage
                      </span>
                  </div>

                  <div className="space-y-1 mt-6">
                      <p className="font-medium text-muted-foreground text-base truncate">{wallet.name}</p>
                      <h3 className="text-3xl font-semibold text-foreground tracking-tight truncate">
                        {formatRupiah(wallet.balance)}
                      </h3>
                  </div>
                </CardContent>

                {/* Subtle decorative accent */}
                <div
                  className="absolute right-0 top-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"
                  style={{ backgroundColor: wallet.color || 'hsl(var(--primary))' }}
                />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
