import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { m, Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export const StatCard = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subValue?: string; 
  icon: any; 
  color: string;
  trend?: number;
}) => (
  <m.div variants={fadeUp}>
    <Card className="relative overflow-hidden group border-border/40 bg-card/40 backdrop-blur-xl transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
      <div className={cn("absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500", color)}>
        <Icon size={120} />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-xl border transition-colors duration-500", 
            "bg-background/40 border-border/40 group-hover:border-primary/30")}>
            <Icon className={cn("size-5", color)} />
          </div>
          {trend !== undefined && (
            <Badge variant={trend >= 0 ? "default" : "destructive"} className="font-bold tabular-nums">
              {trend >= 0 ? "+" : ""}{trend}
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/70">{title}</p>
          <h3 className="text-3xl font-black text-foreground tracking-tighter">{value}</h3>
          {subValue && <p className="text-xs font-medium text-muted-foreground">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  </m.div>
);
