import { NextResponse, type NextRequest } from 'next/server';
import { createDownloadClaim, verifyPaidCheckoutSession } from '@/lib/purchase';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');
  const destination = new URL('/thank-you', request.url);

  try {
    if (!sessionId || !(await verifyPaidCheckoutSession(sessionId))) {
      destination.searchParams.set('status', 'problem');
      return NextResponse.redirect(destination, 303);
    }

    const response = NextResponse.redirect(destination, 303);
    response.cookies.set('anc_download_access', createDownloadClaim(sessionId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    destination.searchParams.set('status', 'problem');
    return NextResponse.redirect(destination, 303);
  }
}
