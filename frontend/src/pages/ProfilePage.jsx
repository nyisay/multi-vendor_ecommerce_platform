import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getImageUrl } from "../services/api";
import { PAYMENT_METHOD_OPTIONS } from "../services/checkout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import { SectionHeading } from "../components/ui/Section";
import { Card, CardBody } from "../components/ui/Card";

export default function ProfilePage() {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileBackgroundFile, setProfileBackgroundFile] = useState(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [removeProfileBackground, setRemoveProfileBackground] = useState(false);
  const [loading, setLoading] = useState(false);
  const previewProfileImageUrl = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : ""),
    [profileImageFile],
  );
  const previewProfileBackgroundUrl = useMemo(
    () => (profileBackgroundFile ? URL.createObjectURL(profileBackgroundFile) : ""),
    [profileBackgroundFile],
  );

  useEffect(() => {
    return () => {
      if (previewProfileImageUrl) URL.revokeObjectURL(previewProfileImageUrl);
      if (previewProfileBackgroundUrl) URL.revokeObjectURL(previewProfileBackgroundUrl);
    };
  }, [previewProfileImageUrl, previewProfileBackgroundUrl]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(event.currentTarget);
      const payload = new FormData();
      payload.append("name", formData.get("name"));
      payload.append("phone", formData.get("phone") || "");
      payload.append("address", formData.get("address") || "");
      payload.append(
        "defaultShippingFullName",
        formData.get("defaultShippingFullName") || "",
      );
      payload.append(
        "defaultShippingPhone",
        formData.get("defaultShippingPhone") || "",
      );
      payload.append(
        "defaultShippingAddressLine1",
        formData.get("defaultShippingAddressLine1") || "",
      );
      payload.append(
        "defaultShippingAddressLine2",
        formData.get("defaultShippingAddressLine2") || "",
      );
      payload.append("defaultShippingCity", formData.get("defaultShippingCity") || "");
      payload.append("defaultShippingState", formData.get("defaultShippingState") || "");
      payload.append(
        "defaultShippingPostalCode",
        formData.get("defaultShippingPostalCode") || "",
      );
      payload.append(
        "defaultShippingCountry",
        formData.get("defaultShippingCountry") || "",
      );
      payload.append("defaultPaymentMethod", formData.get("defaultPaymentMethod") || "cod");
      payload.append("profileTheme", theme);
      if (user?.role === "vendor") {
        payload.append("shopName", formData.get("shopName") || "");
      }
      if (password) {
        payload.append("password", password);
      }
      if (profileImageFile) {
        payload.append("profileImage", profileImageFile);
      }
      if (profileBackgroundFile) {
        payload.append("profileCardBackground", profileBackgroundFile);
      }
      if (removeProfileImage) {
        payload.append("removeProfileImage", "true");
      }
      if (removeProfileBackground) {
        payload.append("removeProfileBackground", "true");
      }
      await updateProfile(payload);
      await refreshProfile();
      showToast("Updating...", "info");

      setTimeout(() => {
        showToast("Profile updated", "success");
      }, 1500);
      setPassword("");
      setProfileImageFile(null);
      setProfileBackgroundFile(null);
      setRemoveProfileImage(false);
      setRemoveProfileBackground(false);
    } catch (err) {
      showToast(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const resolvedProfileImageUrl = profileImageFile
    ? previewProfileImageUrl
    : user?.profileImageUrl
      ? getImageUrl(user.profileImageUrl)
      : "";
  const resolvedBackgroundImageUrl = profileBackgroundFile
    ? previewProfileBackgroundUrl
    : user?.profileCardBackgroundUrl
      ? getImageUrl(user.profileCardBackgroundUrl)
      : "";
  const theme = user?.profileTheme || "ocean";
  const displayRole = user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "Member";
  const shippingDefaultsCount = [
    user?.defaultShippingAddress?.fullName || user?.name,
    user?.defaultShippingAddress?.phone || user?.phone,
    user?.defaultShippingAddress?.addressLine1 || user?.address,
    user?.defaultShippingAddress?.city,
    user?.defaultShippingAddress?.country
  ].filter(Boolean).length;
  const profileFacts = [
    { label: "Role", value: displayRole },
    { label: "Payment", value: user?.defaultPaymentMethod || "cod" },
    { label: "Shipping", value: `${shippingDefaultsCount}/5 ready` }
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <SectionHeading
        title="Profile Settings"
        description="A luxury profile suite for account details, signature media, and checkout preferences."
        right={user?.role ? <Badge variant="neutral">{user.role}</Badge> : null}
      />

      <form
        key={user?._id || "guest"}
        onSubmit={onSubmit}
        className="grid gap-6 xl:grid-cols-[340px_1fr]"
      >
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <Card className="border-[#e7dcc8] bg-[linear-gradient(180deg,_#fffaf2_0%,_#ffffff_100%)] shadow-[0_24px_60px_-48px_rgba(146,116,63,0.45)]">
            <CardBody className="space-y-4 p-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">
                  Media
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight text-[#1c1917]">
                  Portrait And Cover
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Curate the first impression with a refined portrait and an elegant background image.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500"
                  htmlFor="profileImage"
                >
                  Profile photo
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-[#e7dcc8] bg-white px-3 py-2.5 text-sm text-stone-700"
                />
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                  <input
                    type="checkbox"
                    checked={removeProfileImage}
                    onChange={(event) => setRemoveProfileImage(event.target.checked)}
                  />
                  Remove current profile photo
                </label>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.1em] text-stone-500"
                  htmlFor="profileBackground"
                >
                  Profile card wallpaper
                </label>
                <input
                  id="profileBackground"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProfileBackgroundFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-[#e7dcc8] bg-white px-3 py-2.5 text-sm text-stone-700"
                />
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600">
                  <input
                    type="checkbox"
                    checked={removeProfileBackground}
                    onChange={(event) => setRemoveProfileBackground(event.target.checked)}
                  />
                  Remove current wallpaper
                </label>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-[#3b3224] bg-[#120f0b] shadow-[0_34px_90px_-56px_rgba(15,23,42,0.85)]">
            <CardBody className="p-0">
              <div
                className="relative overflow-hidden border rounded-3xl bg-[linear-gradient(145deg,_#120f0b_0%,_#1d1812_52%,_#0f172a_100%)] px-6 pb-6 pt-7 text-white"
                style={
                  resolvedBackgroundImageUrl
                    ? {
                        backgroundImage: `url(${resolvedBackgroundImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }
                    : undefined
                }
              >
                <div className="absolute border rounded-b-full inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.16),rgba(12,10,9,0.88))]" />
                <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
                <div className="absolute -right-16 top-0 h-44 w-44 rounded-full bg-amber-300/12 blur-3xl" />
                <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-yellow-100/8 blur-3xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-amber-200/20 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-100/80">
                      PawsieMart
                    </span>
                    <Badge variant="neutral">{displayRole}</Badge>
                  </div>

                  <div className="mt-8 flex items-end gap-4">
                    {resolvedProfileImageUrl ? (
                      <img
                        src={resolvedProfileImageUrl}
                        alt={user?.name || "Profile"}
                        className="h-20 w-20 rounded-[1.4rem] border border-white/60 object-cover shadow-[0_20px_40px_-24px_rgba(15,23,42,0.8)]"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-white/50 bg-white/20 text-2xl font-black text-white">
                        {(user?.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-2xl font-black tracking-tight text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="truncate text-sm font-medium text-amber-50/80">
                        {user?.email || ""}
                      </p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200/60">
                        Luxury profile preview
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {profileFacts.map((fact) => (
                      <div
                        key={fact.label}
                        className="rounded-2xl border border-amber-200/12 bg-white/6 px-3 py-3 backdrop-blur"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-100/55">
                          {fact.label}
                        </p>
                        <p className="mt-2 truncate text-sm font-bold text-white">
                          {fact.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden border-[#eadfcf] bg-[linear-gradient(180deg,_#ffffff_0%,_#fffdfa_100%)] shadow-[0_26px_70px_-56px_rgba(120,95,52,0.35)]">
            <CardBody className="space-y-5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">
                    Account
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1c1917]">
                    Personal Signature
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Present your identity in a more elevated format with balanced spacing and warmer detail.
                  </p>
                </div>
                <div className="rounded-2xl border border-[#eadfcf] bg-[#fff7ec] px-4 py-3 text-sm text-stone-600">
                  Email stays read-only for account safety.
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user?.name || ""}
                    placeholder="Name"
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <Input id="email" value={user?.email || ""} disabled />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="phone"
                  >
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={user?.phone || ""}
                    placeholder="Phone"
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="address"
                  >
                    Address
                  </label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={user?.address || ""}
                    placeholder="Address"
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {user?.role === "vendor" && (
                <div className="rounded-[1.4rem] border border-amber-200 bg-[linear-gradient(180deg,_#fff8ee_0%,_#ffffff_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="shopName"
                  >
                    Shop name
                  </label>
                  <Input
                    id="shopName"
                    name="shopName"
                    defaultValue={user?.shopName || ""}
                    placeholder="Shop name"
                    className="mt-2"
                  />
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="overflow-hidden border-[#eadfcf] bg-[linear-gradient(180deg,_#ffffff_0%,_#fffdfa_100%)] shadow-[0_26px_70px_-56px_rgba(120,95,52,0.35)]">
            <CardBody className="space-y-5 p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">
                  Checkout Defaults
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1c1917]">
                  Delivery Preferences
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Save your preferred delivery details and payment method for a smoother premium checkout flow.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingFullName"
                  >
                    Recipient name
                  </label>
                  <Input
                    id="defaultShippingFullName"
                    name="defaultShippingFullName"
                    defaultValue={user?.defaultShippingAddress?.fullName || user?.name || ""}
                    placeholder="Recipient name"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingPhone"
                  >
                    Shipping phone
                  </label>
                  <Input
                    id="defaultShippingPhone"
                    name="defaultShippingPhone"
                    defaultValue={user?.defaultShippingAddress?.phone || user?.phone || ""}
                    placeholder="Shipping phone"
                  />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingAddressLine1"
                  >
                    Address line 1
                  </label>
                  <Input
                    id="defaultShippingAddressLine1"
                    name="defaultShippingAddressLine1"
                    defaultValue={
                      user?.defaultShippingAddress?.addressLine1 || user?.address || ""
                    }
                    placeholder="Street address"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingAddressLine2"
                  >
                    Address line 2
                  </label>
                  <Input
                    id="defaultShippingAddressLine2"
                    name="defaultShippingAddressLine2"
                    defaultValue={user?.defaultShippingAddress?.addressLine2 || ""}
                    placeholder="Apartment, suite, building"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingCity"
                  >
                    City
                  </label>
                  <Input
                    id="defaultShippingCity"
                    name="defaultShippingCity"
                    defaultValue={user?.defaultShippingAddress?.city || ""}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingState"
                  >
                    State
                  </label>
                  <Input
                    id="defaultShippingState"
                    name="defaultShippingState"
                    defaultValue={user?.defaultShippingAddress?.state || ""}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingPostalCode"
                  >
                    Postal code
                  </label>
                  <Input
                    id="defaultShippingPostalCode"
                    name="defaultShippingPostalCode"
                    defaultValue={user?.defaultShippingAddress?.postalCode || ""}
                    placeholder="Postal code"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                    htmlFor="defaultShippingCountry"
                  >
                    Country
                  </label>
                  <Input
                    id="defaultShippingCountry"
                    name="defaultShippingCountry"
                    defaultValue={user?.defaultShippingAddress?.country || ""}
                    placeholder="Country"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                  htmlFor="defaultPaymentMethod"
                >
                  Preferred payment method
                </label>
                <Select
                  id="defaultPaymentMethod"
                  name="defaultPaymentMethod"
                  defaultValue={user?.defaultPaymentMethod || "cod"}
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          <Card className="overflow-hidden border-[#eadfcf] bg-[linear-gradient(180deg,_#ffffff_0%,_#fffdfa_100%)] shadow-[0_26px_70px_-56px_rgba(120,95,52,0.35)]">
            <CardBody className="space-y-5 p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">
                  Security
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-[#1c1917]">
                  Security And Save
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Finalize every update in one place while keeping access details protected.
                </p>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                  htmlFor="newPassword"
                >
                  New password (optional)
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex flex-col gap-3 rounded-[1.4rem] border border-[#eadfcf] bg-[linear-gradient(180deg,_#fff8ee_0%,_#fffdf8_100%)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-600">
                  This layout uses a luxury visual direction with a consistent boutique-style finish.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[148px] border-amber-200 bg-amber-300 text-slate-950 shadow-[0_20px_38px_-24px_rgba(251,191,36,0.9)] hover:bg-amber-200"
                >
                  {loading ? "Saving..." : "Save profile"}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </form>
    </section>
  );
}
