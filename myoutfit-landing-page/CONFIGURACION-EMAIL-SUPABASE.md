# 📧 Configuración de Email en Supabase

## ✅ Sistema Actualizado

He configurado el sistema para funcionar correctamente con la **verificación de correo electrónico** de Supabase.

## 🔄 Cambios Realizados

### 1. ✅ Eliminado el Trigger de Auto-Confirmación
- Ahora los usuarios DEBEN confirmar su email antes de poder iniciar sesión

### 2. ✅ Flujo de Registro Actualizado
```
Usuario → Registro → Email de confirmación → Confirmar → Login → Dashboard
```

### 3. ✅ Mensajes Mejorados
- Mensaje claro después del registro pidiendo confirmar email
- Error específico si intenta hacer login sin confirmar
- Instrucciones detalladas en cada paso

### 4. ✅ Creación de Tienda Automática
- La tienda se crea automáticamente en el primer login (después de confirmar email)
- No es necesario crear la tienda durante el registro

## ⚙️ Configuración SMTP Requerida

Para que Supabase pueda enviar emails de confirmación, necesitas configurar SMTP:

### Opción 1: Usar el Email de Supabase (Desarrollo - Limitado)

Supabase proporciona un servicio de email básico que funciona para desarrollo:

1. Ve a: https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna/auth/templates
2. Revisa las plantillas de email (ya están configuradas por defecto)
3. Los emails se enviarán automáticamente, pero tienen límites

⚠️ **Limitaciones del email de Supabase:**
- Máximo 3 emails por hora en desarrollo
- Pueden ir a spam
- No recomendado para producción

### Opción 2: Configurar SMTP Personalizado (Producción - Recomendado)

#### A. Usando Gmail (Gratis, fácil de configurar)

1. **Habilitar verificación en 2 pasos en Gmail**:
   - Ve a: https://myaccount.google.com/security
   - Habilita "Verificación en 2 pasos"

2. **Crear una contraseña de aplicación**:
   - Ve a: https://myaccount.google.com/apppasswords
   - Selecciona "Correo" y "Otro" (nombre: Supabase)
   - Copia la contraseña de 16 caracteres

3. **Configurar en Supabase**:
   - Ve a: https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna/settings/auth
   - Busca la sección "SMTP Settings"
   - Configura:
     ```
     SMTP Host: smtp.gmail.com
     SMTP Port: 465
     SMTP User: tu-email@gmail.com
     SMTP Password: [contraseña de aplicación de 16 caracteres]
     SMTP Sender Name: MyOutfit
     SMTP Sender Email: tu-email@gmail.com
     ```

#### B. Usando SendGrid (Profesional, más confiable)

1. **Crear cuenta en SendGrid**:
   - Ve a: https://sendgrid.com
   - Crea una cuenta gratuita (100 emails/día)

2. **Crear API Key**:
   - Ve a Settings → API Keys
   - Crea una nueva API Key con permisos completos
   - Copia la API Key

3. **Configurar en Supabase**:
   - Ve a: https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna/settings/auth
   - Busca la sección "SMTP Settings"
   - Configura:
     ```
     SMTP Host: smtp.sendgrid.net
     SMTP Port: 587
     SMTP User: apikey
     SMTP Password: [tu API Key de SendGrid]
     SMTP Sender Name: MyOutfit
     SMTP Sender Email: noreply@tudominio.com
     ```

#### C. Usando Mailgun (Otra opción profesional)

Similar a SendGrid, con plan gratuito para 5,000 emails/mes.

## 📧 Personalizar Plantillas de Email

1. Ve a: https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna/auth/templates

2. Puedes personalizar:
   - **Confirm signup**: Email de confirmación de registro
   - **Magic Link**: Link mágico para login sin contraseña
   - **Change Email Address**: Confirmación de cambio de email
   - **Reset Password**: Recuperación de contraseña

3. Personaliza el contenido con tus colores y marca

## 🧪 Cómo Probar el Flujo

### 1. Registro de Usuario:

```
1. Ve a: http://localhost:3000/b2b/register
2. Completa el formulario con un email real
3. Haz click en "Crear cuenta gratis"
4. Verás un mensaje: "¡Cuenta creada exitosamente! 🎉 Confirma tu correo"
```

### 2. Confirmar Email:

```
1. Revisa tu bandeja de entrada (y spam)
2. Busca email de: noreply@mail.supabase.io (o tu SMTP configurado)
3. Haz click en "Confirm your email" o "Confirmar email"
4. Te redirigirá automáticamente
```

### 3. Iniciar Sesión:

```
1. Ve a: http://localhost:3000/dashboard
2. Ingresa email y contraseña
3. La tienda se creará automáticamente
4. Accederás al dashboard
```

## ❓ Solución de Problemas

### Problema: No recibo el email de confirmación

**Soluciones:**
1. Revisa la carpeta de spam
2. Verifica que el SMTP esté configurado correctamente
3. Verifica los logs en Supabase: Auth → Logs
4. Intenta con otro email

### Problema: El email va a spam

**Soluciones:**
1. Configura SPF, DKIM y DMARC en tu dominio
2. Usa un servicio profesional como SendGrid
3. Marca el email como "No es spam" para entrenar tu filtro

### Problema: "Email not confirmed" al hacer login

**Solución:**
- El usuario debe confirmar su email primero
- Reenvía el email de confirmación desde Supabase Dashboard

## 🔍 Verificar Estado de Usuarios

Para ver el estado de confirmación de usuarios:

```sql
SELECT 
  id, 
  email, 
  email_confirmed_at, 
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;
```

- `email_confirmed_at`: NULL = no confirmado, con fecha = confirmado

## 📊 Reenviar Email de Confirmación

Si un usuario no recibió el email:

```sql
-- Ver usuarios sin confirmar
SELECT id, email, created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;
```

Desde el Dashboard de Supabase:
1. Ve a: Authentication → Users
2. Busca el usuario
3. Click en "..." → "Send password reset email" (alternativa)

O puedes implementar un botón "Reenviar email" en tu aplicación.

## 🎯 Estado Actual del Sistema

- ✅ Registro requiere confirmación de email
- ✅ Login verifica que el email esté confirmado
- ✅ Mensajes claros para el usuario
- ✅ Tienda se crea automáticamente después de confirmar
- ⚠️ **Pendiente**: Configurar SMTP para emails en producción

## 🚀 Próximos Pasos

1. **Configurar SMTP** (ver opciones arriba)
2. **Personalizar plantillas** de email con tu marca
3. **Probar el flujo completo** con un email real
4. **Implementar "Reenviar email"** si es necesario

---

## 📝 URL del Proyecto Supabase

Dashboard: https://supabase.com/dashboard/project/tdzglepfyqnteatmtfna


