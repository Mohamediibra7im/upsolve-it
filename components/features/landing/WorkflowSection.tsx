import Link from "next/link";
import {
  ArrowUpRight,
  SlidersHorizontal,
  Code2,
  RotateCcw,
} from "lucide-react";
import styles from "./landing.module.css";
const steps = [
  {
    icon: SlidersHorizontal,
    title: "Make it yours.",
    text: "Connect your Codeforces handle, choose a mode, and set the difficulty and topics.",
  },
  {
    icon: Code2,
    title: "Give it a real attempt.",
    text: "Work through your set on Codeforces. Stay curious when the obvious approach doesn’t work.",
  },
  {
    icon: RotateCcw,
    title: "Come back with an insight.",
    text: "Review your session, revisit the unsolved problems, and take what you learned into the next one.",
  },
];
export default function WorkflowSection() {
  return (
    <section
      id="how-it-works"
      className={styles.workflow}
      aria-labelledby="workflow-title"
    >
      <div className={styles.workflowHeading}>
        <h2 id="workflow-title">
          A simple loop.
          <br />A lasting habit.
        </h2>
        <Link href="/help/quick-start" className={styles.textButton}>
          Read the getting started guide
          <ArrowUpRight size={17} />
        </Link>
      </div>
      <ol className={styles.steps}>
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title}>
            <div className={styles.stepTop}>
              <span>0{index + 1}</span>
              <Icon size={21} />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
