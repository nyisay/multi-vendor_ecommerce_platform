import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordField from "../components/ui/PasswordField";
import Select from "../components/ui/Select";
import { Card, CardBody } from "../components/ui/Card";
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
} from "../components/ui/IconGlyphs";
import {
  getPasswordValidationError,
  isValidEmail,
  PASSWORD_REQUIREMENTS_TEXT,
} from "../utils/authValidation";

const ROLE_SURFACES = {
  customer: "bg-sky-50 text-sky-950 ring-sky-200",
  vendor: "bg-amber-50 text-amber-950 ring-amber-200",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    shopName: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!isValidEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    const passwordError = getPasswordValidationError(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(form);
      setSuccessMessage(
        form.role === "vendor"
          ? "Registration submitted. Vendor account needs admin approval before login."
          : "Registration successful. Please login.",
      );
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(56,189,248,0.16),_transparent_24%),linear-gradient(135deg,_#020617_0%,_#111827_55%,_#1e293b_100%)] px-6 py-7 text-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.95)] sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />
            <div className="absolute bottom-[-26%] right-[8%] h-48 w-48 rounded-full bg-sky-300/10 blur-3xl" />
          </div>

          <div className="relative space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
                <SparklesIcon className="h-4 w-4" />
                Account creation
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/55">
                Join the marketplace
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                Create an account that fits how you shop or sell.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                Same registration logic, just a more polished first impression for
                customers and vendor applications.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                  For customers
                </p>
                <p className="mt-2 text-lg font-black tracking-tight text-white">
                  Start browsing and buying faster
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/10 px-4 py-4 backdrop-blur">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                  For vendors
                </p>
                <p className="mt-2 text-lg font-black tracking-tight text-white">
                  Apply to sell with admin approval
                </p>
              </article>
            </div>

            <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                What to expect
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300" />
                  <p className="text-sm leading-6 text-slate-200">
                    Customers can register and continue toward login right away.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-300" />
                  <p className="text-sm leading-6 text-slate-200">
                    Vendors can include store details and wait for admin approval.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                  <p className="text-sm leading-6 text-slate-200">
                    Contact details help keep the marketplace experience reliable.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              >
                Already have an account?
              </Link>
              <Link
                to="/"
                className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.4)]">
          <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Registration form
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
              Create account
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign up as a customer or apply as a vendor.
            </p>
          </div>

          <CardBody className="space-y-5 p-6">
            <div
              className={`rounded-[1.5rem] px-4 py-4 ring-1 ${ROLE_SURFACES[form.role]}`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-70">
                Account type
              </p>
              <p className="mt-2 text-lg font-black tracking-tight">
                {form.role === "vendor" ? "Vendor application" : "Customer account"}
              </p>
              <p className="mt-2 text-sm opacity-80">
                {form.role === "vendor"
                  ? "Vendor accounts require admin approval before login."
                  : "Customer accounts can continue straight to login after registration."}
              </p>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  htmlFor="name"
                >
                  Full name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={onChange}
                  required
                  autoComplete="name"
                  className="border-slate-200 bg-slate-50"
                  leadingIcon={<UserIcon className="h-4.5 w-4.5" />}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  htmlFor="email"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="olivia.nguyen@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoComplete="email"
                  className="border-slate-200 bg-slate-50"
                  leadingIcon={<MailIcon className="h-4.5 w-4.5" />}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  htmlFor="password"
                >
                  Password
                </label>
                <PasswordField
                  id="password"
                  name="password"
                  placeholder="AungSoe@2026"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                  className="border-slate-200 bg-slate-50"
                  leadingIcon={<ShieldIcon className="h-4.5 w-4.5" />}
                />
                <p className="text-xs font-semibold text-slate-500">
                  {PASSWORD_REQUIREMENTS_TEXT}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  htmlFor="confirmPassword"
                >
                  Confirm password
                </label>
                <PasswordField
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  required
                  autoComplete="new-password"
                  className="border-slate-200 bg-slate-50"
                  leadingIcon={<ShieldIcon className="h-4.5 w-4.5" />}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                  htmlFor="role"
                >
                  Account type
                </label>
                <Select id="role" name="role" value={form.role} onChange={onChange}>
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                </Select>
                {form.role === "vendor" && (
                  <p className="text-xs font-semibold text-slate-500">
                    Vendor accounts require admin approval before login.
                  </p>
                )}
              </div>

              {form.role === "vendor" && (
                <div className="space-y-2">
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                    htmlFor="shopName"
                  >
                    Shop name
                  </label>
                  <Input
                    id="shopName"
                    name="shopName"
                    type="text"
                    placeholder="Your store name"
                    value={form.shopName}
                    onChange={onChange}
                    className="border-slate-200 bg-slate-50"
                    leadingIcon={<SparklesIcon className="h-4.5 w-4.5" />}
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="text"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={onChange}
                    autoComplete="tel"
                    className="border-slate-200 bg-slate-50"
                    leadingIcon={<PhoneIcon className="h-4.5 w-4.5" />}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Address"
                    value={form.address}
                    onChange={onChange}
                    autoComplete="street-address"
                    className="border-slate-200 bg-slate-50"
                    leadingIcon={<MapPinIcon className="h-4.5 w-4.5" />}
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-[1.4rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              {successMessage && (
                <p className="rounded-[1.4rem] border border-emerald-200 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-emerald-800">
                  {successMessage}
                </p>
              )}

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Submitting..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600">
              Already registered?{" "}
              <Link
                className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
