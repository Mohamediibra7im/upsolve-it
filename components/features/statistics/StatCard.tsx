import { m, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  icon: any;
  trend?: number;
}) => (
  <m.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-5 font-sans text-primary">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      {trend !== undefined && (
        <span className={`text-xs font-medium tabular-nums ${trend >= 0 ? "text-primary" : "text-red-400"}`}>
          {trend >= 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="font-heading text-3xl font-medium text-foreground tabular-nums">{value}</span>
      <Icon size={16} className="text-muted-foreground" />
    </div>
    {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
  </m.div>
);
