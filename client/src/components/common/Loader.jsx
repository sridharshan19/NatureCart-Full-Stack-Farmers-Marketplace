export default function Loader({ label = "Loading..." }) {
  return (
    <div className="rounded-[1.75rem] bg-white/95 p-6 text-center shadow-xl">
      <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-[#0f766e]" />
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
