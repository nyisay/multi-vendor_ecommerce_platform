import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getImageUrl } from "../services/api";
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
  const [theme, setTheme] = useState(user?.profileTheme || "ocean");
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

  const themeClassMap = {
    ocean: "bg-gradient-to-br from-sky-600 to-blue-700 text-white",
    sunset: "bg-gradient-to-br from-orange-500 to-rose-600 text-white",
    midnight: "bg-gradient-to-br from-slate-800 to-indigo-900 text-white",
    forest: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white",
    custom: "bg-slate-800 text-white",
  };

  useEffect(() => {
    setTheme(user?.profileTheme || "ocean");
  }, [user?.profileTheme]);

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

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <SectionHeading
        title="Profile Settings"
        description="Manage your account details, visual theme, and security settings."
        right={user?.role ? <Badge variant="neutral">{user.role}</Badge> : null}
      />

      <Card className="overflow-hidden">
        <CardBody className="space-y-6 p-0">
          <div
            className={`relative overflow-hidden px-6 py-6 sm:px-8 ${themeClassMap[theme] || themeClassMap.ocean}`}
            style={
              user?.profileCardBackgroundUrl || profileBackgroundFile
                ? {
                    backgroundImage: `url(${profileBackgroundFile ? previewProfileBackgroundUrl : getImageUrl(user.profileCardBackgroundUrl)})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            <div className="absolute inset-0 bg-slate-900/20" />
            <div className="relative flex items-center gap-4">
              {user?.profileImageUrl || profileImageFile ? (
                <img
                  src={profileImageFile ? previewProfileImageUrl : getImageUrl(user.profileImageUrl)}
                  alt={user?.name || "Profile"}
                  className="h-20 w-20 rounded-2xl border border-white/65 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/60 bg-white/25 text-2xl font-black">
                  {(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xl font-black">{user?.name || "User"}</p>
                <p className="text-sm font-medium text-white/90">{user?.email || ""}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/90">
                  {theme} theme
                </p>
              </div>
            </div>
          </div>

          <form key={user?._id || "guest"} onSubmit={onSubmit} className="space-y-6 px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="space-y-2">
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
                />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                  htmlFor="theme"
                >
                  Profile theme
                </label>
                <Select id="theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
                  <option value="ocean">Ocean</option>
                  <option value="sunset">Sunset</option>
                  <option value="midnight">Midnight</option>
                  <option value="forest">Forest</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                  htmlFor="profileImage"
                >
                  Profile photo
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                />
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={removeProfileImage}
                    onChange={(event) => setRemoveProfileImage(event.target.checked)}
                  />
                  Remove current profile photo
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
                htmlFor="profileBackground"
              >
                Profile card wallpaper
              </label>
              <input
                id="profileBackground"
                type="file"
                accept="image/*"
                onChange={(event) => setProfileBackgroundFile(event.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
              />
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={removeProfileBackground}
                  onChange={(event) => setRemoveProfileBackground(event.target.checked)}
                />
                Remove current wallpaper
              </label>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-slate-500">
                Account visuals and profile info are saved together.
              </p>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
}
