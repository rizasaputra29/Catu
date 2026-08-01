'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import type { Wallet, Transaction } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Calendar, Tag, Wallet as WalletIcon } from 'lucide-react';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  wallets: Wallet[];
  initialData?: Transaction | null;
}

const incomeCategories = ['Penjualan', 'Jasa', 'Pendapatan Lain'];
const expenseCategories = ['Persediaan', 'Sewa', 'Utilitas', 'Gaji', 'Transportasi', 'Pemasaran', 'Peralatan', 'Pemeliharaan', 'Pengeluaran Lain'];

export function TransactionDialog({ open, onOpenChange, onSave, wallets, initialData }: TransactionDialogProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opening
  useEffect(() => {
    if (open) {
        if (initialData) {
            // Edit Mode
            setType(initialData.type);
            setAmount(initialData.amount.toString());
            setCategory(initialData.category);
            setWalletId(initialData.walletId || (wallets[0]?.id || ''));
            setDate(new Date(initialData.date).toISOString().split('T')[0]);
            setDesc(initialData.description || '');
        } else {
            // Add Mode
            setType('expense');
            setAmount('');
            setCategory('');
            setWalletId(wallets[0]?.id || '');
            setDate(new Date().toISOString().split('T')[0]);
            setDesc('');
        }
    }
  }, [open, initialData, wallets]);

  const handleSave = async () => {
      if (!amount || !walletId || !category) return;
      
      setIsSubmitting(true);
      
      const payload = { 
        type, 
        amount: parseFloat(amount), 
        category, 
        walletId, 
        date, 
        description: desc 
      };

      await onSave(initialData ? { ...payload, id: initialData.id } : payload);
      
      setIsSubmitting(false);
      onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border rounded-2xl max-w-[calc(100%-2rem)] sm:max-w-md max-h-[90dvh] flex flex-col overflow-hidden bg-white p-0 gap-0 shadow-lg">
         <DialogHeader className="shrink-0 pt-6 px-4 sm:px-6 pb-4 border-b border-border">
          <DialogTitle className="text-2xl font-bold">
            {initialData ? 'Ubah Transaksi' : 'Transaksi Baru'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-4 sm:px-6 py-6 space-y-6">
          <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted rounded-xl p-1">
               <TabsTrigger
                    value="expense"
                    disabled={!!initialData}
                    className="rounded-lg font-semibold data-[state=active]:bg-destructive data-[state=active]:text-white transition-all duration-base ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ArrowDownRight className="w-4 h-4 mr-2" /> Pengeluaran
               </TabsTrigger>
               <TabsTrigger
                    value="income"
                    disabled={!!initialData}
                    className="rounded-lg font-semibold data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all duration-base ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Pemasukan
               </TabsTrigger>
            </TabsList>
          </Tabs>

           {/* Amount Input */}
           <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Jumlah</Label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-muted-foreground">Rp</span>
                  <Input
                    placeholder="0"
                    value={formatRupiah(parseFloat(amount || '0')).replace('Rp', '').trim()}
                    onChange={(e) => setAmount(cleanRupiah(e.target.value))}
                    className="h-16 pl-12 text-2xl font-bold rounded-2xl"
                  />
              </div>
           </div>

           {/* Details Grid */}
           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dompet</Label>
                  <Select value={walletId} onValueChange={setWalletId}>
                      <SelectTrigger className="h-12 rounded-xl font-bold transition-all duration-base ease-in-out">
                         <div className="flex items-center gap-2 overflow-hidden">
                             <WalletIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="truncate">{wallets.find(w => w.id === walletId)?.name || "Pilih Dompet"}</span>
                         </div>
                      </SelectTrigger>
                      <SelectContent position="popper">
                          {wallets.map(w => (
                            <SelectItem key={w.id} value={w.id} className="font-medium">
                                {w.name} <span className="text-xs text-muted-foreground ml-1">({formatRupiah(w.balance)})</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
               </div>
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tanggal</Label>
                    <div className="relative flex h-12 items-center rounded-xl border border-input bg-background px-3 overflow-hidden">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0 mr-2" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-full w-full min-w-0 border-0 bg-transparent p-0 font-bold shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 truncate [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        />
                    </div>
                </div>
           </div>

           <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 rounded-xl font-bold transition-all duration-base ease-in-out">
                      <div className="flex items-center gap-2">
                         <Tag className="w-4 h-4 text-muted-foreground" />
                          <SelectValue placeholder="Pilih Kategori" />
                      </div>
                  </SelectTrigger>
                  <SelectContent position="popper">
                      {(type === 'expense' ? expenseCategories : incomeCategories).map(c => (
                          <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
           </div>

           <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Catatan (Opsional)</Label>
               <Textarea
                   placeholder="Tambahkan keterangan..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="rounded-xl resize-none font-medium min-h-[80px]"
               />
           </div>
        </div>

        <DialogFooter className="shrink-0 px-4 sm:px-6 py-4 border-t border-border bg-white">
           <Button
             onClick={handleSave}
             disabled={!amount || !walletId || !category || isSubmitting}
             className="w-full h-14 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary/90 transition-all duration-base ease-in-out disabled:opacity-50"
           >
             {isSubmitting ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Simpan Transaksi')}
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}