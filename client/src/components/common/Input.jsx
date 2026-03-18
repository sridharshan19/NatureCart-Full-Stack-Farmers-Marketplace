export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-[#d7d2c8] bg-[#fffaf4] p-3 text-slate-800 shadow-sm outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4] ${className}`}
    />
  );
}
