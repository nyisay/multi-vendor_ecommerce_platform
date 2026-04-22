import { Link } from "react-router-dom";

export default function Footer() {
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
                <li>
                  <Link to="/profile" className="transition hover:text-amber-200">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link to="/orders" className="transition hover:text-amber-200">
                    Orders
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="transition hover:text-amber-200">
                    Cart
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-white/55">Vendors</p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <Link to="/vendor/dashboard" className="transition hover:text-amber-200">
                    Vendor dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/products" className="transition hover:text-amber-200">
                    Manage products
                  </Link>
                </li>
                <li>
                  <Link to="/vendor/orders" className="transition hover:text-amber-200">
                    Vendor orders
                  </Link>
                </li>
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
