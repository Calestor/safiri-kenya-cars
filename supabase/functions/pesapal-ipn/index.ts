import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PESAPAL_BASE_URL = Deno.env.get('PESAPAL_BASE_URL') || 'https://cybqa.pesapal.com/pesapalv3';

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

const calculateCommission = (amount: number, rate = 10) => {
  const commission = Number(((amount * rate) / 100).toFixed(2));
  const payout = Number((amount - commission).toFixed(2));

  return { commission, payout };
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const orderTrackingId = url.searchParams.get('orderTrackingId') || '';
  const merchantReference = url.searchParams.get('orderMerchantReference') || '';
  const notificationType = url.searchParams.get('orderNotificationType') || 'IPNCHANGE';

  const responsePayload = {
    orderNotificationType: notificationType,
    orderTrackingId,
    orderMerchantReference: merchantReference,
    status: '200',
  };

  if (!orderTrackingId) {
    return jsonResponse(responsePayload);
  }

  try {
    const pesapalToken = await getPesapalToken();
    const statusResponse = await fetch(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        headers: {
          Authorization: `Bearer ${pesapalToken}`,
        },
      },
    );

    const statusData = await statusResponse.json();
    const normalizedStatus = String(
      statusData.payment_status_description ||
      statusData.payment_status ||
      statusData.status ||
      statusData.status_code ||
      '',
    ).toUpperCase();

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, car_id, total_price, commission_rate, payment_status')
      .or(`pesapal_order_tracking_id.eq.${orderTrackingId},id.eq.${merchantReference}`)
      .maybeSingle();

    if (!booking) {
      return jsonResponse(responsePayload);
    }

    if (normalizedStatus === 'COMPLETED') {
      if (booking.payment_status !== 'paid') {
        const { data: car } = await supabase
          .from('cars')
          .select('owner_id')
          .eq('id', booking.car_id)
          .single();

        if (car?.owner_id) {
          const commissionRate = Number(booking.commission_rate || 10);
          const { commission, payout } = calculateCommission(Number(booking.total_price), commissionRate);

          await supabase
            .from('bookings')
            .update({
              payment_status: 'paid',
              payment_method: 'card',
              commission_rate: commissionRate,
              commission_amount: commission,
              owner_payout_amount: payout,
            })
            .eq('id', booking.id);

          const { data: existingPayout } = await supabase
            .from('payouts')
            .select('id')
            .eq('booking_id', booking.id)
            .maybeSingle();

          if (!existingPayout) {
            await supabase.from('payouts').insert({
              booking_id: booking.id,
              owner_id: car.owner_id,
              total_amount: Number(booking.total_price),
              commission_amount: commission,
              payout_amount: payout,
              status: 'pending',
              payment_method: 'card',
            });
          }
        }
      }
    } else if (['FAILED', 'INVALID', 'CANCELLED'].includes(normalizedStatus)) {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed', payment_method: 'card' })
        .eq('id', booking.id);
    }
  } catch (error) {
    console.error('Pesapal IPN processing failed', error);
  }

  return jsonResponse(responsePayload);
});
