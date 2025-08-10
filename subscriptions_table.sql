-- =====================================================
-- SCRIPT: Creación de Tablas de Suscripciones
-- =====================================================
-- Este script crea las tablas necesarias para gestionar suscripciones
-- y sus pagos en Supabase.

-- =====================================================
-- TABLA: subscriptions - Suscripciones
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name TEXT NOT NULL,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired', 'pending')),
  last_renewal_date DATE NOT NULL,
  next_due_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  responsible_id UUID REFERENCES profiles(id),
  notes TEXT,
  alerts BOOLEAN DEFAULT FALSE,
  management_url TEXT,
  access_credentials TEXT,
  cost NUMERIC(10, 2) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLA: subscription_payments - Pagos de Suscripciones
-- =====================================================

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_responsible_id ON public.subscriptions(responsible_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_project_id ON public.subscriptions(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_due_date ON public.subscriptions(next_due_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_service_name ON public.subscriptions(service_name);

-- Índices para subscription_payments
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_payment_date ON public.subscription_payments(payment_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para subscriptions
CREATE POLICY "Enable read access for all users" ON public.subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.subscriptions
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for admins only" ON public.subscriptions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Habilitar RLS en subscription_payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_payments
CREATE POLICY "Enable read access for all users" ON public.subscription_payments
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.subscription_payments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.subscription_payments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for admins only" ON public.subscription_payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para subscriptions
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener suscripciones próximas a vencer
CREATE OR REPLACE FUNCTION get_upcoming_subscriptions(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  service_name TEXT,
  next_due_date DATE,
  cost NUMERIC(10, 2),
  currency TEXT,
  responsible_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.service_name,
    s.next_due_date,
    s.cost,
    s.currency,
    p.name as responsible_name
  FROM subscriptions s
  LEFT JOIN profiles p ON s.responsible_id = p.id
  WHERE s.status = 'active'
    AND s.next_due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
  ORDER BY s.next_due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de suscripciones
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  total_monthly_cost NUMERIC(10, 2),
  overdue_subscriptions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COALESCE(SUM(cost) FILTER (WHERE status = 'active'), 0) as total_monthly_cost,
    COUNT(*) FILTER (WHERE status = 'active' AND next_due_date < CURRENT_DATE) as overdue_subscriptions
  FROM subscriptions;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar datos de ejemplo si la tabla está vacía
INSERT INTO public.subscriptions (
  service_name,
  subscription_type,
  currency,
  status,
  last_renewal_date,
  next_due_date,
  payment_method,
  notes,
  alerts,
  cost
) VALUES 
  (
    'Netflix',
    'monthly',
    'USD',
    'active',
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE + INTERVAL '15 days',
    'Credit Card',
    'Suscripción familiar para 4 pantallas',
    true,
    15.99
  ),
  (
    'Spotify Premium',
    'monthly',
    'USD',
    'active',
    CURRENT_DATE - INTERVAL '1 month',
    CURRENT_DATE + INTERVAL '5 days',
    'PayPal',
    'Suscripción individual',
    true,
    9.99
  ),
  (
    'Adobe Creative Cloud',
    'annual',
    'USD',
    'active',
    CURRENT_DATE - INTERVAL '6 months',
    CURRENT_DATE + INTERVAL '6 months',
    'Credit Card',
    'Suite completa para diseño',
    false,
    599.88
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.subscriptions IS 'Tabla para gestionar suscripciones a servicios y herramientas';
COMMENT ON TABLE public.subscription_payments IS 'Tabla para registrar pagos de suscripciones';

COMMENT ON COLUMN public.subscriptions.service_name IS 'Nombre del servicio suscrito';
COMMENT ON COLUMN public.subscriptions.subscription_type IS 'Tipo de suscripción (weekly, biweekly, monthly, quarterly, semiannual, annual)';
COMMENT ON COLUMN public.subscriptions.status IS 'Estado de la suscripción (active, paused, cancelled, expired, pending)';
COMMENT ON COLUMN public.subscriptions.last_renewal_date IS 'Fecha de la última renovación';
COMMENT ON COLUMN public.subscriptions.next_due_date IS 'Fecha del próximo vencimiento';
COMMENT ON COLUMN public.subscriptions.payment_method IS 'Método de pago utilizado';
COMMENT ON COLUMN public.subscriptions.responsible_id IS 'ID del usuario responsable de la suscripción';
COMMENT ON COLUMN public.subscriptions.alerts IS 'Si se deben mostrar alertas para esta suscripción';
COMMENT ON COLUMN public.subscriptions.management_url IS 'URL directa para administrar la suscripción';
COMMENT ON COLUMN public.subscriptions.access_credentials IS 'Credenciales de acceso (encriptadas)';
COMMENT ON COLUMN public.subscriptions.cost IS 'Costo de la suscripción';
COMMENT ON COLUMN public.subscriptions.project_id IS 'ID del proyecto asociado (opcional)';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
