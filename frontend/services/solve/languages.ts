/**
 * The languages the workspace can run, newest first; the first is what a new
 * visitor starts with. The ids are the ones POST /api/run takes. The names
 * say what the runner really has (the backend's LANGUAGES maps each id to a
 * compiler there), so they change together with it.
 */
export const LANGUAGES = [
  { id: "cpp20", name: "C++ 20 (GCC 15)", file: "solution.cpp" },
  { id: "cpp17", name: "C++ 17 (GCC 15)", file: "solution.cpp" },
  { id: "python", name: "Python 3.14", file: "solution.py" },
  { id: "java", name: "Java 25", file: "Main.java" },
  { id: "go", name: "Go 1.26", file: "main.go" },
  { id: "typescript", name: "TypeScript (Deno)", file: "solution.ts" },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]["id"];

export const isLanguage = (id: unknown): id is LanguageId =>
  LANGUAGES.some((l) => l.id === id);

const CPP = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    
    return 0;
}
`;

/** What a new draft starts as: the lines everyone types first. */
export const STARTER: Record<LanguageId, string> = {
  cpp17: CPP,
  cpp20: CPP,
  python: `import sys
input = sys.stdin.readline


def main():
    pass


main()
`,
  java: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));

    }
}
`,
  // Go refuses an unused import or variable, so its start already reads a number.
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

var in = bufio.NewReader(os.Stdin)
var out = bufio.NewWriter(os.Stdout)

func main() {
	defer out.Flush()

	var n int
	fmt.Fscan(in, &n)

}
`,
  typescript: `const input = await new Response(Deno.stdin.readable).text();
const tokens = input.split(/\\s+/).filter(Boolean);
let at = 0;
const next = (): string => tokens[at++];

const n = Number(next());

`,
};
