import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const apiKey = process.env.CLOUDINARY_API_KEY!;
const apiSecret = process.env.CLOUDINARY_API_SECRET!;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    'Cloudinary credentials are missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.'
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export const cloudinaryConfig = {
  cloudName,
  apiKey,
  apiSecret,
  uploadPreset: 'pembukuan',
  folder: 'avatars',
};

export function generateAvatarUploadSignature() {
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder: 'avatars',
    timestamp,
    upload_preset: 'pembukuan',
  };
  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    timestamp,
    signature,
    apiKey,
    cloudName,
    uploadPreset: 'pembukuan',
    folder: 'avatars',
  };
}

export function getPublicIdFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    const afterUpload = parts.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part));
    const rest =
      versionIndex !== -1
        ? afterUpload.slice(versionIndex + 1)
        : afterUpload;

    if (rest.length === 0) return null;

    return rest.join('/').replace(/\.[^.]+$/, '');
  } catch {
    return null;
  }
}

export async function deleteAvatar(publicId: string): Promise<void> {
  if (!publicId) return;
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
  });
  // eslint-disable-next-line no-console
  console.log('Cloudinary destroy result:', result);
}
