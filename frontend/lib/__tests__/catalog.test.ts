import { NO_QUERY, catalogSearch, parseCatalogQuery } from "../catalog";

describe("catalogue filters in the address", () => {
  it("reads every filter and writes the same address back", () => {
    const search = "?judge=atcoder&min=1200&max=1600&tag=dp&q=1996E&page=3";
    const query = parseCatalogQuery(
      Object.fromEntries(new URLSearchParams(search)),
    );
    expect(query).toEqual({
      judge: "atcoder",
      min: 1200,
      max: 1600,
      tag: "dp",
      q: "1996E",
      page: 3,
    });
    expect(catalogSearch(query)).toBe(search);
  });

  it("drops what the API would refuse and leaves defaults out", () => {
    const query = parseCatalogQuery({
      judge: "spoj",
      min: "12a",
      max: "",
      tag: ["dp", "math"],
      q: "  two  ",
      page: "0",
    });
    expect(query).toEqual({ ...NO_QUERY, q: "two" });
    expect(catalogSearch(query)).toBe("?q=two");
    expect(catalogSearch(NO_QUERY)).toBe("");
  });

  it("keeps a tag with a space or a star safe in the address", () => {
    const query = { ...NO_QUERY, tag: "*special problem" };
    const search = catalogSearch(query);
    expect(search).toBe("?tag=*special+problem");
    expect(
      parseCatalogQuery(Object.fromEntries(new URLSearchParams(search))),
    ).toEqual(query);
  });
});
