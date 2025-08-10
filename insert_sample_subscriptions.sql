-- =====================================================
-- INSERTAR DATOS DE EJEMPLO EN SUBSCRIPTIONS
-- =====================================================

-- Insertar suscripciones de ejemplo con la nueva estructura JSONB
INSERT INTO public.subscriptions (
  service_name,
  subscription_type,
  currency,
  status,
  last_renewal_date,
  next_due_date,
  payment_method,
  responsible_id,
  notes,
  alerts,
  management_url,
  access_credentials,
  cost,
  project_id
) VALUES 
-- Netflix
(
  'Netflix Premium',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '1 month',
  CURRENT_DATE + INTERVAL '1 month',
  'Tarjeta de Crédito',
  (SELECT id FROM profiles LIMIT 1),
  'Suscripción familiar para 4 pantallas',
  true,
  'https://netflix.com/account',
  '{"username": "user_netflix_2024", "password": "Netflix2024!"}'::jsonb,
  15.99,
  (SELECT id FROM projects LIMIT 1)
),
-- Spotify
(
  'Spotify Premium',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '15 days',
  'PayPal',
  (SELECT id FROM profiles LIMIT 1),
  'Música sin anuncios para el equipo',
  true,
  'https://spotify.com/account',
  '{"username": "spotify_team", "password": "Spotify2024!"}'::jsonb,
  9.99,
  (SELECT id FROM projects LIMIT 1)
),
-- Adobe Creative Cloud
(
  'Adobe Creative Cloud',
  'annual',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '6 months',
  'Tarjeta de Débito',
  (SELECT id FROM profiles LIMIT 1),
  'Suite completa para diseño y edición',
  true,
  'https://adobe.com/account',
  '{"username": "adobe_designer", "password": "Adobe2024!"}'::jsonb,
  599.88,
  (SELECT id FROM projects LIMIT 1)
),
-- Figma
(
  'Figma Professional',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '20 days',
  'Tarjeta de Crédito',
  (SELECT id FROM profiles LIMIT 1),
  'Diseño colaborativo en tiempo real',
  false,
  'https://figma.com/account',
  '{"username": "figma_team", "password": "Figma2024!"}'::jsonb,
  12.00,
  (SELECT id FROM projects LIMIT 1)
),
-- Notion
(
  'Notion Team',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '25 days',
  'PayPal',
  (SELECT id FROM profiles LIMIT 1),
  'Gestión de proyectos y documentación',
  true,
  'https://notion.so/account',
  '{"username": "notion_admin", "password": "Notion2024!"}'::jsonb,
  8.00,
  (SELECT id FROM projects LIMIT 1)
),
-- Slack
(
  'Slack Pro',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '10 days',
  'Tarjeta de Crédito',
  (SELECT id FROM profiles LIMIT 1),
  'Comunicación interna del equipo',
  false,
  'https://slack.com/account',
  '{"username": "slack_workspace", "password": "Slack2024!"}'::jsonb,
  7.25,
  (SELECT id FROM projects LIMIT 1)
),
-- Zoom
(
  'Zoom Pro',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '12 days',
  CURRENT_DATE + INTERVAL '18 days',
  'Tarjeta de Débito',
  (SELECT id FROM profiles LIMIT 1),
  'Videoconferencias sin límite de tiempo',
  true,
  'https://zoom.us/account',
  '{"username": "zoom_meetings", "password": "Zoom2024!"}'::jsonb,
  14.99,
  (SELECT id FROM projects LIMIT 1)
),
-- GitHub
(
  'GitHub Team',
  'monthly',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '8 days',
  CURRENT_DATE + INTERVAL '22 days',
  'Tarjeta de Crédito',
  (SELECT id FROM profiles LIMIT 1),
  'Control de versiones y colaboración',
  false,
  'https://github.com/settings/billing',
  '{"username": "github_org", "password": "GitHub2024!"}'::jsonb,
  4.00,
  (SELECT id FROM projects LIMIT 1)
),
-- Canva Pro
(
  'Canva Pro',
  'annual',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '3 months',
  CURRENT_DATE + INTERVAL '9 months',
  'PayPal',
  (SELECT id FROM profiles LIMIT 1),
  'Diseño gráfico y plantillas premium',
  false,
  'https://canva.com/account',
  '{"username": "canva_design", "password": "Canva2024!"}'::jsonb,
  119.99,
  (SELECT id FROM projects LIMIT 1)
),
-- Dropbox
(
  'Dropbox Professional',
  'annual',
  'USD',
  'active',
  CURRENT_DATE - INTERVAL '2 months',
  CURRENT_DATE + INTERVAL '10 months',
  'Tarjeta de Crédito',
  (SELECT id FROM profiles LIMIT 1),
  'Almacenamiento en la nube y sincronización',
  true,
  'https://dropbox.com/account',
  '{"username": "dropbox_team", "password": "Dropbox2024!"}'::jsonb,
  199.99,
  (SELECT id FROM projects LIMIT 1)
);

-- Verificar la inserción
SELECT 
  service_name,
  subscription_type,
  status,
  cost,
  currency,
  access_credentials->>'username' as username,
  access_credentials->>'password' as password
FROM public.subscriptions 
ORDER BY created_at DESC
LIMIT 10;

-- Contar total de suscripciones
SELECT COUNT(*) as total_subscriptions FROM public.subscriptions;
