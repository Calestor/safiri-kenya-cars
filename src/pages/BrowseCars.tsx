import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { mockCars } from "@/lib/mockCars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";

const BrowseCars = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "all");
  const [selectedCarType, setSelectedCarType] = useState("all");
  const [selectedTransmission, setSelectedTransmission] = useState("all");
  const [priceRange, setPriceRange] = useState([2000, 6000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const locations = Array.from(new Set(mockCars.map((car) => car.location)));
  const carTypes = ["SUV", "Sedan", "Hatchback", "Minivan"];
  const transmissions = ["Automatic", "Manual"];

  // Filter and sort logic
  const filteredCars = useMemo(() => {
    let filtered = mockCars.filter((car) => {
      const matchesSearch =
        car.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = selectedLocation === "all" || car.location === selectedLocation;
      const matchesCarType = selectedCarType === "all" || car.type === selectedCarType;
      const matchesTransmission =
        selectedTransmission === "all" || car.transmission === selectedTransmission;
      const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1];

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCarType &&
        matchesTransmission &&
        matchesPrice
      );
    });

    // Sort
    switch (sortBy) {
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "newest":
      default:
        return filtered;
    }
  }, [searchQuery, selectedLocation, selectedCarType, selectedTransmission, priceRange, sortBy]);

  const isFilterActive =
    searchQuery ||
    selectedLocation !== "all" ||
    selectedCarType !== "all" ||
    selectedTransmission !== "all" ||
    priceRange[0] !== 2000 ||
    priceRange[1] !== 6000 ||
    sortBy !== "newest";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLocation("all");
    setSelectedCarType("all");
    setSelectedTransmission("all");
    setPriceRange([2000, 6000]);
    setSortBy("newest");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">Browse Cars</h1>
            <p className="text-gray-600">
              Found <span className="font-bold text-kenya-red">{filteredCars.length}</span> cars
              available
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                {/* Mobile Filter Toggle */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden w-full mb-4 bg-kenya-red hover:bg-kenya-red/90"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {showFilters ? "Hide" : "Show"} Filters
                </Button>

                {/* Filters */}
                <Card className={`${showFilters ? "block" : "hidden"} lg:block`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Filters</CardTitle>
                      {isFilterActive && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-kenya-red hover:underline flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Clear
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Brand, model..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Location</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Car Type */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Car Type</label>
                      <Select value={selectedCarType} onValueChange={setSelectedCarType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {carTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transmission */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Transmission</label>
                      <Select
                        value={selectedTransmission}
                        onValueChange={setSelectedTransmission}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All transmissions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Transmissions</SelectItem>
                          {transmissions.map((trans) => (
                            <SelectItem key={trans} value={trans}>
                              {trans}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-semibold mb-4">
                        Price Range
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={1000}
                        max={8000}
                        step={100}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>KSh {priceRange[0].toLocaleString()}/day</span>
                        <span>KSh {priceRange[1].toLocaleString()}/day</span>
                      </div>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Top Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Cars Grid */}
            <div className="lg:col-span-3">
              {filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCars.map((car) => (
                    <div
                      key={car.id}
                      onClick={() => navigate(`/cars/${car.id}`)}
                      className="cursor-pointer"
                    >
                      <CarCard {...car} featured={false} />
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-gray-600 mb-4 text-lg">No cars found matching your filters</p>
                    <Button
                      onClick={clearFilters}
                      className="bg-kenya-red hover:bg-kenya-red/90"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BrowseCars;
