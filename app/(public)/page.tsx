'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Wallet,
  BarChart3,
  Smartphone,
  ShieldCheck,
  ChevronDown,
  Github,
  Linkedin,
  Instagram,
} from 'lucide-react';

const BRAND = {
  blue: '#3B6CB8',
  darkBlue: '#2A5A9E',
  lime: '#D4EC4A',
} as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } },
} as const;

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
} as const;

const navLinks = [
  { label: 'Beranda', href: '#home' },
  { label: 'Tentang Kami', href: '#about' },
  { label: 'Kegunaan', href: '#training' },
  { label: 'FAQ', href: '#faq' },
];

const benefitCards = [
  {
    icon: Wallet,
    title: 'Pencatatan Cepat',
    desc: 'Catat pemasukan dan pengeluaran dalam hitungan detik.',
  },
  {
    icon: BarChart3,
    title: 'Laporan Visual',
    desc: 'Lihat ringkasan bulanan dan tahunan secara jelas.',
  },
  {
    icon: Smartphone,
    title: 'Akses di Mana Saja',
    desc: 'Gunakan CATU di ponsel, tablet, maupun desktop.',
  },
  {
    icon: ShieldCheck,
    title: 'Data Tetap Aman',
    desc: 'Privasi dan keamanan data keuangan Anda terjaga.',
  },
];

const trainingRows = [
  {
    title: 'UNTUK PRIBADI',
    bullets: [
      'Atur pemasukan & pengeluaran harian',
      'Pantau saldo dompet dan tabungan',
      'Lihat ringkasan bulanan otomatis',
    ],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'UNTUK BISNIS',
    bullets: [
      'Kelola buku kas usaha dengan rapi',
      'Kategorikan transaksi bisnis secara otomatis',
      'Ekspor laporan untuk pembukuan',
    ],
    image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'UNTUK TIM',
    bullets: [
      'Akses bersama untuk tim kecil',
      'Hak akses sesuai peran masing-masing',
      'Pantau arus kas secara real-time',
    ],
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  },
];

const faqItems = [
  {
    question: 'Apakah CATU gratis digunakan?',
    answer:
      'Ya, CATU dapat digunakan secara gratis untuk kebutuhan pencatatan pribadi dan bisnis kecil.',
  },
  {
    question: 'Bagaimana cara menyimpan data saya?',
    answer:
      'Data Anda tersimpan di cloud dan dapat diakses kapan saja dari perangkat yang Anda gunakan.',
  },
  {
    question: 'Bisakah saya mengunduh laporan keuangan?',
    answer:
      'Tentu. Anda bisa mengekspor laporan transaksi dan ringkasan keuangan kapan saja.',
  },
  {
    question: 'Apakah CATU aman untuk data keuangan?',
    answer:
      'Keamanan data adalah prioritas kami. Kami menggunakan enkripsi dan praktik keamanan terbaik.',
  },
];


export default function Home() {
  const [activeTraining, setActiveTraining] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  return (
    <main
      className="min-h-screen bg-white text-foreground overflow-x-hidden font-sans"
      style={{ '--brand-blue': BRAND.blue, '--brand-dark-blue': BRAND.darkBlue, '--brand-lime': BRAND.lime } as React.CSSProperties}
    >
      {/* HEADER */}
      <LandingNavbar menuItems={navLinks} />

      {/* HERO */}
      <section id="home" className="bg-[var(--brand-blue)] min-h-[100dvh] flex items-center pt-32 pb-16 md:pt-40 md:pb-24 rounded-b-[2.5rem] md:rounded-b-[3.5rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-8"
            >
              <p className="text-[var(--brand-lime)] text-sm font-semibold tracking-widest uppercase">
                #1 Aplikasi Keuangan Pribadi
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white uppercase tracking-tight leading-[1.05]">
                Kelola Keuangan
                <br />
                <span className="text-[var(--brand-lime)]">Lebih Teratur</span>
              </h1>
              <p className="text-white/80 text-base md:text-lg max-w-lg leading-relaxed">
                CATU membantu Anda mencatat pemasukan, pengeluaran, dan arus kas
                dengan tampilan yang bersih dan mudah dipahami.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/register">
                  <Button className="h-14 px-8 rounded-full bg-[var(--brand-lime)] text-[var(--brand-blue)] text-base font-semibold hover:bg-[var(--brand-lime)]/90 shadow-lg shadow-black/10">
                    Daftar Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="h-14 px-8 rounded-full border-white text-[var(--brand-blue)] hover:bg-white hover:text-[var(--brand-blue)] text-base font-semibold"
                  >
                    Masuk
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative hidden lg:block h-[500px] xl:h-[560px]"
            >
              <motion.div
                variants={fadeInUp}
                className="absolute top-2 right-0 xl:right-8 w-[280px] xl:w-[320px] z-10"
              >
                <Image
                  src="/landing-mockup.png"
                  alt="Tampilan aplikasi CATU di ponsel"
                  width={460}
                  height={660}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="absolute top-8 left-0 xl:left-8 w-[320px] xl:w-[380px] z-20"
              >
                <Image
                  src="/dashboard-mockup.png"
                  alt="Dasbor keuangan CATU"
                  width={460}
                  height={660}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
              <div className="absolute bottom-10 right-20 w-40 h-40 rounded-full bg-[var(--brand-lime)]/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT US / PROFESSIONAL APPROACH */}
      <section id="about" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-[var(--brand-blue)]/10">
                <Image
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                  alt="Mengelola keuangan dengan CATU"
                  width={800}
                  height={1000}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-[var(--brand-lime)] -z-10" />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp} className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">
                  Pendekatan{' '}
                  <span className="text-[var(--brand-lime)]">Profesional</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  CATU dirancang untuk membantu Anda mengambil keputusan keuangan
                  yang lebih baik. Dengan tampilan yang sederhana, setiap transaksi
                  tercatat rapi dan laporan tersaji secara otomatis.
                </p>
                <p className="text-muted-foreground leading-relaxed max-w-lg">
                  Baik untuk kebutuhan pribadi maupun bisnis kecil, CATU memberikan
                  fondasi pembukuan yang andal tanpa perlu spreadsheet yang rumit.
                </p>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16 md:mt-24"
          >
            {benefitCards.map((card, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="bg-[var(--brand-blue)] rounded-2xl p-7 text-white space-y-4 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-[var(--brand-lime)]" />
                </div>
                <h3 className="font-semibold text-lg">{card.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* BANNER */}
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto mb-12 sm:mb-6 lg:mb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative rounded-[2rem] overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center"
          >
            <Image
              src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1600&q=80"
              alt="Mencatat arus kas"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-[var(--brand-blue)]/75" />
            <div className="relative z-10 max-w-3xl px-8 md:px-14 py-12">
              <p className="text-white text-lg md:text-2xl font-semibold leading-relaxed">
                Pantau arus kas dan catatan transaksi harian dengan mudah, baik
                untuk pribadi maupun bisnis kecil Anda.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRAINING */}
      <section id="training" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-[var(--brand-blue)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase inline-block text-white">
              Kegunaan
              <span className="block h-1.5 w-24 bg-[var(--brand-lime)] mt-3 rounded-full" />
            </h2>
          </motion.div>

          <div className="space-y-4">
            {trainingRows.map((row, i) => {
              const isOpen = activeTraining === i;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="rounded-2xl border border-white/10 overflow-hidden bg-white"
                >
                  <button
                    onClick={() => setActiveTraining(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-muted/30 transition-colors"
                  >
                    <span className="text-lg md:text-xl font-bold tracking-wide text-gray-900">
                      {row.title}
                    </span>
                    <ChevronDown
                      className={`w-6 h-6 text-[var(--brand-blue)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 md:p-8 pt-0 grid md:grid-cols-2 gap-8 items-center">
                          <div className="space-y-4">
                            {row.bullets.map((bullet, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <span className="mt-2 w-2 h-2 rounded-full bg-[var(--brand-lime)] shrink-0" />
                                <p className="text-muted-foreground leading-relaxed">{bullet}</p>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-2xl overflow-hidden aspect-[4/3]">
                            <Image
                              src={row.image}
                              alt={row.title}
                              width={800}
                              height={600}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12 md:mb-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase inline-block">
              FAQ
              <span className="block h-1.5 w-16 bg-[var(--brand-lime)] mt-3 rounded-full mx-auto" />
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, i) => {
              const isOpen = activeFaq === i;
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="bg-white rounded-2xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-base md:text-lg pr-4">{item.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[var(--brand-blue)] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 CATU. Hak cipta dilindungi.
          </p>
          <div className="flex gap-6 items-center">
            <Link href="https://github.com/rizasaputra29" className="text-muted-foreground hover:text-[var(--brand-blue)] transition-colors">
              <Github className="w-5 h-5" />
            </Link>
            <Link href="https://www.linkedin.com/in/rizasaputra29/" className="text-muted-foreground hover:text-[var(--brand-blue)] transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="https://www.instagram.com/rizasaputra29/" className="text-muted-foreground hover:text-[var(--brand-blue)] transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
