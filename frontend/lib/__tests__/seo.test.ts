import { PUBLIC_PAGES, publicPageMetadata } from "../seo";

describe("publicPageMetadata", () => {
  // Every other public page has an opengraph-image.tsx beside it, which Next
  // adds by itself. The home page's image sits one level up, so it is named.
  it("names the share image on the home page", () => {
    const home = publicPageMetadata("/");
    const expected = [expect.objectContaining({ url: "/opengraph-image" })];
    expect(home.openGraph?.images).toEqual(expected);
    expect(home.twitter?.images).toEqual(expected);
  });

  it("leaves the other pages to the image beside them", () => {
    for (const path of Object.keys(PUBLIC_PAGES)) {
      if (path === "/") continue;
      expect(
        publicPageMetadata(path as "/faq").openGraph?.images,
      ).toBeUndefined();
    }
  });
});
