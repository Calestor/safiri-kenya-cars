import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface BookingCar {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  year: number;
  ownerName: string;
}

interface BookingWidgetProps {
  car: BookingCar;
}

const BookingWidget = ({ car }: BookingWidgetProps) => {
  const { user } = useAuth();
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [booked, setBooked] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const calculateDays = () => {
    if (pickupDate && returnDate) {
      const days = differenceInDays(returnDate, pickupDate);
      return Math.max(1, days);
    }
    return 0;
  };

  const days = calculateDays();
  const subtotal = car.price * days;
  const insurance = days > 0 ? Math.ceil(subtotal * 0.1) : 0;
  const tax = days > 0 ? Math.ceil(subtotal * 0.16) : 0;
  const total = subtotal + insurance + tax;

  const handleBooking = () => {
    if (!pickupDate || !returnDate) return;
    setBookingError("");
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!pickupDate || !returnDate) {
      return;
    }

    setConfirming(true);
    setBookingError("");

    const { error } = await supabase.from("bookings").insert({
      car_id: car.id,
      renter_id: user.id,
      start_date: format(pickupDate, "yyyy-MM-dd"),
      end_date: format(returnDate, "yyyy-MM-dd"),
      total_price: total,
      status: "pending",
    });

    setConfirming(false);

    if (error) {
      setBookingError(error.message);
      return;
    }

    setShowConfirm(false);
    setBooked(true);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6">
        <div className="border-b pb-4">
          <div className="text-3xl font-bold text-kenya-red mb-1">
            KSh {car.price.toLocaleString()}
          </div>
          <p className="text-gray-600">per day</p>
        </div>

        {booked ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-bold text-gray-800">Booking Confirmed!</h3>
            <p className="text-gray-600 text-sm">
              {car.ownerName} will contact you shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-left space-y-1">
              <p><span className="font-medium">Car:</span> {car.title}</p>
              <p><span className="font-medium">Pickup:</span> {format(pickupDate!, "PPP")}</p>
              <p><span className="font-medium">Return:</span> {format(returnDate!, "PPP")}</p>
              <p><span className="font-medium">Total:</span> KSh {total.toLocaleString()}</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setBooked(false);
                setPickupDate(undefined);
                setReturnDate(undefined);
              }}
            >
              Make Another Booking
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pick-up Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={pickupDate}
                      onSelect={setPickupDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Return Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={returnDate}
                      onSelect={setReturnDate}
                      disabled={(date) =>
                        (pickupDate ? date <= pickupDate : false) || date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {days > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{days}</span> day
                  {days > 1 ? "s" : ""} rental
                </p>
              </div>
            )}

            {days > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KSh {car.price.toLocaleString()} × {days} day{days > 1 ? "s" : ""}</span>
                  <span className="font-semibold">KSh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Insurance (10%)</span>
                  <span className="font-semibold">KSh {insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">VAT (16%)</span>
                  <span className="font-semibold">KSh {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 pt-3">
                  <span>Total</span>
                  <span className="text-kenya-red">KSh {total.toLocaleString()}</span>
                </div>
              </div>
            )}

            {(!pickupDate || !returnDate) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">Select dates to see pricing breakdown</p>
              </div>
            )}

            {user ? (
              <Button
                onClick={handleBooking}
                disabled={!pickupDate || !returnDate}
                className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-6 text-lg font-semibold"
              >
                Book Now
              </Button>
            ) : (
              <Button
                onClick={() => {
                  window.location.href = "/login";
                }}
                className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-6 text-lg font-semibold"
              >
                Login to Book
              </Button>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Free cancellation up to 24 hours before pickup</p>
              <p>✓ Mileage: Unlimited</p>
              <p>✓ Driver's license required</p>
              <p>✓ Contact: {car.ownerName}</p>
            </div>

            <Button variant="outline" className="w-full">Message Owner</Button>
          </>
        )}
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <img src={car.image} alt={car.title} className="w-20 h-16 object-cover rounded-lg" />
              <div>
                <h3 className="font-bold text-gray-800">{car.title}</h3>
                <p className="text-sm text-gray-500">{car.location} · {car.year}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pick-up</span>
                <span className="font-medium">{pickupDate && format(pickupDate, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return</span>
                <span className="font-medium">{returnDate && format(returnDate, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium">{days} day{days > 1 ? "s" : ""}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Insurance (10%)</span>
                <span className="font-medium">KSh {insurance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (16%)</span>
                <span className="font-medium">KSh {tax.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-kenya-red">KSh {total.toLocaleString()}</span>
              </div>
            </div>

            {bookingError && <p className="text-sm text-red-500">{bookingError}</p>}

            <p className="text-xs text-gray-500 text-center">
              By confirming, you agree to our Terms of Service and cancellation policy.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Go Back
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirming}
              className="bg-kenya-red hover:bg-kenya-red/90 text-white flex-1"
            >
              {confirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingWidget;
