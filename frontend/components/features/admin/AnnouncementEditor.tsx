"use client";

import { useState, type ChangeEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { FormError } from "@/components/features/auth";
import { AnnouncementBody } from "@/components/shared/AnnouncementDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { saveAnnouncement } from "@/hooks/admin/useAdminAnnouncements";
import type { Announcement, Audience } from "@/types/Announcement";
import {
  ACTION_LABEL_MAX,
  MESSAGE_MAX,
  TITLE_MAX,
  isActionUrl,
} from "@/utils/announcement";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const AUDIENCES: { value: Audience; label: string; hint: string }[] = [
  {
    value: "everyone",
    label: "Everyone",
    hint: "Every visitor, signed in or not.",
  },
  {
    value: "members",
    label: "Members only",
    hint: "Signed-in visitors only.",
  },
];

/** The text inputs, as typed. Times are local "YYYY-MM-DDTHH:mm" text in the admin's own time zone. */
type Text = {
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  startsAt: string;
  endsAt: string;
};
type Errors = Partial<Record<keyof Text, string>>;

/** An ISO time as a datetime-local value, and back. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};
const fromLocalInput = (value: string) =>
  value ? new Date(value).toISOString() : null;

function validate(text: Text): Errors {
  const errors: Errors = {};
  const label = text.actionLabel.trim();
  const url = text.actionUrl.trim();
  if (!text.title.trim()) errors.title = "Give the announcement a title.";
  if (!text.message.trim()) errors.message = "Write the message.";
  if (url && !label)
    errors.actionLabel = "Add a label for the button, or clear the link.";
  if (label && !url)
    errors.actionUrl = "Add the link the button opens, or clear the label.";
  else if (url && !isActionUrl(url))
    errors.actionUrl =
      "Use a path on this site, like /training, or a full https:// address.";
  // Two datetime-local values compare correctly as text.
  if (text.startsAt && text.endsAt && text.endsAt <= text.startsAt)
    errors.endsAt = "The end must be after the start.";
  return errors;
}

function Field({
  id,
  label,
  count,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  /** Characters typed and the most allowed. */
  count?: [number, number];
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="u-field">
      <span className="flex items-baseline justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        {count && (
          <span className="u-hint t-num">
            {count[0]} / {count[1]}
          </span>
        )}
      </span>
      {children}
      {error ? (
        <p id={`${id}-error`} className="u-error">
          {error}
        </p>
      ) : (
        hint && <p className="u-hint">{hint}</p>
      )}
    </div>
  );
}

/** Writes a new announcement, or edits the one given. Mount it to open it. */
export function AnnouncementEditor({
  announcement,
  onClose,
  onSaved,
}: Readonly<{
  announcement: Announcement | null;
  onClose: () => void;
  onSaved: (published: boolean) => void;
}>) {
  const [text, setText] = useState<Text>({
    title: announcement?.title ?? "",
    message: announcement?.message ?? "",
    actionLabel: announcement?.actionLabel ?? "",
    actionUrl: announcement?.actionUrl ?? "",
    startsAt: toLocalInput(announcement?.startsAt ?? null),
    endsAt: toLocalInput(announcement?.endsAt ?? null),
  });
  const [audience, setAudience] = useState<Audience>(
    announcement?.audience ?? "everyone",
  );
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const idOf = (key: keyof Text) => `announcement-${key}`;
  const control = (key: keyof Text) => ({
    id: idOf(key),
    className: "u-input",
    value: text[key],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setText({ ...text, [key]: e.target.value }),
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `${idOf(key)}-error` : undefined,
  });

  const save = async (published: boolean) => {
    const found = validate(text);
    setErrors(found);
    setServerError("");
    const firstInvalid = Object.keys(found)[0] as keyof Text | undefined;
    if (firstInvalid) {
      document.getElementById(idOf(firstInvalid))?.focus();
      return;
    }

    setSaving(true);
    try {
      await saveAnnouncement(
        {
          title: text.title.trim(),
          message: text.message.trim(),
          actionLabel: text.actionLabel.trim() || null,
          actionUrl: text.actionUrl.trim() || null,
          audience,
          startsAt: fromLocalInput(text.startsAt),
          endsAt: fromLocalInput(text.endsAt),
          published,
        },
        announcement?._id,
      );
      onSaved(published);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? `The announcement was not saved. ${error.message}`
          : "The announcement was not saved. Try again in a minute.",
      );
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {announcement ? "Edit announcement" : "New announcement"}
          </DialogTitle>
          <DialogDescription className="t-muted">
            Visitors see it as a pop-up when they open the site, once each.
            Saving an edit shows it to them again.
          </DialogDescription>
        </DialogHeader>

        {/* Not a form: Enter in a field must never publish to every visitor. */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid content-start gap-5">
            <Field
              id={idOf("title")}
              label="Title"
              count={[text.title.length, TITLE_MAX]}
              error={errors.title}
            >
              <input
                {...control("title")}
                maxLength={TITLE_MAX}
                placeholder="Ladder mode is here"
              />
            </Field>

            <Field
              id={idOf("message")}
              label="Message"
              count={[text.message.length, MESSAGE_MAX]}
              hint="Plain text. Line breaks are kept."
              error={errors.message}
            >
              <textarea
                {...control("message")}
                rows={5}
                maxLength={MESSAGE_MAX}
                placeholder="Say what changed and what to do next, in a few short lines"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id={idOf("actionLabel")}
                label="Button label (optional)"
                error={errors.actionLabel}
              >
                <input
                  {...control("actionLabel")}
                  maxLength={ACTION_LABEL_MAX}
                  placeholder="Start a session"
                />
              </Field>
              <Field
                id={idOf("actionUrl")}
                label="Button link"
                error={errors.actionUrl}
              >
                <input
                  {...control("actionUrl")}
                  maxLength={300}
                  placeholder="/training or https://codeforces.com/contests"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </Field>
            </div>

            <div className="u-field">
              <span id="announcement-audience">Audience</span>
              <div
                className="u-seg justify-self-start"
                role="group"
                aria-labelledby="announcement-audience"
              >
                {AUDIENCES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={audience === value}
                    onClick={() => setAudience(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="u-hint">
                {AUDIENCES.find((a) => a.value === audience)?.hint}
              </p>
            </div>

            {/* one per row: side by side they were too narrow for a full date and time */}
            <div className="grid gap-4">
              <Field
                id={idOf("startsAt")}
                label="Starts (optional)"
                hint="Your local time. Empty: on publish."
              >
                <DateTimePicker
                  id={idOf("startsAt")}
                  value={text.startsAt}
                  onChange={(startsAt) => setText({ ...text, startsAt })}
                  placeholder="On publish"
                />
              </Field>
              <Field
                id={idOf("endsAt")}
                label="Ends (optional)"
                hint="Your local time. Empty: no end."
                error={errors.endsAt}
              >
                <DateTimePicker
                  id={idOf("endsAt")}
                  value={text.endsAt}
                  onChange={(endsAt) => setText({ ...text, endsAt })}
                  min={text.startsAt || undefined}
                  placeholder="No end"
                  aria-invalid={errors.endsAt ? true : undefined}
                  aria-describedby={
                    errors.endsAt ? `${idOf("endsAt")}-error` : undefined
                  }
                />
              </Field>
            </div>
          </div>

          <div className="grid content-start gap-3">
            <p className="t-eyebrow">Preview</p>
            <div className="u-panel u-panel--sunk p-4 sm:p-6">
              {/* A picture of the pop-up: its buttons do nothing here. */}
              <div
                inert
                className="relative mx-auto max-w-md rounded-lg border border-line bg-card p-6 shadow-pop"
              >
                <X
                  className="absolute right-5 top-5 size-4 text-ink-muted"
                  aria-hidden="true"
                />
                <AnnouncementBody
                  preview
                  announcement={{
                    title: text.title.trim() || "Your title",
                    message:
                      text.message.trim() || "Your message appears here.",
                    actionLabel: text.actionLabel.trim() || null,
                    actionUrl: text.actionUrl.trim() || null,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:col-span-2">
            {serverError && <FormError>{serverError}</FormError>}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => void save(false)}
              >
                Save draft
              </Button>
              <Button disabled={saving} onClick={() => void save(true)}>
                {saving
                  ? "Saving…"
                  : announcement?.published
                    ? "Publish changes"
                    : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
