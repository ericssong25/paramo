-- Script para arreglar/crear el trigger de actualización de saldos
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar trigger y función existentes si existen
DROP TRIGGER IF EXISTS trigger_update_business_wallet_balance ON public.transactions;
DROP FUNCTION IF EXISTS public.update_business_wallet_balance();

-- 2. Crear función para actualizar balance automáticamente
CREATE OR REPLACE FUNCTION public.update_business_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Para transferencias: restar del origen y sumar al destino
  IF NEW.type = 'transfer' AND NEW.from_wallet_id IS NOT NULL AND NEW.to_wallet_id IS NOT NULL THEN
    -- Restar del wallet origen
    UPDATE public.business_wallets 
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.from_wallet_id;
    
    -- Sumar al wallet destino
    UPDATE public.business_wallets 
    SET current_balance = current_balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.to_wallet_id;
  
  -- Para ingresos: sumar al wallet
  ELSIF NEW.type = 'income' AND NEW.wallet_id IS NOT NULL THEN
    UPDATE public.business_wallets 
    SET current_balance = current_balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.wallet_id;
  
  -- Para egresos: restar del wallet
  ELSIF NEW.type = 'expense' AND NEW.wallet_id IS NOT NULL THEN
    UPDATE public.business_wallets 
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.wallet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear trigger para actualizar balance automáticamente
CREATE TRIGGER trigger_update_business_wallet_balance
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_wallet_balance();

-- 4. Verificar que se creó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_update_business_wallet_balance';

-- 5. Probar el trigger con una transacción de prueba (opcional)
-- INSERT INTO transactions (type, amount, currency, date, status, from_wallet_id, to_wallet_id) 
-- VALUES ('transfer', 10.00, 'USD', CURRENT_DATE, 'cleared', 
--         (SELECT id FROM business_wallets WHERE name = 'cash'), 
--         (SELECT id FROM business_wallets WHERE name = 'binance'));
