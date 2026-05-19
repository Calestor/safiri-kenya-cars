import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CarCard from "./CarCard";
import { supabase } from "@/lib/supabase";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop";

const FeaturedCars = () => {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      const { data } = await supabase
        .from("cars")
        .select("*")
        .eq("is_available", true)
        .order("rating", { ascending: false })
        .limit(3);

      setFeaturedCars(data ?? []);
      setLoading(false);
    };

    fetchFeaturedCars();
  }, []);

  const handleViewCar = (carId: string) => {
    navigate(`/cars/${carId}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Cars</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular rental cars across Kenya. From city runabouts to safari-ready SUVs, find the perfect vehicle for your journey.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-kenya-red" />
          </div>
        ) : featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => (
              <div
                key={car.id}
                onClick={() => handleViewCar(car.id)}
                className="cursor-pointer"
              >
                <CarCard
                  {...car}
                  image={car.image || FALLBACK_IMAGE}
                  reviewCount={car.review_count}
                  fuelType={car.fuel_type}
                  ownerName={car.owner_name}
                  fuelEfficiency={car.fuel_efficiency}
                  featured={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">No featured cars available right now.</div>
        )}

        <div className="text-center mt-10">
          <Button
            variant="outline"
            className="border-kenya-red text-kenya-red hover:bg-kenya-red hover:text-white"
            onClick={() => navigate("/cars")}
          >
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
