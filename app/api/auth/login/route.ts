// path: app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, ClientUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // FIX CALLABILITY: Menggunakan destructuring yang sederhana
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: 'Kredensial tidak valid' }, { status: 401 });
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      return NextResponse.json({ message: 'Kredensial tidak valid' }, { status: 401 });
    }

    const userWithoutPassword: ClientUser = { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        businessName: user.businessName,
        avatarUrl: user.avatarUrl 
    };
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ message: 'Kesalahan server' }, { status: 500 });
  }
}