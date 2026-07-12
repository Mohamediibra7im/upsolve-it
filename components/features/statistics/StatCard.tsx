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
  <m.div variants={fadeUp} className="py-3 px-4 border-b border-emerald-500/10 font-mono text-emerald-400">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/40">{title}</span>
      {trend !== undefined && (
        <span className={`text-[9px] font-bold tabular-nums ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {trend >= 0 ? "+" : ""}{trend}
        </span>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-emerald-300 tabular-nums">{value}</span>
      <Icon size={12} className="text-emerald-500/40" />
    </div>
    {subValue && <p className="text-[9px] text-emerald-500/30 mt-0.5">{subValue}</p>}
  </m.div>
);
