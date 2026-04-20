import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

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
    <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Create Account</h1>

      <form className="space-y-3" onSubmit={onSubmit}>
        <input
          name="name"
          type="text"
          placeholder="Full name"
          value={form.name}
          onChange={onChange}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
          className="w-full rounded border border-gray-300 px-3 py-2"
        />

        <select
          name="role"
          value={form.role}
          onChange={onChange}
          className="w-full rounded border border-gray-300 px-3 py-2"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
        </select>

        {form.role === "vendor" && (
          <input
            name="shopName"
            type="text"
            placeholder="Shop name"
            value={form.shopName}
            onChange={onChange}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        )}

        <input
          name="phone"
          type="text"
          placeholder="Phone"
          value={form.phone}
          onChange={onChange}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="address"
          type="text"
          placeholder="Address"
          value={form.address}
          onChange={onChange}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-gray-900 px-3 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Register"}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Already registered?{" "}
        <Link className="font-medium text-gray-900 underline" to="/login">
          Login
        </Link>
      </p>
    </section>
  );
}
