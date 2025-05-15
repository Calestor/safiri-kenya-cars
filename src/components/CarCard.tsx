
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car as CarIcon, MapPin, Users, Calendar } from "lucide-react";

interface CarCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  rating: number;
  reviewCount: number;
  year: number;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  featured?: boolean;
}

const CarCard = ({
  id,
  title,
  image,
  price,
  location,
  rating,
  reviewCount,
  year,
  seats,
  transmission,
  featured = false,
}: CarCardProps) => {
  return (
    <div className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all ${
      featured ? 'border-2 border-kenya-gold' : ''
    }`}>
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        {featured && (
          <Badge className="absolute top-3 left-3 bg-kenya-gold text-black font-medium">
            Featured
          </Badge>
        )}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white text-gray-800 font-medium">
            {year}
          </Badge>
        </div>
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-white text-gray-800 font-medium">
            {transmission}
          </Badge>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="text-sm font-semibold text-kenya-red">
            KSh {price.toLocaleString()}/day
          </div>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex text-kenya-gold">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-kenya-gold' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-sm text-gray-600">({reviewCount})</span>
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{seats} seats</span>
          </div>
          <div className="flex items-center">
            <CarIcon className="h-4 w-4 mr-1" />
            <span>{transmission}</span>
          </div>
        </div>
        
        <Button className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default CarCard;
