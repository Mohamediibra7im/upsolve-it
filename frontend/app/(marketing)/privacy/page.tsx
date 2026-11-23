import DocPage from "@/components/features/landing/DocPage";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/privacy");

const SECTIONS = [
  {
    id: "what-we-collect",
    title: "What we collect",
    body: "We only collect the essential data needed to sync your Codeforces progress, including your handle, rating history, and submission data. We never store your Codeforces password or private credentials.",
  },
  {
    id: "how-we-protect-your-data",
    title: "How we protect your data",
    body: "Your session data is encrypted and stored securely. We use industry-standard security practices to keep your training history accessible only to you.",
  },
  {
    id: "your-privacy-rights",
    title: "Your privacy rights",
    body: "We never sell or share your training data with third parties. Your performance metrics are used solely to provide you with personalized training insights.",
  },
  {
    id: "cookies",
    title: "Cookies",
    body: "We use essential cookies to keep you logged in. No tracking or marketing cookies are used on this platform.",
  },
];

export default function Page() {
  return (
    <DocPage
      eyebrow="Privacy policy"
      title="Your privacy matters."
      lead="How we handle your data, protect your information, and respect your privacy."
      sections={SECTIONS.map((s) => ({ ...s, body: <p>{s.body}</p> }))}
    />
  );
}
