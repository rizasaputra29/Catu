'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/hooks/queries/useWallet';
import { useTransactions } from '@/hooks/queries/useTransactions';
import { useUpdateWallet, useDeleteWallet } from '@/hooks/mutations/useWalletMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { ArrowLeft, Save, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Transaction, Wallet } from '@/lib/types';

export default function WalletDetailPage() {
  const updateWallet = useUpdateWallet();
  const deleteWallet = useDeleteWallet();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;

  const { data: wallet, isLoading: isLoadingWallet } = useWallet(id, Boolean(id));
  const { data: transactionsResponse } = useTransactions({
    pageSize: 1000,
    filters: { walletId: id },
    enabled: Boolean(id),
  });
  const walletTransactions = transactionsResponse?.data ?? [];

  const [form, setForm] = useState<Omit<Wallet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>({
    name: '', type: 'cash', balance: 0, color: '#3B6CB8',
  });

  useEffect(() => {
    if (wallet) {
      setForm({ name: wallet.name, type: wallet.type, balance: wallet.balance, color: wallet.color });
    }
  }, [wallet]);

  if (isLoadingWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!wallet) return null;

  const handleSave = async () => {
    try {
      await updateWallet.mutateAsync({ id, ...form });
      toast({ title: "Berhasil", description: "Detail dompet disimpan." });
    } catch (e) {
      toast({ title: "Gagal", description: "Gagal memperbarui.", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWallet.mutateAsync(id);
      toast({ title: "Berhasil", description: "Dompet dihapus." });
      router.push('/dashboard');
    } catch (e) {
      toast({ title: "Gagal", description: "Gagal menghapus.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push('/dashboard')} className="pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Dasbor
          </Button>
        </div>

        {/* Edit Card */}
        <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card mb-8">
          <CardHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <CardTitle className="text-xl font-semibold tracking-tight">Detail Dompet</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-medium">Nama</Label>
                  <Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium">Jenis</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Tunai</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="e-wallet">Dompet Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Saldo Saat Ini</Label>
                <Input
                  value={formatRupiah(form.balance).replace('Rp', '').trim()}
                  onChange={(e) => setForm({...form, balance: parseFloat(cleanRupiah(e.target.value)) || 0})}
                  className="h-14 text-xl font-semibold"
                />
                <p className="text-xs text-muted-foreground">Menyesuaikan ini akan membuat koreksi manual.</p>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Warna Tema</Label>
                <div className="flex gap-2">
                  {['#3B6CB8', '#2A5A9E', '#D4EC4A', '#94a3b8', '#f1f5f9'].map(c => (
                    <div
                      key={c}
                      onClick={() => setForm({...form, color: c})}
                      className={`w-8 h-8 rounded-full cursor-pointer border transition-all duration-base ease-in-out ${form.color === c ? 'border-foreground scale-110' : 'border-border'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={updateWallet.isPending}
                  className="flex-1 rounded-full bg-primary text-white font-semibold h-12 hover:bg-primary/90"
                >
                  <Save className="w-4 h-4 mr-2" /> {updateWallet.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="rounded-full border-destructive text-destructive hover:bg-destructive/10 font-semibold h-12 w-12 p-0 flex items-center justify-center">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border border-border shadow-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Dompet?</AlertDialogTitle>
                      <AlertDialogDescription>Ini akan menghapus dompet dan SEMUA transaksinya. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full border-border">Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteWallet.isPending}
                        className="rounded-full bg-destructive text-white hover:bg-destructive/90"
                      >
                        {deleteWallet.isPending ? 'Menghapus...' : 'Hapus'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <h3 className="text-lg font-semibold tracking-tight mb-4">Riwayat Transaksi</h3>
        <div className="space-y-3">
          {walletTransactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">Tidak ada transaksi untuk dompet ini.</div>
          ) : (
            walletTransactions.map((t: Transaction) => (
              <div key={t.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.category}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-destructive'}`}>
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
