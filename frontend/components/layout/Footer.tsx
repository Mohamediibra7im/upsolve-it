import Link from "next/link";
import Brand from "./Brand";

const REPO = "https://github.com/Mohamediibra7im/upsolve-it";
const columns: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Training modes", href: "/modes" },
    { label: "The ladder", href: "/ladder" },
    { label: "How it works", href: "/how-it-works" },
    { label: "FAQ", href: "/faq" },
  ],
  Account: [
    { label: "Log in", href: "/login" },
    { label: "Create an account", href: "/signup" },
    { label: "Reset password", href: "/reset-password" },
  ],
  Community: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "GitHub", href: REPO },
    { label: "HNU - FCSIT ICPC", href: "https://hnuicpc.tech" },
    { label: "Report a bug", href: `${REPO}/issues` },
  ],
  Legal: [
    { label: "Privacy policy", href: "/privacy" },
    { label: "Terms of service", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="u-foot">
      <div className="wrap">
        <div className="u-foot__cols">
          <div className="grid content-start gap-4">
            <Link
              href="/"
              aria-label="Upsolve It home"
              className="justify-self-start"
            >
              <Brand />
            </Link>
            <p className="t-muted max-w-[280px]">
              A little more practice.
              <br />A better problem solver.
            </p>
          </div>
          {Object.entries(columns).map(([title, links]) => (
            <nav key={title} aria-label={title}>
              <h2>{title}</h2>
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="u-foot__base">
          <span>© {new Date().getFullYear()} Upsolve It</span>
          <p>
            Built under the{" "}
            <a
              href="https://hnuicpc.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="t-link"
            >
              HNU - FCSIT ICPC Community
            </a>{" "}
            <span className="whitespace-nowrap">
              by{" "}
              <a
                href="https://mohamediibrahim.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="t-link"
              >
                Mohamed Ibrahim
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
