import { useState } from "react";
import { Car } from "@/lib/mockCars";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface BookingWidgetProps {
  car: Car;
}

const BookingWidget = ({ car }: BookingWidgetProps) => {
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);

  const calculateDays = () => {
    if (pickupDate && returnDate) {
      const days = differenceInDays(returnDate, pickupDate);
      return Math.max(1, days);
    }
    return 0;
  };

  const days = calculateDays();
  const subtotal = car.price * days;
  const insurance = days > 0 ? Math.ceil(subtotal * 0.1) : 0; // 10% insurance
  const tax = days > 0 ? Math.ceil(subtotal * 0.16) : 0; // 16% VAT
  const total = subtotal + insurance + tax;

  const handleBooking = () => {
    if (!pickupDate || !returnDate) {
      alert("Please select pickup and return dates");
      return;
    }
    console.log("Booking:", { car: car.id, pickupDate, returnDate, total });
    alert(`Booking confirmed!\nTotal: KSh ${total.toLocaleString()}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-6">
      {/* Price Header */}
      <div className="border-b pb-4">
        <div className="text-3xl font-bold text-kenya-red mb-1">
          KSh {car.price.toLocaleString()}
        </div>
        <p className="text-gray-600">per day</p>
      </div>

      {/* Dates Selection */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pick-up Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
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
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
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

      {/* Duration */}
      {days > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">{days}</span> day
            {days > 1 ? "s" : ""} rental
          </p>
        </div>
      )}

      {/* Price Breakdown */}
      {days > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              KSh {car.price.toLocaleString()} × {days} day{days > 1 ? "s" : ""}
            </span>
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

      {/* Warning */}
      {!pickupDate || !returnDate ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            Select dates to see pricing breakdown
          </p>
        </div>
      ) : null}

      {/* Booking Button */}
      <Button
        onClick={handleBooking}
        disabled={!pickupDate || !returnDate}
        className="w-full bg-kenya-red hover:bg-kenya-red/90 text-white py-6 text-lg font-semibold"
      >
        Book Now
      </Button>

      {/* Additional Info */}
      <div className="space-y-2 text-sm text-gray-600">
        <p>✓ Free cancellation up to 24 hours before pickup</p>
        <p>✓ Mileage: Unlimited</p>
        <p>✓ Driver's license required</p>
        <p>✓ Contact: {car.ownerName}</p>
      </div>

      {/* Contact Owner */}
      <Button variant="outline" className="w-full">
        Message Owner
      </Button>
    </div>
  );
};

export default BookingWidget;
