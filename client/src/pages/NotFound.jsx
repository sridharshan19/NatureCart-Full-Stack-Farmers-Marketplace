import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl rounded-[2rem] bg-white/95 p-10 text-center shadow-2xl">
      <p className="text-xs uppercase tracking-[0.35em] text-amber-700">404</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-4 text-sm text-slate-600">
        The page you requested is not available right now. Head back to the marketplace
        or return to your dashboard.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          to="/"
          className="rounded-full bg-[#0f766e] px-5 py-3 font-semibold text-white"
        >
          Go Home
        </Link>
        <Link
          to="/dashboard"
          className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-800"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}
