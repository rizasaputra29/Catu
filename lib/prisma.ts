// path: lib/prisma.ts
import { PrismaClient } from '@prisma/client';
// import { withAccelerate } from '@prisma/extension-accelerate'; // HAPUS/KOMENTARI BARIS INI

// Tipe klien dikembalikan ke standar PrismaClient
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

// Inisialisasi tanpa ekstensi Accelerate
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ // Dihapus: .$extends(withAccelerate())
    log: ['error', 'warn'],
  });

// Hanya pada development, simpan instance ke objek global
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}