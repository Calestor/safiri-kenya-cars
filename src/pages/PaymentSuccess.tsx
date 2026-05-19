import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type PaymentBooking = Database["public"]["Tables"]["bookings"]["Row"] & {
  cars?: {
    title: string | null;
    location: string | null;
  } | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<PaymentBooking | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!user || !bookingId) {
      setPageLoading(false);
      return;
    }

    const loadBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, cars(title, location)")
        .eq("id", bookingId)
        .eq("renter_id", user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Unable to load booking",
          description: error.message,
          variant: "destructive",
        });
      }

      setBooking((data as unknown as PaymentBooking | null) ?? null);
      setPageLoading(false);
    };

    void loadBooking();
  }, [bookingId, toast, user]);

  if (loading || pageLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-kenya-red" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border-green-100 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl">Payment Confirmed! 🎉</CardTitle>
              <CardDescription>Your booking payment has been received successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {booking ? (
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-lg font-semibold text-slate-900">{booking.cars?.title || "Safiri Kenya booking"}</p>
                  <p className="mt-1 text-sm text-slate-500">{booking.cars?.location || "Kenya"}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-sm text-slate-500">Pickup</p>
                      <p className="font-medium text-slate-900">{format(new Date(booking.start_date), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Return</p>
                      <p className="font-medium text-slate-900">{format(new Date(booking.end_date), "MMM d, yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Amount Paid</p>
                      <p className="font-medium text-slate-900">{formatCurrency(booking.total_price)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  Your payment was confirmed. The booking summary will appear here once the booking record is available.
                </div>
              )}

              <div className="flex justify-center">
                <Button className="bg-kenya-red hover:bg-kenya-red/90" onClick={() => navigate("/dashboard")}>
                  Go to My Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
