import Link from "next/link";
import {
  ArrowUpRight,
  Bug,
  Facebook,
  Github,
  Globe,
  Linkedin,
  Lock,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import ClosingCall from "@/components/features/landing/ClosingCall";
import { publicPageMetadata } from "@/lib/seo";

export const metadata = publicPageMetadata("/contact");

const REPO = "https://github.com/Mohamediibra7im/upsolve-it";

// Every channel here is one the project already uses in public.
const WAYS = [
  {
    icon: Bug,
    title: "Report a bug or ask for a feature",
    text: "Open an issue on GitHub. Say what you did, what you expected and what happened instead. This is the fastest way to get something fixed.",
    links: [
      { icon: Github, label: "Open an issue", href: `${REPO}/issues/new` },
    ],
  },
  {
    icon: MessagesSquare,
    title: "Talk to the community",
    text: "Upsolve It is built under the HNU - FCSIT ICPC Community. Questions about training, contests or the community go there.",
    links: [
      { icon: Globe, label: "hnuicpc.tech", href: "https://hnuicpc.tech" },
      {
        icon: Facebook,
        label: "Facebook",
        href: "https://www.facebook.com/fcsit.hnu.icpc",
      },
      {
        icon: Linkedin,
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/hnu-fcsit-icpc-community",
      },
      {
        icon: Github,
        label: "GitHub",
        href: "https://github.com/HNU-ICPC-Community",
      },
    ],
  },
  {
    icon: UserRound,
    title: "Reach the maintainer",
    text: "For anything about your account or your data, or something that does not belong in a public issue, contact Mohamed Ibrahim through his site.",
    links: [
      {
        icon: Globe,
        label: "mohamediibrahim.dev",
        href: "https://mohamediibrahim.dev/",
      },
    ],
  },
  {
    icon: Lock,
    title: "Report a security problem",
    text: "Please do not post it in a public issue. Use GitHub’s private vulnerability report so it can be fixed before it is disclosed.",
    links: [
      {
        icon: Lock,
        label: "Report privately",
        href: `${REPO}/security/advisories/new`,
      },
    ],
  },
];

export default function Page() {
  return (
    <>
      <div className="wrap pb-[88px]">
        <header className="mb-12 border-b border-line-strong pb-12 pt-16">
          <p className="t-eyebrow">Contact</p>
          <h1 className="t-d2 mt-4">Get in touch.</h1>
          <p className="t-lg t-muted mt-5 max-w-[720px]">
            Upsolve It is a community project with no support desk. These are
            the places where someone will read what you write. For quick
            answers, the{" "}
            <Link href="/faq" className="t-link">
              FAQ
            </Link>{" "}
            comes first.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {WAYS.map(({ icon: Icon, title, text, links }) => (
            <section
              key={title}
              className="u-panel grid content-between gap-6 p-6 sm:p-8"
            >
              <div className="grid gap-3">
                <span className="u-step" aria-hidden="true">
                  <Icon className="size-4" />
                </span>
                <h2 className="t-h2">{title}</h2>
                <p className="t-muted max-w-[52ch]">{text}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="u-btn"
                  >
                    <link.icon aria-hidden="true" />
                    {link.label} <ArrowUpRight aria-hidden="true" />
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <ClosingCall title="A little better. Every session." />
    </>
  );
}
