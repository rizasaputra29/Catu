import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { generateAvatarUploadSignature } from '@/lib/cloudinary-server';

async function getAuthUser() {
  const cookieStore = await cookies();
  return cookieStore.get('session_token_mock')?.value;
}

export async function GET() {
  try {
    const userId = await getAuthUser();

    if (!userId) {
      return NextResponse.json({ message: 'Tidak diizinkan' }, { status: 401 });
    }

    const signatureData = generateAvatarUploadSignature();
    return NextResponse.json(signatureData);
  } catch (error) {
    console.error('Cloudinary Signature Error:', error);
    return NextResponse.json(
      { message: 'Gagal membuat signature' },
      { status: 500 }
    );
  }
}
