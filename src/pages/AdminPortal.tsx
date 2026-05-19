import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Car,
  DollarSign,
  ExternalLink,
  Loader2,
  LogOut,
  Shield,
  UserX,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] & { email?: string | null };
type CarRow = Database["public"]["Tables"]["cars"]["Row"] & {
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
};
type BookingStatus = Database["public"]["Tables"]["bookings"]["Row"]["status"] | "declined";
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"] & {
  status: BookingStatus;
  cars?: {
    title: string | null;
    brand: string | null;
  } | null;
  renterProfile?: ProfileRow | null;
};
type PayoutRow = Database["public"]["Tables"]["payouts"]["Row"];

type LicensePreview = {
  name: string;
  url: string;
};

const roleBadgeClass: Record<ProfileRow["role"], string> = {
  admin: "border-transparent bg-purple-100 text-purple-700",
  owner: "border-transparent bg-blue-100 text-blue-700",
  renter: "border-transparent bg-slate-100 text-slate-700",
};

const bookingStatusBadgeClass: Record<BookingStatus | "cancelled", string> = {
  pending: "border-transparent bg-yellow-100 text-yellow-800",
  confirmed: "border-transparent bg-green-100 text-green-800",
  declined: "border-transparent bg-red-100 text-red-700",
  cancelled: "border-transparent bg-red-100 text-red-700",
  completed: "border-transparent bg-blue-100 text-blue-700",
};

const paymentStatusBadgeClass = (status?: string | null) => {
  if (!status || status === "unpaid") return "border-transparent bg-orange-100 text-orange-700";
  if (status === "paid") return "border-transparent bg-green-100 text-green-700";
  return "border-transparent bg-red-100 text-red-700";
};

const payoutStatusBadgeClass = (status?: string | null) =>
  status === "paid"
    ? "border-transparent bg-green-100 text-green-700"
    : "border-transparent bg-orange-100 text-orange-700";

const availabilityBadgeClass = (available: boolean) =>
  available
    ? "border-transparent bg-green-100 text-green-700"
    : "border-transparent bg-red-100 text-red-700";

const activeBadgeClass = (isActive: boolean | null) =>
  isActive === false
    ? "border-transparent bg-red-100 text-red-700"
    : "border-transparent bg-green-100 text-green-700";

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatDateRange = (start?: string | null, end?: string | null) => {
  if (!start || !end) return "—";
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);

const truncateId = (value: string) => `${value.slice(0, 8)}...`;

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SK";

const AdminPortal = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [cars, setCars] = useState<CarRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRow[]>([]);
  const [payoutsAvailable, setPayoutsAvailable] = useState(true);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [licensePreview, setLicensePreview] = useState<LicensePreview | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [profilesRes, carsRes, bookingsRes, payoutsRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("cars").select("*, profiles!owner_id(full_name, phone)").order("created_at", { ascending: false }),
        supabase.from("bookings").select("*, cars(title, brand)").order("created_at", { ascending: false }),
        supabase.from("payouts").select("*").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (carsRes.error) throw carsRes.error;
      if (bookingsRes.error) throw bookingsRes.error;

      const profileRows = (profilesRes.data ?? []) as ProfileRow[];
      const carRows = (carsRes.data ?? []) as unknown as CarRow[];
      const bookingRows = (bookingsRes.data ?? []) as unknown as BookingRow[];
      const profileMap = new Map(profileRows.map((item) => [item.id, item]));

      setProfiles(profileRows);
      setCars(carRows);
      setBookings(
        bookingRows.map((booking) => ({
          ...booking,
          renterProfile: profileMap.get(booking.renter_id) ?? null,
        })),
      );

      if (payoutsRes.error) {
        setPayoutsAvailable(false);
        setPayouts([]);
      } else {
        setPayoutsAvailable(true);
        setPayouts((payoutsRes.data ?? []) as PayoutRow[]);
      }
    } catch (error: any) {
      toast({
        title: "Failed to load admin data",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const toggleAccountStatus = async (userId: string, nextValue: boolean) => {
    setPendingAction(`profile-${userId}`);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_active: nextValue })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: `Account ${nextValue ? "enabled" : "disabled"}`,
        description: "User status updated successfully.",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Unable to update account",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const toggleCarAvailability = async (carId: string, nextValue: boolean) => {
    setPendingAction(`car-${carId}`);

    try {
      const { error } = await supabase
        .from("cars")
        .update({ is_available: nextValue })
        .eq("id", carId);

      if (error) throw error;

      toast({
        title: `Car ${nextValue ? "activated" : "deactivated"}`,
        description: "Car availability updated successfully.",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Unable to update car",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const markPayoutAsPaid = async (payoutId: string) => {
    setPendingAction(`payout-${payoutId}`);

    try {
      const { error } = await supabase
        .from("payouts")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", payoutId);

      if (error) throw error;

      toast({
        title: "Payout marked as paid",
        description: "Owner payout status updated successfully.",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Unable to update payout",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const carMap = useMemo(() => new Map(cars.map((car) => [car.id, car])), [cars]);
  const profileMap = useMemo(() => new Map(profiles.map((item) => [item.id, item])), [profiles]);
  const bookingMap = useMemo(() => new Map(bookings.map((booking) => [booking.id, booking])), [bookings]);

  const payoutRows = useMemo(() => payouts.map((payout) => {
    const booking = payout.booking_id ? bookingMap.get(payout.booking_id) ?? null : null;
    const owner = payout.owner_id ? profileMap.get(payout.owner_id) ?? null : null;
    const car = booking?.car_id ? carMap.get(booking.car_id) ?? null : null;

    return { payout, booking, owner, car };
  }), [bookingMap, carMap, payouts, profileMap]);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((booking) => ["confirmed", "pending"].includes(booking.status)).length;
    const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
    const disabledAccounts = profiles.filter((item) => item.is_active === false).length;
    const totalCommission = bookings
      .filter((booking) => booking.payment_status === "paid")
      .reduce((sum, booking) => sum + Number(booking.commission_amount || 0), 0);
    const pendingPayouts = payouts.filter((payout) => payout.status !== "paid").length;

    return [
      {
        title: "Total Users",
        value: profiles.length,
        icon: Users,
        subtitle: `${disabledAccounts} disabled accounts`,
      },
      {
        title: "Total Cars",
        value: cars.length,
        icon: Car,
        subtitle: `${cars.filter((item) => item.is_available).length} active listings`,
      },
      {
        title: "Total Bookings",
        value: bookings.length,
        icon: Calendar,
        subtitle: `${activeBookings} active bookings`,
      },
      {
        title: "Pending Bookings",
        value: pendingBookings,
        icon: AlertCircle,
        subtitle: "Awaiting admin attention",
      },
      {
        title: "Total Commission Earned",
        value: formatCurrency(totalCommission),
        icon: DollarSign,
        subtitle: "From successfully paid bookings",
      },
      {
        title: "Pending Payouts",
        value: pendingPayouts,
        icon: Shield,
        subtitle: payoutsAvailable ? "Awaiting owner settlement" : "Run payment migration first",
      },
      {
        title: "Active Bookings",
        value: activeBookings,
        icon: Shield,
        subtitle: "Confirmed or pending",
      },
      {
        title: "Disabled Accounts",
        value: disabledAccounts,
        icon: UserX,
        subtitle: "Currently blocked users",
      },
    ];
  }, [bookings, cars, payouts, payoutsAvailable, profiles]);

  const adminName = profile?.full_name || "Super Admin";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <header className="border-b border-slate-800 bg-slate-900 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Safiri Kenya Admin</p>
              <h1 className="text-xl font-semibold">Super Admin Portal</h1>
            </div>
          </div>
        </header>
        <div className="flex h-[calc(100vh-81px)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-kenya-red" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Safiri Kenya Admin</p>
            <h1 className="text-2xl font-semibold">Super Admin Portal</h1>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="text-sm text-slate-300">
              Signed in as <span className="font-medium text-white">{adminName}</span>
            </div>
            <Button asChild variant="ghost" className="text-white hover:bg-slate-800 hover:text-white">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2 gap-2 bg-slate-200 p-1 md:grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="cars">Cars</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <Card key={stat.title} className="border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                      <CardTitle className="text-base font-medium text-slate-700">{stat.title}</CardTitle>
                      <div className="rounded-full bg-kenya-red/10 p-2 text-kenya-red">
                        <Icon className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                      <p className="mt-1 text-sm text-slate-500">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      profiles.map((item) => {
                        const actionKey = `profile-${item.id}`;
                        const isUpdating = pendingAction === actionKey;
                        const isAdmin = item.role === "admin";
                        const emailOrId = item.email || truncateId(item.id);

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={item.avatar_url ?? undefined} />
                                  <AvatarFallback className="bg-kenya-red text-xs text-white">
                                    {getInitials(item.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-slate-900">{item.full_name || "Unnamed user"}</div>
                                  <div className="text-xs text-slate-500">{emailOrId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.phone || "—"}</TableCell>
                            <TableCell>{item.id_number || "—"}</TableCell>
                            <TableCell>
                              <Badge className={cn("capitalize", roleBadgeClass[item.role])}>{item.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={activeBadgeClass(item.is_active)}>
                                {item.is_active === false ? "Disabled" : "Active"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(item.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!item.driver_license_url}
                                  onClick={() =>
                                    item.driver_license_url &&
                                    setLicensePreview({
                                      name: item.full_name || "Driver license",
                                      url: item.driver_license_url,
                                    })
                                  }
                                >
                                  View License
                                </Button>
                                <Button
                                  size="sm"
                                  variant={item.is_active === false ? "default" : "destructive"}
                                  disabled={isAdmin || isUpdating}
                                  onClick={() => toggleAccountStatus(item.id, item.is_active === false)}
                                  className={item.is_active === false ? "bg-slate-900 text-white hover:bg-slate-800" : undefined}
                                >
                                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                  {isAdmin ? "Protected" : item.is_active === false ? "Enable Account" : "Disable Account"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cars">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Car Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Price / Day</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cars.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-slate-500">
                          No cars found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cars.map((car) => {
                        const actionKey = `car-${car.id}`;
                        const isUpdating = pendingAction === actionKey;

                        return (
                          <TableRow key={car.id}>
                            <TableCell>
                              <div className="flex min-w-[240px] items-center gap-3">
                                <div className="h-14 w-20 overflow-hidden rounded-md bg-slate-200">
                                  {car.image ? (
                                    <img src={car.image} alt={car.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-slate-500">
                                      <Car className="h-5 w-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">{car.title}</div>
                                  <div className="text-xs text-slate-500">
                                    {car.brand} {car.model} • {car.year}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">{car.profiles?.full_name || "Unknown owner"}</div>
                              <div className="text-xs text-slate-500">{car.profiles?.phone || truncateId(car.owner_id)}</div>
                            </TableCell>
                            <TableCell>{formatCurrency(car.price)}</TableCell>
                            <TableCell>{car.location}</TableCell>
                            <TableCell>
                              <Badge className={availabilityBadgeClass(car.is_available)}>
                                {car.is_available ? "Available" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(car.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex justify-end">
                                <Button
                                  size="sm"
                                  variant={car.is_available ? "destructive" : "default"}
                                  disabled={isUpdating}
                                  onClick={() => toggleCarAvailability(car.id, !car.is_available)}
                                  className={!car.is_available ? "bg-slate-900 text-white hover:bg-slate-800" : undefined}
                                >
                                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                  {car.is_available ? "Deactivate" : "Activate"}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Renter</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => {
                        const statusClass =
                          bookingStatusBadgeClass[booking.status] ?? bookingStatusBadgeClass.cancelled;

                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium text-slate-900">{truncateId(booking.id)}</TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">{booking.cars?.title || "Unknown car"}</div>
                              <div className="text-xs text-slate-500">{booking.cars?.brand || "—"}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-slate-900">
                                {booking.renterProfile?.full_name || "Unknown renter"}
                              </div>
                              <div className="text-xs text-slate-500">
                                {booking.renterProfile?.phone || truncateId(booking.renter_id)}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(booking.start_date)}</TableCell>
                            <TableCell>{formatDate(booking.end_date)}</TableCell>
                            <TableCell>{formatCurrency(booking.total_price)}</TableCell>
                            <TableCell>
                              <Badge className={cn("capitalize", statusClass)}>{booking.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Badge className={paymentStatusBadgeClass(booking.payment_status)}>
                                  {booking.payment_status || "unpaid"}
                                </Badge>
                                {booking.payment_method ? (
                                  <div className="text-xs uppercase tracking-wide text-slate-500">{booking.payment_method}</div>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Owner Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {!payoutsAvailable ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    Run the payment migration before using payout management. Once the <code>payouts</code> table exists, records will appear here automatically.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner</TableHead>
                        <TableHead>Car</TableHead>
                        <TableHead>Booking Dates</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Owner Payout</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payoutRows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-8 text-center text-slate-500">
                            No payouts recorded yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        payoutRows.map(({ payout, booking, owner, car }) => {
                          const actionKey = `payout-${payout.id}`;
                          const isUpdating = pendingAction === actionKey;

                          return (
                            <TableRow key={payout.id}>
                              <TableCell>
                                <div className="font-medium text-slate-900">{owner?.full_name || "Unknown owner"}</div>
                                <div className="text-xs text-slate-500">{owner?.phone || "Phone unavailable"}</div>
                              </TableCell>
                              <TableCell>{car?.title || booking?.cars?.title || "Unknown car"}</TableCell>
                              <TableCell>{formatDateRange(booking?.start_date, booking?.end_date)}</TableCell>
                              <TableCell>{formatCurrency(Number(payout.total_amount || 0))}</TableCell>
                              <TableCell>{formatCurrency(Number(payout.commission_amount || 0))}</TableCell>
                              <TableCell>{formatCurrency(Number(payout.payout_amount || 0))}</TableCell>
                              <TableCell>
                                <Badge className={payoutStatusBadgeClass(payout.status)}>{payout.status || "pending"}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end">
                                  <Button
                                    size="sm"
                                    disabled={payout.status === "paid" || isUpdating}
                                    onClick={() => markPayoutAsPaid(payout.id)}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                  >
                                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {payout.status === "paid" ? "Paid" : "Mark as Paid"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={!!licensePreview} onOpenChange={(open) => !open && setLicensePreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{licensePreview?.name || "Driver license"}</DialogTitle>
            <DialogDescription>Review the uploaded driver license document.</DialogDescription>
          </DialogHeader>

          {licensePreview?.url ? (
            <div className="space-y-4">
              <div className="max-h-[70vh] overflow-hidden rounded-md border bg-slate-50">
                <img
                  src={licensePreview.url}
                  alt={`${licensePreview.name} license`}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a href={licensePreview.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in new tab
                </a>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortal;
