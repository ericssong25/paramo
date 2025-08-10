-- =====================================================
-- ACTUALIZAR CREDENCIALES DE ACCESO EXISTENTES
-- =====================================================

-- Actualizar todas las suscripciones que tienen access_credentials NULL
-- con credenciales aleatorias en formato JSON

UPDATE public.subscriptions 
SET access_credentials = jsonb_build_object(
  'username', 
  CASE 
    WHEN service_name ILIKE '%netflix%' THEN 'user_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%spotify%' THEN 'spotify_' || substr(md5(random()::text), 1, 6)
    WHEN service_name ILIKE '%amazon%' THEN 'amazon_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%google%' THEN 'google_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%microsoft%' THEN 'ms_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%adobe%' THEN 'adobe_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%figma%' THEN 'figma_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%notion%' THEN 'notion_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%slack%' THEN 'slack_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%zoom%' THEN 'zoom_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%dropbox%' THEN 'dropbox_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%github%' THEN 'github_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%trello%' THEN 'trello_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%asana%' THEN 'asana_' || substr(md5(random()::text), 1, 8)
    WHEN service_name ILIKE '%canva%' THEN 'canva_' || substr(md5(random()::text), 1, 8)
    ELSE 'user_' || substr(md5(random()::text), 1, 8)
  END,
  'password',
  CASE 
    WHEN service_name ILIKE '%netflix%' THEN 'Netflix' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%spotify%' THEN 'Spotify' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%amazon%' THEN 'Amazon' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%google%' THEN 'Google' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%microsoft%' THEN 'MS' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%adobe%' THEN 'Adobe' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%figma%' THEN 'Figma' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%notion%' THEN 'Notion' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%slack%' THEN 'Slack' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%zoom%' THEN 'Zoom' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%dropbox%' THEN 'Dropbox' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%github%' THEN 'GitHub' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%trello%' THEN 'Trello' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%asana%' THEN 'Asana' || substr(md5(random()::text), 1, 6) || '!'
    WHEN service_name ILIKE '%canva%' THEN 'Canva' || substr(md5(random()::text), 1, 6) || '!'
    ELSE 'Pass' || substr(md5(random()::text), 1, 8) || '!'
  END
)
WHERE access_credentials IS NULL;

-- Verificar la actualización
SELECT 
  id,
  service_name,
  access_credentials,
  jsonb_typeof(access_credentials) as credentials_type
FROM public.subscriptions 
WHERE access_credentials IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Contar cuántas suscripciones fueron actualizadas
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(access_credentials) as with_credentials,
  COUNT(*) - COUNT(access_credentials) as without_credentials
FROM public.subscriptions;
