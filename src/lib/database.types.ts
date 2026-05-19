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
          id_number: string | null;
          role: 'renter' | 'owner' | 'admin';
          is_active: boolean | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          driver_license_url?: string | null;
          id_number?: string | null;
          role?: 'renter' | 'owner' | 'admin';
          is_active?: boolean | null;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          driver_license_url?: string | null;
          id_number?: string | null;
          role?: 'renter' | 'owner' | 'admin';
          is_active?: boolean | null;
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
          payment_status: string | null;
          payment_method: string | null;
          commission_rate: number | null;
          commission_amount: number | null;
          owner_payout_amount: number | null;
          mpesa_checkout_request_id: string | null;
          pesapal_order_tracking_id: string | null;
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
          payment_status?: string | null;
          payment_method?: string | null;
          commission_rate?: number | null;
          commission_amount?: number | null;
          owner_payout_amount?: number | null;
          mpesa_checkout_request_id?: string | null;
          pesapal_order_tracking_id?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: string | null;
          payment_method?: string | null;
          commission_rate?: number | null;
          commission_amount?: number | null;
          owner_payout_amount?: number | null;
          mpesa_checkout_request_id?: string | null;
          pesapal_order_tracking_id?: string | null;
        };
      };
      platform_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string | null;
        };
        Insert: {
          key: string;
          value: string;
          updated_at?: string | null;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string | null;
        };
      };
      payouts: {
        Row: {
          id: string;
          booking_id: string | null;
          owner_id: string | null;
          total_amount: number;
          commission_amount: number;
          payout_amount: number;
          status: string | null;
          payment_method: string | null;
          created_at: string | null;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          owner_id?: string | null;
          total_amount: number;
          commission_amount: number;
          payout_amount: number;
          status?: string | null;
          payment_method?: string | null;
          created_at?: string | null;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          owner_id?: string | null;
          total_amount?: number;
          commission_amount?: number;
          payout_amount?: number;
          status?: string | null;
          payment_method?: string | null;
          created_at?: string | null;
          paid_at?: string | null;
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
