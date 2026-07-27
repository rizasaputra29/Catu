'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await register(email, password, fullName, securityAnswer);

    if (success) {
      toast({ title: 'Registration successful', description: 'Account created! Redirecting...' });
      router.push('/dashboard');
    } else {
      toast({ title: 'Registration failed', description: 'Email already exists', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const slideVariant: Variants = {
    initial: { x: "-100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  const formVariant: Variants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { duration: 0.5, ease: "easeInOut" } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 lg:p-8 font-sans selection:bg-primary selection:text-white">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 border border-border bg-white rounded-2xl overflow-hidden shadow-lg lg:h-[700px]">
        
        {/* LEFT SIDE: REGISTER FORM */}
        <motion.div 
            className="p-8 md:p-16 flex flex-col justify-center h-full order-2 lg:order-1 relative bg-white overflow-hidden"
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
            <div className="text-center lg:text-left mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">Create Account</h1>
              <p className="text-muted-foreground font-normal">Start tracking your finances today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Security: Mother&apos;s Maiden Name</Label>
                <Input
                  id="securityAnswer"
                  type="text"
                  placeholder="For password recovery"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 mt-4 text-lg font-medium rounded-pill bg-primary text-white hover:bg-primary/90 transition-all duration-base ease-in-out"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground font-normal">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary hover:underline underline-offset-4 inline-flex items-center gap-1">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: DARK VISUAL PANEL */}
        <motion.div 
          className="relative hidden lg:flex flex-col justify-between bg-primary text-white p-12 border-l border-border h-full order-1 lg:order-2"
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

             <div className="relative z-10 text-right">
              <div className="flex items-center justify-end">
                <BrandLogo href="/" size="md" theme="dark" />
              </div>
             <div className="mt-12">
                <h2 className="text-4xl font-semibold tracking-tight mb-4">Join the Club</h2>
                <p className="text-base font-normal opacity-90 ml-auto max-w-xs leading-relaxed">
                  Take control of your financial future with the smartest tracking tool.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
