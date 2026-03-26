import { Link } from "react-router-dom";
import AnalyticsCard from "../components/AnalyticsCard";

const adminHighlights = [
  {
    title: "Revenue",
    value: "Analytics View",
    subtitle: "Track marketplace earnings and completed order value.",
    accent: "teal",
  },
  {
    title: "Sales",
    value: "Trend Reports",
    subtitle: "Review daily sales movement and order growth.",
    accent: "sky",
  },
  {
    title: "Products",
    value: "Top Performers",
    subtitle: "See which products and farmers are driving demand.",
    accent: "amber",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <section className="soft-hero p-8 text-slate-900">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Admin analytics</p>
        <h1 className="mt-3 text-4xl font-bold">Marketplace insight dashboard</h1>
        <p className="mt-4 max-w-3xl text-sm text-slate-700">
          Review revenue, sales activity, top-performing products, and farmer
          contributions from one clear admin view.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {adminHighlights.map((card) => (
          <AnalyticsCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            accent={card.accent}
          />
        ))}
      </section>

      <section className="surface-panel p-6">
        <h2 className="text-2xl font-bold text-slate-900">Open analytics report</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          Use the full analytics page to inspect revenue, top products, top farmers,
          and sales trend summaries with data from MongoDB orders.
        </p>
        <Link
          to="/admin/analytics"
          className="mt-5 inline-block rounded-full bg-[#0f766e] px-5 py-3 font-semibold text-white"
        >
          View Full Analytics
        </Link>
      </section>
    </div>
  );
}
