import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Calendar, Car, Loader2, Phone, Plus, Shield, Star, ToggleLeft, ToggleRight, User, X } from "lucide-react";
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
  const [requests, setRequests] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bookings" | "requests" | "cars">("bookings");
  const [renterModal, setRenterModal] = useState<any | null>(null);
  const [ratedBookings, setRatedBookings] = useState<Set<string>>(new Set());
  const [activeRatingBookingId, setActiveRatingBookingId] = useState<string | null>(null);
  const [selectedRatings, setSelectedRatings] = useState<Record<string, number>>({});
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({});
  const [ratingErrors, setRatingErrors] = useState<Record<string, string>>({});
  const [submittingRatingId, setSubmittingRatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) { setDataLoading(false); navigate("/login"); }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setDataLoading(true);

      const [bookingsRes, carsRes] = await Promise.all([
        supabase.from("bookings").select("*, cars(title, image, location)").eq("renter_id", user.id).order("created_at", { ascending: false }),
        supabase.from("cars").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);

      if (carsRes.data) {
        setMyCars(carsRes.data);
        const carIds = carsRes.data.map((c: any) => c.id);

        if (carIds.length > 0) {
          const { data: reqData } = await supabase
            .from("bookings")
            .select("*, cars(title, image, location)")
            .in("car_id", carIds)
            .order("created_at", { ascending: false });

          if (reqData) {
            const renterIds = [...new Set(reqData.map((r: any) => r.renter_id).filter(Boolean))];
            const bookingIds = reqData.map((r: any) => r.id);

            const [profilesResult, ratedBookingsResult, renterRatings] = await Promise.all([
              renterIds.length > 0
                ? supabase
                    .from("profiles")
                    .select("id, full_name, phone, avatar_url, driver_license_url, created_at")
                    .in("id", renterIds)
                : Promise.resolve({ data: [] as any[] }),
              bookingIds.length > 0
                ? supabase
                    .from("renter_ratings")
                    .select("booking_id")
                    .eq("owner_id", user.id)
                    .in("booking_id", bookingIds)
                : Promise.resolve({ data: [] as any[] }),
              Promise.all(
                renterIds.map(async (renterId) => {
                  const { data: ratingsData } = await supabase
                    .from("renter_ratings")
                    .select("rating")
                    .eq("renter_id", renterId);

                  const avgRating = ratingsData?.length
                    ? (ratingsData.reduce((a, b) => a + b.rating, 0) / ratingsData.length).toFixed(1)
                    : null;

                  return {
                    renterId,
                    avgRating,
                    ratingCount: ratingsData?.length || 0,
                  };
                }),
              ),
            ]);

            const profileMap: Record<string, any> = {};
            profilesResult.data?.forEach((renterProfile: any) => {
              profileMap[renterProfile.id] = renterProfile;
            });

            const renterRatingsMap: Record<string, any> = {};
            renterRatings.forEach((ratingSummary) => {
              renterRatingsMap[ratingSummary.renterId] = ratingSummary;
            });

            setRatedBookings(new Set(ratedBookingsResult.data?.map((rating: any) => rating.booking_id) || []));
            setRequests(
              reqData.map((request: any) => ({
                ...request,
                renter: request.renter_id
                  ? {
                      ...(profileMap[request.renter_id] || {}),
                      avg_rating: renterRatingsMap[request.renter_id]?.avgRating || null,
                      rating_count: renterRatingsMap[request.renter_id]?.ratingCount || 0,
                    }
                  : null,
              })),
            );
          } else {
            setRequests([]);
            setRatedBookings(new Set());
          }
        } else {
          setRequests([]);
          setRatedBookings(new Set());
        }
      }

      setDataLoading(false);
    };

    load();

    const channel = supabase
      .channel("dashboard-bookings")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";
  };

  const updateLocalRenterSummary = (renterId: string, rating: number) => {
    setRequests((prev) => prev.map((request) => {
      if (request.renter_id !== renterId || !request.renter) return request;

      const ratingCount = request.renter.rating_count || 0;
      const currentAverage = request.renter.avg_rating ? Number(request.renter.avg_rating) : 0;
      const nextAverage = ((currentAverage * ratingCount) + rating) / (ratingCount + 1);

      return {
        ...request,
        renter: {
          ...request.renter,
          avg_rating: nextAverage.toFixed(1),
          rating_count: ratingCount + 1,
        },
      };
    }));

    setRenterModal((current: any) => {
      if (!current || current.id !== renterId) return current;
      const ratingCount = current.rating_count || 0;
      const currentAverage = current.avg_rating ? Number(current.avg_rating) : 0;
      const nextAverage = ((currentAverage * ratingCount) + rating) / (ratingCount + 1);

      return {
        ...current,
        avg_rating: nextAverage.toFixed(1),
        rating_count: ratingCount + 1,
      };
    });
  };

  const toggleAvailability = async (carId: string, current: boolean) => {
    await supabase.from("cars").update({ is_available: !current }).eq("id", carId);
    setMyCars((prev) => prev.map((car) => car.id === carId ? { ...car, is_available: !current } : car));
  };

  const cancelBooking = async (bookingId: string) => {
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b));
  };

  const updateRequest = async (bookingId: string, status: "confirmed" | "cancelled" | "completed") => {
    await supabase.from("bookings").update({ status }).eq("id", bookingId);
    setRequests((prev) => prev.map((b) => b.id === bookingId ? { ...b, status } : b));
  };

  const submitRenterRating = async (request: any) => {
    if (!user) return;

    const selectedRating = selectedRatings[request.id];
    if (!selectedRating) {
      setRatingErrors((prev) => ({ ...prev, [request.id]: "Please choose a star rating." }));
      return;
    }

    setSubmittingRatingId(request.id);
    setRatingErrors((prev) => ({ ...prev, [request.id]: "" }));

    const ratingComment = ratingComments[request.id]?.trim() || null;
    const { error } = await supabase.from("renter_ratings").insert({
      booking_id: request.id,
      renter_id: request.renter_id,
      owner_id: user.id,
      rating: selectedRating,
      comment: ratingComment,
    });

    setSubmittingRatingId(null);

    if (error) {
      setRatingErrors((prev) => ({ ...prev, [request.id]: error.message }));
      return;
    }

    setRatedBookings((prev) => {
      const next = new Set(prev);
      next.add(request.id);
      return next;
    });
    setActiveRatingBookingId(null);
    setSelectedRatings((prev) => ({ ...prev, [request.id]: 0 }));
    setRatingComments((prev) => ({ ...prev, [request.id]: "" }));
    setRatingErrors((prev) => ({ ...prev, [request.id]: "" }));
    updateLocalRenterSummary(request.renter_id, selectedRating);
  };

  const pendingRequests = requests.filter((r) => r.status === "pending").length;

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

  if (!user) return null;

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
              <Button className="bg-kenya-red hover:bg-kenya-red/90"><Plus className="w-4 h-4 mr-2" /> List a Car</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card><CardContent className="flex items-center gap-4 p-6">
              <Calendar className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
              <div><p className="text-2xl font-bold">{bookings.length}</p><p className="text-gray-600 text-sm">My Bookings</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6">
              <Bell className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests}</p>
                <p className="text-gray-600 text-sm">Pending Requests</p>
              </div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6">
              <Car className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
              <div><p className="text-2xl font-bold">{myCars.length}</p><p className="text-gray-600 text-sm">My Listed Cars</p></div>
            </CardContent></Card>
            <Card><CardContent className="flex items-center gap-4 p-6">
              <User className="w-10 h-10 text-kenya-red bg-red-50 p-2 rounded-lg" />
              <div><p className="text-sm font-medium">{profile?.full_name || "-"}</p><p className="text-gray-600 text-sm">{user?.email}</p></div>
            </CardContent></Card>
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <Button variant={activeTab === "bookings" ? "default" : "outline"} onClick={() => setActiveTab("bookings")} className={activeTab === "bookings" ? "bg-kenya-red hover:bg-kenya-red/90" : ""}>
              My Bookings ({bookings.length})
            </Button>
            <Button variant={activeTab === "requests" ? "default" : "outline"} onClick={() => setActiveTab("requests")} className={activeTab === "requests" ? "bg-kenya-red hover:bg-kenya-red/90" : "relative"}>
              Booking Requests ({requests.length})
              {pendingRequests > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingRequests}</span>}
            </Button>
            <Button variant={activeTab === "cars" ? "default" : "outline"} onClick={() => setActiveTab("cars")} className={activeTab === "cars" ? "bg-kenya-red hover:bg-kenya-red/90" : ""}>
              My Cars ({myCars.length})
            </Button>
          </div>

          {activeTab === "bookings" && (
            bookings.length === 0 ? (
              <Card className="text-center py-12"><CardContent>
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No bookings yet.</p>
                <Link to="/cars"><Button className="bg-kenya-red hover:bg-kenya-red/90">Browse Cars</Button></Link>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}><CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    {booking.cars?.image && <img src={booking.cars.image} alt={booking.cars?.title} className="w-full md:w-28 h-20 object-cover rounded-lg" />}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{booking.cars?.title || "Car"}</h3>
                      <p className="text-sm text-gray-500">{booking.cars?.location}</p>
                      <p className="text-sm text-gray-600 mt-1">{format(new Date(booking.start_date), "MMM d")} to {format(new Date(booking.end_date), "MMM d, yyyy")}</p>
                      <p className="text-sm font-semibold mt-1">KSh {booking.total_price.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-start md:items-end">
                      <Badge className={statusColor[booking.status] || ""}>{booking.status}</Badge>
                      {booking.status === "pending" && (
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => cancelBooking(booking.id)}>Cancel</Button>
                      )}
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            )
          )}

          {activeTab === "requests" && (
            requests.length === 0 ? (
              <Card className="text-center py-12"><CardContent>
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No booking requests yet.</p>
                <p className="text-gray-400 text-sm mt-1">Requests will appear here when someone books one of your cars.</p>
              </CardContent></Card>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const showingRatingForm = activeRatingBookingId === req.id;
                  const selectedRating = selectedRatings[req.id] || 0;

                  return (
                    <Card key={req.id}><CardContent className="p-4 flex flex-col md:flex-row md:items-start gap-4">
                      {req.cars?.image && <img src={req.cars.image} alt={req.cars?.title} className="w-full md:w-28 h-20 object-cover rounded-lg" />}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800">{req.cars?.title || "Your Car"}</h3>
                        <p className="text-sm text-gray-500">{req.cars?.location}</p>
                        <p className="text-sm text-gray-600 mt-1">{format(new Date(req.start_date), "MMM d")} to {format(new Date(req.end_date), "MMM d, yyyy")}</p>
                        <p className="text-sm font-semibold mt-1">KSh {req.total_price.toLocaleString()}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => req.renter && setRenterModal(req.renter)}
                            className="inline-flex items-center gap-2 rounded px-2 py-1 bg-gray-50 transition hover:bg-gray-100 disabled:cursor-not-allowed"
                            disabled={!req.renter}
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>{req.renter?.full_name || "Unknown"}</span>
                          </button>
                          {req.renter?.phone && (
                            <span className="inline-flex items-center gap-1 rounded bg-gray-50 px-2 py-1">
                              <Phone className="h-3.5 w-3.5" />
                              {req.renter.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full flex-col gap-2 items-start md:w-auto md:items-end">
                        <Badge className={statusColor[req.status] || ""}>{req.status}</Badge>
                        {req.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateRequest(req.id, "confirmed")}>Confirm</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => updateRequest(req.id, "cancelled")}>Decline</Button>
                          </div>
                        )}
                        {req.status === "confirmed" && (
                          <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => updateRequest(req.id, "completed")}>
                            Mark Complete
                          </Button>
                        )}
                        {req.status === "completed" && !ratedBookings.has(req.id) && !showingRatingForm && (
                          <Button size="sm" className="bg-kenya-red hover:bg-kenya-red/90 text-white" onClick={() => setActiveRatingBookingId(req.id)}>
                            Rate Renter
                          </Button>
                        )}
                        {req.status === "completed" && ratedBookings.has(req.id) && (
                          <span className="text-xs font-medium text-green-600">Renter rated</span>
                        )}
                        {showingRatingForm && (
                          <div className="w-full rounded-xl border bg-white p-4 shadow-sm md:w-80">
                            <p className="text-sm font-semibold text-gray-900">Rate this renter</p>
                            <div className="mt-3 flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => {
                                    setSelectedRatings((prev) => ({ ...prev, [req.id]: star }));
                                    setRatingErrors((prev) => ({ ...prev, [req.id]: "" }));
                                  }}
                                  className="rounded p-1"
                                >
                                  <Star className={`h-5 w-5 ${star <= selectedRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                </button>
                              ))}
                            </div>
                            <Textarea
                              className="mt-3"
                              placeholder="Share a quick note about this renter"
                              value={ratingComments[req.id] || ""}
                              onChange={(e) => setRatingComments((prev) => ({ ...prev, [req.id]: e.target.value }))}
                            />
                            {ratingErrors[req.id] && <p className="mt-2 text-sm text-red-500">{ratingErrors[req.id]}</p>}
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                className="bg-kenya-red hover:bg-kenya-red/90 text-white"
                                disabled={submittingRatingId === req.id}
                                onClick={() => submitRenterRating(req)}
                              >
                                {submittingRatingId === req.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setActiveRatingBookingId(null)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent></Card>
                  );
                })}
              </div>
            )
          )}

          {activeTab === "cars" && (
            myCars.length === 0 ? (
              <Card className="text-center py-12"><CardContent>
                <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">You have not listed any cars yet.</p>
                <Link to="/list-your-car"><Button className="bg-kenya-red hover:bg-kenya-red/90">List Your Car</Button></Link>
              </CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCars.map((car) => (
                  <Card key={car.id}><CardContent className="p-4">
                    <div className="flex gap-4">
                      {car.image && <img src={car.image} alt={car.title} className="w-24 h-20 object-cover rounded-lg" />}
                      <div className="flex-1">
                        <h3 className="font-bold">{car.title}</h3>
                        <p className="text-sm text-gray-500">{car.location} - KSh {car.price.toLocaleString()}/day</p>
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
                  </CardContent></Card>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {renterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setRenterModal(null)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4">
              {renterModal.avatar_url ? (
                <img src={renterModal.avatar_url} alt={renterModal.full_name || "Renter"} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-xl font-semibold text-kenya-red">
                  {getInitials(renterModal.full_name)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{renterModal.full_name || "Unknown Renter"}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  {renterModal.phone || "Phone not provided"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Member since {renterModal.created_at ? format(new Date(renterModal.created_at), "MMMM yyyy") : "Unknown"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-yellow-50 p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">Renter rating</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {renterModal.avg_rating ? `${renterModal.avg_rating}/5` : "No ratings yet"}
                </p>
                <p className="text-sm text-gray-500">
                  {renterModal.rating_count || 0} rating{(renterModal.rating_count || 0) === 1 ? "" : "s"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Shield className="h-4 w-4 text-kenya-red" />
                  <span className="font-medium">Driver license</span>
                </div>
                {renterModal.driver_license_url ? (
                  <div className="mt-3 space-y-3">
                    <img src={renterModal.driver_license_url} alt="Driver license" className="h-28 w-full rounded-lg object-cover" />
                    <a
                      href={renterModal.driver_license_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-medium text-kenya-red hover:underline"
                    >
                      View License
                    </a>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">No license uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;
