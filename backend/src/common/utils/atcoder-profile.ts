import { BadRequestException } from '@nestjs/common';
import { readPage } from './read-page';

export type AtcoderProfile = {
  /** The handle in AtCoder's own letter case. */
  handle: string;
  /** What the user typed as their affiliation; empty when they left it blank. */
  affiliation: string;
};

const text = (html: string) => html.replace(/<[^>]+>/g, '').trim();

/**
 * The handle and affiliation on an AtCoder profile page, or null when the
 * page is not a profile. AtCoder has no API for either: the profile page is
 * the one place its users' own text can be read.
 */
export function parseAtcoderProfile(html: string): AtcoderProfile | null {
  const handle = /<a href="\/users\/([A-Za-z0-9_]+)" class="username">/.exec(
    html,
  )?.[1];
  if (!handle) return null;
  const affiliation =
    /<th[^>]*>Affiliation<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/.exec(html)?.[1];
  return { handle, affiliation: text(affiliation ?? '') };
}

/** Reads a profile from atcoder.jp. Null when no user has that handle. */
export async function readAtcoderProfile(
  handle: string,
  userAgent: string,
): Promise<AtcoderProfile | null> {
  let html: string;
  try {
    html = await readPage(
      // lang=en: the row is found by its English name
      `https://atcoder.jp/users/${encodeURIComponent(handle)}?lang=en`,
      userAgent,
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'answered 404') return null;
    throw new BadRequestException(
      'AtCoder could not be reached. Try again in a minute.',
    );
  }
  return parseAtcoderProfile(html);
}
