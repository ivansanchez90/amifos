# 🆘 Solución de Problemas Actuales

## 🚨 **Problemas identificados:**

### 1. **Error CORS con Edge Function**
```
Access to fetch at 'https://ytamermzvgnnroppqrug.supabase.co/functions/v1/crear-usuario'
from origin 'http://localhost:5173' has been blocked by CORS policy
```
**Causa**: La Edge Function `crear-usuario` no está desplegada o tiene errores.

### 2. **Error 429 Rate Limit**
```
POST https://ytamermzvgnnroppqrug.supabase.co/auth/v1/signup 429 (Too Many Requests)
AuthApiError: email rate limit exceeded
```
**Causa**: Has excedido el límite de solicitudes de Supabase Auth por intentar muchas veces con el mismo email.

---

## 🛠️ **Soluciones:**

### **Solución 1: Resolver el Error 429 (Inmediato)**

El error 429 es temporal. Supabase limita las solicitudes por seguridad.

#### **Opción A: Esperar (Recomendado)**
- Espera **10-15 minutos** antes de volver a intentar
- Supabase resetea el contador de rate limit automáticamente

#### **Opción B: Usar Email Diferente**
- Usa un email que nunca hayas usado antes
- Ejemplos: `test.12345@example.com`, `usuario.prueba@tempmail.com`

#### **Opción C: Crear Usuario Directamente en Supabase**
1. Ve a: `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/auth/users`
2. Haz clic en **"Add user"**
3. Ingresa un email nuevo y contraseña
4. Desactiva **"Confirm email"** si quieres acceso inmediato
5. Haz clic en **"Create user"**
6. El código ahora detectará que el usuario ya existe y lo vinculará

---

### **Solución 2: Desplegar la Edge Function (Prioritario)**

#### **Paso 1: Crear la Función en el Dashboard**

1. Ve a: `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/functions`
2. Haz clic en **"New Function"**
3. Nombre: `crear-usuario`
4. Haz clic en **"Create"**

#### **Paso 2: Copiar el Código Correcto**

1. Abre el archivo: `supabase/functions/crear-usuario/index.ts`
2. Copia **TODO** el contenido
3. Pégalo en el editor de la Edge Function

**Asegúrate de copiar el código exacto, incluyendo:**
- ✅ Los headers CORS
- ✅ El manejo del método OPTIONS
- ✅ El import correcto de Supabase

#### **Paso 3: Guardar y Desplegar**

1. Haz clic en **"Save"** o **"Deploy"**
2. Espera a que aparezca **"Successfully deployed"**
3. Verifica que el estado sea **"Active"**

#### **Paso 4: Configurar Variable de Entorno**

1. En la misma página de la función
2. Ve a **"Environment Variables"** o **"Secrets"**
3. Agrega:
   - **Name**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Tu service_role key

**¿Dónde conseguir el service_role key?**
1. Ve a: `Project Settings` → `API`
2. Copia el **`service_role`** secret (NO el `anon` key)

#### **Paso 5: Verificar que Funcione**

1. Vuelve a la lista de funciones
2. Verifica que `crear-usuario` esté **"Active"**
3. Haz clic en ella para ver los logs

---

## 🧪 **Plan de Acción:**

### **Ahora (Resolver Rate Limit):**
1. **Espera 15 minutos** O
2. **Usa un email diferente**

### **Después (Resolver CORS):**
1. **Despliega la Edge Function** siguiendo los pasos arriba
2. **Verifica que esté Active**
3. **Prueba crear un usuario nuevo**

---

## 📊 **Flujo Completo del Sistema:**

```
Usuario intenta crear cuenta
        ↓
[1] Intenta Edge Function "crear-usuario"
        ↓
¿Está desplegada?
├─ Sí ✅ → Crea usuario automáticamente
└─ No ❌ → Error CORS (tu problema actual)
        ↓
[2] Usa método alternativo con signUp
        ↓
¿Hay rate limit?
├─ No ✅ → Crea usuario normalmente
└─ Sí ❌ → Error 429 (tu problema actual)
        ↓
[3] Usuario ve mensaje de error
```

---

## 🎯 **Resultado Esperado:**

Cuando ambos problemas estén resueltos:

```
✅ Usuario creado correctamente.
```

Y el usuario aparece en:
- Tabla `auth.users` (Supabase Auth)
- Tabla `usuarios` (Base de datos)
- Tabla `docentes` (si es Docente)

---

## 🚨 **Si sigues teniendo problemas:**

### **A) Edge Function sigue fallando con CORS:**

1. **Verifica el código copiado:**
   - Asegúrate de no faltar ninguna línea
   - Verifica que los headers CORS estén completos

2. **Revisa los logs de la función:**
   - En el dashboard de Supabase
   - Ve a Edge Functions → crear-usuario → Logs
   - Busca errores específicos

3. **Intenta curl directo:**
   ```bash
   curl -X OPTIONS https://ytamermzvgnnroppqrug.supabase.co/functions/v1/crear-usuario \
   -H "Origin: http://localhost:5173" \
   -H "Access-Control-Request-Method: POST" \
   -H "Access-Control-Request-Headers: content-type"
   ```

### **B) Método alternativo sigue fallando:**

1. **Verifica la configuración de email:**
   - Ve a: `Project Settings` → `Auth`
   - Desactiva **"Confirm email"** temporalmente

2. **Usa el método directo de Supabase:**
   - Crea el usuario en el dashboard de Supabase
   - El código detectará que ya existe

---

## 📞 **Prueba paso a paso:**

### **1. Resolver Rate Limit (15 min):**
- **Espera 15 minutos** O usa email nuevo
- **Prueba:** `test.12345@example.com`

### **2. Desplegar Edge Function:**
- **Sigue los pasos anteriores**
- **Verifica que esté Active**

### **3. Probar el sistema:**
- **Abre consola** (F12)
- **Ve a `/admin`** → **Usuarios** → **+ Nuevo usuario**
- **Usa datos nuevos**
- **Observa los logs**

---

## ✅ **Checklist Final:**

- [ ] Esperé 15 minutos o usé email nuevo
- [ ] Desplegué la Edge Function `crear-usuario`
- [ ] Configuré `SUPABASE_SERVICE_ROLE_KEY`
- [ ] La función está en estado "Active"
- [ ] Probé crear un usuario nuevo
- [ ] El usuario aparece en la tabla `usuarios`
- [ ] No hay errores en la consola

---

**¿Cuál problema quieres resolver primero? ¿El rate limit o el CORS?**