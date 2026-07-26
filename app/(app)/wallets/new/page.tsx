// type: uploaded file
// fileName: rizasaputra29/cashmap/CashMap-235e6969e3543c204ba46858fea59b0be36b468d/app/(app)/wallets/new/page.tsx
// fullContent:
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewWalletPage() {
  const { addWallet } = useFinance();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', type: 'cash', balance: '', color: '#D2F65E' });

  const handleSave = async () => {
      if (!form.name) return toast({ title: "Error", description: "Name is required", variant: "destructive" });
      
      try {
          await addWallet({
              name: form.name,
              type: form.type,
              balance: parseFloat(cleanRupiah(form.balance)) || 0,
              color: form.color
          });
          toast({ title: "Success", description: "Wallet created!" });
          router.push('/dashboard');
      } catch(e) {
          toast({ title: "Error", description: "Failed to create.", variant: "destructive" });
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-xl">
         <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent">
             <ArrowLeft className="w-5 h-5 mr-2" /> Cancel
         </Button>

         <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-100">
                <CardTitle className="text-3xl font-black">New Wallet</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
                 <div className="space-y-2">
                    <Label className="font-bold">Wallet Name</Label>
                    <Input placeholder="e.g. Main Bank, Secret Stash" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="border-2 border-black rounded-xl h-12" />
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold">Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                        <SelectTrigger className="border-2 border-black rounded-xl h-12"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank">Bank Account</SelectItem>
                            <SelectItem value="e-wallet">E-Wallet</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>

                 <div className="space-y-2">
                    <Label className="font-bold">Initial Balance</Label>
                    <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                         <Input 
                            placeholder="0"
                            value={formatRupiah(parseFloat(cleanRupiah(form.balance)) || 0).replace('Rp', '').trim()} 
                            onChange={(e) => setForm({...form, balance: e.target.value})} 
                            className="border-2 border-black rounded-xl h-14 pl-12 text-xl font-black" 
                         />
                    </div>
                 </div>

                 <div className="space-y-2">
                         <Label className="font-bold">Color Theme</Label>
                         <div className="flex gap-3">
                            {['#D2F65E', '#A7C7E7', '#F49AC2', '#FFD1DC', '#E6E6FA'].map(c => (
                                <div 
                                    key={c} 
                                    onClick={() => setForm({...form, color: c})}
                                    className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-transform ${form.color === c ? 'border-black scale-110' : 'border-transparent hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                         </div>
                 </div>

                 <Button onClick={handleSave} className="w-full rounded-full bg-black text-white font-bold h-14 text-lg mt-4 shadow-lg hover:translate-y-[-2px] transition-all">
                     Create Wallet
                 </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}