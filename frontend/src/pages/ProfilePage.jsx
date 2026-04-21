import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useToast } from "../context/useToast";
import { getImageUrl } from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { SectionHeading } from "../components/ui/Section";

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
    ocean: "bg-gradient-to-br from-cyan-500/80 to-blue-500/80 text-white",
    sunset: "bg-gradient-to-br from-rose-500/80 to-amber-500/80 text-white",
    midnight: "bg-gradient-to-br from-slate-800/90 to-indigo-800/90 text-white",
    forest: "bg-gradient-to-br from-emerald-600/80 to-teal-700/80 text-white",
    custom: "bg-black/50 text-white",
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
    <section className="mx-auto max-w-3xl space-y-6">
      <SectionHeading
        title="Profile"
        description="Manage your account details."
        right={user?.role ? <Badge variant="neutral">{user.role}</Badge> : null}
      />

      <div
        className={`overflow-hidden rounded-3xl border border-white/40 p-5 shadow-xl ${
          themeClassMap[theme] || themeClassMap.ocean
        }`}
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
            <div className="flex items-center gap-4 rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
              {user?.profileImageUrl || profileImageFile ? (
                <img
                  src={profileImageFile ? previewProfileImageUrl : getImageUrl(user.profileImageUrl)}
                  alt={user?.name || "Profile"}
                  className="h-16 w-16 rounded-full border-2 border-white/80 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/25 text-xl font-black">
                  {(user?.name || "U").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-black">{user?.name || "User"}</p>
                <p className="text-sm opacity-90">{user?.email || ""}</p>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-90">{theme} theme</p>
              </div>
            </div>
            <form key={user?._id || "guest"} onSubmit={onSubmit} className="mt-4 space-y-4 rounded-2xl bg-black/30 p-4 backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="name">
                    Name
                  </label>
                  <Input id="name" name="name" defaultValue={user?.name || ""} placeholder="Name" required autoComplete="name" className="border-white/30 bg-white/85 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="email">
                    Email
                  </label>
                  <Input id="email" value={user?.email || ""} disabled className="border-white/30 bg-white/70 text-gray-800" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="phone">
                    Phone
                  </label>
                  <Input id="phone" name="phone" defaultValue={user?.phone || ""} placeholder="Phone" autoComplete="tel" className="border-white/30 bg-white/85 text-gray-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="address">
                    Address
                  </label>
                  <Input id="address" name="address" defaultValue={user?.address || ""} placeholder="Address" autoComplete="street-address" className="border-white/30 bg-white/85 text-gray-900" />
                </div>
              </div>

              {user?.role === "vendor" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="shopName">
                    Shop name
                  </label>
                  <Input id="shopName" name="shopName" defaultValue={user?.shopName || ""} placeholder="Shop name" className="border-white/30 bg-white/85 text-gray-900" />
                </div>
              )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="theme">
                  Profile card theme
                </label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(event) => setTheme(event.target.value)}
                  className="w-full rounded-xl border border-white/30 bg-white/85 px-3 py-2 text-sm text-gray-900"
                >
                  <option value="ocean">Ocean</option>
                  <option value="sunset">Sunset</option>
                  <option value="midnight">Midnight</option>
                  <option value="forest">Forest</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="profileImage">
                  Profile photo
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-white/30 bg-white/85 px-3 py-2 text-sm text-gray-900"
                />
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-white/90">
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
              <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="profileBackground">
                Profile card wallpaper (transparent, meme, anything you like)
              </label>
              <input
                id="profileBackground"
                type="file"
                accept="image/*"
                onChange={(event) => setProfileBackgroundFile(event.target.files?.[0] || null)}
                className="w-full rounded-xl border border-white/30 bg-white/85 px-3 py-2 text-sm text-gray-900"
              />
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-white/90">
                <input
                  type="checkbox"
                  checked={removeProfileBackground}
                  onChange={(event) => setRemoveProfileBackground(event.target.checked)}
                />
                Remove current wallpaper
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/80" htmlFor="newPassword">
                New password (optional)
              </label>
              <Input
                id="newPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="border-white/30 bg-white/85 text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold text-white/90">
                Personalize your card with themes, profile photos, and custom wallpapers.
              </p>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save profile"}
              </Button>
            </div>
            </form>
      </div>
    </section>
  );
}
