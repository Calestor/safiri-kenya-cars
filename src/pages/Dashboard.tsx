import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Car, Calendar, User, Plus, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "cars">("bookings");

  useEffect(() => {
    if (!loading && !user) {
      setDataLoading(false);
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [bookingsRes, carsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("*, cars(title, image, location)")
          .eq("renter_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("cars")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (carsRes.data) setMyCars(carsRes.data);
      setDataLoading(false);
    };

    load();
  }, [user]);

  const toggleAvailability = async (carId: string, current: boolean) => {
    await supabase.from("cars").update({ is_available: !current }).eq("id", carId);
    setMyCars((prev) => prev.map((car) => (car.id === carId ? { ...car, is_available: !current } : car)));
  };

  const cancelBooking = async (bookingId: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status: "cancelled" } : booking)));
  };

  if (loading || dataLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-kenya-red" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {profile?.full_name || user?.email}</p>
            </div>
            <Link to="/list-your-car">
              <Button className="bg-kenya-red hover:bg-kenya-red/90">
                <Plus className="w-4 h-4 mr-2" /> List a Car
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Calendar className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
                <div><p className="text-2xl font-bold">{bookings.length}</p><p className="text-gray-600 text-sm">My Bookings</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <Car className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
                <div><p className="text-2xl font-bold">{myCars.length}</p><p className="text-gray-600 text-sm">My Listed Cars</p></div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <User className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
                <div><p className="text-sm font-medium">{profile?.full_name || "—"}</p><p className="text-gray-600 text-sm">{user?.email}</p></div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 mb-6">
            <Button variant={activeTab === "bookings" ? "default" : "outline"} onClick={() => setActiveTab("bookings")} className={activeTab === "bookings" ? "bg-kenya-red hover:bg-kenya-red/90" : ""}>
              My Bookings ({bookings.length})
            </Button>
            <Button variant={activeTab === "cars" ? "default" : "outline"} onClick={() => setActiveTab("cars")} className={activeTab === "cars" ? "bg-kenya-red hover:bg-kenya-red/90" : ""}>
              My Cars ({myCars.length})
            </Button>
          </div>

          {activeTab === "bookings" && (
            bookings.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No bookings yet.</p>
                  <Link to="/cars"><Button className="bg-kenya-red hover:bg-kenya-red/90">Browse Cars</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                      {booking.cars?.image && <img src={booking.cars.image} alt={booking.cars?.title} className="w-full md:w-28 h-20 object-cover rounded-lg" />}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{booking.cars?.title || "Car"}</h3>
                        <p className="text-sm text-gray-500">{booking.cars?.location}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(new Date(booking.start_date), "MMM d")} → {format(new Date(booking.end_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm font-semibold mt-1">KSh {booking.total_price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-start md:items-end">
                        <Badge className={statusColor[booking.status] || ""}>{booking.status}</Badge>
                        {booking.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => cancelBooking(booking.id)}>Cancel</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}

          {activeTab === "cars" && (
            myCars.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">You haven't listed any cars yet.</p>
                  <Link to="/list-your-car"><Button className="bg-kenya-red hover:bg-kenya-red/90">List Your Car</Button></Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCars.map((car) => (
                  <Card key={car.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {car.image && <img src={car.image} alt={car.title} className="w-24 h-20 object-cover rounded-lg" />}
                        <div className="flex-1">
                          <h3 className="font-bold">{car.title}</h3>
                          <p className="text-sm text-gray-500">{car.location} · KSh {car.price.toLocaleString()}/day</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={car.is_available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                              {car.is_available ? "Available" : "Unavailable"}
                            </Badge>
                            <Button size="sm" variant="ghost" onClick={() => toggleAvailability(car.id, car.is_available)} className="h-7 px-2">
                              {car.is_available ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
