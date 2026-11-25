import type { LanguageId } from "./languages";

// Four spaces and braces on the opening line, as the editor indents and the
// starting code is written.
const CLANG_STYLE = "{BasedOnStyle: LLVM, IndentWidth: 4, ColumnLimit: 100}";

/**
 * Formats a draft: clang-format for C++, Java and TypeScript, Ruff for Python,
 * gofmt for Go. All are WebAssembly and are fetched the first time they are
 * needed, so the page does not pay for them until someone formats. Python or
 * Go that does not parse throws; clang-format tidies whatever it is given.
 */
export async function formatCode(
  code: string,
  language: LanguageId,
): Promise<string> {
  if (language === "python") {
    const ruff = await import("@wasm-fmt/ruff_fmt/web");
    await ruff.default(new URL("@wasm-fmt/ruff_fmt/wasm", import.meta.url));
    return ruff.format(code, "solution.py");
  }
  if (language === "go") {
    const gofmt = await import("@wasm-fmt/gofmt/web");
    await gofmt.default(new URL("@wasm-fmt/gofmt/wasm", import.meta.url));
    return gofmt.format(code);
  }
  const clang = await import("@wasm-fmt/clang-format/web");
  await clang.default(new URL("@wasm-fmt/clang-format/wasm", import.meta.url));
  return clang.format(
    code,
    language === "java"
      ? "main.java"
      : language === "typescript"
        ? "main.ts"
        : "main.cpp",
    CLANG_STYLE,
  );
}
