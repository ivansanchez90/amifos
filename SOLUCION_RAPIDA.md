# 🚀 Solución Rápida para Ambos Problemas

## 🎯 **Enfoque: Crear usuario directamente en Supabase**

Dado que tanto la Edge Function como el método alternativo están fallando por CORS y rate limit, vamos a usar el método más directo:

---

## 📋 **Paso 1: Crear Usuario en Supabase Dashboard**

### Ve a Authentication:
```
https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/auth/users
```

### Crear usuario:
1. Haz clic en **"Add user"** (botón arriba a la derecha)
2. Completa:
   - **Email**: `test.docente123@example.com` (usa uno nuevo)
   - **Password**: `123456`
   - **Auto Confirm User**: ✅ **ACTÍVALO** (esto es importante)
3. Haz clic en **"Create user"**

---

## 📋 **Paso 2: Verificar que se creó**

1. En la misma página, deberías ver el usuario en la lista
2. Copia el **User ID** (UUID) del nuevo usuario
3. Guárdalo temporalmente

---

## 📋 **Paso 3: Insertar en tabla usuarios manualmente**

### Ve a Database:
```
https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/database/usuarios
```

### Insertar registro:
1. Haz clic en **"Insert row"** (tabla usuarios)
2. Completa:
   - **id_usuario**: [Pega el UUID copiado]
   - **email**: `test.docente123@example.com`
   - **nombre**: `Agostina`
   - **apellido**: `Jara`
   - **rol**: `Docente`
   - **activo**: `true`
3. Haz clic en **"Save"**

---

## 📋 **Paso 4: Si es Docente, insertar en docentes**

### Ve a tabla docentes:
```
https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/database/docentes
```

### Insertar registro:
1. Haz clic en **"Insert row"**
2. Completa:
   - **id_usuario**: [Mismo UUID de antes]
   - **dni**: `` (puedes dejarlo vacío)
   - **especialidad**: null (déjalo como null)
   - **activo**: `true`
3. Haz clic en **"Save"**

---

## 📋 **Paso 5: Verificar en el Panel**

1. Ve a tu aplicación: `http://localhost:5173/admin`
2. Ingresa al panel
3. Ve a **"Usuarios"**
4. Deberías ver el nuevo usuario: `Agostina Jara`

---

## 🎯 **Prueba iniciar sesión:**

1. Cierra sesión en el panel si estás logueado
2. Ve al login normal de tu aplicación
3. Usa:
   - **Email**: `test.docente123@example.com`
   - **Password**: `123456`
4. Deberías poder iniciar sesión

---

## 🔧 **Solución Permanente (Edge Function):**

Una vez que verifiques que el sistema funciona manualmente, despliega la Edge Function correctamente:

### Ve a Edge Functions:
```
https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/functions
```

### Crear función:
1. **"New Function"**
2. **Nombre**: `crear-usuario`
3. **Create**

### Copiar código:
1. Abre: `supabase/functions/crear-usuario/index.ts`
2. Copia TODO el contenido
3. Pégalo en el editor

### Desplegar:
1. **"Deploy"**
2. Espera **"Successfully deployed"**
3. Configura `SUPABASE_SERVICE_ROLE_KEY`

### Probar:
1. Ve al panel de tu app
2. **"Usuarios"** → **"+ Nuevo usuario"**
3. Prueba crear uno nuevo

---

## 🚨 **Si todavía hay problemas:**

### **Opción A: Desactivar Rate Limit Temporalmente**

1. Ve a: `Project Settings` → `Auth`
2. Busca **"Rate limiting"**
3. Desactívalo temporalmente (si es posible)
4. Guarda cambios
5. Prueba crear usuario nuevamente

### **Opción B: Usar cURL directo**

Prueba si la Edge Function responde correctamente:

```bash
curl -X POST https://ytamermzvgnnroppqrug.supabase.co/functions/v1/crear-usuario \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu_anon_key" \
  -d '{
    "email": "test.curl@example.com",
    "password": "123456",
    "nombre": "Test",
    "apellido": "Curl",
    "rol": "Docente"
  }'
```

### **Opción C: Verificar Service Role Key**

1. Ve a: `Project Settings` → `API`
2. Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcto
3. Asegúrate de usar el **service_role secret**, NO el anon key

---

## ✅ **Checklist de Verificación:**

- [ ] Usuario creado en Supabase Auth
- [ ] Usuario insertado en tabla usuarios
- [ ] Si es Docente, insertado en tabla docentes
- [ ] Usuario aparece en el panel de administración
- [ ] Puede iniciar sesión con las credenciales
- [ ] Edge Function desplegada y activa
- [ ] No hay errores CORS
- [ ] No hay errores 429

---

## 🎉 **Resultado esperado:**

Una vez completados estos pasos:
- ✅ Tendrás usuarios funcionando en el sistema
- ✅ Podrás crear más usuarios desde el panel
- ✅ El Edge Function funcionará correctamente

**¿Funciona el método manual de crear usuarios directamente en Supabase?**