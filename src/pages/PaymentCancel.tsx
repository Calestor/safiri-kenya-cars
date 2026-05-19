import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border-red-100 shadow-sm">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
              <CardDescription>Your payment did not complete. You can try again whenever you are ready.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                className="w-full bg-kenya-red hover:bg-kenya-red/90 sm:w-auto"
                onClick={() => navigate(bookingId ? `/payment/${bookingId}` : "/dashboard")}
              >
                Try Again
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentCancel;
