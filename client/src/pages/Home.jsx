import { Link } from "react-router-dom";

const features = [
  {
    title: "Direct Sourcing",
    description: "Connect directly with local producers, supporting small-scale farms in your community.",
  },
  {
    title: "Verified Quality",
    description: "Every listing belongs to a verified regional farm, ensuring organic practices and absolute freshness.",
  },
  {
    title: "Secure Pickups",
    description: "Coordinate convenient pickup windows directly with the farmer after placing your order.",
  },
];

const stats = [
  { label: "Verified Farms", value: "Eco-certified" },
  { label: "Zero Middlemen", value: "Direct Trade" },
  { label: "Fresh Guarantee", value: "Harvest to Pickup" },
];

const pillars = [
  "Fresh seasonal ingredients harvested daily",
  "Transparent farmer profiles and direct contact",
  "Easy online coordination for simple local pickup",
];

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="soft-hero px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="absolute -right-16 top-8 h-48 w-48 rounded-full bg-fuchsia-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute left-1/2 top-4 h-28 w-28 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="eyebrow text-amber-800">NatureCart Marketplace</p>
            <h1 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Fresh farm produce straight to your neighborhood.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              NatureCart connects conscious consumers with local growers. Discover fresh seasonal harvests, coordinate local pickups, and support community agriculture with direct-to-farm orders.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="rounded-full bg-[linear-gradient(135deg,#2ca37d_0%,#ef9a45_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-emerald-950/10 hover:-translate-y-0.5"
              >
                Explore Marketplace
              </Link>
              <Link
                to="/dashboard"
                className="rounded-full border border-white/50 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-lg hover:-translate-y-0.5"
              >
                Open Workspace
              </Link>
            </div>
          </div>

          <div className="section-card-strong color-pop rounded-[1.75rem] border border-white/80 p-6">
            <p className="eyebrow">Platform Promise</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Fresh produce, clear ownership, and transparent seller-to-buyer coordinates.
            </h2>
            <div className="mt-5 space-y-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar}
                  className="rounded-2xl border border-orange-100/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,243,221,0.88))] px-4 py-3 text-sm font-medium text-slate-700"
                >
                  {pillar}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="section-card color-pop rounded-[1.6rem] px-5 py-6 md:px-6"
          >
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="section-card-strong color-pop rounded-[1.85rem] p-7">
          <p className="eyebrow">Direct Connection</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">
            Empowering regional farms and conscious consumers.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
            Direct trade channels ensure that farmers receive fair value for their harvests while customers gain access to premium, fresh ingredients. Every order supports family-owned farms and promotes local economic growth.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="rounded-full bg-[linear-gradient(135deg,#ef8f37_0%,#bf6c2f_100%)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20"
            >
              Create Account
            </Link>
            <Link
              to="/products"
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow"
            >
              Browse Catalog
            </Link>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-[1.85rem] bg-[linear-gradient(135deg,#57bb93_0%,#249b72_42%,#f0a759_100%)] p-7 text-white shadow-2xl">
          <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-emerald-950/70">
            Role-Based Portals
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.4rem] border border-white/35 bg-white/35 p-5 text-slate-900 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-700">Admin Console</p>
              <p className="mt-2 text-xl font-bold">Monitor operations, verify farmers, and review analytics</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/35 bg-white/35 p-5 text-slate-900 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-700">Farmer Workspace</p>
              <p className="mt-2 text-xl font-bold">List fresh harvests, adjust pricing, and track orders</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/35 bg-white/35 p-5 text-slate-900 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-700">Consumer Marketplace</p>
              <p className="mt-2 text-xl font-bold">Shop local organic ingredients and coordinate pickups</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="section-card-strong color-pop rounded-[1.75rem] border border-white/80 p-6 hover:-translate-y-1"
          >
            <p className="text-sm uppercase tracking-[0.26em] text-orange-600">Feature</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">{feature.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
