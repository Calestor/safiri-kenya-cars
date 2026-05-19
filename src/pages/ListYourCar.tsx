import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, AlertCircle, Loader2, Upload, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const FEATURES = [
  "Air Conditioning", "Power Windows", "Parking Sensors", "Cruise Control",
  "Bluetooth Connectivity", "Rearview Camera", "Sunroof", "Leather Seats",
  "Apple CarPlay", "Android Auto", "ABS Brakes", "Airbags", "GPS Navigation",
  "4WD System", "Off-road Capable", "Heated Seats"
];

const KENYAN_LOCATIONS = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Machakos", "Malindi", "Nyeri", "Garissa"];

const emptyForm = {
  title: "",
  brand: "",
  model: "",
  year: String(new Date().getFullYear()),
  type: "",
  price: "",
  location: "",
  seats: "5",
  transmission: "",
  fuel_type: "",
  mileage: "",
  fuel_efficiency: "",
  description: "",
};

const ListYourCar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const setField = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleFeature = (feature: string) =>
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((item) => item !== feature) : [...prev, feature]
    );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setSelectedFeatures([]);
    setImageFiles([]);
    setImagePreviews([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (imageFiles.length === 0) { setError("Please add at least one photo of your car."); return; }
    setSubmitting(true);
    setError(null);

    // 1. Insert car record first to get its ID
    const { data: carData, error: carErr } = await supabase.from("cars").insert({
      owner_id: user.id,
      title: form.title,
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      type: form.type as "SUV" | "Sedan" | "Hatchback" | "Minivan",
      price: Number(form.price),
      location: form.location,
      seats: Number(form.seats),
      transmission: form.transmission as "Automatic" | "Manual",
      fuel_type: form.fuel_type as "Petrol" | "Diesel" | "Hybrid",
      mileage: Number(form.mileage) || 0,
      fuel_efficiency: form.fuel_efficiency || null,
      description: form.description || null,
      features: selectedFeatures,
      is_available: true,
      rating: 0,
      review_count: 0,
      owner_name: user.email,
      owner_rating: 5.0,
    }).select().single();

    if (carErr || !carData) {
      setError(carErr?.message ?? "Failed to create listing.");
      setSubmitting(false);
      return;
    }

    // 2. Upload images to Supabase Storage
    const uploadedUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/${carData.id}/${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("car-images").upload(path, file, { upsert: true });
      if (!uploadErr) {
        const { data: { publicUrl } } = supabase.storage.from("car-images").getPublicUrl(path);
        uploadedUrls.push(publicUrl);
      }
    }

    // 3. Update car with image URLs
    if (uploadedUrls.length > 0) {
      await supabase.from("cars").update({ image: uploadedUrls[0], images: uploadedUrls }).eq("id", carData.id);
    }

    // 4. Insert car_images rows
    if (uploadedUrls.length > 0) {
      await supabase.from("car_images").insert(
        uploadedUrls.map((url, position) => ({ car_id: carData.id, url, position }))
      );
    }

    setSubmitting(false);
    setSuccess(true);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md text-center p-8">
            <AlertCircle className="w-12 h-12 text-kenya-red mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Login Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to list your car.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login"><Button className="bg-kenya-red hover:bg-kenya-red/90">Log In</Button></Link>
              <Link to="/signup"><Button variant="outline">Sign Up</Button></Link>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md text-center p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Car Listed Successfully!</h2>
            <p className="text-gray-600 mb-6">Your car is now live on Safiri Kenya.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/cars")} className="bg-kenya-red hover:bg-kenya-red/90">Browse Cars</Button>
              <Button variant="outline" onClick={() => { setSuccess(false); resetForm(); }}>List Another</Button>
            </div>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-bold mb-2">List Your Car</h1>
          <p className="text-gray-600 mb-8">Fill in your car's details to start earning on Safiri Kenya.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Car Title *</Label>
                    <Input placeholder="e.g. Toyota Prado 2022" value={form.title} onChange={(e) => setField("title", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Brand *</Label>
                    <Input placeholder="e.g. Toyota" value={form.brand} onChange={(e) => setField("brand", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Model *</Label>
                    <Input placeholder="e.g. Prado TX" value={form.model} onChange={(e) => setField("model", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Year *</Label>
                    <Input type="number" min="1990" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setField("year", e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Car Type *</Label>
                    <Select value={form.type} onValueChange={(value) => setField("type", value)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        {["SUV", "Sedan", "Hatchback", "Minivan"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Number of Seats *</Label>
                    <Input type="number" min="2" max="12" value={form.seats} onChange={(e) => setField("seats", e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Location & Pricing</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location *</Label>
                    <Select value={form.location} onValueChange={(value) => setField("location", value)}>
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {KENYAN_LOCATIONS.map((location) => <SelectItem key={location} value={location}>{location}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Price per Day (KES) *</Label>
                    <Input type="number" min="500" placeholder="e.g. 3500" value={form.price} onChange={(e) => setField("price", e.target.value)} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Vehicle Specifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Transmission *</Label>
                    <Select value={form.transmission} onValueChange={(value) => setField("transmission", value)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Automatic">Automatic</SelectItem>
                        <SelectItem value="Manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fuel Type *</Label>
                    <Select value={form.fuel_type} onValueChange={(value) => setField("fuel_type", value)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Current Mileage (km)</Label>
                    <Input type="number" min="0" placeholder="e.g. 45000" value={form.mileage} onChange={(e) => setField("mileage", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Fuel Efficiency</Label>
                  <Input placeholder="e.g. 12 km/l" value={form.fuel_efficiency} onChange={(e) => setField("fuel_efficiency", e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Car Photos</CardTitle>
                <CardDescription>Upload up to 10 photos. First photo will be the cover image.</CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-kenya-red hover:bg-red-50 transition cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload photos</p>
                  <p className="text-gray-400 text-sm mt-1">JPG, PNG, WEBP — up to 10 images</p>
                </button>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`preview ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-kenya-red text-white text-xs px-2 py-0.5 rounded">Cover</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Features</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <Checkbox id={feature} checked={selectedFeatures.includes(feature)} onCheckedChange={() => toggleFeature(feature)} />
                      <Label htmlFor={feature} className="text-sm font-normal cursor-pointer">{feature}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent>
                <Textarea placeholder="Describe your car — condition, what makes it great, ideal use cases..." rows={4} value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-6 text-lg font-semibold">
              {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Listing Car...</> : "List My Car"}
            </Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListYourCar;
