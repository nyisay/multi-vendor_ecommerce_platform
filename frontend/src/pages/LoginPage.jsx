import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody } from "../components/ui/Card";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-6 text-center shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)]">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Access your account and continue shopping with the same cleaner
          marketplace flow.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[1.9rem] border border-slate-200 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.42)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Account access
          </p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950">
            Continue to your account
          </p>
        </div>
        <CardBody className="p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
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
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={onChange}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="rounded-[1.4rem] border border-red-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffffff_100%)] px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            New here?{" "}
            <Link
              className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-amber-300"
              to="/register"
            >
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </section>
  );
}
