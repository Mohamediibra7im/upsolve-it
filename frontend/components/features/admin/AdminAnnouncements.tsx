"use client";

import { useState } from "react";
import {
  CalendarClock,
  CircleOff,
  PencilLine,
  Plus,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHead } from "@/components/ui/kit";
import { useToast } from "@/components/providers/Toast";
import {
  useAdminAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
} from "@/hooks/admin/useAdminAnnouncements";
import type { Announcement } from "@/types/Announcement";
import { AdminPager } from "./AdminPager";
import { AdminState, AdminRetry } from "./AdminState";
import { AnnouncementEditor } from "./AnnouncementEditor";

const when = (iso: string) =>
  new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

/** Where an announcement stands right now. The state never comes as colour alone. */
function StateBadge({ announcement }: { announcement: Announcement }) {
  const { published, startsAt, endsAt } = announcement;
  const now = Date.now();
  if (!published)
    return (
      <Badge variant="line">
        <PencilLine />
        Draft
      </Badge>
    );
  if (endsAt && Date.parse(endsAt) <= now)
    return (
      <Badge>
        <CircleOff />
        Ended
      </Badge>
    );
  if (startsAt && Date.parse(startsAt) > now)
    return (
      <Badge variant="pending">
        <CalendarClock />
        Scheduled
      </Badge>
    );
  return (
    <Badge variant="solved">
      <Radio />
      Live
    </Badge>
  );
}

export default function AdminAnnouncements() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // null: closed. { announcement: null }: writing a new one.
  const [editor, setEditor] = useState<{
    announcement: Announcement | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<Announcement | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();
  const { announcements, total, isLoading, isError, mutate } =
    useAdminAnnouncements(pageSize, (page - 1) * pageSize);

  /** Runs one change on a row, then reloads the list and says what happened. */
  const change = async (
    announcement: Announcement,
    run: () => Promise<void>,
    done: string,
  ) => {
    setBusyId(announcement._id);
    try {
      await run();
      await mutate();
      toast({ title: done, variant: "success" });
    } catch (error) {
      toast({
        title: "The announcement did not change.",
        description:
          error instanceof Error ? error.message : "Try again in a minute.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  };

  const togglePublished = (a: Announcement) =>
    change(
      a,
      () =>
        saveAnnouncement(
          {
            title: a.title,
            message: a.message,
            actionLabel: a.actionLabel,
            actionUrl: a.actionUrl,
            audience: a.audience,
            startsAt: a.startsAt,
            endsAt: a.endsAt,
            published: !a.published,
          },
          a._id,
        ),
      a.published ? "Announcement unpublished." : "Announcement published.",
    );

  const confirmDelete = () => {
    if (!deleting) return;
    setDeleting(null);
    void change(
      deleting,
      () => deleteAnnouncement(deleting._id),
      "Announcement deleted.",
    );
  };

  return (
    <>
      <PageHead eyebrow="Admin" title="Announcements">
        <Button onClick={() => setEditor({ announcement: null })}>
          <Plus />
          New announcement
        </Button>
      </PageHead>

      <section className="u-panel" aria-label="Announcements">
        <div className="u-panel__head">
          <p className="t-sm t-muted">
            Every live announcement opens in a pop-up when someone visits,
            newest first.
          </p>
          <span className="t-sm t-num t-muted">{total} total</span>
        </div>

        {isLoading ? (
          <AdminState tone="loading" title="Loading announcements…" />
        ) : isError ? (
          <AdminState
            tone="error"
            title="The announcements did not load"
            description="The server did not answer. Try again in a minute."
            action={<AdminRetry onRetry={() => mutate()} />}
            className="border-0"
          />
        ) : announcements.length === 0 ? (
          <AdminState
            title="No announcements yet"
            description="Write one with New announcement. Published, it greets visitors when they open the site."
            className="border-0"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="u-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Audience</th>
                  <th>Window</th>
                  <th>State</th>
                  <th>Updated</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a._id}>
                    <td className="min-w-56 max-w-sm">
                      <b className="block truncate" title={a.title}>
                        {a.title}
                      </b>
                      <span className="t-sm t-muted block truncate">
                        {a.message}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      {a.audience === "members" ? "Members only" : "Everyone"}
                    </td>
                    <td className="t-num whitespace-nowrap text-ink-muted">
                      {a.startsAt ? when(a.startsAt) : "On publish"} to{" "}
                      {a.endsAt ? when(a.endsAt) : "No end"}
                    </td>
                    <td>
                      <StateBadge announcement={a} />
                    </td>
                    <td className="t-num whitespace-nowrap text-ink-muted">
                      {when(a.updatedAt)}
                    </td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busyId}
                          onClick={() => setEditor({ announcement: a })}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!busyId}
                          onClick={() => void togglePublished(a)}
                        >
                          {busyId === a._id
                            ? "Saving…"
                            : a.published
                              ? "Unpublish"
                              : "Publish"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={!!busyId}
                          onClick={() => setDeleting(a)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <AdminPager
          page={page}
          totalPages={Math.max(1, Math.ceil(total / pageSize))}
          pageSize={pageSize}
          disabled={isLoading}
          onPage={setPage}
          onPageSize={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </section>

      {editor && (
        <AnnouncementEditor
          announcement={editor.announcement}
          onClose={() => setEditor(null)}
          onSaved={(published) => {
            setEditor(null);
            void mutate();
            toast({
              title: published
                ? "Announcement published."
                : "Draft saved. Visitors do not see it yet.",
              variant: "success",
            });
          }}
        />
      )}

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-md">
          {deleting && (
            <>
              <DialogHeader>
                <DialogTitle>Delete this announcement?</DialogTitle>
                <DialogDescription asChild>
                  <div className="grid gap-3 text-left">
                    <p className="t-muted">
                      It is removed for good and visitors stop seeing it. To
                      hide it and keep the text, unpublish it instead.
                    </p>
                    <div className="u-panel u-panel--sunk px-4 py-3 text-ink">
                      <b className="block truncate">{deleting.title}</b>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setDeleting(null)}>
                  Keep it
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  Delete announcement
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
