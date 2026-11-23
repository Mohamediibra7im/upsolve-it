/** The languages the workspace can run. The ids are the ones POST /api/run takes. */
export const LANGUAGES = [
  { id: "cpp17", name: "C++ 17", file: "solution.cpp" },
  { id: "cpp20", name: "C++ 20", file: "solution.cpp" },
  { id: "python", name: "Python 3", file: "solution.py" },
  { id: "java", name: "Java", file: "Main.java" },
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
};
