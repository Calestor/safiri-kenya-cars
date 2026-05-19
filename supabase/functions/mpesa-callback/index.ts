import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: true });
  }

  try {
    const payload = await req.json();
    const callback = payload?.Body?.stkCallback;
    const checkoutRequestId = callback?.CheckoutRequestID as string | undefined;
    const resultCode = Number(callback?.ResultCode ?? -1);

    if (!checkoutRequestId) {
      return jsonResponse({ success: true });
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, car_id, total_price, commission_rate, payment_status')
      .eq('mpesa_checkout_request_id', checkoutRequestId)
      .maybeSingle();

    if (bookingError || !booking) {
      console.error('Booking lookup failed', bookingError?.message || 'not found');
      return jsonResponse({ success: true });
    }

    if (resultCode !== 0) {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed', payment_method: 'mpesa' })
        .eq('id', booking.id);

      return jsonResponse({ success: true });
    }

    if (booking.payment_status === 'paid') {
      return jsonResponse({ success: true });
    }

    const { data: car } = await supabase
      .from('cars')
      .select('owner_id')
      .eq('id', booking.car_id)
      .single();

    if (!car?.owner_id) {
      console.error('Owner lookup failed for booking', booking.id);
      return jsonResponse({ success: true });
    }

    const commissionRate = Number(booking.commission_rate || 10);
    const { commission, payout } = calculateCommission(Number(booking.total_price), commissionRate);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_method: 'mpesa',
        commission_rate: commissionRate,
        commission_amount: commission,
        owner_payout_amount: payout,
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('Booking update failed', updateError.message);
      return jsonResponse({ success: true });
    }

    const { data: existingPayout } = await supabase
      .from('payouts')
      .select('id')
      .eq('booking_id', booking.id)
      .maybeSingle();

    if (!existingPayout) {
      const { error: payoutError } = await supabase.from('payouts').insert({
        booking_id: booking.id,
        owner_id: car.owner_id,
        total_amount: Number(booking.total_price),
        commission_amount: commission,
        payout_amount: payout,
        status: 'pending',
        payment_method: 'mpesa',
      });

      if (payoutError) {
        console.error('Payout insert failed', payoutError.message);
      }
    }
  } catch (error) {
    console.error('M-Pesa callback processing failed', error);
  }

  return jsonResponse({ success: true });
});
