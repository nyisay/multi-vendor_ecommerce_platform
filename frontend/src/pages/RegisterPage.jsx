import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card, CardBody } from "../components/ui/Card";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
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
    <section className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Join the marketplace</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Create account</h1>
        <p className="mt-1 text-sm text-gray-600">Sign up as a customer or apply as a vendor.</p>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="name">
                Full name
              </label>
              <Input id="name" name="name" type="text" placeholder="Full name" value={form.name} onChange={onChange} required autoComplete="name" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="email">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={onChange} required autoComplete="email" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="password">
                Password
              </label>
              <Input id="password" name="password" type="password" placeholder="Create a password" value={form.password} onChange={onChange} required autoComplete="new-password" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="role">
                Account type
              </label>
              <Select id="role" name="role" value={form.role} onChange={onChange}>
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </Select>
              {form.role === "vendor" && (
                <p className="text-xs font-semibold text-gray-500">
                  Vendor accounts require admin approval before login.
                </p>
              )}
            </div>

            {form.role === "vendor" && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="shopName">
                  Shop name
                </label>
                <Input id="shopName" name="shopName" type="text" placeholder="Your store name" value={form.shopName} onChange={onChange} />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="phone">
                  Phone
                </label>
                <Input id="phone" name="phone" type="text" placeholder="Phone" value={form.phone} onChange={onChange} autoComplete="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500" htmlFor="address">
                  Address
                </label>
                <Input id="address" name="address" type="text" placeholder="Address" value={form.address} onChange={onChange} autoComplete="street-address" />
              </div>
            </div>

            {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
            {successMessage && <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{successMessage}</p>}

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Submitting..." : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            Already registered?{" "}
            <Link className="font-semibold text-gray-950 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900" to="/login">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </section>
  );
}
