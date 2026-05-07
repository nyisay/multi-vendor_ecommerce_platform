import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PasswordField from "../components/ui/PasswordField";
import { Card, CardBody } from "../components/ui/Card";
import { useToast } from "../context/useToast";
import { KeyIcon, MailIcon, ShieldIcon } from "../components/ui/IconGlyphs";
import {
  getPasswordValidationError,
  isValidEmail,
  isValidVerificationCode,
  PASSWORD_REQUIREMENTS_TEXT,
} from "../utils/authValidation";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      return showToast("Enter a valid email address", "error");
    }

    if (!isValidVerificationCode(code)) {
      return showToast("Verification code must be 6 digits", "error");
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      return showToast(passwordError, "error");
    }

    if (password !== confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ email, code, password, confirmPassword });
      showToast("Password reset successful", "success");
      navigate("/login");
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-6 text-center shadow-[0_20px_55px_-42px_rgba(15,23,42,0.4)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.8)]">
          <KeyIcon className="h-5 w-5" />
        </div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">
          Account Recovery
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950">
          Reset Password
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Enter the email address, 6-digit code, and your new password.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[1.9rem] border border-slate-200 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.42)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Set New Password
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
                placeholder="olivia.nguyen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                leadingIcon={<MailIcon className="h-4.5 w-4.5" />}
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                htmlFor="verificationCode"
              >
                Verification code
              </label>
              <Input
                id="verificationCode"
                name="verificationCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                leadingIcon={<ShieldIcon className="h-4.5 w-4.5" />}
              />
              <p className="text-xs font-semibold text-slate-500">
                The code expires in 10 minutes.
              </p>
            </div>

            <div className="space-y-2">
              <label
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500"
                htmlFor="password"
              >
                New Password
              </label>
              <PasswordField
                id="password"
                name="password"
                placeholder="AungSoe@2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                leadingIcon={<KeyIcon className="h-4.5 w-4.5" />}
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
                Confirm New Password
              </label>
              <PasswordField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                leadingIcon={<KeyIcon className="h-4.5 w-4.5" />}
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Need a new code?{" "}
            <Link
              className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-amber-300"
              to="/forgot-password"
            >
              Request another one
            </Link>
          </p>

          <p className="text-center text-sm text-slate-600">
            Back to{" "}
            <Link
              className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-amber-300"
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </section>
  );
}
