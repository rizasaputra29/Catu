'use client';

import { useState, useEffect } from 'react';
import { useTransaction } from '@/hooks/queries/useTransaction';
import {
  useUpdateTransaction,
  useDeleteTransaction,
} from '@/hooks/mutations/useTransactionMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { formatRupiah, cleanRupiah } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save, Calendar, Tag, FileText } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Transaction } from '@/lib/types';

const incomeCategories = ['Sales', 'Service', 'Other Income'];
const expenseCategories = ['Inventory', 'Rent', 'Utilities', 'Salaries', 'Transportation', 'Marketing', 'Equipment', 'Maintenance', 'Other Expense'];

type TransactionForm = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'wallet' | 'description'> & {
  description: string;
};

export default function TransactionDetailPage() {
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: transaction, isLoading: isLoadingTransaction } = useTransaction(id, Boolean(id));

  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    type: 'expense',
    amount: 0,
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    walletId: '',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (transaction) {
      setTransactionForm({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || '',
        date: transaction.date.split('T')[0],
        walletId: transaction.walletId || '',
      });
      setIsInitialized(true);
    }
  }, [transaction]);

  useEffect(() => {
    if (!isLoadingTransaction && !transaction && isInitialized === false && id) {
      toast({ title: 'Error', description: 'Transaction not found', variant: 'destructive' });
      router.push('/transactions');
    }
  }, [isLoadingTransaction, transaction, isInitialized, id, router, toast]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanRupiah(e.target.value);
    setTransactionForm({ ...transactionForm, amount: parseFloat(cleanedValue || '0') });
  };

  const handleSaveTransaction = async () => {
    if (!transactionForm.amount || !transactionForm.category || !transactionForm.walletId) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      await updateTransaction.mutateAsync({ ...transactionForm, id });
      toast({ title: 'Success', description: 'Transaction updated successfully' });
      router.push('/transactions');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update transaction.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(id);
      toast({ title: 'Success', description: 'Transaction deleted' });
      router.push('/transactions');
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete transaction.', variant: 'destructive' });
    }
  };

  if (isLoadingTransaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/transactions" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-base ease-in-out">
            <ArrowLeft className="w-4 h-4" /> Back to Transactions
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground mt-4">Edit Transaction</h1>
        </div>

        <Card className="border border-border rounded-2xl overflow-hidden bg-white shadow-sm">
          <CardHeader className="px-8 pt-8 pb-2">
            <CardTitle className="text-lg font-semibold">Details</CardTitle>
            <CardDescription>Modify transaction information.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <Tabs value={transactionForm.type} onValueChange={(value) => setTransactionForm({ ...transactionForm, type: value as 'income' | 'expense' })}>
              <TabsList className="grid w-full grid-cols-2 border border-border rounded-xl p-1 h-auto bg-muted mb-6">
                <TabsTrigger value="expense" disabled className="rounded-lg font-medium data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm py-2 disabled:opacity-50 transition-all duration-base ease-in-out">Expense</TabsTrigger>
                <TabsTrigger value="income" disabled className="rounded-lg font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm py-2 disabled:opacity-50 transition-all duration-base ease-in-out">Income</TabsTrigger>
              </TabsList>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="font-medium text-foreground">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">Rp</span>
                    <Input
                      type="text"
                      value={formatRupiah(transactionForm.amount).replace('Rp', '').trim()}
                      onChange={handleAmountChange}
                      className="h-14 border border-border rounded-xl pl-12 text-right text-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="font-medium text-foreground flex items-center gap-2"><Tag className="w-4 h-4" /> Category</Label>
                    <Select value={transactionForm.category} onValueChange={(v) => setTransactionForm({ ...transactionForm, category: v })}>
                      <SelectTrigger className="h-12 rounded-xl font-medium">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {(transactionForm.type === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</Label>
                    <Input type="date" value={transactionForm.date} onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})} className="h-12 rounded-xl font-medium" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Description</Label>
                  <Textarea
                    placeholder="Add notes..."
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                    className="rounded-xl min-h-[100px] resize-none p-4"
                  />
                </div>
              </div>
            </Tabs>

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-8 mt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto h-12 rounded-pill border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive font-medium transition-all duration-base ease-in-out">
                    <Trash2 className="w-5 h-5 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="border border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold">Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This transaction will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-pill font-medium border border-border">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteTransaction.isPending}
                      className="rounded-pill font-medium bg-destructive text-white hover:bg-destructive/90 border-0"
                    >
                      Delete Transaction
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                onClick={handleSaveTransaction}
                disabled={updateTransaction.isPending}
                className="flex-1 h-12 rounded-pill bg-primary text-white font-medium text-lg hover:bg-primary/90 transition-all duration-base ease-in-out"
              >
                <Save className="w-5 h-5 mr-2" /> {updateTransaction.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
