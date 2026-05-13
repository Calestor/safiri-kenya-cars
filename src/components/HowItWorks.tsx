
import { Search, Calendar, Car } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search for a Car",
    description: "Browse our wide selection of cars from trusted owners across Kenya.",
    color: "bg-kenya-red"
  },
  {
    icon: Calendar,
    title: "Book Your Dates",
    description: "Choose your pick-up and return dates and confirm your booking instantly.",
    color: "bg-kenya-green"
  },
  {
    icon: Car,
    title: "Enjoy Your Ride",
    description: "Pick up your car and explore Kenya with freedom and confidence.",
    color: "bg-kenya-gold"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Renting a car in Kenya has never been easier. Our simple 3-step process gets you on the road quickly and safely.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                <step.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 bg-gray-50 p-6 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-3 text-center">For Car Owners</h3>
          <p className="text-gray-600 text-center mb-4">
            List your car on our platform and earn extra income. We handle the bookings, 
            payments, and provide insurance coverage while your car is rented.
          </p>
          <div className="flex justify-center">
            <button className="px-6 py-2 bg-kenya-green hover:bg-kenya-green/90 text-white rounded-md font-medium">
              Learn How to List Your Car
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
