const AnalyticsCard = ({ title, value, subtitle, accent = "teal" }) => {
  const accentMap = {
    teal: "from-[#d6f6ea] to-[#7fd4b3]",
    amber: "from-[#ffe6bd] to-[#f3b869]",
    slate: "from-[#dbe8e2] to-[#8ea39b]",
    sky: "from-[#d9f0ff] to-[#8bc8ec]",
  };

  return (
    <div
      className={`rounded-[1.75rem] bg-gradient-to-br ${
        accentMap[accent] || accentMap.teal
      } p-6 text-slate-900 shadow-xl`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-slate-600">{title}</p>
      <p className="mt-3 text-3xl font-black">{value}</p>
      {subtitle ? <p className="mt-2 text-sm text-slate-700">{subtitle}</p> : null}
    </div>
  );
};

export default AnalyticsCard;
