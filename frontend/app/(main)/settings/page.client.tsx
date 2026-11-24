"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHead, Rank } from "@/components/ui/kit";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import BrandIcon from "@/components/shared/BrandIcon";
import UserAvatar from "@/components/shared/UserAvatar";
import VerifyCodeforcesDialog from "@/components/shared/VerifyCodeforcesDialog";
import { ReminderSettings } from "@/components/features/profile";
import ProfileSettings from "@/components/features/profile/ProfileSettings";
import PublicProfileSetting from "@/components/features/profile/PublicProfileSetting";
import { useUser } from "@/hooks/auth";

const SECTIONS = ["Profile", "Account", "Email", "Privacy", "Session"];

function Setting({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <div className="u-kv flex-wrap items-center">
      <div className="min-w-0 max-w-xl">
        <h3 className="t-h3">{title}</h3>
        <p className="t-sm t-muted">{text}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, setUser } = useUser();
  const [verifying, setVerifying] = useState(false);
  if (!user) return null;

  return (
    <div className="grid gap-6">
      <PageHead eyebrow="Settings" title="Your account." className="mb-2" />
      <div className="grid items-start gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[200px_minmax(0,1fr)_360px]">
        <nav
          aria-label="Settings sections"
          className="hidden content-start gap-0.5 lg:sticky lg:top-24 lg:grid"
        >
          {SECTIONS.map((name, i) => (
            <a
              key={name}
              href={`#settings-${name.toLowerCase()}`}
              className="flex gap-3 rounded-md px-3 py-2.5 font-semibold text-ink-muted hover:bg-surface-sunk hover:text-ink"
            >
              <span className="t-num">{String(i + 1).padStart(2, "0")}</span>
              {name}
            </a>
          ))}
        </nav>
        <div className="grid gap-6">
          <section className="u-panel" aria-labelledby="settings-profile">
            <div className="u-panel__head">
              <h2 id="settings-profile" className="t-h2 scroll-mt-28">
                Profile
              </h2>
            </div>
            <ProfileSettings user={user} onSaved={setUser} />
          </section>

          <section className="u-panel" aria-labelledby="settings-account">
            <div className="u-panel__head">
              <h2 id="settings-account" className="t-h2 scroll-mt-28">
                Account
              </h2>
            </div>
            <Setting
              title="Handle verification"
              text="Proves the Codeforces handle on this account is yours."
            >
              {user.isVerified ? (
                <Badge variant="solved">
                  <ShieldCheck />
                  Verified
                </Badge>
              ) : (
                <Button variant="outline" onClick={() => setVerifying(true)}>
                  Verify your handle
                </Button>
              )}
            </Setting>
            <Setting
              title="Password"
              text="You need your current password to set a new one."
            >
              <div className="shrink-0">
                <ChangePasswordDialog />
              </div>
            </Setting>
          </section>

          <section className="u-panel" aria-labelledby="settings-email">
            <div className="u-panel__head">
              <h2 id="settings-email" className="t-h2 scroll-mt-28">
                Email
              </h2>
            </div>
            <Setting
              title="Weekly reminder"
              text="One email a week listing the problems still waiting in your upsolve queue. Nothing is sent when the queue is clear."
            >
              <ReminderSettings />
            </Setting>
          </section>

          <section className="u-panel" aria-labelledby="settings-privacy">
            <div className="u-panel__head">
              <h2 id="settings-privacy" className="t-h2 scroll-mt-28">
                Privacy
              </h2>
            </div>
            <PublicProfileSetting />
          </section>

          <section className="u-panel" aria-labelledby="settings-session">
            <div className="u-panel__head">
              <h2 id="settings-session" className="t-h2 scroll-mt-28">
                Session
              </h2>
            </div>
            <Setting title="Sign out" text="Ends your session on this device.">
              <Button variant="outline" onClick={logout}>
                <LogOut />
                Sign out
              </Button>
            </Setting>
          </section>
        </div>
        <aside className="u-panel lg:col-start-2 xl:sticky xl:top-24 xl:col-start-auto">
          <div className="flex items-center gap-4 p-5">
            <UserAvatar
              avatar={user.avatar}
              glyphAvatar={user.glyphAvatar}
              codeforcesHandle={user.codeforcesHandle}
              size={56}
            />
            <div className="grid min-w-0 gap-1">
              <b className="t-h3 truncate">
                {user.displayName || user.codeforcesHandle}
              </b>
              <Rank rating={user.rating} name={user.rank} showRating />
            </div>
          </div>
          <div className="border-t border-line">
            <div className="u-kv">
              <span className="t-muted flex items-center gap-2">
                <BrandIcon name="codeforces" />
                Codeforces
              </span>
              <span className="truncate font-semibold">
                {user.codeforcesHandle}
              </span>
            </div>
            <div className="u-kv">
              <span className="t-muted flex items-center gap-2">
                <BrandIcon name="atcoder" />
                AtCoder
              </span>
              <span className="truncate font-semibold">
                {user.links?.atcoder || "Not linked"}
              </span>
            </div>
            <div className="u-kv">
              <span className="t-muted">Highest rating</span>
              <b>{user.maxRating || "—"}</b>
            </div>
            {user.createdAt && (
              <div className="u-kv">
                <span className="t-muted">Member since</span>
                <span className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
          <div className="u-panel__foot">
            <Link href="/profile" className="u-btn u-btn--sm">
              Open your profile
            </Link>
          </div>
        </aside>
      </div>

      <VerifyCodeforcesDialog
        isOpen={verifying}
        onClose={() => setVerifying(false)}
      />
    </div>
  );
}
