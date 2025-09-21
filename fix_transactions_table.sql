-- Script para arreglar la tabla transactions y agregar soporte para transferencias
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar la estructura actual de la tabla transactions
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar el constraint actual del tipo
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND conname LIKE '%type%';

-- 3. Eliminar el constraint actual si existe
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

-- 4. Agregar el nuevo constraint que incluya 'transfer'
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('income', 'expense', 'transfer'));

-- 5. Agregar las nuevas columnas para wallets si no existen
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS wallet_id UUID,
ADD COLUMN IF NOT EXISTS from_wallet_id UUID,
ADD COLUMN IF NOT EXISTS to_wallet_id UUID;

-- 6. Agregar comentarios a las nuevas columnas
COMMENT ON COLUMN public.transactions.wallet_id IS 'ID del wallet para transacciones de ingreso/egreso';
COMMENT ON COLUMN public.transactions.from_wallet_id IS 'ID del wallet origen para transferencias';
COMMENT ON COLUMN public.transactions.to_wallet_id IS 'ID del wallet destino para transferencias';

-- 7. Verificar que se aplicaron los cambios
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
AND column_name IN ('wallet_id', 'from_wallet_id', 'to_wallet_id')
ORDER BY column_name;

-- 8. Verificar el nuevo constraint
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'transactions'::regclass 
AND conname = 'transactions_type_check';
