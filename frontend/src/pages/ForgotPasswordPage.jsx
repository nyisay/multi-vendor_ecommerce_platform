import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardBody } from "../components/ui/Card";
import { useToast } from "../context/useToast";
import { KeyIcon, MailIcon } from "../components/ui/IconGlyphs";
import { isValidEmail } from "../utils/authValidation";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      showToast("Enter a valid email address", "error");
      return;
    }

    setLoading(true);

    try {
      await authApi.forgotPassword(email);
      setSent(true);
      showToast("If the account exists, a verification code has been sent.", "success");
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-6 text-center shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 shadow-[0_18px_35px_-22px_rgba(251,191,36,0.7)]">
          <KeyIcon className="h-5 w-5" />
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
          Account Recovery
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
          Forgot Password?
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter your email address and we'll send a 6-digit verification code to reset your password.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[1.9rem] border border-slate-200 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.42)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Password Reset
          </p>
        </div>
        <CardBody className="p-6">
          {!sent ? (
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  leadingIcon={<MailIcon className="h-4.5 w-4.5" />}
                />
              </div>

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Sending code..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-slate-600">
                If an account exists for <strong>{email}</strong>, a 6-digit verification code has been sent.
                Check your inbox, then continue to the password reset form.
              </p>
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() =>
                  navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`)
                }
              >
                Enter Verification Code
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => navigate("/login")}>
                Back to Sign in
              </Button>
            </div>
          )}

          {!sent && (
            <p className="mt-5 text-center text-sm text-slate-600">
              Remembered your password?{" "}
              <Link
                className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-amber-300"
                to="/login"
              >
                Sign in
              </Link>
            </p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}
