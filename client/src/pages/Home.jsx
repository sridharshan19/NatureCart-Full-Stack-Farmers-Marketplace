import { Link } from "react-router-dom";

const features = [
  {
    title: "Admin command center",
    description: "Create farmers, review all order activity, and manage products with confidence.",
  },
  {
    title: "Farmer inventory flow",
    description: "Publish produce, follow stock, and keep fulfillment moving from a single dashboard.",
  },
  {
    title: "Consumer shopping path",
    description: "Browse products, build a cart, and place pickup orders with a clean checkout flow.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fff7ed_28%,#ccfbf1_58%,#0f172a_100%)] p-8 shadow-2xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-700">
            NatureCart marketplace
          </p>
          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-900">
            Fresh produce, sharper operations, and a calmer admin workflow.
          </h1>
          <p className="mt-4 text-base text-slate-700">
            This frontend is connected to your backend auth, product, cart, order, and
            farmer-management APIs, with a richer admin-first workspace for review and
            control.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="rounded-full bg-[#0f766e] px-6 py-3 font-semibold text-white shadow-lg"
            >
              Open Dashboard
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-white/60 bg-white/80 px-6 py-3 font-semibold text-slate-800 shadow"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-[1.75rem] bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
