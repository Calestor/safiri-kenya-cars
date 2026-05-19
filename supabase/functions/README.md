# Supabase Edge Functions - Deployment

## Prerequisites
npm install -g supabase
supabase login
supabase link --project-ref ggovsxhmuhcgizagewtu

## Set environment variables
supabase secrets set DARAJA_CONSUMER_KEY=xxx
supabase secrets set DARAJA_CONSUMER_SECRET=xxx
supabase secrets set DARAJA_SHORTCODE=174379
supabase secrets set DARAJA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
supabase secrets set DARAJA_CALLBACK_URL=https://ggovsxhmuhcgizagewtu.supabase.co/functions/v1/mpesa-callback
supabase secrets set PESAPAL_CONSUMER_KEY=xxx
supabase secrets set PESAPAL_CONSUMER_SECRET=xxx
supabase secrets set PESAPAL_BASE_URL=https://cybqa.pesapal.com/pesapalv3
supabase secrets set APP_URL=https://your-vercel-domain.vercel.app
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx

## Deploy all functions
supabase functions deploy initiate-mpesa-payment
supabase functions deploy mpesa-callback
supabase functions deploy initiate-pesapal-payment
supabase functions deploy pesapal-ipn
