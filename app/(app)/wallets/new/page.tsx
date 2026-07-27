'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateWallet } from '@/hooks/mutations/useWalletMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewWalletPage() {
  const createWallet = useCreateWallet();
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: '', type: 'cash', balance: '', color: '#0000ee' });

  const handleSave = async () => {
    if (!form.name) return toast({ title: "Error", description: "Name is required", variant: "destructive" });

    try {
      await createWallet.mutateAsync({
        name: form.name,
        type: form.type,
        balance: parseFloat(cleanRupiah(form.balance)) || 0,
        color: form.color,
      });
      toast({ title: "Success", description: "Wallet created!" });
      router.push('/dashboard');
    } catch (e) {
      toast({ title: "Error", description: "Failed to create.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-black">
          <ArrowLeft className="w-5 h-5 mr-2" /> Cancel
        </Button>

        <Card className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
          <CardHeader className="px-8 pt-8 pb-4 border-b border-border">
            <CardTitle className="text-2xl font-semibold tracking-tight">New Wallet</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">Wallet Name</Label>
              <Input placeholder="e.g. Main Bank, Secret Stash" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="h-12" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
                <Input
                  placeholder="0"
                  value={formatRupiah(parseFloat(cleanRupiah(form.balance)) || 0).replace('Rp', '').trim()}
                  onChange={(e) => setForm({...form, balance: e.target.value})}
                  className="h-14 pl-12 text-xl font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold">Color Theme</Label>
              <div className="flex gap-3">
                {['#0000ee', '#3b82f6', '#6366f1', '#94a3b8', '#f1f5f9'].map(c => (
                  <div
                    key={c}
                    onClick={() => setForm({...form, color: c})}
                    className={`w-10 h-10 rounded-full cursor-pointer border transition-transform duration-base ease-in-out ${form.color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={createWallet.isPending}
              className="w-full rounded-pill bg-primary text-white font-bold h-14 text-lg mt-4 hover:bg-primary/90 transition-all duration-base ease-in-out"
            >
              {createWallet.isPending ? 'Creating...' : 'Create Wallet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
