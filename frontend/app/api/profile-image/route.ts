import { unstable_cache } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { codeforcesImageUrl } from '@/lib/profile-image';
import { fetchProfileImage } from '@/lib/profile-image-fetch';

export const runtime = 'nodejs';

// Cache only validated successful results. Failed revalidation preserves the last good image.
const cachedImage = unstable_cache(async (url: string) => {
  const result = await fetchProfileImage(url);
  return { contentType: result.contentType, base64: Buffer.from(result.bytes).toString('base64') };
}, ['codeforces-profile-image-v1'], { revalidate: 86400 });

export async function GET(request: NextRequest) {
  const url = codeforcesImageUrl(request.nextUrl.searchParams.get('url') ?? '');
  if (!url) return new NextResponse(null, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  try {
    const image = await cachedImage(url);
    return new NextResponse(Buffer.from(image.base64, 'base64'), { headers: {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800, stale-if-error=604800',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return new NextResponse(null, { status: 503, headers: { 'Cache-Control': 'no-store', 'Retry-After': '2' } });
  }
}
