export default function ProductFilter({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search by product or category"
      className="w-full rounded-full border border-[#d7d2c8] bg-white/90 px-5 py-3 text-slate-700 shadow-lg outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4] md:w-80"
    />
  );
}
