<div align="center">

  # CashMap

![CashMap Logo](public/apple-touch-icon.png)

**Master Your Money Flow.** Track income and expenses, run a simple cash book, and review annual performance. All in one clean, clutter-free dashboard built for UMKM businesses.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

[Lihat Demo](https://cash-map.vercel.app/) · [Lapor Bug](https://github.com/rizasaputra29/cashmap/issues) · [Request Fitur](https://github.com/rizasaputra29/cashmap/issues)

</div>

---

## 📖 About the Project

**CashMap** is a modern finance tracker built as a **Progressive Web App (PWA)**. It helps UMKM owners and individuals keep full control of their money flow with smart categorization, monthly cash book tracking, and yearly recap analytics.

### ✨ Key Features

* **📱 Progressive Web App (PWA):** Install on mobile (iOS/Android) for a native-like experience.
* **📊 Smart Dashboard:** Real-time overview of total balance, income vs expenses, and recent transaction activity.
* **📒 Cash Book:** Monthly ledger with opening balance, running balance, and profit/loss — just like a standard UMKM cash book.
* **📈 Annual Recap:** Yearly totals and a performance chart so you can see business growth at a glance.
* **📝 Transaction Management:** Log income/expenses quickly with categories, filters, and easy edit/delete.
* **🔐 Security:** Custom authentication with password hashing (bcrypt) and security questions for account recovery.
* **💾 Data Sovereignty:** Self-serve **Backup & Restore** feature. Export your financial data to JSON and import it back anytime to move data across devices.
* **🎨 Modern UI:** Built with **Shadcn UI** and **Framer Motion** for a smooth, responsive, and aesthetic interface.

---

## 📸 Screenshot

<div align="center">
  <img src="public/landing-mockup.png" alt="Landing Page" width="45%">
  <img src="public/dashboard-mockup.png" alt="Dashboard" width="45%">
</div>

---

## 🛠️ Tech Stack

Proyek ini dibangun menggunakan teknologi web modern terkini:

| Kategori | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Ikon** | [Lucide React](https://lucide.dev/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **Media** | [Next Cloudinary](https://next.cloudinary.dev/) (Upload Avatar) |
| **Enkripsi** | [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) |

---

## 🚀 Mulai Menggunakan (Localhost)

Ikuti langkah-langkah ini untuk menjalankan proyek secara lokal di mesin Anda.

### Prasyarat

* Node.js (v18 atau lebih baru)
* PostgreSQL Database (Lokal atau Cloud seperti Neon/Supabase)
* Akun Cloudinary (untuk fitur upload foto profil)

### Instalasi

1.  **Clone repositori**
    ```bash
    git clone [https://github.com/rizasaputra29/cashmap.git](https://github.com/rizasaputra29/cashmap.git)
    cd cashmap
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root direktori dan tambahkan konfigurasi berikut:

    ```env
    # Koneksi Database (PostgreSQL)
    DATABASE_URL="postgresql://user:password@localhost:5432/cashmap?schema=public"

    # Cloudinary (Untuk Upload Avatar)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="preset_upload_anda"
    ```

4.  **Setup Database (Prisma)**
    Jalankan migrasi untuk membuat tabel di database Anda:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Jalankan server pengembangan**
    ```bash
    npm run dev
    ```

6.  **Buka aplikasi**
    Buka browser dan kunjungi `http://localhost:3000`.

---

## 🤝 Berkontribusi

Kontribusi adalah hal yang membuat komunitas open source menjadi tempat yang luar biasa untuk belajar, inspirasi, dan berkreasi. Segala bentuk kontribusi sangat **dihargai**.

1.  Fork Proyek ini
2.  Buat Feature Branch Anda (`git checkout -b feature/FiturKeren`)
3.  Commit Perubahan Anda (`git commit -m 'Menambahkan fitur keren'`)
4.  Push ke Branch (`git push origin feature/FiturKeren`)
5.  Buka Pull Request

---


<div align="center">

**Dibuat dengan ❤️ oleh [Riza Saputra](https://github.com/rizasaputra29)**

</div>
