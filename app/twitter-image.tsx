import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const alt = 'CATU | Catatan Keuangan';
export const size = {
  width: 1200,
  height: 438,
};
export const contentType = 'image/png';

export default async function Image() {
  const logoData = await readFile(join(process.cwd(), 'public/og-image.png'), 'base64');
  const logoSrc = `data:image/png;base64,${logoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
        }}
      >
        <img
          src={logoSrc}
          width={size.width}
          height={size.height}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
