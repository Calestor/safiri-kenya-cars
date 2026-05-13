
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

const Hero = () => {
  return (
    <div className="hero-gradient min-h-[500px] md:min-h-[600px] w-full flex items-center relative">
      <div className="container mx-auto px-4 py-16 text-white">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Discover the Perfect Car for Your Kenyan Adventure
          </h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Rent from trusted local car owners across Kenya or earn money by listing your car
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-kenya-red hover:bg-kenya-red/90 text-white"
            >
              Find a Car
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-kenya-red"
            >
              List Your Car
            </Button>
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
