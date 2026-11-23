import { codeforcesImageUrl } from './profile-image';

const MAX_BYTES = 1024 * 1024;
const types = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

function validSignature(bytes: Uint8Array, type: string) {
  const starts = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  if (type === 'image/jpeg') return starts(255, 216, 255);
  if (type === 'image/png') return starts(137, 80, 78, 71, 13, 10, 26, 10);
  if (type === 'image/gif') return starts(71, 73, 70, 56) && [55, 57].includes(bytes[4]) && bytes[5] === 97;
  return starts(82, 73, 70, 70) && [87, 69, 66, 80].every((byte, i) => bytes[i + 8] === byte);
}

export async function fetchProfileImage(value: string, fetcher: typeof fetch = fetch) {
  const url = codeforcesImageUrl(value);
  if (!url) throw new Error('Unsupported profile image');
  const response = await fetcher(url, { redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(5000) });
  const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? '';
  if (!response.ok || !types.has(contentType) || !response.body) {
    await response.body?.cancel();
    throw new Error('Profile image unavailable');
  }
  const reader = response.body.getReader();
  try {
    if (Number(response.headers.get('content-length')) > MAX_BYTES) throw new Error('Profile image too large');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      size += chunk.byteLength;
      if (size > MAX_BYTES) throw new Error('Profile image too large');
      chunks.push(chunk);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    if (!validSignature(bytes, contentType)) throw new Error('Invalid profile image');
    return { bytes, contentType };
  } finally { await reader.cancel(); }
}
