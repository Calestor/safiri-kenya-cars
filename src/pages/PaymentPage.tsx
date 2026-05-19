import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  Smartphone,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

const EDGE_FUNCTIONS_BASE = "https://ggovsxhmuhcgizagewtu.supabase.co/functions/v1";

type PaymentBooking = Database["public"]["Tables"]["bookings"]["Row"] & {
  cars?: {
    title: string | null;
    image: string | null;
    location: string | null;
  } | null;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);

const paymentStatusBadge = (paymentStatus?: string | null) => {
  if (!paymentStatus || paymentStatus === "unpaid") {
    return { label: "Payment Pending", className: "border-transparent bg-orange-100 text-orange-700" };
  }

  if (paymentStatus === "paid") {
    return { label: "Paid ✓", className: "border-transparent bg-green-100 text-green-700" };
  }

  return { label: "Payment Failed", className: "border-transparent bg-red-100 text-red-700" };
};

const getErrorMessage = async (response: Response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json().catch(() => null);
    return data?.error || data?.message || "Payment gateway not configured yet. Deploy the Supabase Edge Functions to enable live payments.";
  }

  const text = await response.text().catch(() => "");
  return text || "Payment gateway not configured yet. Deploy the Supabase Edge Functions to enable live payments.";
};

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, profile, loading } = useAuth();

  const [booking, setBooking] = useState<PaymentBooking | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<"mpesa" | "card">("mpesa");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [initiatingMpesa, setInitiatingMpesa] = useState(false);
  const [initiatingCard, setInitiatingCard] = useState(false);
  const [mpesaRequested, setMpesaRequested] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (profile?.phone) {
      setPhone((current) => current || profile.phone || "");
    }
  }, [profile?.phone]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, navigate, user]);

  const loadBooking = useCallback(async () => {
    if (!bookingId || !user) {
      setPageLoading(false);
      return;
    }

    setPageLoading(true);

    const { data, error } = await supabase
      .from("bookings")
      .select("*, cars(title, image, location)")
      .eq("id", bookingId)
      .eq("renter_id", user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: "Unable to load booking",
        description: error.message,
        variant: "destructive",
      });
      setBooking(null);
      setPageLoading(false);
      return;
    }

    setBooking((data as unknown as PaymentBooking | null) ?? null);
    setPageLoading(false);
  }, [bookingId, toast, user]);

  useEffect(() => {
    if (!user || !bookingId) return;
    void loadBooking();
  }, [bookingId, loadBooking, user]);

  const refreshPaymentStatus = useCallback(async () => {
    if (!bookingId || !user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*, cars(title, image, location)")
      .eq("id", bookingId)
      .eq("renter_id", user.id)
      .maybeSingle();

    if (error) {
      setStatusError(error.message);
      setIsPolling(false);
      return;
    }

    const nextBooking = (data as unknown as PaymentBooking | null) ?? null;
    setBooking(nextBooking);

    if (nextBooking?.payment_status === "paid") {
      setIsPolling(false);
      navigate(`/payment/success?booking_id=${nextBooking.id}`);
      return;
    }

    if (nextBooking?.payment_status === "failed") {
      setIsPolling(false);
      setStatusError("The payment request was declined or timed out. Please try again.");
    }
  }, [bookingId, navigate, user]);

  useEffect(() => {
    if (!isPolling) return;

    const timer = window.setInterval(() => {
      void refreshPaymentStatus();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [isPolling, refreshPaymentStatus]);

  const bookingState = useMemo(() => paymentStatusBadge(booking?.payment_status), [booking?.payment_status]);

  const handleMpesaPayment = async () => {
    if (!booking || !session?.access_token) {
      navigate("/login");
      return;
    }

    setInitiatingMpesa(true);
    setGatewayError(null);
    setStatusError(null);

    try {
      const response = await fetch(`${EDGE_FUNCTIONS_BASE}/initiate-mpesa-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          phone,
          amount: booking.total_price,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await response.json().catch(() => null);
      setMpesaRequested(true);
      setIsPolling(false);
      toast({
        title: "M-Pesa request sent",
        description: "Check your phone and enter your M-Pesa PIN to complete payment.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment gateway not configured yet. Deploy the Supabase Edge Functions to enable live payments.";
      setGatewayError(message);
      toast({
        title: "Unable to start M-Pesa payment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setInitiatingMpesa(false);
    }
  };

  const handleCardPayment = async () => {
    if (!booking || !session?.access_token || !user) {
      navigate("/login");
      return;
    }

    setInitiatingCard(true);
    setGatewayError(null);

    try {
      const fullName = profile?.full_name || user.user_metadata?.full_name || user.email || "Safiri Kenya Renter";
      const [firstName, ...rest] = fullName.split(" ").filter(Boolean);
      const lastName = rest.join(" ") || "Customer";

      const response = await fetch(`${EDGE_FUNCTIONS_BASE}/initiate-pesapal-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          email: user.email,
          phone,
          first_name: firstName || "Safiri",
          last_name: lastName,
          amount: booking.total_price,
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data = await response.json();
      if (!data?.redirect_url) {
        throw new Error("Pesapal did not return a redirect URL.");
      }

      window.location.assign(data.redirect_url as string);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Payment gateway not configured yet. Deploy the Supabase Edge Functions to enable live payments.";
      setGatewayError(message);
      toast({
        title: "Unable to start card payment",
        description: message,
        variant: "destructive",
      });
    } finally {
      setInitiatingCard(false);
    }
  };

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

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <Card className="border-red-100 shadow-sm">
              <CardHeader>
                <CardTitle>Booking not found</CardTitle>
                <CardDescription>
                  We could not find that booking, or it does not belong to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/dashboard")} className="bg-kenya-red hover:bg-kenya-red/90">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isAlreadyPaid = booking.payment_status === "paid";
  const isConfirmed = booking.status === "confirmed";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-2xl">Complete Your Payment</CardTitle>
                    <CardDescription>Choose your preferred payment method for this confirmed booking.</CardDescription>
                  </div>
                  <Badge className={bookingState.className}>{bookingState.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isConfirmed && !isAlreadyPaid ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    Payment becomes available once the owner confirms your booking.
                  </div>
                ) : null}

                {gatewayError ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-semibold">Payment gateway not configured</p>
                        <p className="mt-1">{gatewayError}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {statusError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{statusError}</div>
                ) : null}

                {isAlreadyPaid ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">Payment already confirmed</p>
                        <p className="text-sm">You can review the receipt summary on the success page.</p>
                      </div>
                    </div>
                    <Button
                      className="mt-4 bg-green-600 text-white hover:bg-green-700"
                      onClick={() => navigate(`/payment/success?booking_id=${booking.id}`)}
                    >
                      View Payment Confirmation
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("mpesa")}
                        className={`rounded-2xl border p-5 text-left transition ${selectedMethod === "mpesa" ? "border-green-500 bg-green-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-green-100 p-3 text-green-700">
                            <Smartphone className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-slate-900">Pay with M-Pesa</p>
                            <p className="text-sm text-slate-500">Instant STK Push to your phone</p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod("card")}
                        className={`rounded-2xl border p-5 text-left transition ${selectedMethod === "card" ? "border-blue-500 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-100 p-3 text-blue-700">
                            <CreditCard className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-slate-900">Pay with Card</p>
                            <p className="text-sm text-slate-500">Secure Pesapal hosted checkout</p>
                          </div>
                        </div>
                      </button>
                    </div>

                    {selectedMethod === "mpesa" ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">M-Pesa phone number</label>
                            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712345678" />
                          </div>
                          <Button
                            className="w-full bg-green-600 text-white hover:bg-green-700"
                            disabled={!isConfirmed || initiatingMpesa || !phone.trim()}
                            onClick={handleMpesaPayment}
                          >
                            {initiatingMpesa ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Smartphone className="mr-2 h-4 w-4" />}
                            Send Payment Request
                          </Button>

                          {mpesaRequested ? (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                              <p className="font-medium text-green-700">✅ Check your phone! Enter your M-Pesa PIN to complete payment.</p>
                              <p className="mt-2 text-sm text-green-700/80">Once you finish on your phone, use the button below to keep checking the booking status every 5 seconds.</p>
                              <div className="mt-4 flex flex-wrap gap-3">
                                <Button
                                  variant="outline"
                                  className="border-green-300 text-green-700 hover:bg-green-100"
                                  onClick={() => {
                                    void refreshPaymentStatus();
                                    setIsPolling(true);
                                  }}
                                >
                                  {isPolling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Check Payment Status
                                </Button>
                                {isPolling ? <span className="text-sm text-green-700">Checking every 5 seconds…</span> : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <p className="text-sm text-slate-600">
                          You will be redirected to Pesapal's secure checkout to complete your card payment.
                        </p>
                        <Button
                          className="mt-4 w-full bg-blue-600 text-white hover:bg-blue-700"
                          disabled={!isConfirmed || initiatingCard}
                          onClick={handleCardPayment}
                        >
                          {initiatingCard ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                          Proceed to Pesapal Checkout
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Only confirmed bookings can be paid from this page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.cars?.image ? (
                  <img src={booking.cars.image} alt={booking.cars.title || "Car"} className="h-52 w-full rounded-2xl object-cover" />
                ) : null}
                <div>
                  <p className="text-sm text-slate-500">Car</p>
                  <p className="text-xl font-semibold text-slate-900">{booking.cars?.title || "Safiri Kenya booking"}</p>
                  <p className="text-sm text-slate-500">{booking.cars?.location || "Kenya"}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Pickup</p>
                    <p className="font-medium text-slate-900">{format(new Date(booking.start_date), "MMM d, yyyy")}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Return</p>
                    <p className="font-medium text-slate-900">{format(new Date(booking.end_date), "MMM d, yyyy")}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-5 text-white">
                  <p className="text-sm text-slate-300">Total amount</p>
                  <p className="mt-2 text-3xl font-bold">{formatCurrency(booking.total_price)}</p>
                  {booking.payment_method ? (
                    <p className="mt-2 text-sm text-slate-300">Payment method: {booking.payment_method}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentPage;
