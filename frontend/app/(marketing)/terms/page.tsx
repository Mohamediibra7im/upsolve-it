import DocPage from "@/components/features/landing/DocPage";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/terms");

const SECTIONS = [
  {
    id: "using-the-platform",
    title: "Using the platform",
    body: "Access to Upsolve It is for personal use to improve your competitive programming skills. Automated scraping or interfering with the platform is not allowed.",
  },
  {
    id: "expected-behavior",
    title: "Expected behavior",
    body: "Respect the community. Don't try to bypass security, reverse-engineer the system, or disrupt the experience for others.",
  },
  {
    id: "data-accuracy",
    title: "Data accuracy",
    body: "While we aim for accurate syncing, we're not responsible for discrepancies from external sources like the Codeforces API. Training data is for informational purposes.",
  },
  {
    id: "account-termination",
    title: "Account termination",
    body: "We reserve the right to suspend accounts that violate these terms. Keeping the platform safe and stable is our top priority.",
  },
];

export default function Page() {
  return (
    <DocPage
      eyebrow="Terms of service · Last updated June 2026"
      title="A few ground rules."
      lead="The terms that keep Upsolve It a useful, reliable place to practice."
      sections={SECTIONS.map((s) => ({ ...s, body: <p>{s.body}</p> }))}
    />
  );
}
