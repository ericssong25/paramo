-- Script completo para crear sistema de wallets y actualizar transactions
-- Ejecutar en Supabase SQL Editor

-- 1. Crear tabla business_wallets
CREATE TABLE IF NOT EXISTS public.business_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  color_code VARCHAR(7),
  icon_name VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar las 4 wallets iniciales
INSERT INTO public.business_wallets (name, display_name, currency, color_code, icon_name, current_balance) VALUES
('cash', 'Efectivo', 'USD', '#10B981', 'wallet', 150.00),
('binance', 'Binance', 'USD', '#F59E0B', 'credit-card', 75.50),
('zinli', 'Zinli', 'USD', '#8B5CF6', 'smartphone', 25.00),
('bolivares', 'Bolívares', 'VES', '#3B82F6', 'coins', 500000.00)
ON CONFLICT (name) DO UPDATE SET
  current_balance = EXCLUDED.current_balance,
  updated_at = NOW();

-- 3. Verificar estructura actual de transactions
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Eliminar constraint antiguo si existe
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 5. Agregar nuevo constraint que incluya 'transfer'
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'transfer'));

-- 6. Agregar las nuevas columnas para wallets si no existen
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.business_wallets(id),
ADD COLUMN IF NOT EXISTS from_wallet_id UUID REFERENCES public.business_wallets(id),
ADD COLUMN IF NOT EXISTS to_wallet_id UUID REFERENCES public.business_wallets(id);

-- 7. Agregar comentarios a las nuevas columnas
COMMENT ON COLUMN public.transactions.wallet_id IS 'ID del wallet para transacciones de ingreso/egreso';
COMMENT ON COLUMN public.transactions.from_wallet_id IS 'ID del wallet origen para transferencias';
COMMENT ON COLUMN public.transactions.to_wallet_id IS 'ID del wallet destino para transferencias';

-- 8. Crear función para actualizar balance automáticamente
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

-- 9. Crear trigger para actualizar balance automáticamente
DROP TRIGGER IF EXISTS trigger_update_business_wallet_balance ON public.transactions;
CREATE TRIGGER trigger_update_business_wallet_balance
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_wallet_balance();

-- 10. Crear función para obtener saldo total en USD
CREATE OR REPLACE FUNCTION public.get_total_usd_balance()
RETURNS DECIMAL(15,2) AS $$
DECLARE
  total_usd DECIMAL(15,2) := 0;
BEGIN
  SELECT COALESCE(SUM(current_balance), 0) INTO total_usd
  FROM public.business_wallets 
  WHERE currency = 'USD' AND is_active = true;
  
  RETURN total_usd;
END;
$$ LANGUAGE plpgsql;

-- 11. Habilitar RLS en business_wallets
ALTER TABLE public.business_wallets ENABLE ROW LEVEL SECURITY;

-- 12. Crear políticas RLS para business_wallets
CREATE POLICY "Everyone can view business wallets" ON public.business_wallets
  FOR SELECT USING (true);

CREATE POLICY "Admins can update business wallets" ON public.business_wallets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 13. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_business_wallets_name ON public.business_wallets(name);
CREATE INDEX IF NOT EXISTS idx_business_wallets_currency ON public.business_wallets(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_wallet_id ON public.transactions(from_wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_wallet_id ON public.transactions(to_wallet_id);

-- 14. Verificar que todo se creó correctamente
SELECT 'business_wallets' as table_name, COUNT(*) as row_count FROM public.business_wallets
UNION ALL
SELECT 'transactions_structure' as table_name, COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'transactions' AND table_schema = 'public';

-- 15. Mostrar las wallets creadas
SELECT name, display_name, currency, current_balance, color_code, icon_name 
FROM public.business_wallets 
ORDER BY name;
