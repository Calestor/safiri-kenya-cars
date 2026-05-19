
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import FeaturedCars from "@/components/FeaturedCars";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <FeaturedCars />
      <HowItWorks />
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our satisfied customers about their car rental experiences across Kenya.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "James Mwangi",
                location: "Nairobi",
                text: "I rented a Toyota Prado for our family safari to Maasai Mara. The car was in excellent condition and the owner was very helpful. Highly recommend!",
                rating: 5
              },
              {
                name: "Aisha Omar",
                location: "Mombasa",
                text: "As a tourist, I was worried about renting a car in Kenya, but Safiri Kenya made it so easy. The Suzuki Jimny I got was perfect for exploring the coast.",
                rating: 5
              },
              {
                name: "Daniel Kipchoge",
                location: "Eldoret",
                text: "I use Safiri Kenya whenever I need a car for business trips. Their service is reliable and the car owners are professional. Great platform!",
                rating: 4
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <div className="flex text-kenya-gold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.rating ? 'text-kenya-gold' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="bg-kenya-red text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-kenya-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of happy travelers exploring Kenya with the perfect rental car.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate("/cars")}
              className="px-8 py-3 bg-white text-kenya-red font-bold rounded-md hover:bg-gray-100"
            >
              Find a Car
            </button>
            <button 
              onClick={() => navigate("/list-your-car")}
              className="px-8 py-3 bg-transparent border-2 border-white font-bold rounded-md hover:bg-white/10"
            >
              List Your Car
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
