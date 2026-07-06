import fs from "fs";
import path from "path";
import ClientPage from "./page.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation | Upsolve.it",
  description:
    "Master the Upsolve.it platform. Read the comprehensive user guide covering training sessions, upsolving, notification systems, statistics, and more.",
  keywords: [
    "Upsolve.it documentation",
    "competitive programming guide",
    "Codeforces tracker training",
    "how to upsolve",
    "CP statistics analytics",
  ],
};

const stripEmojis = (str: string) => {
  return str.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "");
};

export default function DocsPage() {
  let content = "";
  try {
    const filePath = path.join(process.cwd(), "GUIDE.md");
    const rawContent = fs.readFileSync(filePath, "utf-8");
    content = stripEmojis(rawContent);
  } catch (error) {
    console.error("Failed to read GUIDE.md file:", error);
    content = "# Comprehensive Usage Guide\n\nFailed to load the user guide. Please check if GUIDE.md exists in the root of the project.";
  }

  return <ClientPage content={content} />;
}
