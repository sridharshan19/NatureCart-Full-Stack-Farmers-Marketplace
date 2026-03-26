import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaLeaf,
  FaLocationArrow,
  FaTwitter,
} from "react-icons/fa";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Orders", to: "/orders" },
];

const roleNotes = [
  "Admin dashboard for farmer onboarding and order review",
  "Farmer tools for product inventory and fulfillment updates",
  "Consumer flow for browsing, cart, checkout, and pickup",
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram },
  { label: "Twitter", href: "https://x.com", icon: FaTwitter },
];

export default function Footer() {
  return (
    <footer className="brand-shell mt-14 text-slate-900">
      <div className="page-frame grid gap-8 py-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grain-ring flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-[linear-gradient(135deg,#ffd986_0%,#ffffff_100%)] text-emerald-800">
              <FaLeaf className="text-lg" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-700">
                NatureCart
              </p>
              <h3 className="mt-1 text-2xl font-black text-emerald-950">
                Fresh trade, clear operations.
              </h3>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-700">
            Fresh produce marketplace connecting farmers and consumers with
            seamless ordering, role-based access, and pickup coordination.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold text-emerald-950">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-700">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link className="hover:text-emerald-900" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold text-emerald-950">Platform Roles</h4>
          <ul className="space-y-3 text-sm text-slate-700">
            {roleNotes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <FaLocationArrow className="mt-1 text-xs text-amber-700" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold text-emerald-950">Connect</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-2 hover:-translate-y-0.5 hover:bg-white/80"
                >
                  <Icon className="text-sm text-amber-700" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-slate-700">
            Built with React, Express, MongoDB, and JWT authentication.
          </p>
        </div>
      </div>

      <div className="border-t border-white/50 py-4 text-center text-sm text-slate-700">
        Copyright 2026 NatureCart. All rights reserved.
      </div>
    </footer>
  );
}
