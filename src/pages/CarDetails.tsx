import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Heart,
  Share2,
  Star,
  Users,
  Zap,
  Fuel,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=800&fit=crop";

const CarDetails = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!carId) {
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      setLoading(true);
      // Try with car_images join first; fall back if table doesn't exist
      let { data, error } = await supabase
        .from("cars")
        .select("*, car_images(url, position)")
        .eq("id", carId)
        .single();

      if (error) {
        const fallback = await supabase.from("cars").select("*").eq("id", carId).single();
        data = fallback.data;
      }

      setCar(data ?? null);
      setLoading(false);
    };

    fetchCar();
  }, [carId]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [carId]);

  const getImages = (car: any): string[] => {
    if (car.car_images && car.car_images.length > 0) {
      return car.car_images
        .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
        .map((img: { url: string }) => img.url);
    }
    if (car.images && car.images.length > 0) return car.images;
    return [car.image || FALLBACK_IMAGE];
  };

  const mappedCar = car
    ? {
        ...car,
        image: car.image || car.images?.[0] || FALLBACK_IMAGE,
        images: getImages(car),
        fuelType: car.fuel_type,
        ownerName: car.owner_name || "Safiri Host",
        reviewCount: car.review_count ?? 0,
        fuelEfficiency: car.fuel_efficiency || "—",
        ownerRating: car.owner_rating ?? 5,
        joinDate: car.created_at,
        responseTime: "Usually within a few hours",
        description: car.description || "No description available.",
        features: car.features || [],
        mileage: car.mileage ?? 0,
        rating: car.rating ?? 0,
      }
    : null;

  const imageCount = mappedCar?.images.length || 0;

  const nextImage = () => {
    if (!imageCount) return;
    setCurrentImageIndex((prev) => (prev + 1) % imageCount);
  };

  const prevImage = () => {
    if (!imageCount) return;
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-kenya-red" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!mappedCar) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Car Not Found</h2>
            <Button onClick={() => navigate("/")} className="bg-kenya-red hover:bg-kenya-red/90">
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1">
        <div className="relative bg-gray-900 h-96">
          <img
            src={mappedCar.images[currentImageIndex]}
            alt={mappedCar.title}
            className="w-full h-full object-cover"
          />
          {mappedCar.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {mappedCar.images.map((_: string, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-start mb-6 gap-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{mappedCar.title}</h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {mappedCar.year} • {mappedCar.brand} {mappedCar.model}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <div className="flex text-kenya-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(mappedCar.rating)
                                ? "fill-kenya-gold"
                                : "fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{mappedCar.rating}</span>
                      <span className="text-gray-500 ml-1">
                        ({mappedCar.reviewCount} reviews)
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {mappedCar.transmission}
                    </Badge>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {mappedCar.location}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-kenya-red to-red-700 text-white p-6 rounded-lg mb-8">
                <div className="text-4xl font-bold mb-2">
                  KSh {mappedCar.price.toLocaleString()}
                  <span className="text-lg font-normal">/day</span>
                </div>
                <p className="text-red-100">Perfect for families and groups</p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About this car</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {mappedCar.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="text-sm">Seats</span>
                  </div>
                  <p className="text-2xl font-bold">{mappedCar.seats}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Fuel className="w-5 h-5 mr-2" />
                    <span className="text-sm">Fuel Type</span>
                  </div>
                  <p className="text-2xl font-bold text-sm">{mappedCar.fuelType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Zap className="w-5 h-5 mr-2" />
                    <span className="text-sm">Efficiency</span>
                  </div>
                  <p className="text-xl font-bold">{mappedCar.fuelEfficiency}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">Mileage</span>
                  </div>
                  <p className="text-xl font-bold">{mappedCar.mileage.toLocaleString()} km</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mappedCar.features.map((feature: string) => (
                    <div
                      key={feature}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-kenya-red rounded-full mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">About the owner</h3>
                <div className="flex items-start gap-4">
                  <div className="bg-kenya-red text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {mappedCar.ownerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{mappedCar.ownerName}</h4>
                    <div className="flex items-center mb-2">
                      <div className="flex text-kenya-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(mappedCar.ownerRating)
                                ? "fill-kenya-gold"
                                : "fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-semibold">
                        {mappedCar.ownerRating}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Member since {new Date(mappedCar.joinDate).getFullYear()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Response time: {mappedCar.responseTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <BookingWidget car={mappedCar} />
              </div>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">Reviews ({mappedCar.reviewCount})</h2>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="bg-kenya-red text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <h4 className="font-semibold">
                          {["Sarah Kipchoge", "Michael Omondi", "Grace Mwangi"][i - 1]}
                        </h4>
                        <span className="text-gray-500 text-sm">
                          {i} month{i > 1 ? "s" : ""} ago
                        </span>
                      </div>
                      <div className="flex text-kenya-gold mb-2">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-kenya-gold" />
                        ))}
                      </div>
                      <p className="text-gray-600">
                        {[
                          "Excellent car! Clean, well-maintained, and the owner was very responsive. Highly recommend!",
                          "Great experience. The car was comfortable for our family road trip. Would rent again.",
                          "Perfect for exploring Kenya. Reliable and in great condition.",
                        ][i - 1]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CarDetails;
