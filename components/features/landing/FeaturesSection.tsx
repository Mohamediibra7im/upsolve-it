import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  GitBranch,
  LockKeyhole,
  RotateCcw,
  ChartNoAxesCombined,
  CalendarDays,
  History,
} from "lucide-react";
import StudioMascot from "@/components/shared/StudioMascot";
import styles from "./landing.module.css";

export default function FeaturesSection({
  signedIn = false,
}: {
  signedIn?: boolean;
}) {
  return (
    <section
      id="features"
      className={styles.features}
      aria-labelledby="features-title"
    >
      <div className={styles.sectionHeading}>
        <h2 id="features-title">
          The next step.
          <br />
          And the one after that.
        </h2>
        <p>
          Practice works better when it connects.
          <br />
          Keep your learning, attempts, and progress together.
        </p>
      </div>
      <article className={styles.roadmapStory}>
        <div className={styles.storyCopy}>
          <span className={styles.storyIcon}>
            <GitBranch size={22} />
          </span>
          <h3>
            Give your curiosity
            <br />
            some direction.
          </h3>
          <p>
            A guided roadmap takes you from the fundamentals to the techniques
            you’ve been meaning to learn. Follow the path at your own pace.
          </p>
          <Link
            href={signedIn ? "/roadmap" : "/signup"}
            className={styles.darkLink}
          >
            Explore the learning path
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div
          className={styles.pathPreview}
          aria-label="Example roadmap progression"
        >
          <div className={styles.pathHeading}>
            <span>Your learning path</span>
            <span>Keep moving forward</span>
          </div>
          <div className={styles.pathRow}>
            <span className={styles.pathComplete}>
              <Check size={17} />
            </span>
            <div>
              <strong>The foundations</strong>
              <p>Get comfortable with the essentials.</p>
            </div>
            <span className={styles.pathState}>Completed</span>
          </div>
          <div className={`${styles.pathRow} ${styles.currentPath}`}>
            <span className={styles.pathCurrent}>
              <span />
            </span>
            <div>
              <strong>Patterns & techniques</strong>
              <p>Turn familiar ideas into useful tools.</p>
            </div>
            <ArrowUpRight size={18} />
          </div>
          <div className={styles.pathRow}>
            <span className={styles.pathLocked}>
              <LockKeyhole size={15} />
            </span>
            <div>
              <strong>The next challenge</strong>
              <p>Bring it all together.</p>
            </div>
          </div>
          <div className={styles.pathFootnote}>
            Every topic builds on what came before.
          </div>
        </div>
      </article>
      <article className={styles.upsolveStory}>
        <div className={styles.queuePreview}>
          <div className={styles.queueHeading}>
            <RotateCcw size={18} />
            <span>Worth another attempt</span>
            <span className={styles.queueBadge}>Example queue</span>
          </div>
          {[
            {
              title: "The pattern you almost found",
              topic: "Greedy",
              rating: "1,200",
            },
            {
              title: "The graph that made you pause",
              topic: "Graphs",
              rating: "1,400",
            },
            {
              title: "A different way to think about it",
              topic: "Dynamic programming",
              rating: "1,600",
            },
          ].map((problem) => (
            <div className={styles.queueRow} key={problem.title}>
              <span className={styles.queueDot} />
              <div>
                <strong>{problem.title}</strong>
                <span>{problem.topic}</span>
              </div>
              <span className={styles.queueRating}>{problem.rating}</span>
            </div>
          ))}
          <div className={styles.queueBottom}>
            <span>Save it. Understand it. Solve it.</span>
            <StudioMascot pose="think" className={styles.queueMascot} />
          </div>
        </div>
        <div className={styles.storyCopy}>
          <span className={styles.storyIcon}>
            <RotateCcw size={22} />
          </span>
          <h3>
            There’s more to learn
            <br />
            after the timer ends.
          </h3>
          <p>
            The problems you didn’t solve stay within reach. Come back with a
            fresh perspective and make the second attempt your best one.
          </p>
          <Link
            href={signedIn ? "/upsolve" : "/signup"}
            className={styles.textButton}
          >
            Build your upsolve habit
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </article>
      <div className={styles.progressStrip}>
        <div>
          <h3>See the practice paying off.</h3>
          <p>Your effort deserves more than a forgotten browser tab.</p>
        </div>
        <div className={styles.progressTools}>
          <Link href={signedIn ? "/statistics" : "/signup"}>
            <History size={18} />
            Session history
          </Link>
          <Link href={signedIn ? "/profile" : "/signup"}>
            <CalendarDays size={18} />
            Practice streaks
          </Link>
          <Link href={signedIn ? "/statistics" : "/signup"}>
            <ChartNoAxesCombined size={18} />
            Performance insights
          </Link>
        </div>
      </div>
    </section>
  );
}
