import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Star, Upload, FileText, User, Phone, CreditCard, Mail, ShieldCheck } from "lucide-react";

interface RatingInfo {
  avg: number;
  count: number;
}

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState<RatingInfo>({ avg: 0, count: 0 });

  const photoInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [photoUploading, setPhotoUploading] = useState(false);
  const [licenseUploading, setLicenseUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setIdNumber((profile as any).id_number ?? "");
      setAvatarUrl(profile.avatar_url ?? null);
      setLicenseUrl(profile.driver_license_url ?? null);
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("renter_ratings")
        .select("rating")
        .eq("renter_id", user.id);
      if (data && data.length > 0) {
        const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
        setRating({ avg: Math.round(avg * 10) / 10, count: data.length });
      }
    })();
  }, [user]);

  const uploadFile = async (
    file: File,
    bucket: string,
    folder: string,
    setUploading: (v: boolean) => void,
    onDone: (url: string) => void
  ) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${folder}/${user.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onDone(urlData.publicUrl);
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, "profile-photos", "avatars", setPhotoUploading, (url) => setAvatarUrl(url));
  };

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setLicensePreview(previewUrl);
    uploadFile(file, "driver-licenses", "licenses", setLicenseUploading, (url) => {
      setLicenseUrl(url);
      URL.revokeObjectURL(previewUrl);
    });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: Record<string, any> = {
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        id_number: idNumber.trim() || null,
      };
      if (avatarUrl !== profile?.avatar_url) updates.avatar_url = avatarUrl;
      if (licenseUrl !== profile?.driver_license_url) updates.driver_license_url = licenseUrl;

      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const renderStars = (value: number) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`h-5 w-5 ${s <= Math.round(value) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Avatar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 text-2xl">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-kenya-red text-white text-xl">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute -bottom-1 -right-1 bg-kenya-red text-white rounded-full p-1.5 shadow hover:bg-kenya-red/90 transition"
              >
                {photoUploading ? (
                  <span className="h-4 w-4 block animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{fullName || "Your Name"}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <Badge variant="outline" className="mt-1 capitalize">{profile?.role ?? "renter"}</Badge>
            </div>
          </div>
        </div>

        {/* Rating */}
        {rating.count > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> Renter Rating
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex">{renderStars(rating.avg)}</div>
              <span className="text-2xl font-bold text-gray-900">{rating.avg}</span>
              <span className="text-sm text-gray-500">({rating.count} {rating.count === 1 ? "review" : "reviews"})</span>
            </div>
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Personal Information</h2>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm">
              <User className="h-4 w-4" /> Full Name
            </Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-sm text-gray-500">
              <Mail className="h-4 w-4" /> Email Address
            </Label>
            <Input id="email" value={user.email ?? ""} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400">Email cannot be changed here. Contact support if needed.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm">
              <Phone className="h-4 w-4" /> Phone Number
            </Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber" className="flex items-center gap-1.5 text-sm">
              <CreditCard className="h-4 w-4" /> National ID Number
            </Label>
            <Input id="idNumber" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="e.g. 12345678" />
          </div>
        </div>

        {/* Driver's License */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Driver's License
          </h2>

          {/* Preview of newly selected image */}
          {licensePreview && (
            <div className="mb-4 relative">
              <img
                src={licensePreview}
                alt="License preview"
                className="w-full max-h-56 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
              {licenseUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                  <span className="h-7 w-7 block animate-spin border-4 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>
          )}

          {/* Existing saved license (no preview selected yet) */}
          {!licensePreview && licenseUrl && (
            <div className="mb-4">
              <img
                src={licenseUrl}
                alt="Current driver's license"
                className="w-full max-h-56 object-contain rounded-lg border border-gray-200 bg-gray-50"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {licenseUrl && !licensePreview && (
              <a href={licenseUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-kenya-red hover:underline text-sm">
                <FileText className="h-4 w-4" /> Open full document
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => licenseInputRef.current?.click()}
              disabled={licenseUploading}
              className="text-xs"
            >
              {licenseUploading
                ? "Uploading…"
                : licenseUrl
                ? "Upload renewed license"
                : "Upload Driver's License"}
            </Button>
            {!licenseUrl && !licensePreview && (
              <p className="text-xs text-gray-400">JPEG, PNG or PDF accepted</p>
            )}
          </div>

          {/* Empty drop zone when nothing selected yet */}
          {!licenseUrl && !licensePreview && (
            <button
              onClick={() => licenseInputRef.current?.click()}
              disabled={licenseUploading}
              className="mt-3 flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg py-8 hover:border-kenya-red transition cursor-pointer"
            >
              <Upload className="h-7 w-7 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to choose a file</span>
              <span className="text-xs text-gray-400 mt-1">JPEG, PNG or PDF</span>
            </button>
          )}

          <input ref={licenseInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleLicenseChange} />
        </div>

        {/* Save */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-3 text-base"
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
