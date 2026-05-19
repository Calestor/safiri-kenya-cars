
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, MapPin } from "lucide-react";
import { format } from "date-fns";

const SearchBar = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [locationError, setLocationError] = useState(false);
  
  const handleSearch = () => {
    if (!location) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    const params = new URLSearchParams();
    params.set("location", location);
    if (pickupDate) params.set("pickup", format(pickupDate, "yyyy-MM-dd"));
    if (returnDate) params.set("return", format(returnDate, "yyyy-MM-dd"));
    navigate(`/cars?${params.toString()}`);
  };

  const kenyaLocations = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", 
    "Malindi", "Lamu", "Nanyuki", "Naivasha", "Diani"
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Pick-up Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Select value={location} onValueChange={(val) => { setLocation(val); setLocationError(false); }}>
            <SelectTrigger className={`pl-10 w-full ${locationError ? "border-red-500" : ""}`}>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {kenyaLocations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {locationError && (
          <p className="text-red-500 text-xs mt-1">Please select a location</p>
        )}
      </div>
      
      <div className="md:w-[160px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pick-up Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {pickupDate ? format(pickupDate, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={pickupDate}
              onSelect={setPickupDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="md:w-[160px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Return Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal h-10"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {returnDate ? format(returnDate, "PPP") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={returnDate}
              onSelect={setReturnDate}
              disabled={(date) => 
                (pickupDate ? date < pickupDate : false) || date < new Date()
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex items-end">
        <Button 
          onClick={handleSearch}
          className="bg-kenya-red hover:bg-kenya-red/90 text-white w-full h-10"
        >
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
