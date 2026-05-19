export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          driver_license_url: string | null;
          role: 'renter' | 'owner' | 'admin';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          driver_license_url?: string | null;
          role?: 'renter' | 'owner' | 'admin';
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          driver_license_url?: string | null;
          role?: 'renter' | 'owner' | 'admin';
        };
      };
      cars: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          brand: string;
          model: string;
          year: number;
          type: 'SUV' | 'Sedan' | 'Hatchback' | 'Minivan';
          image: string | null;
          images: string[];
          price: number;
          location: string;
          seats: number;
          transmission: 'Automatic' | 'Manual';
          fuel_type: 'Petrol' | 'Diesel' | 'Hybrid';
          mileage: number;
          fuel_efficiency: string | null;
          features: string[];
          description: string | null;
          is_available: boolean;
          rating: number;
          review_count: number;
          owner_name: string | null;
          owner_rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          brand: string;
          model: string;
          year: number;
          type: 'SUV' | 'Sedan' | 'Hatchback' | 'Minivan';
          image?: string | null;
          images?: string[];
          price: number;
          location: string;
          seats: number;
          transmission: 'Automatic' | 'Manual';
          fuel_type: 'Petrol' | 'Diesel' | 'Hybrid';
          mileage?: number;
          fuel_efficiency?: string | null;
          features?: string[];
          description?: string | null;
          is_available?: boolean;
          rating?: number;
          review_count?: number;
          owner_name?: string | null;
          owner_rating?: number;
        };
        Update: {
          title?: string;
          brand?: string;
          model?: string;
          year?: number;
          type?: 'SUV' | 'Sedan' | 'Hatchback' | 'Minivan';
          image?: string | null;
          images?: string[];
          price?: number;
          location?: string;
          seats?: number;
          transmission?: 'Automatic' | 'Manual';
          fuel_type?: 'Petrol' | 'Diesel' | 'Hybrid';
          mileage?: number;
          fuel_efficiency?: string | null;
          features?: string[];
          description?: string | null;
          is_available?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          car_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          renter_id: string;
          start_date: string;
          end_date: string;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
        };
      };
      reviews: {
        Row: {
          id: string;
          car_id: string;
          reviewer_id: string;
          booking_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          car_id: string;
          reviewer_id: string;
          booking_id?: string | null;
          rating: number;
          comment?: string | null;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
      renter_ratings: {
        Row: {
          id: string;
          booking_id: string;
          renter_id: string;
          owner_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          renter_id: string;
          owner_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
        };
      };
    };
  };
}
