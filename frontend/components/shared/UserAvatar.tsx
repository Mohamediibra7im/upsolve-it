import { avatarDataUri } from "glyph-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Every avatar in the app: the glyph avatar a user picked, otherwise their
 * Codeforces photo, otherwise their initials. Works in server components.
 */
export default function UserAvatar({
  avatar,
  glyphAvatar,
  codeforcesHandle,
  size = 40,
  className,
}: {
  avatar?: string | null;
  glyphAvatar?: string | null;
  codeforcesHandle?: string | null;
  /** Width and height in pixels. */
  size?: number;
  className?: string;
}) {
  return (
    <Avatar
      className={className}
      style={{ width: size, height: size, fontSize: Math.max(12, size / 4) }}
    >
      {glyphAvatar ? (
        // An SVG drawn from the saved value; as an <img> it cannot run anything.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarDataUri(glyphAvatar)} alt="" className="size-full" />
      ) : (
        <>
          <AvatarImage src={avatar || undefined} alt="" />
          <AvatarFallback className="text-[length:inherit]">
            {codeforcesHandle?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </>
      )}
    </Avatar>
  );
}
