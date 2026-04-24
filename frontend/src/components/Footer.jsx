import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function SocialIcon({ platform, className = "" }) {
  if (platform === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.88-7.37L5.63 22H2.5l7.24-8.28L1.8 2h6.4l4.41 6.91L18.9 2zM17.8 20h1.73L7.24 3.9H5.38z" />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M13.4 21v-7.3H16l.4-3h-3v-1.9c0-.88.25-1.48 1.5-1.48h1.6V4.6c-.28-.04-1.22-.12-2.32-.12-2.3 0-3.88 1.4-3.88 4v2.22H7.8v3h2.44V21z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
        <path d="M21.6 7.2a2.9 2.9 0 0 0-2.04-2.04C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.56.46A2.9 2.9 0 0 0 2.4 7.2C1.94 8.96 1.94 12 1.94 12s0 3.04.46 4.8a2.9 2.9 0 0 0 2.04 2.04C6.2 19.3 12 19.3 12 19.3s5.8 0 7.56-.46a2.9 2.9 0 0 0 2.04-2.04c.46-1.76.46-4.8.46-4.8s0-3.04-.46-4.8zM9.9 15.15V8.85L15.35 12z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M6.94 8.5V19H3.5V8.5zm.25-3.25A2 2 0 1 1 3.2 5.25a2 2 0 0 1 3.99 0zM20.5 12.58V19h-3.43v-5.87c0-1.48-.53-2.48-1.84-2.48-1 0-1.6.67-1.86 1.32-.1.23-.12.55-.12.88V19H9.82s.05-9.08 0-10.5h3.43v1.49l-.02.03h.02v-.03c.46-.7 1.28-1.7 3.11-1.7 2.27 0 4.14 1.48 4.14 4.68z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "X", href: "https://x.com", platform: "x" },
  { label: "Instagram", href: "https://instagram.com", platform: "instagram" },
  { label: "Facebook", href: "https://facebook.com", platform: "facebook" },
  { label: "YouTube", href: "https://youtube.com", platform: "youtube" },
  { label: "LinkedIn", href: "https://linkedin.com", platform: "linkedin" },
];

export default function Footer() {
  const { isAuthenticated, user } = useAuth();

  const accountLinks = !isAuthenticated
    ? [
        { label: "Sign in", to: "/login" },
        { label: "Create account", to: "/register" },
        { label: "Browse products", to: "/products" },
      ]
    : user?.role === "customer"
      ? [
          { label: "Profile", to: "/profile" },
          { label: "Orders", to: "/orders" },
          { label: "Cart", to: "/cart" },
          { label: "Wishlist", to: "/wishlist" },
        ]
      : user?.role === "vendor"
        ? [
            { label: "Profile", to: "/profile" },
            { label: "Vendor dashboard", to: "/vendor/dashboard" },
            { label: "Manage products", to: "/vendor/products" },
            { label: "Vendor orders", to: "/vendor/orders" },
          ]
        : [
            { label: "Profile", to: "/profile" },
            { label: "Admin dashboard", to: "/admin/dashboard" },
            { label: "Admin products", to: "/admin/products" },
            { label: "Admin orders", to: "/admin/orders" },
          ];

  const workspaceTitle = user?.role === "vendor" ? "Vendors" : user?.role === "admin" ? "Admin" : "Marketplace";
  const workspaceLinks =
    user?.role === "vendor"
      ? [
          { label: "Vendor dashboard", to: "/vendor/dashboard" },
          { label: "Manage products", to: "/vendor/products" },
          { label: "Vendor orders", to: "/vendor/orders" },
        ]
      : user?.role === "admin"
        ? [
            { label: "Admin dashboard", to: "/admin/dashboard" },
            { label: "Manage users", to: "/admin/users" },
            { label: "Manage vendors", to: "/admin/vendors" },
          ]
        : [
            { label: "About marketplace", to: "/about" },
            { label: "Accessibility", to: "/accessibility" },
            { label: "Become a vendor", to: "/register" },
          ];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_26%),linear-gradient(135deg,_#020617_0%,_#111827_58%,_#1f2937_100%)] text-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300 text-sm font-black text-slate-950 shadow-[0_18px_35px_-22px_rgba(251,191,36,0.8)]">
                MV
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-tight">MultiVendor</p>
                <p className="text-xs text-slate-300">Built for multi-vendor commerce</p>
              </div>
            </div>
            <p className="max-w-sm text-sm text-slate-300">
              A modern commerce workspace connecting customers, vendors, and admins with one
              clean marketplace experience.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {SOCIAL_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-amber-200 hover:bg-white/10 hover:text-amber-200"
                >
                  <SocialIcon platform={item.platform} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Shop</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link to="/products" className="transition hover:text-amber-200">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/products?sortBy=newest" className="transition hover:text-amber-200">
                    New arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/products?sortBy=price_desc" className="transition hover:text-amber-200">
                    Top deals
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Account</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {accountLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition hover:text-amber-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">{workspaceTitle}</p>
              <ul className="space-y-2 text-sm text-slate-300">
                {workspaceLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition hover:text-amber-200">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Company</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link to="/about" className="transition hover:text-amber-200">
                    About marketplace
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="transition hover:text-amber-200">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="transition hover:text-amber-200">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MultiVendor. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/terms" className="transition hover:text-amber-200">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-amber-200">
              Privacy
            </Link>
            <Link to="/accessibility" className="transition hover:text-amber-200">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
