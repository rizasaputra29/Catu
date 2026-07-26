'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { Wallet, Transaction } from '@/contexts/FinanceContext';
import { ArrowUpRight, ArrowDownRight, Calendar, Tag, Wallet as WalletIcon } from 'lucide-react';

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  wallets: Wallet[];
  initialData?: Transaction | null;
}

const incomeCategories = ['Sales', 'Service', 'Other Income'];
const expenseCategories = ['Inventory', 'Rent', 'Utilities', 'Salaries', 'Transportation', 'Marketing', 'Equipment', 'Maintenance', 'Other Expense'];

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
      <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl sm:max-w-md p-0 overflow-hidden bg-white gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-2xl font-black">
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 rounded-xl p-1 border-2 border-transparent">
               <TabsTrigger 
                    value="expense" 
                    disabled={!!initialData}
                    className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:border-2 data-[state=active]:border-red-100 data-[state=active]:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ArrowDownRight className="w-4 h-4 mr-2" /> Expense
               </TabsTrigger>
               <TabsTrigger 
                    value="income" 
                    disabled={!!initialData}
                    className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:border-2 data-[state=active]:border-green-100 data-[state=active]:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <ArrowUpRight className="w-4 h-4 mr-2" /> Income
               </TabsTrigger>
            </TabsList>
          </Tabs>

           {/* Amount Input */}
           <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Amount</Label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400">Rp</span>
                  <Input 
                    placeholder="0" 
                    value={formatRupiah(parseFloat(amount || '0')).replace('Rp', '').trim()} 
                    onChange={(e) => setAmount(cleanRupiah(e.target.value))} 
                    className="h-16 pl-12 text-2xl font-black border-2 border-black rounded-2xl focus-visible:ring-4 focus-visible:ring-black/5 transition-all"
                  />
              </div>
           </div>

           {/* Details Grid */}
           <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Wallet</Label>
                  <Select value={walletId} onValueChange={setWalletId}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl font-bold focus:border-black transition-colors bg-gray-50/30">
                         <div className="flex items-center gap-2 overflow-hidden">
                             <WalletIcon className="w-4 h-4 text-gray-400 shrink-0" />
                             <span className="truncate">{wallets.find(w => w.id === walletId)?.name || "Select"}</span>
                         </div>
                      </SelectTrigger>
                      <SelectContent>
                          {wallets.map(w => (
                            <SelectItem key={w.id} value={w.id} className="font-medium">
                                {w.name} <span className="text-xs text-gray-400 ml-1">({formatRupiah(w.balance)})</span>
                            </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Date</Label>
                  <div className="relative">
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 border-2 border-gray-200 rounded-xl font-bold pl-10 focus:border-black bg-gray-50/30" />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
               </div>
           </div>

           <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl font-bold focus:border-black transition-colors bg-gray-50/30">
                      <div className="flex items-center gap-2">
                         <Tag className="w-4 h-4 text-gray-400" />
                         <SelectValue placeholder="Select Category" />
                      </div>
                  </SelectTrigger>
                  <SelectContent>
                      {(type === 'expense' ? expenseCategories : incomeCategories).map(c => (
                          <SelectItem key={c} value={c} className="font-medium">{c}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
           </div>
           
           <div className="space-y-2">
               <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Note (Optional)</Label>
               <Textarea 
                  placeholder="Add details..." 
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)} 
                  className="border-2 border-gray-200 rounded-xl resize-none font-medium focus:border-black bg-gray-50/30 min-h-[80px]" 
               />
           </div>

           <Button 
             onClick={handleSave} 
             disabled={!amount || !walletId || !category || isSubmitting}
             className="w-full h-14 rounded-2xl bg-black text-white font-bold text-lg hover:bg-gray-900 shadow-lg hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:hover:translate-y-0 active:scale-95"
           >
             {isSubmitting ? 'Saving...' : (initialData ? 'Update Transaction' : 'Save Transaction')}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}