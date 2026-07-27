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
      toast({ title: 'Login successful', description: 'Welcome back to CATU!' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Login failed', description: 'Invalid email or password', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        toast({ title: 'Error', description: 'New password must be at least 6 characters long.', variant: 'destructive' });
        return;
    }
    setIsSendingReset(true);
    const success = await forgotPassword(forgotEmail, forgotSecurityAnswer, newPassword);
    if (success) {
      toast({ title: 'Success', description: 'Password reset successfully. Please login.' });
      setIsForgotOpen(false);
    } else {
      toast({ title: 'Reset Failed', description: 'Verification failed. Check your details.', variant: 'destructive' });
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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 lg:p-8 font-sans selection:bg-primary selection:text-white">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 border border-border bg-white rounded-2xl overflow-hidden shadow-lg lg:h-[700px]">
        
        {/* LEFT SIDE: DARK VISUAL PANEL */}
        <motion.div 
          className="relative hidden lg:flex flex-col justify-between bg-primary text-white p-12 border-r border-border h-full z-20"
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
                <h2 className="text-4xl font-semibold tracking-tight mb-4">Welcome Back!</h2>
                <p className="text-base font-normal opacity-90 max-w-xs leading-relaxed">
                  Continue your journey to financial freedom. Your dashboard is waiting.
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
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Login</h1>
              <p className="text-muted-foreground font-normal">Enter your details to access your account</p>
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
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
                        <DialogTrigger asChild>
                            <button type="button" className="text-xs font-medium text-primary hover:underline underline-offset-2">
                                Forgot Password?
                            </button>
                        </DialogTrigger>
                        <DialogContent className="border border-border rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold tracking-tight">Reset Password</DialogTitle>
                                <DialogDescription>Verify your identity to reset access.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mother&apos;s Maiden Name</Label>
                                    <Input type="text" value={forgotSecurityAnswer} onChange={(e) => setForgotSecurityAnswer(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-12" />
                                </div>
                                <Button type="submit" disabled={isSendingReset} className="w-full h-12 rounded-pill bg-primary text-white hover:bg-primary/90 transition-all duration-base ease-in-out">
                                    {isSendingReset ? 'Resetting...' : 'Confirm Reset'}
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
                  className="h-12"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-medium rounded-pill bg-primary text-white hover:bg-primary/90 transition-all duration-base ease-in-out"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground font-normal">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="font-medium text-primary hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
