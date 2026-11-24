"use client";

import { useState, type FormEvent } from "react";
import { AvatarPicker } from "glyph-avatar/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormError } from "@/components/features/auth";
import UserAvatar from "@/components/shared/UserAvatar";
import { useToast } from "@/components/providers/Toast";
import { apiClient } from "@/lib/apiClient";
import BrandIcon from "@/components/shared/BrandIcon";
import type { ProfileLinks, User } from "@/types/User";
import {
  PLATFORMS,
  linkError,
  normalizeLink,
  type LinkKey,
} from "@/utils/profileLinks";

const BIO_MAX = 280;

type Form = { displayName: string; bio: string; links: ProfileLinks };

const NO_LINKS: ProfileLinks = {
  github: "",
  linkedin: "",
  x: "",
  website: "",
  atcoder: "",
  leetcode: "",
  codechef: "",
};

const formOf = (user: User): Form => ({
  displayName: user.displayName ?? "",
  bio: user.bio ?? "",
  links: { ...NO_LINKS, ...user.links },
});

/** The Profile group of the settings page: avatar, name, bio and links. */
export default function ProfileSettings({
  user,
  onSaved,
}: {
  user: User;
  /** Gets the user the server returned, to store for the rest of the app. */
  onSaved: (user: User) => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => formOf(user));
  const [linkErrors, setLinkErrors] = useState<
    Partial<Record<LinkKey, string>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const showPicker = (open: boolean) => {
    setError(null);
    setPicking(open);
  };

  const changed = JSON.stringify(form) !== JSON.stringify(formOf(user));

  const save = async (
    patch: Partial<Form> & { glyphAvatar?: string },
    done: string,
  ) => {
    setBusy(true);
    setError(null);
    try {
      const { user: saved } = await apiClient.patch<{ user: User }>(
        "/api/users/me/profile",
        patch,
      );
      onSaved(saved);
      toast({ title: done, variant: "success" });
      return saved;
    } catch (e) {
      // A TypeError is the browser failing to reach the server at all.
      setError(
        e instanceof Error && !(e instanceof TypeError)
          ? e.message
          : "We could not reach the server, so nothing was saved. Try again in a minute.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  const setLink = (key: LinkKey, value: string, message?: string | null) => {
    setForm((f) => ({ ...f, links: { ...f.links, [key]: value } }));
    setLinkErrors((errors) => ({ ...errors, [key]: message ?? undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const links = { ...form.links };
    const found: Partial<Record<LinkKey, string>> = {};
    for (const { key } of PLATFORMS) {
      links[key] = normalizeLink(key, links[key]);
      const message = linkError(key, links[key]);
      if (message) found[key] = message;
    }
    setForm({ ...form, links });
    setLinkErrors(found);
    if (Object.keys(found).length > 0) return;
    const saved = await save({ ...form, links }, "Profile saved");
    if (saved) setForm(formOf(saved));
  };

  return (
    <>
      <div className="u-kv flex-wrap items-center">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar {...user} size={64} />
          <div className="min-w-0 max-w-md">
            <h3 className="t-h3">Avatar</h3>
            <p className="t-sm t-muted">
              {user.glyphAvatar
                ? "The avatar you picked. It shows wherever your handle does."
                : "Your Codeforces photo. You can pick a drawn avatar instead."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => showPicker(true)}
          >
            Change avatar
          </Button>
          {user.glyphAvatar && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                save({ glyphAvatar: "" }, "Using your Codeforces photo")
              }
            >
              Use my Codeforces photo
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={submit} noValidate>
        <div className="u-panel__body grid gap-5">
          <div className="u-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              className="u-input"
              placeholder="Your name, as you want it shown"
              autoComplete="name"
              maxLength={60}
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
            />
          </div>

          <div className="u-field">
            <span className="flex items-baseline justify-between gap-3">
              <label htmlFor="profile-bio">Bio</label>
              <span id="profile-bio-count" className="u-hint t-num">
                {form.bio.length} / {BIO_MAX}
              </span>
            </span>
            <textarea
              id="profile-bio"
              className="u-input"
              rows={3}
              placeholder="A line or two about you: what you are training for, where you compete"
              maxLength={BIO_MAX}
              aria-describedby="profile-bio-count"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div
            role="group"
            aria-labelledby="profile-links"
            className="grid gap-4"
          >
            <div>
              <h3 id="profile-links" className="t-h3">
                Links
              </h3>
              <p className="t-sm t-muted">
                Type a username or paste a profile link: only the username is
                kept.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PLATFORMS.map(({ key, label, placeholder, base }) => {
                const id = `profile-link-${key}`;
                const message = linkErrors[key];
                return (
                  <div key={key} className="u-field">
                    <label htmlFor={id} className="flex items-center gap-2">
                      {key !== "website" && <BrandIcon name={key} />}
                      {label}
                    </label>
                    <input
                      id={id}
                      className="u-input"
                      type={base ? "text" : "url"}
                      placeholder={placeholder}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={message ? true : undefined}
                      aria-describedby={message ? `${id}-error` : undefined}
                      value={form.links[key]}
                      onChange={(e) => setLink(key, e.target.value)}
                      onBlur={(e) => {
                        const value = normalizeLink(key, e.target.value);
                        setLink(key, value, linkError(key, value));
                      }}
                    />
                    {message && (
                      <p id={`${id}-error`} className="u-error">
                        {message}
                      </p>
                    )}
                    {key === "atcoder" && !message && (
                      <p className="u-hint">
                        Also brings your AtCoder contests into the upsolve
                        queue.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && !picking && <FormError>{error}</FormError>}
        </div>
        <div className="u-panel__foot">
          <span>
            Shown on your profile, and on your public profile when it is on.
          </span>
          <Button type="submit" disabled={!changed || busy}>
            {busy ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </form>

      <Dialog open={picking} onOpenChange={showPicker}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="t-h2">Choose an avatar</DialogTitle>
            <DialogDescription className="t-muted">
              Drag to look around, then pick one you like.
            </DialogDescription>
          </DialogHeader>
          <AvatarPicker
            className="u-avatar-picker"
            title=""
            description=""
            saveLabel="Save avatar"
            defaultValue={user.glyphAvatar || user.codeforcesHandle}
            onSave={async (glyphAvatar) => {
              if (await save({ glyphAvatar }, "Avatar saved")) {
                setPicking(false);
              }
            }}
            onCancel={() => showPicker(false)}
          />
          {error && <FormError>{error}</FormError>}
        </DialogContent>
      </Dialog>
    </>
  );
}
