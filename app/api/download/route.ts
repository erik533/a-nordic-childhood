import { get } from '@vercel/blob';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { verifyDownloadClaim } from '@/lib/purchase';
import { trackServerEventSafely } from '@/lib/server-analytics';

export const runtime = 'nodejs';
export const maxDuration = 300;

const DEFAULT_BLOB_PATH = 'products/A-Nordic-Childhood-Learning-Collection-v1.0.zip';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const claim = cookieStore.get('anc_download_access')?.value;
  if (!verifyDownloadClaim(claim)) {
    return new NextResponse('This download link is not authorised. Please return through the Stripe confirmation page.', { status: 403 });
  }

  const pathname = process.env.BLOB_PRODUCT_PATH || DEFAULT_BLOB_PATH;
  const range = request.headers.get('range');
  const result = await get(pathname, {
    access: 'private',
    headers: range ? { Range: range } : undefined,
  });

  if (!result?.stream || result.statusCode !== 200) {
    return new NextResponse('The download is temporarily unavailable. Please contact erik@erikastrand.com.', { status: 503 });
  }

  if (!request.nextUrl.search) {
    await trackServerEventSafely('Download Access', undefined, request.headers);
  }

  const headers = new Headers({
    'Content-Type': result.blob.contentType || 'application/zip',
    'Content-Disposition': 'attachment; filename="A-Nordic-Childhood-Learning-Collection-v1.0.zip"',
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff',
  });

  for (const name of ['accept-ranges', 'content-length', 'content-range', 'etag']) {
    const value = result.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(result.stream, { status: result.statusCode, headers });
}
