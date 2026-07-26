'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from '@/contexts/FinanceContext';
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
  'cash': <WalletIcon className="w-6 h-6 text-black/80" />,
  'bank': <Building2 className="w-6 h-6 text-black/80" />,
  'e-wallet': <CreditCard className="w-6 h-6 text-black/80" />,
};

export function WalletCarousel({ wallets }: WalletCarouselProps) {
  const router = useRouter();

  return (
    <div className="w-full">
      <Carousel
        opts={{
          align: "center", // Default: Center for mobile (single card)
          dragFree: false, // Default: Snap to card on mobile
          containScroll: 'trimSnaps',
          breakpoints: {
            '(min-width: 640px)': {
              align: "start", // Tablet/Desktop: Align start
              dragFree: true, // Tablet/Desktop: Free scroll
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
          
          {/* 1. Add New Wallet Card */}
          {/* Responsive Basis: 100% on mobile, 50% on tablet, 33% on desktop */}
          <CarouselItem className="pl-4 basis-full sm:basis-1/2 md:basis-1/3"> 
            <Button 
              variant="outline" 
              onClick={() => router.push('/wallets/new')}
              className="w-full h-full min-h-[200px] rounded-[2rem] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-black hover:bg-gray-50 transition-all group whitespace-normal bg-white shadow-sm hover:shadow-md"
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm border border-transparent group-hover:border-gray-200 transition-all">
                  <Plus className="w-7 h-7 text-gray-400 group-hover:text-black" />
              </div>
              <span className="font-bold text-gray-400 group-hover:text-black text-lg">Add New Wallet</span>
            </Button>
          </CarouselItem>

          {/* 2. Wallet List */}
          {wallets.map((wallet) => (
            <CarouselItem key={wallet.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3">
              <Card 
                  className="h-full min-h-[200px] rounded-[2rem] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform cursor-pointer relative overflow-hidden group"
                  onClick={() => router.push(`/wallets/${wallet.id}`)}
                  style={{ backgroundColor: wallet.color || '#D2F65E' }}
              >
                <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div className="flex justify-between items-start">
                      <div className="bg-white/30 backdrop-blur-sm p-3 rounded-2xl border border-black/10 shadow-sm">
                          {WalletIconMap[wallet.type] || <WalletIcon className="w-6 h-6 text-black/80" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-wider bg-black text-white px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          Manage
                      </span>
                  </div>
                  
                  <div className="space-y-1 mt-6">
                      <p className="font-bold text-black/70 text-base truncate">{wallet.name}</p>
                      <h3 className="text-4xl font-black text-black tracking-tight truncate">
                        {formatRupiah(wallet.balance)}
                      </h3>
                  </div>
                </CardContent>
                
                {/* Decorative Pattern */}
                <div className="absolute right-0 top-0 w-40 h-full bg-gradient-to-l from-white/20 to-transparent pointer-events-none" />
                <div className="absolute -right-8 -bottom-8 opacity-10 scale-125 transform group-hover:scale-110 transition-transform duration-500">
                   <WalletIcon className="w-48 h-48" />
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}