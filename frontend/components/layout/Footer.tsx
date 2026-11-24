import Link from "next/link";
import { Globe } from "lucide-react";
import BrandIcon from "@/components/shared/BrandIcon";
import Brand from "./Brand";
import FooterContest from "./FooterContest";
import { guestLinks } from "./publicLinks";

const REPO = "https://github.com/Mohamediibra7im/upsolve-it";
const community = [
  { label: "GitHub", href: REPO, icon: "github" },
  { label: "hnuicpc.tech", href: "https://hnuicpc.tech", icon: null },
  {
    label: "Facebook",
    href: "https://www.facebook.com/fcsit.hnu.icpc",
    icon: "facebook",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/hnu-fcsit-icpc-community",
    icon: "linkedin",
  },
] as const;
const columns = {
  Account: [
    { label: "Log in", href: "/login" },
    { label: "Create an account", href: "/signup" },
    { label: "Reset password", href: "/reset-password" },
  ],
  More: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Report a bug", href: `${REPO}/issues` },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

/** The closing of every page, in three columns: who this is and where the
 *  community lives, every page, and what is on next. */
export default function Footer() {
  return (
    <footer className="u-foot">
      <div className="wrap">
        <div className="u-foot__grid">
          <section className="u-foot__brand">
            <div>
              <Link href="/" aria-label="Upsolve It home">
                <Brand />
              </Link>
              <p className="u-foot__line">
                A little more practice.
                <em>A better problem solver.</em>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {community.map(({ label, href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="u-btn u-btn--sm"
                >
                  {icon ? (
                    <BrandIcon name={icon} />
                  ) : (
                    <Globe aria-hidden="true" />
                  )}
                  {label}
                </a>
              ))}
            </div>
          </section>

          <section className="u-foot__links">
            <nav aria-label="Pages">
              <h2>Pages</h2>
              <ul className="u-foot__two">
                {guestLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
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
          </section>

          <div className="u-foot__side">
            <section>
              <h2>Works with</h2>
              <div className="u-foot__judges">
                <span>
                  <BrandIcon name="codeforces" />
                  Codeforces
                </span>
                <span>
                  <BrandIcon name="atcoder" />
                  AtCoder
                </span>
              </div>
            </section>
            <FooterContest />
          </div>
        </div>

        <div className="u-foot__base">
          <span>© {new Date().getFullYear()} Upsolve It · Free to use</span>
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
