import { NextResponse, type NextRequest } from 'next/server';
import { createDownloadClaim, findPaidCheckoutSessionByReceipt } from '@/lib/purchase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const destination = new URL('/recover', request.url);

  try {
    const form = await request.formData();
    const email = String(form.get('email') || '').trim();
    const receipt = String(form.get('receipt') || '').trim();
    const website = String(form.get('website') || '').trim();

    if (website || email.length > 254 || receipt.length > 80 || !email.includes('@') || !receipt) {
      destination.searchParams.set('status', 'not-found');
      return NextResponse.redirect(destination, 303);
    }

    const sessionId = await findPaidCheckoutSessionByReceipt(email, receipt);
    if (!sessionId) {
      destination.searchParams.set('status', 'not-found');
      return NextResponse.redirect(destination, 303);
    }

    const response = NextResponse.redirect(new URL('/thank-you', request.url), 303);
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
