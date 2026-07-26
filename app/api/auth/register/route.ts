// path: app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, ClientUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // PERUBAHAN: Terima securityAnswer
    const { email, password, fullName, businessName, securityAnswer } = await request.json();

    if (!email || !password || !fullName || !securityAnswer) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } }); 
    if (user) {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    // BARU: Hash Jawaban Keamanan
    const hashedSecurityAnswer = await hashPassword(securityAnswer); 
    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=000&color=fff`;

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        businessName: businessName || null,
        avatarUrl: defaultAvatarUrl,
        // BARU: Simpan Jawaban Keamanan yang sudah di-hash
        securityAnswer: hashedSecurityAnswer,
      },
      select: { id: true, email: true, fullName: true, businessName: true, avatarUrl: true }, 
    });

    return NextResponse.json(newUser as ClientUser, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}