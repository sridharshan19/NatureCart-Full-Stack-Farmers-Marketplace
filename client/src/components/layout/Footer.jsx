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
    <footer className="mt-8 border-t border-white/30 bg-[linear-gradient(135deg,#111827_0%,#0f766e_55%,#b45309_100%)] text-white shadow-2xl">
      <div className="container mx-auto grid gap-6 px-4 py-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-amber-200">
              <FaLeaf className="text-lg" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-200">
                NatureCart
              </p>
              <h3 className="mt-1 text-2xl font-black">Fresh trade, clear operations.</h3>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-100/85">
            Fresh produce marketplace connecting farmers and consumers with
            seamless ordering, role-based access, and pickup coordination.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-100/85">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link className="hover:text-amber-200" to={link.to}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold">Platform Roles</h4>
          <ul className="space-y-3 text-sm text-slate-100/85">
            {roleNotes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <FaLocationArrow className="mt-1 text-xs text-amber-200" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-lg font-semibold">Connect</h4>
          <div className="flex flex-wrap gap-3 text-sm">
            {socialLinks.map((link) => {
              const Icon = link.icon;

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 hover:bg-white/20"
                >
                  <Icon className="text-sm text-amber-200" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-slate-100/85">
            Built with React, Express, MongoDB, and JWT authentication.
          </p>
        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-sm text-slate-200">
        © 2026 NatureCart. All rights reserved.
      </div>
    </footer>
  );
}
