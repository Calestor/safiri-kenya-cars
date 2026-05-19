import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DARAJA_BASE_URL = 'https://sandbox.safaricom.co.ke';
const DEFAULT_SHORTCODE = '174379';
const DEFAULT_PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const CALLBACK_URL =
  Deno.env.get('DARAJA_CALLBACK_URL') ||
  'https://ggovsxhmuhcgizagewtu.supabase.co/functions/v1/mpesa-callback';

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

const formatPhoneNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7') || digits.startsWith('1')) return `254${digits}`;

  throw new Error('Please enter a valid Kenyan phone number.');
};

const generateTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => `${value}`.padStart(2, '0');

  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const getAccessToken = async () => {
  const consumerKey = Deno.env.get('DARAJA_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('DARAJA_CONSUMER_SECRET');

  if (!consumerKey || !consumerSecret) {
    throw new Error('Daraja credentials are missing.');
  }

  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  const response = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to authenticate with Daraja.');
  }

  const data = await response.json();
  return data.access_token as string;
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

    const { booking_id, phone, amount } = await req.json();

    if (!booking_id || !phone || !amount) {
      return jsonResponse({ error: 'booking_id, phone and amount are required' }, 400);
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, renter_id, status, payment_status, total_price')
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

    const timestamp = generateTimestamp();
    const shortcode = Deno.env.get('DARAJA_SHORTCODE') || DEFAULT_SHORTCODE;
    const passkey = Deno.env.get('DARAJA_PASSKEY') || DEFAULT_PASSKEY;
    const password = btoa(`${shortcode}${passkey}${timestamp}`);
    const accessToken = await getAccessToken();
    const formattedPhone = formatPhoneNumber(phone as string);

    const response = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Number(amount),
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: 'SafiriKenya',
        TransactionDesc: 'Car Rental Payment',
      }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.CheckoutRequestID) {
      return jsonResponse(
        {
          error:
            responseData.errorMessage ||
            responseData.ResponseDescription ||
            'Unable to initiate M-Pesa payment',
        },
        400,
      );
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        mpesa_checkout_request_id: responseData.CheckoutRequestID,
        payment_status: 'unpaid',
      })
      .eq('id', booking_id);

    if (updateError) {
      return jsonResponse({ error: updateError.message }, 500);
    }

    return jsonResponse({
      success: true,
      checkout_request_id: responseData.CheckoutRequestID,
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unexpected error while initiating M-Pesa payment' },
      500,
    );
  }
});
