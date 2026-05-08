# 🐛 Troubleshooting - Creación de Usuarios

## Error: "POST https://ytamermzvgnnroppqrug.supabase.co/auth/v1/signup 400 (Bad Request)"

### 🔍 **Causas Posibles:**

#### 1. **El email ya existe**
- Si el email ya está registrado en Supabase Auth, no se puede crear nuevamente
- **Solución**: El código ahora intenta vincular el usuario existente automáticamente

#### 2. **Configuración de confirmación de email**
- Supabase puede tener activada la confirmación obligatoria de email
- **Solución**: Desactivar confirmación de email (ver abajo)

#### 3. **Problemas con la contraseña**
- Contraseña muy corta (menos de 6 caracteres)
- **Solución**: Usa una contraseña de 6+ caracteres

---

## 🛠️ **Soluciones:**

### **Solución 1: Desactivar Confirmación de Email** (Recomendado para desarrollo)

1. Ve a: `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/auth/providers`
2. En **"Email Provider"** busca **"Confirm email"** o **"Confirmar email"**
3. Desactívalo
4. Guarda los cambios
5. Intenta crear el usuario nuevamente

### **Solución 2: Usar un Email Nuevo**
- Intenta con un email que nunca hayas usado antes
- Ejemplo: `test.12345@example.com`

### **Solución 3: Verificar la Consola del Navegador**
1. Abre las DevTools (F12)
2. Ve a la pestaña **"Console"**
3. Intenta crear el usuario
4. Busca los logs que comienzan con:
   - `Intentando crear usuario con signUp:`
   - `Error en signUp:`
   - `Usuario creado en Auth:`

Esto mostrará exactamente qué está fallando.

### **Solución 4: Verificar Configuración de Supabase**

Ve a: `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/auth/settings`

Verifica:
- ✅ **Site URL**: Debe ser `http://localhost:5173` (para desarrollo)
- ✅ **Redirect URLs**: Debe incluir `http://localhost:5173/**`
- ✅ **Email confirmation**: Puede estar activado o desactivado según tu preferencia

---

## 📊 **Logs del Sistema**

El código ahora incluye logging detallado. En la consola del navegador verás:

### ✅ **Logs de éxito:**
```javascript
Intentando crear usuario con signUp: {email: "...", nombre: "...", ...}
Usuario creado en Auth: {user: {...}, session: {...}}
Insertando en tabla usuarios: {...}
Usuario insertado correctamente en tabla usuarios
Usuario creado exitosamente: {...}
```

### ❌ **Logs de error:**
```javascript
Intentando crear usuario con signUp: {email: "...", ...}
Error en signUp: {message: "..."}
```

---

## 🧪 **Test Step-by-Step:**

1. **Abre la consola del navegador** (F12)
2. **Ve a `/admin`**
3. **Ingresa al panel de administración**
4. **Ve a "Usuarios"**
5. **Haz clic en "+ Nuevo usuario"**
6. **Completa el formulario:**
   - Nombre: `Test`
   - Apellido: `User`
   - Email: `test12345@example.com`
   - Contraseña: `123456`
   - Rol: `Docente`
7. **Haz clic en "Crear usuario"**
8. **Observa los logs en la consola**

---

## 🎯 **Resultados Esperados:**

### Si funciona:
```
✅ Usuario creado correctamente.
```
Y el usuario aparece en la tabla de usuarios.

### Si falla:
```
Error: [descripción del error]
```
Revisa la consola para más detalles.

---

## 📞 **Si nada funciona:**

### **Opción A: Crear usuario directamente en Supabase**
1. Ve a: `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/auth/users`
2. Haz clic en **"Add user"**
3. Ingresa el email y contraseña
4. Desactiva **"Confirm email"** si quieres acceso inmediato
5. Haz clic en **"Create user"**
6. Copia el **User ID**
7. En tu panel, inserta el registro en la tabla `usuarios` con ese ID

### **Opción B: Desplegar la Edge Function**
Sigue las instrucciones en `DEPLOY_MANUAL.md` para desplegar la Edge Function, que es más robusta.

### **Opción C: Contactar soporte**
Si nada funciona, puede haber un problema con la configuración del proyecto de Supabase.

---

## 🔧 **Verificación Final:**

Después de crear un usuario exitosamente:

1. **Ve a la tabla `usuarios` en Supabase:**
   - `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/database/usuarios`
2. **Verifica que el usuario esté allí**
3. **Si es Docente, verifica también la tabla `docentes`:**
   - `https://supabase.com/dashboard/project/ytamermzvgnnroppqrug/database/docentes`

---

**¿Sigues teniendo problemas?** Revisa los logs en la consola del navegador para más información específica.