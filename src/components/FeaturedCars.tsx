
import { Button } from "@/components/ui/button";
import CarCard from "./CarCard";

// Sample car data
const featuredCars = [
  {
    id: "1",
    title: "Toyota Prado TX",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: 12000,
    location: "Nairobi, Kenya",
    rating: 4.8,
    reviewCount: 24,
    year: 2020,
    seats: 7,
    transmission: "Automatic" as const,
    featured: true
  },
  {
    id: "2",
    title: "Toyota Corolla",
    image: "https://images.unsplash.com/photo-1590510757317-5fd5cde63be6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: 5000,
    location: "Mombasa, Kenya",
    rating: 4.5,
    reviewCount: 18,
    year: 2019,
    seats: 5,
    transmission: "Manual" as const
  },
  {
    id: "3",
    title: "Suzuki Jimny",
    image: "https://images.unsplash.com/photo-1594132599253-11fce70a21ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    price: 7000,
    location: "Nairobi, Kenya",
    rating: 4.7,
    reviewCount: 15,
    year: 2021,
    seats: 4,
    transmission: "Manual" as const
  },
  {
    id: "4",
    title: "Mazda CX-5",
    image: "https://images.unsplash.com/photo-1670513700396-87c367c31cc8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    price: 9000,
    location: "Nakuru, Kenya",
    rating: 4.6,
    reviewCount: 12,
    year: 2020,
    seats: 5,
    transmission: "Automatic" as const
  }
];

const FeaturedCars = () => {
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
            <CarCard key={car.id} {...car} />
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button variant="outline" className="border-kenya-red text-kenya-red hover:bg-kenya-red hover:text-white">
            View All Cars
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
