import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PESAPAL_BASE_URL = Deno.env.get('PESAPAL_BASE_URL') || 'https://cybqa.pesapal.com/pesapalv3';
const APP_URL = Deno.env.get('APP_URL') || 'http://localhost:8080';
const IPN_URL = 'https://ggovsxhmuhcgizagewtu.supabase.co/functions/v1/pesapal-ipn';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

const getPesapalToken = async () => {
  const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('Pesapal credentials are missing.');
  }

  const response = await fetch(`${PESAPAL_BASE_URL}/api/Auth/RequestToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Unable to authenticate with Pesapal.');
  }

  const data = await response.json();
  return data.token as string;
};

const registerIpn = async (token: string) => {
  const response = await fetch(`${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: IPN_URL,
      ipn_notification_type: 'GET',
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ipn_id) {
    throw new Error(data.error?.message || data.message || 'Unable to register Pesapal IPN URL.');
  }

  return data.ipn_id as string;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) {
      return jsonResponse({ error: 'Missing authorization token' }, 401);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: 'Invalid user session' }, 401);
    }

    const { booking_id, email, phone, first_name, last_name, amount } = await req.json();

    if (!booking_id || !email || !phone || !first_name || !last_name || !amount) {
      return jsonResponse({ error: 'Missing required payment details' }, 400);
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, renter_id, status, payment_status')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return jsonResponse({ error: 'Booking not found' }, 404);
    }

    if (booking.renter_id !== user.id) {
      return jsonResponse({ error: 'You are not allowed to pay for this booking' }, 403);
    }

    if (booking.status !== 'confirmed') {
      return jsonResponse({ error: 'Booking must be confirmed before payment' }, 400);
    }

    if (booking.payment_status === 'paid') {
      return jsonResponse({ error: 'Booking is already paid' }, 400);
    }

    const pesapalToken = await getPesapalToken();
    const notificationId = await registerIpn(pesapalToken);
    const callbackUrl = `${APP_URL}/payment/success?booking_id=${booking_id}`;

    const response = await fetch(`${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pesapalToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: booking_id,
        currency: 'KES',
        amount: Number(amount),
        description: 'Car Rental - Safiri Kenya',
        callback_url: callbackUrl,
        notification_id: notificationId,
        billing_address: {
          email_address: email,
          phone_number: phone,
          first_name,
          last_name,
        },
      }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.redirect_url || !responseData.order_tracking_id) {
      return jsonResponse(
        {
          error: responseData.error?.message || responseData.message || 'Unable to create Pesapal order',
        },
        400,
      );
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        pesapal_order_tracking_id: responseData.order_tracking_id,
        payment_status: 'unpaid',
      })
      .eq('id', booking_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    return jsonResponse({ redirect_url: responseData.redirect_url });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error while initiating card payment' },
      500,
    );
  }
});
