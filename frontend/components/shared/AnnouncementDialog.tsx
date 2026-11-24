"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { CurrentAnnouncement } from "@/types/Announcement";
import { isActionUrl } from "@/utils/announcement";

type Shown = Omit<CurrentAnnouncement, "id" | "updatedAt">;

/**
 * The announcement's button as a link, or nothing when it has no action or
 * its address is not one the site will open. A path stays in this tab; an
 * outside address opens in a new one.
 */
export function AnnouncementAction({
  announcement: { actionLabel, actionUrl },
  className,
  onClick,
}: {
  announcement: Pick<Shown, "actionLabel" | "actionUrl">;
  className: string;
  onClick?: () => void;
}) {
  if (!actionLabel || !actionUrl || !isActionUrl(actionUrl)) return null;
  return actionUrl.startsWith("/") ? (
    <Link href={actionUrl} onClick={onClick} className={className}>
      {actionLabel}
    </Link>
  ) : (
    <a
      href={actionUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      {actionLabel}
      <ArrowUpRight aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/**
 * The whole announcement, as the pop-up shows it when the site opens. The
 * admin editor draws the same thing as its preview.
 */
export function AnnouncementBody({
  announcement,
  onClose,
  preview = false,
  position,
  stepper,
}: {
  announcement: Shown;
  onClose?: () => void;
  /** "2 of 3", when there is more than one to read. */
  position?: string;
  /** The previous and next buttons, placed at the start of the last row. */
  stepper?: ReactNode;
  /** Outside a dialog: plain elements in place of the dialog's title and description. */
  preview?: boolean;
}) {
  const { title, message, actionLabel, actionUrl } = announcement;
  const Title = preview ? "h3" : DialogTitle;
  const Message = preview ? "p" : DialogDescription;
  const hasAction = !!actionLabel && !!actionUrl && isActionUrl(actionUrl);

  return (
    <div className="grid gap-4 text-left">
      <div className="grid gap-2 pr-8">
        <p className="t-eyebrow">
          Announcement{position ? ` · ${position}` : ""}
        </p>
        <Title className="t-h2 break-words">{title}</Title>
      </div>
      <Message className="t-muted whitespace-pre-line break-words text-[15px] leading-6">
        {message}
      </Message>
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
        {stepper && <div className="flex gap-2 sm:mr-auto">{stepper}</div>}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {hasAction ? (
          <AnnouncementAction
            announcement={announcement}
            className="u-btn u-btn--primary"
            onClick={onClose}
          />
        ) : (
          <Button onClick={onClose}>Got it</Button>
        )}
      </div>
    </div>
  );
}
