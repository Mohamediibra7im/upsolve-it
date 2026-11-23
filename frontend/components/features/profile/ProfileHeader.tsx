import Link from "next/link";
import { Eye, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { profileLinkList } from "@/utils/profileLinks";
import type { User } from "@/types/User";
import ProfileHero from "./ProfileHero";

export default function ProfileHeader({
  user,
  onVerify,
}: {
  user: User;
  onVerify: () => void;
}) {
  const since = user.createdAt && new Date(user.createdAt);
  const nothingAdded =
    !user.displayName && !user.bio && profileLinkList(user.links).length === 0;
  return (
    <ProfileHero
      eyebrow={
        since && !Number.isNaN(since.getTime())
          ? `Your profile · Member since ${since.toLocaleDateString(undefined, { month: "long", year: "numeric" })}`
          : "Your profile"
      }
      person={user}
      badges={
        <>
          {user.isVerified ? (
            <Badge variant="solved">
              <ShieldCheck />
              Verified
            </Badge>
          ) : (
            <>
              <Badge variant="pending">
                <ShieldAlert />
                Not verified
              </Badge>
              <Button variant="link" onClick={onVerify}>
                Verify your handle
              </Button>
            </>
          )}
          {user.role === "admin" && <Badge variant="line">Admin</Badge>}
        </>
      }
      actions={
        <>
          <Link href="/settings" className="u-btn u-btn--sm u-btn--ghost">
            <Pencil aria-hidden="true" />
            Edit profile
          </Link>
          {user.publicProfile && (
            <Link
              href={`/u/${user.codeforcesHandle}`}
              className="u-btn u-btn--sm u-btn--ghost"
            >
              <Eye aria-hidden="true" />
              View public page
            </Link>
          )}
        </>
      }
      note={
        nothingAdded && (
          <Link href="/settings" className="u-btn u-btn--sm justify-self-start">
            Add your name, bio and links
          </Link>
        )
      }
    />
  );
}
