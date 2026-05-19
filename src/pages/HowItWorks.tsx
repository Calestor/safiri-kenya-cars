import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  CreditCard,
  Navigation,
  CheckCircle,
  Users,
  DollarSign,
  ShieldCheck,
  Clock,
} from "lucide-react";

const HowItWorks = () => {
  const navigate = useNavigate();

  const renterSteps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Browse & Search",
      description: "Find your perfect car from thousands of listings across Kenya",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Select Dates",
      description: "Choose your pickup and return dates with flexible options",
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Make Payment",
      description: "Pay securely using M-Pesa, card, or bank transfer",
    },
    {
      icon: <Navigation className="w-8 h-8" />,
      title: "Enjoy Your Ride",
      description: "Pick up your car and explore Kenya with confidence",
    },
  ];

  const ownerSteps = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "List Your Car",
      description: "Add your vehicle details and set your own daily rate",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Get Bookings",
      description: "Receive rental requests from verified travelers",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Secure Protection",
      description: "Your car is protected with our comprehensive insurance",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Earn Money",
      description: "Get paid directly to your account after each rental",
    },
  ];

  const faqs = [
    {
      question: "Is my car insured while being rented?",
      answer:
        "Yes! All cars on Safiri Kenya come with comprehensive insurance coverage. Renters are also required to maintain this insurance during their rental period.",
    },
    {
      question: "How does payment work?",
      answer:
        "Renters pay upfront via M-Pesa, card, or bank transfer. Car owners receive 90% of the rental fee (after 10% service fee) within 24 hours of the rental completion.",
    },
    {
      question: "What if there's damage to my car?",
      answer:
        "Our insurance covers accidental damage. In case of intentional damage, the renter's security deposit covers repairs. Our claims team investigates and settles disputes fairly.",
    },
    {
      question: "Can I cancel a booking?",
      answer:
        "Renters can cancel free of charge up to 24 hours before pickup. Car owners can cancel with 48 hours notice. Cancellations within 24 hours may have a charge.",
    },
    {
      question: "Do I need a special license to rent?",
      answer:
        "You need a valid driving license (national or international) and must be at least 18 years old. For renters under 25, an additional young driver fee may apply.",
    },
    {
      question: "How do I contact my car owner/renter?",
      answer:
        "You can message through the Safiri Kenya app or platform. Direct phone contact information is shared once a booking is confirmed.",
    },
  ];

  const features = [
    {
      title: "Verified Users",
      description: "All users are verified to ensure safety and trust",
      icon: <ShieldCheck className="w-6 h-6 text-kenya-red" />,
    },
    {
      title: "24/7 Support",
      description: "Our customer support team is always available to help",
      icon: <Clock className="w-6 h-6 text-kenya-red" />,
    },
    {
      title: "Flexible Pricing",
      description: "Car owners set their own rates and availability",
      icon: <DollarSign className="w-6 h-6 text-kenya-red" />,
    },
    {
      title: "Easy Payment",
      description: "Multiple payment methods for your convenience",
      icon: <CreditCard className="w-6 h-6 text-kenya-red" />,
    },
    {
      title: "Insurance Coverage",
      description: "Comprehensive protection for vehicle owners",
      icon: <ShieldCheck className="w-6 h-6 text-kenya-red" />,
    },
    {
      title: "Ratings & Reviews",
      description: "Transparent reviews help you make informed decisions",
      icon: <Users className="w-6 h-6 text-kenya-red" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-kenya-red to-red-700 text-white py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How Safiri Kenya Works</h1>
            <p className="text-xl text-red-100 max-w-2xl mx-auto">
              Whether you're looking to rent a car or earn money by sharing yours, Safiri Kenya
              makes it simple and secure
            </p>
          </div>
        </section>

        {/* For Renters */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">For Renters</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get started in 4 easy steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {renterSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="text-kenya-red mb-4">{step.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                  {idx < renterSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-1 bg-kenya-red" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => navigate("/cars")}
                className="bg-kenya-red hover:bg-kenya-red/90 text-white py-6 px-8 text-lg font-semibold"
              >
                Browse Cars Now
              </Button>
            </div>
          </div>
        </section>

        {/* For Owners */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">For Car Owners</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Earn passive income by renting your car
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {ownerSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <Card className="h-full">
                    <CardContent className="pt-6">
                      <div className="text-kenya-red mb-4">{step.icon}</div>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                  {idx < ownerSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 -right-4 w-8 h-1 bg-kenya-red" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={() => navigate("/list-your-car")}
                className="bg-kenya-red hover:bg-kenya-red/90 text-white py-6 px-8 text-lg font-semibold"
              >
                List Your Car
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Safiri Kenya?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're committed to making car rentals safe, affordable, and convenient
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">{feature.icon}</div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-600 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600">
                Have questions? We have answers
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-kenya-red to-red-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-red-100 max-w-2xl mx-auto mb-8 text-lg">
              Join thousands of travelers and car owners on Safiri Kenya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/cars")}
                className="bg-white text-kenya-red hover:bg-gray-100 py-6 px-8 font-semibold"
              >
                Browse Cars
              </Button>
              <Button
                onClick={() => navigate("/list-your-car")}
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 py-6 px-8 font-semibold"
              >
                List Your Car
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HowItWorks;
