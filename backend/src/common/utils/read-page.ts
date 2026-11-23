import https from 'node:https';

/**
 * Reads one HTML page over HTTPS under the given client name.
 *
 * Node's plain HTTPS client is used on purpose, not `fetch`: Codeforces sits
 * behind a browser check that turns `fetch` away for the headers it adds
 * (it reads as a script inside a browser), while it answers a plain client
 * that says who it is. There is no disguise here, and when a judge refuses,
 * the caller shows a link to the judge instead.
 */
export function readPage(
  url: string,
  userAgent: string,
  redirectsLeft = 2,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { 'User-Agent': userAgent, Accept: 'text/html' },
        timeout: 12_000,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const next = res.headers.location;
        if (status >= 300 && status < 400 && next) {
          res.resume();
          // a redirect is followed only within the same site
          const target = new URL(next, url);
          if (redirectsLeft > 0 && target.host === new URL(url).host)
            readPage(target.href, userAgent, redirectsLeft - 1).then(
              resolve,
              reject,
            );
          else reject(new Error('redirected elsewhere'));
          return;
        }
        if (status !== 200) {
          res.resume();
          reject(new Error(`answered ${status}`));
          return;
        }
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          body += chunk;
          // a problem page is well under a megabyte; more than four is not one
          if (body.length > 4_000_000) req.destroy(new Error('page too large'));
        });
        res.on('end', () => resolve(body));
      },
    );
    req.on('timeout', () => req.destroy(new Error('timed out')));
    req.on('error', reject);
  });
}
