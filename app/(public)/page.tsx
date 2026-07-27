'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import LogoLoop from '@/components/ui/logo-loop';
import { BrandLogo } from '@/components/BrandLogo';
import { 
  ArrowRight, 
  Wallet, 
  BookOpen, 
  BarChart3, 
  TrendingUp,
  Github,
  Linkedin,
  Instagram
} from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "easeInOut" } 
    }
  };

  const stagger: Variants = {
    visible: { transition: { staggerChildren: 0.05 } }
  };

  const techStackLogos = [
    { src: "https://cdn.worldvectorlogo.com/logos/next-js.svg", alt: "Next.js", title: "Next.js", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", alt: "React", title: "React", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg", alt: "TypeScript", title: "TypeScript", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg", alt: "Tailwind CSS", title: "Tailwind CSS", width: 100, height: 40 },
    { src: "https://cdn.worldvectorlogo.com/logos/prisma-3.svg", alt: "Prisma", title: "Prisma", width: 100, height: 40 },
    { src: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg", alt: "PostgreSQL", title: "PostgreSQL", width: 100, height: 40 },
    { src: "https://lucide.dev/library-logos/shadcn-ui-dark.svg", alt: "Shadcn UI", title: "Shadcn UI", width: 100, height: 40 },
    { src: "https://cdn.worldvectorlogo.com/logos/framer-motion.svg", alt: "Framer Motion", title: "Framer Motion", width: 100, height: 40 },
  ];

  return (
    <main className="min-h-screen bg-white text-foreground overflow-x-hidden font-sans selection:bg-primary selection:text-white">
      
      {/* HERO SECTION */}
      <section className="pt-12 pb-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto bg-gradient-to-br from-[#f4f6ff] to-white rounded-2xl p-8 md:p-16 relative overflow-hidden min-h-[600px] flex flex-col justify-center border border-border shadow-sm"
        >
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M80 0 Q 50 50 80 100" stroke="currentColor" strokeWidth="0.3" className="text-primary" fill="none" />
              <path d="M90 0 Q 60 50 90 100" stroke="currentColor" strokeWidth="0.3" className="text-primary" fill="none" />
            </svg>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 relative z-20">
               <BrandLogo href="/" size="lg" theme="light" />
              
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
                  Master your <br/>
                  <span className="italic font-serif font-normal">money</span> flow.
                </h1>
                <p className="text-base font-normal max-w-md text-muted-foreground leading-relaxed">
                  Track income and expenses, run your cash book, and view annual performance. All in one clean, clutter-free dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/auth/register">
                  <Button className="h-14 px-8 rounded-pill bg-primary text-primary-foreground text-lg font-medium hover:bg-primary/90 shadow-sm transition-all duration-base ease-in-out">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="h-14 px-8 rounded-pill text-lg font-medium transition-all duration-base ease-in-out">
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block h-[600px] w-full">
              <motion.div 
                initial={{ y: -50, opacity: 0, rotate: 6, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, rotate: 12, scale: 0.9 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
                className="absolute top-4 right-4 w-[300px] z-10"
              >
                 <Image
                   src="/landing-mockup.png"
                   alt="CATU Mobile Landing"
                   width={600}
                   height={850}
                   className="w-full h-auto object-cover rounded-xl opacity-90 hover:opacity-100 transition-opacity duration-base ease-in-out"
                   priority
                 />
              </motion.div>

              <motion.div 
                initial={{ y: 100, opacity: 0, rotate: -5 }}
                animate={{ y: 40, opacity: 1, rotate: -6 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                className="absolute top-10 left-10 w-[320px] z-20"
              >
                 <Image
                   src="/dashboard-mockup.png"
                   alt="CATU Dashboard"
                   width={620}
                   height={790}
                   className="w-full h-auto object-cover rounded-xl"
                   priority
                 />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* TECH STACK LOGO LOOP */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-12">Powered By Modern Tech Stack</p>
          
          <div className="w-full overflow-hidden grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-base ease-in-out">
            <LogoLoop 
              logos={techStackLogos} 
              speed={60} 
              direction="left"
              logoHeight={40}
              gap={40}
              pauseOnHover={true}
              scaleOnHover={true}
              fadeOut={true}
              fadeOutColor="#ffffff"
              ariaLabel="Tech Stack Logos"
            />
          </div>
        </div>
      </section>

      {/* FEATURE HIGHLIGHT (DARK CARD) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-8 items-center"
          >
            <div className="bg-[#111] text-white rounded-2xl p-8 md:p-12 relative overflow-hidden min-h-[450px] flex flex-col justify-between shadow-lg">
               <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 400">
                    <path d="M0 300 C 100 300, 100 100, 200 150 S 300 50, 400 100 L 400 400 L 0 400 Z" fill="#0000ee" />
                  </svg>
               </div>

               <div className="relative z-10">
                 <div className="inline-block bg-primary text-white px-3 py-1 rounded-pill text-sm font-medium mb-6">
                    Analytics Feature
                 </div>
                   <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">
                     Keep your finger on the Cash Flow.
                  </h3>
                  <p className="text-white/60 max-w-sm text-base leading-relaxed">
                     Real-time cash book entries and monthly recaps show exactly where your business stands.
                  </p>
               </div>

               <div className="relative z-10 mt-8">
                   <div className="bg-white/10 rounded-2xl p-6 border border-white/10 max-w-xs">
                     <p className="text-sm text-white/60 mb-2">Cash Position</p>
                     <div className="flex justify-between items-end">
                       <span className="text-3xl font-medium">Rp 8.5M</span>
                       <div className="flex items-center gap-1 text-white text-sm font-medium bg-primary px-2 py-1 rounded-lg">
                         <TrendingUp className="w-3 h-3" /> Stable
                       </div>
                     </div>
                   </div>
               </div>
            </div>

            <div className="lg:pl-12 py-8">
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Full Analytics of your Money.</h2>
               <p className="text-base text-muted-foreground mb-10 leading-relaxed">
                 Stop guessing where your money goes. CATU categorizes every rupiah, visualizes your spending habits, and helps you make smarter financial decisions effortlessly.
               </p>
               
               <div className="space-y-8">
                 {[
                    { title: "Smart Categorization", desc: "Automatically sort transactions into Food, Transport, and more." },
                    { title: "Export & Backup", desc: "Your data is yours. Export to JSON anytime for safekeeping." }
                 ].map((item, idx) => (
                   <div key={idx} className="flex gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 font-medium text-xl text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-medium mb-2">{item.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="pb-24 bg-muted/30 px-4 sm:px-6 lg:px-8 mt-12 rounded-t-3xl">
        <div className="max-w-7xl mx-auto pt-24">
          <div className="text-center mb-16">
             <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">Everything you need</h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Powerful features packed into a simple interface designed for clarity.
            </p>
          </div>

          <motion.div 
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
             {[
               { 
                 icon: Wallet, 
                 title: "Transaction Tracking", 
                 desc: "Log income and expenses in seconds. Edit, delete, and view history with ease."
               },
               { 
                 icon: BookOpen, 
                 title: "Cash Book", 
                 desc: "Monthly income, expenses, and running balance in one neat table."
               },
               { 
                 icon: BarChart3, 
                 title: "Annual Recap", 
                 desc: "Yearly totals and performance chart so you can see business growth at a glance."
               }
             ].map((feature, i) => (
              <motion.div 
                key={i}
                variants={fadeInUp}
                className="bg-white p-10 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-base ease-in-out"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-8">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-medium mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>&copy; 2025 CATU. All rights reserved.</p>
            
            <div className="flex gap-6 mt-4 md:mt-0 items-center">
              <Link href="https://github.com/rizasaputra29" className="hover:text-primary transition-colors duration-base ease-in-out"><Github className="w-5 h-5" /></Link>
              <Link href="https://www.linkedin.com/in/rizasaputra29/" className="hover:text-primary transition-colors duration-base ease-in-out"><Linkedin className="w-5 h-5" /></Link>
              <Link href="https://www.instagram.com/rizasaputra29/" className="hover:text-primary transition-colors duration-base ease-in-out"><Instagram className="w-5 h-5" /></Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
