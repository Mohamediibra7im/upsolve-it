export type Audience = "everyone" | "members";

/** One entry of GET /api/announcements/current, as the bar and its pop-up show it. */
export interface CurrentAnnouncement {
  id: string;
  title: string;
  /** Plain text with line breaks. Never rendered as HTML. */
  message: string;
  actionLabel: string | null;
  /** An internal path or an https:// address: see utils/announcement.ts. */
  actionUrl: string | null;
  /** Changes on every edit: with the id, it is what a dismissal remembers. */
  updatedAt: string;
}

/** A stored announcement, as the admin list returns it. */
export interface Announcement extends Omit<CurrentAnnouncement, "id"> {
  _id: string;
  /** `members` is shown to signed-in visitors only. */
  audience: Audience;
  startsAt: string | null;
  endsAt: string | null;
  published: boolean;
  createdAt: string;
}

/** The body of a create or an update. An update replaces every field. */
export type AnnouncementInput = Pick<
  Announcement,
  | "title"
  | "message"
  | "actionLabel"
  | "actionUrl"
  | "audience"
  | "startsAt"
  | "endsAt"
  | "published"
>;
