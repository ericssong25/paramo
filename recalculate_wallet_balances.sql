-- Script para recalcular saldos de wallets basándose en transacciones existentes
-- Ejecutar en Supabase SQL Editor

-- 1. Resetear todos los saldos a 0
UPDATE public.business_wallets SET current_balance = 0;

-- 2. Recalcular saldos basándose en transacciones
-- Para ingresos
UPDATE public.business_wallets 
SET current_balance = current_balance + (
  SELECT COALESCE(SUM(amount), 0)
  FROM public.transactions 
  WHERE type = 'income' 
  AND wallet_id = business_wallets.id
);

-- Para egresos (restar)
UPDATE public.business_wallets 
SET current_balance = current_balance - (
  SELECT COALESCE(SUM(amount), 0)
  FROM public.transactions 
  WHERE type = 'expense' 
  AND wallet_id = business_wallets.id
);

-- Para transferencias de salida (restar)
UPDATE public.business_wallets 
SET current_balance = current_balance - (
  SELECT COALESCE(SUM(amount), 0)
  FROM public.transactions 
  WHERE type = 'transfer' 
  AND from_wallet_id = business_wallets.id
);

-- Para transferencias de entrada (sumar)
UPDATE public.business_wallets 
SET current_balance = current_balance + (
  SELECT COALESCE(SUM(amount), 0)
  FROM public.transactions 
  WHERE type = 'transfer' 
  AND to_wallet_id = business_wallets.id
);

-- 3. Verificar los saldos recalculados
SELECT name, display_name, current_balance, currency 
FROM public.business_wallets 
ORDER BY name;

-- 4. Verificar el total de transacciones por tipo
SELECT 
  type,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM public.transactions 
GROUP BY type 
ORDER BY type;
