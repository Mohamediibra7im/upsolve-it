import { codeforcesImageUrl, profileImageSrc } from '../profile-image';
import { fetchProfileImage } from '../profile-image-fetch';

const image = 'https://userpic.codeforces.org/422/avatar/2b5dbe87f0d859a2.jpg';
const jpeg = new Uint8Array([255, 216, 255, 224, 0, 16]);
function upstream(bytes = jpeg, type = 'image/jpeg', status = 200, length?: number) {
  let sent = false;
  return { ok: status >= 200 && status < 300, status,
    headers: { get: (key: string) => key === 'content-type' ? type : key === 'content-length' && length !== undefined ? String(length) : null },
    body: { cancel: jest.fn(async () => {}), getReader: () => ({ read: jest.fn(async () => sent ? { done: true } : (sent = true, { done: false, value: bytes })), cancel: jest.fn(async () => {}) }) },
  } as unknown as Response;
}
it('canonicalizes only trusted Codeforces image URLs', () => {
  expect(codeforcesImageUrl(image.replace('https:', 'http:'))).toBe(image);
  expect(profileImageSrc(image)).toBe('/api/profile-image?url=' + encodeURIComponent(image));
  expect(profileImageSrc('/images/default-avatar.jpg')).toBe('/images/default-avatar.jpg');
  for (const value of ['https://evil.example/a.jpg', 'https://userpic.codeforces.org.evil.example/422/avatar/a.jpg', 'https://userpic.codeforces.org@127.0.0.1/422/avatar/a.jpg', 'https://userpic.codeforces.org:444/422/avatar/a.jpg', image + '?redirect=http://127.0.0.1', image + '#test', 'https://userpic.codeforces.org/422/avatar/a.svg', 'file:///etc/passwd']) expect(codeforcesImageUrl(value)).toBeNull();
});
it('fetches verified image bytes without cookies or redirects', async () => {
  const fetcher = jest.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => upstream());
  await expect(fetchProfileImage(image, fetcher)).resolves.toEqual({ bytes: jpeg, contentType: 'image/jpeg' });
  expect(fetcher).toHaveBeenCalledWith(image, expect.objectContaining({ redirect: 'error', cache: 'no-store', signal: expect.anything() }));
  expect(fetcher.mock.calls[0][1]).not.toHaveProperty('headers');
});
it('rejects untrusted hosts before issuing any request', async () => {
  const fetcher = jest.fn();
  await expect(fetchProfileImage('http://127.0.0.1/secret', fetcher)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
});
it.each([
  ['upstream error', () => upstream(jpeg, 'text/html', 503)],
  ['HTML disguised as an image', () => upstream(new TextEncoder().encode('<html>error</html>'))],
  ['SVG', () => upstream(jpeg, 'image/svg+xml')],
  ['oversized advertised image', () => upstream(jpeg, 'image/jpeg', 200, 3_000_000)],
  ['oversized streamed image', () => upstream(new Uint8Array(3_000_000))],
])('rejects %s instead of caching it', async (_, response) => {
  await expect(fetchProfileImage(image, jest.fn(async () => response()))).rejects.toThrow();
});
