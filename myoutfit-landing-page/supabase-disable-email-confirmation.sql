-- ============================================
-- SCRIPT PARA DESHABILITAR CONFIRMACIÓN DE EMAIL
-- ============================================
-- IMPORTANTE: Este script solo funciona si tienes acceso a la configuración de Supabase
-- Para aplicar estos cambios, ve al Dashboard de Supabase:
-- https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna/auth/providers

-- PASOS PARA DESHABILITAR LA CONFIRMACIÓN DE EMAIL:
-- 1. Ir a: Authentication > Settings > Email Auth
-- 2. Desmarcar "Enable email confirmations"
-- 3. Guardar cambios

-- ALTERNATIVA: Si prefieres mantener la confirmación de email,
-- puedes auto-confirmar usuarios en desarrollo con este trigger:

-- Crear función para auto-confirmar usuarios
CREATE OR REPLACE FUNCTION auto_confirm_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-confirmar el email del usuario
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = NEW.id
  AND email_confirmed_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para auto-confirmar usuarios al registrarse
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_confirm_users();

-- ============================================
-- NOTA: Si quieres deshacer estos cambios:
-- ============================================
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS auto_confirm_users();


