'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const BRAND = {
  blue: '#3B6CB8',
  darkBlue: '#2A5A9E',
  lime: '#D4EC4A',
} as const;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState(''); 
  const [isSendingReset, setIsSendingReset] = useState(false);

  const { login, forgotPassword } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast({ title: 'Berhasil masuk', description: 'Selamat datang kembali di CATU!' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Gagal masuk', description: 'Email atau kata sandi salah', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        toast({ title: 'Kesalahan', description: 'Kata sandi baru minimal 6 karakter.', variant: 'destructive' });
        return;
    }
    setIsSendingReset(true);
    const success = await forgotPassword(forgotEmail, forgotSecurityAnswer, newPassword);
    if (success) {
      toast({ title: 'Berhasil', description: 'Reset kata sandi berhasil. Silakan masuk.' });
      setIsForgotOpen(false);
    } else {
      toast({ title: 'Reset gagal', description: 'Verifikasi gagal. Periksa kembali data Anda.', variant: 'destructive' });
    }
    setIsSendingReset(false);
  };

  const slideVariant: Variants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const formVariant: Variants = {
    initial: { x: "-100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-white p-4 lg:p-8 font-sans selection:bg-[var(--brand-blue)] selection:text-white"
      style={{ '--brand-blue': BRAND.blue, '--brand-dark-blue': BRAND.darkBlue, '--brand-lime': BRAND.lime } as React.CSSProperties}
    >
      <div className="w-full max-w-5xl grid lg:grid-cols-2 border border-border bg-white rounded-2xl overflow-hidden shadow-lg lg:h-[700px]">
        
        {/* LEFT SIDE: DARK VISUAL PANEL */}
        <motion.div 
          className="relative hidden lg:flex flex-col justify-between bg-[var(--brand-dark-blue)] text-white p-12 border-r border-border h-full z-20"
          variants={slideVariant}
          initial="initial"
          animate="animate"
        >
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="white" strokeWidth="0.5" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="relative z-10">
             <BrandLogo href="/" size="md" theme="dark" />
             <div className="mt-12">
                 <h2 className="text-4xl font-semibold tracking-tight mb-4">Selamat Datang Kembali!</h2>
                 <p className="text-base font-normal opacity-90 max-w-xs leading-relaxed">
                    Lanjutkan perjalanan menuju <span className="text-[var(--brand-lime)]">kebebasan finansial</span>. Dasbor Anda menunggu.
                 </p>
             </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <motion.div 
            className="p-8 md:p-16 flex flex-col justify-center h-full relative bg-white overflow-hidden"
            variants={formVariant}
            initial="initial"
            animate="animate"
        >
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-5 lg:hidden">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="currentColor" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="absolute top-6 left-6 z-30">
            <Link href="/" className="flex items-center justify-center w-8 h-8 bg-white rounded-full border border-border hover:bg-muted transition-all duration-base ease-in-out">
               <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
          </div>

           <div className="lg:hidden flex justify-center mb-4 relative z-10 mt-12">
             <BrandLogo href="/" size="md" theme="light" />
           </div>

          <div className="max-w-sm mx-auto w-full relative z-10">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Masuk</h1>
              <p className="text-muted-foreground font-normal">Masukkan detail Anda untuk mengakses akun</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 focus-visible:ring-[var(--brand-blue)]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Kata Sandi</Label>
                    <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                        <DialogTrigger asChild>
                            <button type="button" className="text-xs font-medium text-[var(--brand-blue)] hover:text-[var(--brand-dark-blue)] hover:underline underline-offset-2">
                                Lupa Kata Sandi?
                            </button>
                        </DialogTrigger>
                        <DialogContent className="border border-border rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold tracking-tight">Reset Kata Sandi</DialogTitle>
                                <DialogDescription>Verifikasi identitas Anda untuk mengatur ulang akses.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="h-12 focus-visible:ring-[var(--brand-blue)]" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nama Ibu Kandung</Label>
                                    <Input type="text" value={forgotSecurityAnswer} onChange={(e) => setForgotSecurityAnswer(e.target.value)} required className="h-12 focus-visible:ring-[var(--brand-blue)]" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kata Sandi Baru</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-12 focus-visible:ring-[var(--brand-blue)]" />
                                </div>
                                <Button type="submit" disabled={isSendingReset} className="w-full h-12 rounded-pill bg-[var(--brand-lime)] text-[var(--brand-dark-blue)] hover:bg-[var(--brand-lime)]/90 transition-all duration-base ease-in-out">
                                    {isSendingReset ? 'Mereset...' : 'Konfirmasi Reset'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 focus-visible:ring-[var(--brand-blue)]"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-medium rounded-pill bg-[var(--brand-lime)] text-[var(--brand-dark-blue)] hover:bg-[var(--brand-lime)]/90 transition-all duration-base ease-in-out"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground font-normal">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="font-medium text-[var(--brand-blue)] hover:text-[var(--brand-dark-blue)] hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Daftar
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
