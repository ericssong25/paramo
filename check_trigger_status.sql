-- Script para verificar el estado del trigger y función
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la función existe
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'update_business_wallet_balance';

-- 2. Verificar si el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_business_wallet_balance';

-- 3. Verificar las columnas de wallet en transactions
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
AND column_name IN ('wallet_id', 'from_wallet_id', 'to_wallet_id')
ORDER BY column_name;

-- 4. Verificar una transacción de transferencia reciente
SELECT 
  id, type, amount, currency, 
  wallet_id, from_wallet_id, to_wallet_id,
  created_at
FROM transactions 
WHERE type = 'transfer' 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar saldos actuales de wallets
SELECT name, display_name, current_balance, currency 
FROM business_wallets 
ORDER BY name;
