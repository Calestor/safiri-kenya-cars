import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Camera, Car, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [driverLicense, setDriverLicense] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (setter: (file: File | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.files?.[0] ?? null);
  };

  const uploadFile = async (
    bucket: "profile-photos" | "driver-licenses",
    userId: string,
    prefix: "avatar" | "license",
    file: File,
  ) => {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/${prefix}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match.");
      setMessage("");
      return;
    }

    if (!driverLicense) {
      setError("Please upload your driver's license.");
      setMessage("");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Unable to create account right now.");

      const userId = signUpData.user.id;
      const avatarUrl = profilePhoto
        ? await uploadFile("profile-photos", userId, "avatar", profilePhoto)
        : null;
      const driverLicenseUrl = await uploadFile("driver-licenses", userId, "license", driverLicense);

      const { error: profileError } = await supabase.from("profiles").update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        driver_license_url: driverLicenseUrl,
      }).eq("id", userId);

      if (profileError) throw profileError;

      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setProfilePhoto(null);
      setDriverLicense(null);
      setMessage("Your account has been created and is pending email verification. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex justify-center items-center px-4 py-8">
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-7 w-7 text-kenya-red" />
          <span className="font-bold text-xl text-kenya-red">Safiri Kenya</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-2xl shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join Safiri Kenya - rent or list your car today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="********"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profilePhoto">Profile Photo (Optional)</Label>
                  <label
                    htmlFor="profilePhoto"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition hover:border-kenya-red hover:bg-red-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-kenya-red shadow-sm">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">Upload avatar</p>
                      <p className="truncate text-sm text-gray-500">{profilePhoto?.name || "PNG, JPG or JPEG image"}</p>
                    </div>
                    <Upload className="h-4 w-4 text-gray-400" />
                  </label>
                  <Input id="profilePhoto" type="file" accept="image/*" className="hidden" onChange={handleFileChange(setProfilePhoto)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverLicense">Driver's License</Label>
                  <label
                    htmlFor="driverLicense"
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 transition hover:border-kenya-red hover:bg-red-50"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-kenya-red shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">Upload license</p>
                      <p className="truncate text-sm text-gray-500">{driverLicense?.name || "Required document"}</p>
                    </div>
                    <Upload className="h-4 w-4 text-gray-400" />
                  </label>
                  <Input id="driverLicense" type="file" accept="image/*" className="hidden" onChange={handleFileChange(setDriverLicense)} />
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-5 font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-kenya-red font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
