
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Car, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-kenya-red" />
            <span className="font-bold text-lg text-kenya-red">KenyaRide</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-kenya-red font-medium">
              Home
            </Link>
            <Link to="/cars" className="text-gray-700 hover:text-kenya-red font-medium">
              Browse Cars
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-kenya-red font-medium">
              How It Works
            </Link>
            <Link to="/list-your-car" className="text-gray-700 hover:text-kenya-red font-medium">
              List Your Car
            </Link>
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-kenya-red text-kenya-red hover:bg-kenya-red hover:text-white">
              Log In
            </Button>
            <Button className="bg-kenya-red hover:bg-kenya-red/90 text-white">
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link 
              to="/" 
              className="block py-2 text-gray-700 hover:text-kenya-red"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/cars" 
              className="block py-2 text-gray-700 hover:text-kenya-red"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Cars
            </Link>
            <Link 
              to="/how-it-works" 
              className="block py-2 text-gray-700 hover:text-kenya-red"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              to="/list-your-car" 
              className="block py-2 text-gray-700 hover:text-kenya-red"
              onClick={() => setIsMenuOpen(false)}
            >
              List Your Car
            </Link>
            <div className="pt-2 space-y-3">
              <Button 
                variant="outline" 
                className="w-full border-kenya-red text-kenya-red hover:bg-kenya-red hover:text-white"
              >
                Log In
              </Button>
              <Button 
                className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white"
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
