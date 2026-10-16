import Link from "next/link";
import { ArrowUpRight, Github, Heart } from "lucide-react";
import StudioMascot from "@/components/shared/StudioMascot";
import styles from "./landing.module.css";
export default function CommunitySection({
  signedIn = false,
}: {
  signedIn?: boolean;
}) {
  return (
    <section
      id="community"
      className={styles.community}
      aria-labelledby="community-title"
    >
      <div className={styles.communityIntro}>
        <span>
          <Heart size={16} />
          Made by people who love a good problem.
        </span>
        <a
          href="https://www.facebook.com/fcsit.hnu.icpc"
          target="_blank"
          rel="noopener noreferrer"
        >
          Meet HNU ICPC
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className={styles.communityMain}>
        <div>
          <h2 id="community-title">
            A little better.
            <br />
            Every session.
          </h2>
          <p>
            No shortcuts to understanding.
            <br />
            Just a good place to keep showing up.
          </p>
          <Link
            href={signedIn ? "/training" : "/signup"}
            className={styles.primaryButton}
          >
            {signedIn ? "Build your next session" : "Find your next challenge"}
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className={styles.communityArt} aria-hidden="true">
          <span className={styles.communityWord}>
            keep
            <br />
            going.
          </span>
          <StudioMascot pose="welcome" className={styles.communityMascot} />
        </div>
      </div>
      <div className={styles.communityFooter}>
        <span>Free to use. Made for the climb.</span>
        <a
          href="https://github.com/HNU-ICPC-Community"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={15} />
          Built in the open
          <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}
