import { useParams, useNavigate } from "react-router-dom";
import { getCarById } from "@/lib/mockCars";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingWidget from "@/components/BookingWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { useState } from "react";

const CarDetails = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const car = carId ? getCarById(carId) : null;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!car) {
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
  };

  const totalDays = 1; // Default for display
  const estimatedTotal = car.price * totalDays;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1">
        {/* Image Gallery */}
        <div className="relative bg-gray-900 h-96">
          <img
            src={car.images[currentImageIndex]}
            alt={car.title}
            className="w-full h-full object-cover"
          />
          {car.images.length > 1 && (
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
            {car.images.map((_, index) => (
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
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{car.title}</h1>
                  <p className="text-gray-600 text-lg mb-4">
                    {car.year} • {car.brand} {car.model}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="flex text-kenya-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(car.rating)
                                ? "fill-kenya-gold"
                                : "fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 font-semibold">{car.rating}</span>
                      <span className="text-gray-500 ml-1">
                        ({car.reviewCount} reviews)
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {car.transmission}
                    </Badge>
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

              {/* Price Section */}
              <div className="bg-gradient-to-r from-kenya-red to-red-700 text-white p-6 rounded-lg mb-8">
                <div className="text-4xl font-bold mb-2">
                  KSh {car.price.toLocaleString()}
                  <span className="text-lg font-normal">/day</span>
                </div>
                <p className="text-red-100">Perfect for families and groups</p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">About this car</h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {car.description}
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="text-sm">Seats</span>
                  </div>
                  <p className="text-2xl font-bold">{car.seats}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Fuel className="w-5 h-5 mr-2" />
                    <span className="text-sm">Fuel Type</span>
                  </div>
                  <p className="text-2xl font-bold text-sm">{car.fuelType}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Zap className="w-5 h-5 mr-2" />
                    <span className="text-sm">Efficiency</span>
                  </div>
                  <p className="text-xl font-bold">{car.fuelEfficiency}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">Mileage</span>
                  </div>
                  <p className="text-xl font-bold">{car.mileage.toLocaleString()} km</p>
                </div>
              </div>

              {/* Features */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Features & Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {car.features.map((feature) => (
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

              {/* Owner Info */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">About the owner</h3>
                <div className="flex items-start gap-4">
                  <div className="bg-kenya-red text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg">
                    {car.ownerName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{car.ownerName}</h4>
                    <div className="flex items-center mb-2">
                      <div className="flex text-kenya-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(car.ownerRating)
                                ? "fill-kenya-gold"
                                : "fill-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-semibold">
                        {car.ownerRating}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Member since {new Date(car.joinDate).getFullYear()}
                    </p>
                    <p className="text-gray-600 text-sm">
                      Response time: {car.responseTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <BookingWidget car={car} />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">Reviews ({car.reviewCount})</h2>
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b pb-6">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="bg-kenya-red text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
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
