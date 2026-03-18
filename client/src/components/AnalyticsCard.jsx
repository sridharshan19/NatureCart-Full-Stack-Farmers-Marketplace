const AnalyticsCard = ({ title, value, subtitle, accent = "teal" }) => {
  const accentMap = {
    teal: "from-teal-600 to-teal-800",
    amber: "from-amber-500 to-amber-700",
    slate: "from-slate-700 to-slate-900",
    sky: "from-sky-500 to-sky-700",
  };

  return (
    <div
      className={`rounded-[1.75rem] bg-gradient-to-br ${
        accentMap[accent] || accentMap.teal
      } p-6 text-white shadow-xl`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-white/70">{title}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-white/80">{subtitle}</p> : null}
    </div>
  );
};

export default AnalyticsCard;
