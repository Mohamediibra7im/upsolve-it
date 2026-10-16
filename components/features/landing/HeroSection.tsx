"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Focus,
  Layers3,
  Zap,
} from "lucide-react";
import StudioMascot from "@/components/shared/StudioMascot";
import styles from "./landing.module.css";

const modes = {
  Ladder: {
    icon: Layers3,
    title: "A little higher, every session.",
    description: "Start with a familiar problem. Finish with a new idea.",
    time: "120 min",
    range: "1,000–1,400",
    topics: ["Implementation", "Greedy", "Binary search", "Math"],
    ratings: [1000, 1100, 1300, 1400],
  },
  Weakness: {
    icon: Focus,
    title: "Make the tricky topics click.",
    description: "Give the ideas you tend to avoid a little more attention.",
    time: "120 min",
    range: "1,000–1,300",
    topics: ["Dynamic programming", "Graphs", "Dynamic programming", "Graphs"],
    ratings: [1000, 1100, 1200, 1300],
  },
  Speed: {
    icon: Zap,
    title: "Find your rhythm against the clock.",
    description: "A shorter session for faster thinking and cleaner solves.",
    time: "52 min",
    range: "800–1,100",
    topics: ["Implementation", "Strings", "Sorting", "Greedy"],
    ratings: [800, 900, 1000, 1100],
  },
};
type Mode = keyof typeof modes;
const problemNames = [
  "Find your footing",
  "Spot the pattern",
  "Connect the ideas",
  "Take the next step",
];

export default function HeroSection({ user }: { user: unknown }) {
  const [mode, setMode] = useState<Mode>("Ladder");
  const preview = modes[mode];
  const destination = user ? "/training" : "/signup";

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.masthead}>
        <p className={styles.heroKicker}>
          <span className={styles.codeforcesBars} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Codeforces practice, with a plan.
        </p>
        <h1 id="hero-title">
          Make your next
          <br />
          solve count.
        </h1>
        <p className={styles.heroDescription}>
          Find your challenge. Work through the hard parts. Build a practice
          routine that takes you somewhere.
        </p>
        <div className={styles.heroActions}>
          <Link href={destination} className={styles.primaryButton}>
            {user ? "Build your next session" : "Start practicing for free"}
            <ArrowUpRight size={18} />
          </Link>
          <a href="#practice-lab" className={styles.textButton}>
            Explore the workspace
            <ArrowDown size={16} />
          </a>
        </div>
        <p className={styles.heroNote}>
          Free to use. Built by competitive programmers.
        </p>
      </div>

      <div id="practice-lab" className={styles.practiceLab}>
        <div className={styles.labToolbar}>
          <div className={styles.labTitle}>
            <span className={styles.labStatus} />
            Your practice workspace
            <span className={styles.demoLabel}>Interactive preview</span>
          </div>
          <span className={styles.labToolbarNote}>
            A good place to get better.
          </span>
        </div>
        <div className={styles.labLayout}>
          <div className={styles.modeRail}>
            <p>Find your focus</p>
            <div
              role="group"
              aria-label="Preview a training mode"
              className={styles.modeOptions}
            >
              {(Object.keys(modes) as Mode[]).map((name) => {
                const Icon = modes[name].icon;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={mode === name}
                    onClick={() => setMode(name)}
                    className={mode === name ? styles.activeMode : undefined}
                  >
                    <Icon size={17} />
                    <span>{name}</span>
                    <ArrowUpRight size={14} className={styles.modeArrow} />
                  </button>
                );
              })}
            </div>
            <div className={styles.moreModes}>
              <span>Go further</span>
              <p>
                Contest simulation
                <br />
                Endurance sessions
              </p>
              <Link href={destination}>
                See all five modes
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div
            className={styles.sessionPreview}
            aria-live="polite"
            aria-atomic="true"
          >
            <div className={styles.sessionHeading}>
              <div>
                <h2>{preview.title}</h2>
                <p>{preview.description}</p>
              </div>
              <span>
                <Clock3 size={14} />
                {preview.time}
              </span>
            </div>
            <div className={styles.problemHeading}>
              <span>Your problem set</span>
              <span>Rating</span>
            </div>
            <div className={styles.problemList}>
              {problemNames.map((name, index) => (
                <div className={styles.problemRow} key={name}>
                  <span
                    className={
                      index === 0 ? styles.problemSolved : styles.problemIndex
                    }
                  >
                    {index === 0 ? (
                      <Check size={14} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <span>{preview.topics[index]}</span>
                  </div>
                  <span className={styles.problemRating}>
                    {preview.ratings[index].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <p className={styles.previewCaption}>
              Example problems and ratings. Your session is generated around
              your choices.
            </p>
          </div>
          <div className={styles.climbPanel}>
            <div className={styles.climbHeading}>
              <span>Room to grow</span>
              <strong>{preview.range}</strong>
              <p>
                Choose a range.
                <br />
                Give yourself a challenge.
              </p>
            </div>
            <div className={styles.climbScene} aria-hidden="true">
              <svg
                className={styles.climbGuide}
                viewBox="0 0 240 190"
                fill="none"
              >
                <path
                  d="M0 188H60V140H120V92H180V44H240"
                  stroke="#526c5b"
                  strokeWidth="1"
                />
                <path
                  d="M60 140V190M120 92V190M180 44V190"
                  stroke="#344c3b"
                  strokeWidth="1"
                />
              </svg>
              <StudioMascot
                pose="climb"
                priority
                className={styles.climbMascot}
              />
            </div>
            <Link href={destination} className={styles.labCta}>
              Make it your session
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className={styles.labFooter}>
          <span>
            <Check size={13} />
            Train with your Codeforces profile
          </span>
          <span>One attempt. One insight. One step forward.</span>
        </div>
      </div>
    </section>
  );
}
