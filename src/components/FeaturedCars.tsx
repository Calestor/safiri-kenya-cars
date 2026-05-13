
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CarCard from "./CarCard";
import { mockCars } from "@/lib/mockCars";

const FeaturedCars = () => {
  const navigate = useNavigate();
  const featuredCars = mockCars.slice(0, 4);

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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCars.map((car) => (
            <div 
              key={car.id}
              onClick={() => handleViewCar(car.id)}
              className="cursor-pointer"
            >
              <CarCard 
                {...car}
                featured={true}
              />
            </div>
          ))}
        </div>
        
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
