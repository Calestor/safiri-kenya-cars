import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";

const listCarSchema = z.object({
  // Basic Details
  carBrand: z.string().min(2, "Brand is required"),
  carModel: z.string().min(2, "Model is required"),
  carYear: z.string().min(4, "Year is required"),
  carType: z.string().min(1, "Car type is required"),
  transmission: z.enum(["Manual", "Automatic"]),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  mileage: z.string().min(1, "Mileage is required"),
  seatsCount: z.string().min(1, "Number of seats is required"),
  color: z.string().min(2, "Color is required"),

  // Pricing & Location
  dailyRate: z.string().min(1, "Daily rate is required"),
  location: z.string().min(2, "Location is required"),
  
  // Description
  description: z.string().min(20, "Description must be at least 20 characters").max(500),
  fuelEfficiency: z.string().optional(),

  // Features
  features: z.array(z.string()).min(1, "Select at least one feature"),

  // Owner Details
  ownerName: z.string().min(2, "Name is required"),
  ownerEmail: z.string().email("Valid email is required"),
  ownerPhone: z.string().min(10, "Valid phone number is required"),

  // Agreements
  termsAccepted: z.boolean().refine((val) => val === true, "You must accept terms"),
});

type ListCarFormData = z.infer<typeof listCarSchema>;

const ListYourCar = () => {
  const [submitted, setSubmitted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const form = useForm<ListCarFormData>({
    resolver: zodResolver(listCarSchema),
    defaultValues: {
      transmission: "Automatic",
      fuelType: "Petrol",
      carType: "SUV",
      features: [],
      termsAccepted: false,
    },
  });

  const carTypes = ["Sedan", "SUV", "Hatchback", "Coupe", "Minivan", "Pickup", "Wagon"];
  const kenyaLocations = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
    "Malindi",
    "Lamu",
    "Nanyuki",
    "Naivasha",
    "Diani",
  ];
  const amenities = [
    "Air Conditioning",
    "Power Windows",
    "Power Steering",
    "Cruise Control",
    "Touchscreen Radio",
    "Bluetooth",
    "AUX/USB Port",
    "Parking Sensors",
    "Rearview Camera",
    "ABS Brakes",
    "Airbags",
    "Sunroof",
    "Leather Seats",
    "Climate Control",
  ];

  const onSubmit = (data: ListCarFormData) => {
    console.log("Form Data:", data);
    setSubmitted(true);
    setTimeout(() => {
      form.reset();
      setUploadedImages([]);
      setSubmitted(false);
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full border-green-200 bg-green-50">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-900 mb-2">Listing Created!</h2>
              <p className="text-green-700 mb-4">
                Your car has been successfully listed. Our team will review it and you'll be notified shortly.
              </p>
              <p className="text-sm text-green-600">Redirecting...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3">List Your Car</h1>
            <p className="text-xl text-gray-600">
              Start earning money by renting out your car on Safiri Kenya
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Car Details Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Car Details</CardTitle>
                  <CardDescription>
                    Provide basic information about your vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carBrand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Toyota" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="carModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Prado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="carYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="2020" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="carType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Car Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {carTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Silver" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mileage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mileage (km)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="45000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="seatsCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seats</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[2, 4, 5, 7, 8, 9].map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Seats
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transmission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmission</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Manual">Manual</SelectItem>
                              <SelectItem value="Automatic">Automatic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fuelType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fuel Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Petrol">Petrol</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                              <SelectItem value="Electric">Electric</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="fuelEfficiency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Efficiency (km/l)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 8.5" {...field} />
                        </FormControl>
                        <FormDescription>
                          Approximate fuel consumption per liter
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pricing & Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing & Location</CardTitle>
                  <CardDescription>Set your rental rate and where the car is located</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="dailyRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Rate (KSh)</FormLabel>
                        <FormControl>
                          <div className="flex items-center">
                            <span className="text-gray-600 mr-2">KSh</span>
                            <Input type="number" placeholder="5000" {...field} />
                            <span className="text-gray-600 ml-2">/day</span>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Price per day in Kenyan Shillings
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {kenyaLocations.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                  <CardDescription>Tell renters about your vehicle</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Car Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your car, its condition, and any special features..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Features & Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                  <CardDescription>Select all features your car has</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="features"
                    render={() => (
                      <FormItem>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {amenities.map((feature) => (
                            <FormField
                              key={feature}
                              control={form.control}
                              name="features"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={feature}
                                    className="flex flex-row items-center space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(feature)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, feature])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== feature)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {feature}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Images Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Car Photos</CardTitle>
                  <CardDescription>Upload clear photos of your vehicle</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <label className="cursor-pointer">
                      <span className="text-kenya-red font-semibold">Click to upload</span>
                      <span className="text-gray-600"> or drag and drop</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-3">
                        Uploaded Images ({uploadedImages.length})
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedImages.map((image, idx) => (
                          <img
                            key={idx}
                            src={image}
                            alt={`Car ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>How renters will contact you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="ownerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Kipchoge" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ownerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+254 7XX XXX XXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal cursor-pointer">
                            I agree to the Terms & Conditions and Insurance Requirements
                          </FormLabel>
                          <FormDescription>
                            Your car must have comprehensive insurance coverage. You are responsible for any damages not covered by renters.
                          </FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-kenya-red hover:bg-kenya-red/90 text-white py-6 text-lg font-semibold"
                >
                  List Your Car Now
                </Button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Before You List:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Ensure your car is in good condition and well-maintained</li>
                    <li>✓ Have comprehensive insurance coverage</li>
                    <li>✓ Provide clear, honest photos of your vehicle</li>
                    <li>✓ Our team reviews listings within 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ListYourCar;
