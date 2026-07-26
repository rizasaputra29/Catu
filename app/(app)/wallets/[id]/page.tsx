// type: uploaded file
// fileName: rizasaputra29/cashmap/CashMap-235e6969e3543c204ba46858fea59b0be36b468d/app/(app)/wallets/[id]/page.tsx
// fullContent:
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function WalletDetailPage() {
  const { getWalletById, updateWallet, deleteWallet, transactions } = useFinance();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const [wallet, setWallet] = useState<any>(null);
  const [form, setForm] = useState({ name: '', type: 'cash', balance: '', color: '#D2F65E' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const w = getWalletById(id);
    if (w) {
        setWallet(w);
        setForm({ 
            name: w.name, 
            type: w.type, 
            balance: w.balance.toString(), 
            color: w.color 
        });
    }
  }, [id, getWalletById]);

  if (!wallet) return null;

  const walletTransactions = transactions.filter(t => t.walletId === id);

  const handleSave = async () => {
      try {
          await updateWallet(id, {
              name: form.name,
              type: form.type,
              balance: parseFloat(cleanRupiah(form.balance)),
              color: form.color
          });
          toast({ title: "Updated", description: "Wallet details saved." });
          setIsEditing(false);
          router.refresh();
      } catch(e) {
          toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
      }
  };

  const handleDelete = async () => {
      try {
          await deleteWallet(id);
          toast({ title: "Deleted", description: "Wallet removed." });
          router.push('/dashboard');
      } catch (e) {
          toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-[#D2F65E]">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-2xl">
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="pl-0 hover:bg-transparent hover:text-black/60">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
            </Button>
        </div>

        {/* Edit Card */}
        <Card className="border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] overflow-hidden bg-white mb-8">
            <CardHeader className="px-8 pt-8 pb-4 border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-2xl font-black">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold">Name</Label>
                            <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="border-2 border-black rounded-xl h-11" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold">Type</Label>
                            <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                                <SelectTrigger className="border-2 border-black rounded-xl h-11"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="e-wallet">E-Wallet</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold">Current Balance</Label>
                        <Input 
                            value={formatRupiah(parseFloat(cleanRupiah(form.balance)) || 0).replace('Rp', '').trim()} 
                            onChange={(e) => setForm({...form, balance: e.target.value})} 
                            className="border-2 border-black rounded-xl h-14 text-xl font-black" 
                        />
                         <p className="text-xs text-gray-500">Adjusting this creates a manual correction.</p>
                    </div>
                    <div className="space-y-2">
                         <Label className="font-bold">Color Theme</Label>
                         <div className="flex gap-2">
                            {['#D2F65E', '#A7C7E7', '#F49AC2', '#FFD1DC', '#E6E6FA'].map(c => (
                                <div 
                                    key={c} 
                                    onClick={() => setForm({...form, color: c})}
                                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${form.color === c ? 'border-black scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                         </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSave} className="flex-1 rounded-full bg-black text-white font-bold h-12">
                            <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="rounded-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold h-12 w-12 p-0 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-3xl border-2 border-black">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Wallet?</AlertDialogTitle>
                                    <AlertDialogDescription>This will delete the wallet and ALL its transactions. This cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-full border-2">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="rounded-full bg-red-600 text-white border-2 border-red-700">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* History */}
        <h3 className="text-xl font-black mb-4">Transaction History</h3>
        <div className="space-y-3">
             {walletTransactions.length === 0 ? (
                 <div className="p-8 text-center text-gray-400 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">No transactions found for this wallet.</div>
             ) : (
                walletTransactions.map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-2xl border-2 border-black shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-black ${t.type === 'income' ? 'bg-[#D2F65E]' : 'bg-white'}`}>
                                {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className="font-bold text-sm">{t.category}</p>
                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <span className={`font-black ${t.type === 'income' ? 'text-green-600' : 'text-black'}`}>
                             {t.type === 'income' ? '+' : '-'} {formatRupiah(t.amount)}
                         </span>
                    </div>
                ))
             )}
        </div>

      </div>
    </div>
  );
}