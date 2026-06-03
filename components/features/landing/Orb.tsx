/* ───── Decorative orb ───── */
const Orb = ({className}: {className?: string}) => (
  <div
    className={`absolute rounded-full pointer-events-none blur-[120px] ${className}`}
  />
);

export default Orb;
