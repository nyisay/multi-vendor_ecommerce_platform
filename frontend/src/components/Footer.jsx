import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#7A8B99] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="space-y-4 md:col-span-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-[#7A8B99]">
                MV
              </span>
              <div>
                <p className="text-sm font-extrabold tracking-tight">MultiVendor</p>
                <p className="text-xs text-white/80">Multi-vendor marketplace</p>
              </div>
            </div>
            <p className="max-w-sm text-sm text-white/80">
              Discover products from multiple trusted sellers with smooth browsing, checkout, and order tracking.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Shop</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/products" className="hover:text-white">Products</Link></li>
                <li><Link to="/products?sortBy=newest" className="hover:text-white">New arrivals</Link></li>
                <li><Link to="/products?sortBy=price_desc" className="hover:text-white">Top deals</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Account</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/profile" className="hover:text-white">Profile</Link></li>
                <li><Link to="/orders" className="hover:text-white">Orders</Link></li>
                <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Vendors</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/vendor/dashboard" className="hover:text-white">Vendor dashboard</Link></li>
                <li><Link to="/vendor/products" className="hover:text-white">Manage products</Link></li>
                <li><Link to="/vendor/orders" className="hover:text-white">Vendor orders</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white/90">Company</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link to="/about" className="hover:text-white">About marketplace</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MultiVendor. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/accessibility" className="hover:text-white">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
