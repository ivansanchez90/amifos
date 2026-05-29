/**
 * AdminPanel.tsx
 * Panel de administración — Educar Para Transformar
 * Roles: Admin / Directivo → acceso completo
 *        Docente           → solo sus secciones
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

// ═══════════════════════════════════════════════════════════════
//  TIPOS
// ═══════════════════════════════════════════════════════════════
interface UsuarioPanel {
  id_usuario: string
  nombre: string
  apellido: string
  email: string
  rol: string
  activo: boolean
}

interface PrefillAlumno {
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string
}

interface PrefillUsuario {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: string
  alumno?: PrefillAlumno | null
}

interface Alumno {
  id_alumno: number
  nombre: string
  apellido: string
  dni: string
  activo: boolean
  cursos: { nivel: string; grado_anio: string; division: string } | null
}

interface Docente {
  id_docente: number
  dni: string
  especialidad: string | null
  activo: boolean
  usuarios: { nombre: string; apellido: string; email: string } | null
}

interface Curso {
  id_curso: number
  nivel: string
  grado_anio: string
  division: string
  capacidad_maxima: number
}

interface Materia {
  id_materia: number
  nombre: string
  horas_semanales: number
  activo: boolean
}

interface Asignacion {
  id_asignacion: number
  docentes: { usuarios: { nombre: string; apellido: string } | null } | null
  materias: { nombre: string } | null
  cursos: { nivel: string; grado_anio: string; division: string } | null
}

interface AlumnoAsistencia {
  id_alumno: number
  nombre: string
  apellido: string
  estado: 'Presente' | 'Ausente' | 'Tarde' | 'Justificado'
}

interface Calificacion {
  id_calificacion: number
  nota: number
  trimestre: number
  tipo_evaluacion: string
  fecha_carga: string
  alumnos: { nombre: string; apellido: string } | null
  asignaciones: { materias: { nombre: string } | null } | null
}

interface Cuota {
  id_cuota: number
  mes: number
  anio: number
  monto_base: number
  descuento: number
  estado: string
  fecha_vencimiento: string
  alumnos: { nombre: string; apellido: string } | null
}

interface ActividadEx {
  id_actividad: number
  nombre: string
  tipo: string
  descripcion: string | null
  cupo_maximo: number
  activo: boolean
}

interface DocumentoAlumno {
  id_documento: number
  id_alumno: number
  nombre: string
  tipo: string | null
  url_archivo: string
  fecha_carga: string
}

interface Beca {
  id_beca: number
  id_alumno: number
  porcentaje: number
  motivo: string | null
  activo: boolean
  fecha_otorgamiento: string
  alumnos: { nombre: string; apellido: string } | null
}

interface Sueldo {
  id_sueldo: number
  id_usuario: string | null
  mes: number
  anio: number
  monto: number
  estado: string
  fecha_pago: string | null
  usuarios: { nombre: string; apellido: string; rol: string } | null
}

interface Compra {
  id_compra: number
  descripcion: string
  destino: string
  cantidad: number
  monto: number
  proveedor: string | null
  fecha_compra: string
}

interface Instalacion {
  id_instalacion: number
  nombre: string
  tipo: string | null
  activo: boolean
}

interface Reserva {
  id_reserva: number
  id_instalacion: number
  fecha: string
  hora_inicio: string
  hora_fin: string
  motivo: string | null
  instalaciones: { nombre: string } | null
  usuarios: { nombre: string; apellido: string } | null
}

interface MensajeContacto {
  id_mensaje: number
  nombre: string
  email: string
  mensaje: string
  leido: boolean
  fecha_envio: string
}

interface Inscripcion {
  id_inscripcion: number
  nombre_aspirante: string
  apellido_aspirante: string | null
  fecha_nacimiento_aspirante: string | null
  dni_aspirante: string
  nombre_tutor: string
  email_tutor: string
  telefono_tutor: string | null
  nivel_solicitado: string
  estado: string
  fecha_solicitud: string
}

interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  fecha_publicacion: string
  activo: boolean
  destacada: boolean
}

// ═══════════════════════════════════════════════════════════════
//  COLORES
// ═══════════════════════════════════════════════════════════════
const C = {
  purple: '#5B35C5',
  purpleLight: '#EEE9FF',
  purpleDark: '#3D2092',
  purpleMid: '#7B55E8',
  white: '#FFFFFF',
  bg: '#F5F4FB',
  text: '#1A1A2E',
  textMuted: '#6B6B8A',
  border: '#E8E6F5',
  green: '#27AE60',
  orange: '#E67E22',
  red: '#E74C3C',
  blue: '#2980B9',
}

const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

// ═══════════════════════════════════════════════════════════════
//  ESTILOS REUTILIZABLES
// ═══════════════════════════════════════════════════════════════
const card: React.CSSProperties = {
  background: C.white,
  borderRadius: 16,
  padding: 24,
  boxShadow: '0 2px 16px rgba(91,53,197,0.06)',
  border: `1px solid ${C.border}`,
}
const cardTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  color: C.text,
  marginBottom: 20,
}
const th: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 800,
  color: C.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  padding: '0 12px 12px 0',
  borderBottom: `2px solid ${C.border}`,
}
const td: React.CSSProperties = {
  padding: '11px 12px 11px 0',
  fontSize: 13,
  borderBottom: `1px solid ${C.border}`,
  verticalAlign: 'middle',
}
const input: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: `2px solid ${C.border}`,
  fontSize: 13,
  fontFamily: 'inherit',
  outline: 'none',
  color: C.text,
  boxSizing: 'border-box',
}
const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  color: C.textMuted,
  display: 'block',
  marginBottom: 5,
}
const btnPrimary: React.CSSProperties = {
  background: `linear-gradient(135deg, ${C.purple}, ${C.purpleMid})`,
  color: C.white,
  border: 'none',
  borderRadius: 10,
  padding: '10px 20px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const btnSecondary: React.CSSProperties = {
  background: C.purpleLight,
  color: C.purple,
  border: 'none',
  borderRadius: 10,
  padding: '10px 20px',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const btnDanger: React.CSSProperties = {
  background: '#E74C3C1A',
  color: C.red,
  border: 'none',
  borderRadius: 8,
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  background: color + '1A',
  color,
  borderRadius: 20,
  padding: '3px 10px',
  fontSize: 11,
  fontWeight: 800,
})

// ═══════════════════════════════════════════════════════════════
//  NAV ITEMS POR ROL
// ═══════════════════════════════════════════════════════════════
const NAV_ADMIN = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'usuarios', icon: '👥', label: 'Usuarios' },
  { key: 'alumnos', icon: '🎓', label: 'Alumnos' },
  { key: 'docentes', icon: '👨‍🏫', label: 'Docentes' },
  { key: 'cursos', icon: '🏫', label: 'Cursos' },
  { key: 'materias', icon: '📚', label: 'Materias' },
  { key: 'asignaciones', icon: '🔗', label: 'Asignaciones' },
  { key: 'cuotas', icon: '💳', label: 'Cuotas' },
  { key: 'becas', icon: '🎟️', label: 'Becas' },
  { key: 'sueldos', icon: '💼', label: 'Sueldos' },
  { key: 'compras', icon: '🧪', label: 'Compras insumos' },
  { key: 'inscripciones', icon: '📋', label: 'Inscripciones' },
  { key: 'actividades', icon: '🎨', label: 'Extracurriculares' },
  { key: 'reservas', icon: '🏟️', label: 'Reservas' },
  { key: 'mensajes', icon: '✉️', label: 'Mensajes' },
  { key: 'noticias', icon: '📰', label: 'Noticias' },
  { key: 'galeria', icon: '🖼️', label: 'Galería' },
]

const NAV_DOCENTE = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'asistencia', icon: '📅', label: 'Tomar asistencia' },
  { key: 'calificaciones', icon: '📝', label: 'Calificaciones' },
  { key: 'amonestaciones', icon: '⚠️', label: 'Amonestaciones' },
  { key: 'reservas', icon: '🏟️', label: 'Reservas' },
]

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<UsuarioPanel | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [prefillUsuario, setPrefillUsuario] = useState<PrefillUsuario | null>(
    null,
  )

  const irARegistrarUsuario = useCallback((data: PrefillUsuario) => {
    setPrefillUsuario(data)
    setActiveNav('usuarios')
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', user.id)
      .single()
      .then(({ data }) => {
        if (data) setPerfil(data as UsuarioPanel)
        setLoading(false)
      })
  }, [user])

  if (!user || loading)
    return <LoginAdmin onLogin={setUser} loading={loading} />

  if (!perfil || !['Admin', 'Directivo', 'Docente'].includes(perfil.rol)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>
            Sin acceso
          </div>
          <p style={{ color: C.textMuted }}>
            Tu usuario no tiene permisos para este panel.
          </p>
          <button style={btnPrimary} onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </div>
      </div>
    )
  }

  const esAdmin = ['Admin', 'Directivo'].includes(perfil.rol)
  const navItems = esAdmin ? NAV_ADMIN : NAV_DOCENTE
  const initials = `${perfil.nombre[0]}${perfil.apellido[0]}`

  return (
    <div
      style={{
        fontFamily: "'Nunito','Segoe UI',sans-serif",
        background: C.bg,
        minHeight: '100vh',
        color: C.text,
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          background: C.white,
          borderBottom: `3px solid ${C.purple}`,
          padding: '0 28px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 16px rgba(91,53,197,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src='/logo.png'
            alt='Logo'
            style={{ height: 46 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: C.purple,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Educar Para Transformar
            </div>
            <div style={{ fontSize: 10, color: C.textMuted }}>
              Panel {perfil.rol}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg,${C.purple},${C.purpleMid})`,
              color: C.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>
              {perfil.nombre} {perfil.apellido}
            </div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{perfil.rol}</div>
          </div>
          <button
            style={{ ...btnSecondary, padding: '7px 14px', fontSize: 12 }}
            onClick={() => supabase.auth.signOut()}
          >
            Salir
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 68px)' }}>
        {/* ── SIDEBAR ── */}
        <aside
          style={{
            width: 220,
            background: C.white,
            borderRight: `1px solid ${C.border}`,
            padding: '20px 0',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: C.textMuted,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              padding: '0 20px 14px',
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 6,
            }}
          >
            Menú
          </div>
          {navItems.map((item) => (
            <div
              key={item.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 20px',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: activeNav === item.key ? 800 : 600,
                color: activeNav === item.key ? C.purple : C.textMuted,
                background: activeNav === item.key ? C.purpleLight : 'none',
                borderLeft:
                  activeNav === item.key
                    ? `3px solid ${C.purple}`
                    : '3px solid transparent',
                transition: 'all 0.15s',
              }}
              onClick={() => setActiveNav(item.key)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* ── CONTENIDO ── */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {activeNav === 'dashboard' && (
            <Dashboard esAdmin={esAdmin} perfil={perfil} />
          )}
          {activeNav === 'usuarios' && esAdmin && (
            <GestionUsuarios
              prefill={prefillUsuario}
              onPrefillConsumed={() => setPrefillUsuario(null)}
            />
          )}
          {activeNav === 'alumnos' && esAdmin && <GestionAlumnos />}
          {activeNav === 'docentes' && esAdmin && <GestionDocentes />}
          {activeNav === 'cursos' && esAdmin && <GestionCursos />}
          {activeNav === 'materias' && esAdmin && <GestionMaterias />}
          {activeNav === 'asignaciones' && esAdmin && <GestionAsignaciones />}
          {activeNav === 'cuotas' && esAdmin && <GestionCuotas />}
          {activeNav === 'becas' && esAdmin && <GestionBecas />}
          {activeNav === 'sueldos' && esAdmin && <GestionSueldos />}
          {activeNav === 'compras' && esAdmin && <GestionCompras />}
          {activeNav === 'inscripciones' && esAdmin && (
            <GestionInscripciones onRegistrar={irARegistrarUsuario} />
          )}
          {activeNav === 'mensajes' && esAdmin && <GestionMensajes />}
          {activeNav === 'actividades' && esAdmin && <GestionActividades />}
          {activeNav === 'reservas' && <GestionReservas userId={user.id} />}
          {activeNav === 'noticias' && esAdmin && (
            <GestionNoticias userId={user.id} />
          )}
          {activeNav === 'galeria' && esAdmin && (
             <GestionGaleria userId={user.id} />
           )}
          {activeNav === 'asistencia' && !esAdmin && (
            <TomarAsistencia userId={user.id} />
          )}
          {activeNav === 'calificaciones' && !esAdmin && (
            <CargarCalificaciones userId={user.id} />
          )}
          {activeNav === 'amonestaciones' && !esAdmin && (
            <GestionAmonestaciones userId={user.id} />
          )}
        </main>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN ADMIN
// ═══════════════════════════════════════════════════════════════
function LoginAdmin({
  onLogin,
  loading,
}: {
  onLogin: (u: User) => void
  loading: boolean
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: "'Nunito',sans-serif",
        }}
      >
        <p style={{ color: C.purple, fontWeight: 800 }}>Cargando...</p>
      </div>
    )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (err || !data.user) {
      setError('Credenciales incorrectas.')
      setBusy(false)
      return
    }
    onLogin(data.user)
    setBusy(false)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: "'Nunito',sans-serif",
        background: `radial-gradient(ellipse at 60% 0%, ${C.purpleLight} 0%, ${C.bg} 60%)`,
      }}
    >
      <div
        style={{ ...card, width: '100%', maxWidth: 380, padding: '44px 36px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src='/logo.png'
            alt='Logo'
            style={{ height: 70, marginBottom: 12 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div style={{ fontSize: 17, fontWeight: 900, color: C.purple }}>
            Panel Administrativo
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
            Educar Para Transformar
          </div>
        </div>
        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <span style={label}>Email</span>
            <input
              type='email'
              required
              style={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='admin@email.com'
            />
          </div>
          <div>
            <span style={label}>Contraseña</span>
            <input
              type='password'
              required
              style={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
            />
          </div>
          {error && (
            <div
              style={{
                background: '#E74C3C12',
                border: '1px solid #E74C3C40',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: C.red,
                fontWeight: 700,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          <button
            type='submit'
            disabled={busy}
            style={{
              ...btnPrimary,
              padding: 14,
              fontSize: 14,
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({
  esAdmin,
  perfil,
}: {
  esAdmin: boolean
  perfil: UsuarioPanel
}) {
  const [stats, setStats] = useState({
    alumnos: 0,
    docentes: 0,
    inscripciones: 0,
    cuotasPendientes: 0,
  })

  useEffect(() => {
    if (!esAdmin) return
    Promise.all([
      supabase
        .from('alumnos')
        .select('id_alumno', { count: 'exact' })
        .eq('activo', true),
      supabase
        .from('docentes')
        .select('id_docente', { count: 'exact' })
        .eq('activo', true),
      supabase
        .from('inscripciones')
        .select('id_inscripcion', { count: 'exact' })
        .eq('estado', 'Pendiente'),
      supabase
        .from('cuotas')
        .select('id_cuota', { count: 'exact' })
        .in('estado', ['Pendiente', 'Vencida', 'En mora']),
    ]).then(([a, d, i, c]) => {
      setStats({
        alumnos: a.count ?? 0,
        docentes: d.count ?? 0,
        inscripciones: i.count ?? 0,
        cuotasPendientes: c.count ?? 0,
      })
    })
  }, [esAdmin])

  const statItems = esAdmin
    ? [
        {
          icon: '🎓',
          label: 'Alumnos activos',
          value: stats.alumnos,
          color: C.purple,
        },
        {
          icon: '👨‍🏫',
          label: 'Docentes activos',
          value: stats.docentes,
          color: C.blue,
        },
        {
          icon: '📋',
          label: 'Inscripciones pendientes',
          value: stats.inscripciones,
          color: C.orange,
        },
        {
          icon: '💳',
          label: 'Cuotas sin pagar',
          value: stats.cuotasPendientes,
          color: C.red,
        },
      ]
    : []

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 6px' }}>
          Bienvenido/a, {perfil.nombre} 👋
        </h2>
        <p style={{ color: C.textMuted, margin: 0, fontSize: 14 }}>
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {esAdmin && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {statItems.map((s) => (
            <div
              key={s.label}
              style={{ ...card, borderTop: `3px solid ${s.color}` }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: s.color }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...card }}>
        <div style={cardTitle}>Accesos rápidos</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {(esAdmin ? NAV_ADMIN : NAV_DOCENTE)
            .filter((n) => n.key !== 'dashboard')
            .map((item) => (
              <div
                key={item.key}
                style={{
                  ...card,
                  padding: '16px 20px',
                  cursor: 'pointer',
                  minWidth: 140,
                  textAlign: 'center',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  flex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow =
                    '0 6px 24px rgba(91,53,197,0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = ''
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.purple }}>
                  {item.label}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE USUARIOS (crear directivos, docentes, alumnos)
// ═══════════════════════════════════════════════════════════════
function GestionUsuarios({
  prefill,
  onPrefillConsumed,
}: {
  prefill?: PrefillUsuario | null
  onPrefillConsumed?: () => void
} = {}) {
  const [usuarios, setUsuarios] = useState<UsuarioPanel[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    rol: 'Docente',
  })
  const ALUMNO_VACIO = {
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    id_curso: '',
    obra_social: '',
  }
  const [alumnoForm, setAlumnoForm] = useState(ALUMNO_VACIO)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const [{ data: us }, { data: cu }] = await Promise.all([
      supabase.from('usuarios').select('*').order('apellido'),
      supabase.from('cursos').select('*').eq('activo', true),
    ])
    if (us) setUsuarios(us as UsuarioPanel[])
    if (cu) setCursos(cu as Curso[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!prefill) return
    setForm({
      email: prefill.email,
      password: prefill.password,
      nombre: prefill.nombre,
      apellido: prefill.apellido,
      rol: prefill.rol,
    })
    setAlumnoForm(
      prefill.alumno
        ? {
            nombre: prefill.alumno.nombre,
            apellido: prefill.alumno.apellido,
            dni: prefill.alumno.dni,
            fecha_nacimiento: prefill.alumno.fecha_nacimiento,
            id_curso: '',
            obra_social: '',
          }
        : ALUMNO_VACIO,
    )
    setMsg('')
    setShowForm(true)
    onPrefillConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill, onPrefillConsumed])

  // Crea el usuario vía edge function y luego fuerza nombre/apellido/rol en la
  // fila de `usuarios`, porque el backend desplegado no respeta esos valores
  // (los crea sin nombre y con un rol por defecto). Devuelve el id_usuario.
  const crearUsuario = async (datos: {
    email: string
    password: string
    nombre: string
    apellido: string
    rol: string
  }): Promise<{ error: string | null; id: string | null }> => {
    const { error } = await supabase.functions.invoke('crear-usuario', {
      body: datos,
    })
    if (error) return { error: error.message, id: null }

    const { data: u } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email', datos.email)
      .single()
    if (!u?.id_usuario) {
      return {
        error: 'No se encontró el usuario recién creado para completar sus datos.',
        id: null,
      }
    }
    const { error: updErr } = await supabase
      .from('usuarios')
      .update({
        nombre: datos.nombre,
        apellido: datos.apellido,
        rol: datos.rol,
      })
      .eq('id_usuario', u.id_usuario)
    if (updErr) {
      return {
        error: 'no se pudo guardar nombre/rol del usuario: ' + updErr.message,
        id: u.id_usuario,
      }
    }
    return { error: null, id: u.id_usuario }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    const { error: errUser, id: idUsuario } = await crearUsuario({
      email: form.email,
      password: form.password,
      nombre: form.nombre,
      apellido: form.apellido,
      rol: form.rol,
    })
    if (errUser) {
      setMsg('Error: ' + errUser)
      setLoading(false)
      return
    }

    // Si es Tutor: crear también el usuario del alumno (email generado desde el
    // DNI) y el registro en `alumnos` vinculado al alumno y al tutor.
    if (form.rol === 'Padre') {
      const emailAlumno = `${alumnoForm.dni}@alumno.local`
      const { error: errAlumno, id: idAlumno } = await crearUsuario({
        email: emailAlumno,
        password: alumnoForm.dni,
        nombre: alumnoForm.nombre,
        apellido: alumnoForm.apellido,
        rol: 'Alumno',
      })
      if (errAlumno) {
        setMsg(
          '⚠️ Tutor creado, pero hubo un error al crear el usuario del alumno: ' +
            errAlumno,
        )
        setLoading(false)
        load()
        return
      }

      const { error: alErr } = await supabase.from('alumnos').insert([
        {
          nombre: alumnoForm.nombre,
          apellido: alumnoForm.apellido,
          dni: alumnoForm.dni,
          fecha_nacimiento: alumnoForm.fecha_nacimiento || null,
          id_curso: alumnoForm.id_curso ? Number(alumnoForm.id_curso) : null,
          id_usuario: idAlumno,
          id_usuario_padre: idUsuario,
          obra_social: alumnoForm.obra_social || null,
        },
      ])
      if (alErr) {
        setMsg(
          '⚠️ Usuarios creados, pero hubo un error al registrar el alumno: ' +
            alErr.message,
        )
        setLoading(false)
        load()
        return
      }
    }

    setMsg(
      form.rol === 'Padre'
        ? '✅ Tutor y alumno (usuario + registro) creados correctamente.'
        : '✅ Usuario creado correctamente.',
    )
    setForm({
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      rol: 'Docente',
    })
    setAlumnoForm(ALUMNO_VACIO)
    setShowForm(false)
    load()
    setLoading(false)
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase
      .from('usuarios')
      .update({ activo: !activo })
      .eq('id_usuario', id)
    load()
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          👥 Usuarios
        </h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Crear nuevo usuario</div>
          <form
            onSubmit={handleCreate}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            <div>
              <span style={label}>Nombre</span>
              <input
                style={input}
                required
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nombre: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Apellido</span>
              <input
                style={input}
                required
                value={form.apellido}
                onChange={(e) =>
                  setForm((p) => ({ ...p, apellido: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Email</span>
              <input
                type='email'
                style={input}
                required
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Contraseña</span>
              <input
                type='password'
                style={input}
                required
                minLength={6}
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Rol</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                value={form.rol}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rol: e.target.value }))
                }
              >
                <option value='Docente'>Docente</option>
                <option value='Directivo'>Directivo</option>
                <option value='Admin'>Admin</option>
                <option value='Alumno'>Alumno</option>
                <option value='Padre'>Tutor</option>
              </select>
            </div>

            {form.rol === 'Padre' && (
              <div
                style={{
                  gridColumn: '1/-1',
                  borderTop: `1px solid ${C.border}`,
                  paddingTop: 16,
                  marginTop: 4,
                }}
              >
                <div style={cardTitle}>Datos del alumno asociado</div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                  }}
                >
                  <div>
                    <span style={label}>Nombre del alumno</span>
                    <input
                      style={input}
                      required
                      value={alumnoForm.nombre}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({ ...p, nombre: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span style={label}>Apellido del alumno</span>
                    <input
                      style={input}
                      required
                      value={alumnoForm.apellido}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({
                          ...p,
                          apellido: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <span style={label}>DNI del alumno</span>
                    <input
                      style={input}
                      required
                      value={alumnoForm.dni}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({ ...p, dni: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <span style={label}>Fecha de nacimiento</span>
                    <input
                      type='date'
                      style={input}
                      value={alumnoForm.fecha_nacimiento}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({
                          ...p,
                          fecha_nacimiento: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <span style={label}>Curso</span>
                    <select
                      style={{ ...input, appearance: 'none' as const }}
                      value={alumnoForm.id_curso}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({
                          ...p,
                          id_curso: e.target.value,
                        }))
                      }
                    >
                      <option value=''>Sin asignar</option>
                      {cursos.map((c) => (
                        <option key={c.id_curso} value={c.id_curso}>
                          {c.nivel} — {c.grado_anio} "{c.division}"
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={label}>Obra social</span>
                    <input
                      style={input}
                      value={alumnoForm.obra_social}
                      onChange={(e) =>
                        setAlumnoForm((p) => ({
                          ...p,
                          obra_social: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 12,
                    color: C.textMuted,
                    background: C.purpleLight,
                    borderRadius: 8,
                    padding: '8px 12px',
                  }}
                >
                  Acceso del alumno al portal — email:{' '}
                  <strong>
                    {alumnoForm.dni
                      ? `${alumnoForm.dni}@alumno.local`
                      : '(se genera con el DNI)'}
                  </strong>{' '}
                  · contraseña: <strong>el DNI</strong>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type='submit'
                disabled={loading}
                style={{
                  ...btnPrimary,
                  width: '100%',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading
                  ? 'Creando...'
                  : form.rol === 'Padre'
                    ? 'Crear tutor y alumno'
                    : 'Crear usuario'}
              </button>
            </div>
            {msg && (
              <div
                style={{
                  gridColumn: '1/-1',
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tabla */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Nombre</th>
              <th style={th}>Email</th>
              <th style={th}>Rol</th>
              <th style={th}>Estado</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id_usuario}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {u.apellido}, {u.nombre}
                </td>
                <td style={{ ...td, color: C.textMuted }}>{u.email}</td>
                <td style={td}>
                  <span
                    style={badge(
                      u.rol === 'Admin' || u.rol === 'Directivo'
                        ? C.purple
                        : C.blue,
                    )}
                  >
                    {u.rol}
                  </span>
                </td>
                <td style={td}>
                  <span style={badge(u.activo ? C.green : C.red)}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={td}>
                  <button
                    style={
                      u.activo
                        ? btnDanger
                        : {
                            ...btnDanger,
                            background: '#27AE601A',
                            color: C.green,
                          }
                    }
                    onClick={() => toggleActivo(u.id_usuario, u.activo)}
                  >
                    {u.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE ALUMNOS
// ═══════════════════════════════════════════════════════════════
function GestionAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [legajoId, setLegajoId] = useState<number | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    fecha_nacimiento: '',
    id_curso: '',
    email_padre: '',
    obra_social: '',
  })

  const load = useCallback(async () => {
    const [{ data: al }, { data: cu }] = await Promise.all([
      supabase
        .from('alumnos')
        .select('*, cursos(nivel, grado_anio, division)')
        .order('apellido'),
      supabase.from('cursos').select('*').eq('activo', true),
    ])
    if (al) setAlumnos(al as unknown as Alumno[])
    if (cu) setCursos(cu as Curso[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    // Buscar usuario padre por email
    const { data: padre } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('email', form.email_padre)
      .single()
    const { error } = await supabase.from('alumnos').insert([
      {
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        fecha_nacimiento: form.fecha_nacimiento,
        id_curso: form.id_curso ? Number(form.id_curso) : null,
        id_usuario_padre: padre?.id_usuario ?? null,
        obra_social: form.obra_social || null,
      },
    ])
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('✅ Alumno registrado.')
      setShowForm(false)
      load()
    }
    setLoading(false)
  }

  if (legajoId !== null) {
    return (
      <LegajoAlumno idAlumno={legajoId} onClose={() => setLegajoId(null)} />
    )
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🎓 Alumnos</h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo alumno'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Registrar alumno</div>
          <form
            onSubmit={handleCreate}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}
          >
            <div>
              <span style={label}>Nombre</span>
              <input
                style={input}
                required
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nombre: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Apellido</span>
              <input
                style={input}
                required
                value={form.apellido}
                onChange={(e) =>
                  setForm((p) => ({ ...p, apellido: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>DNI</span>
              <input
                style={input}
                required
                value={form.dni}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dni: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Fecha de nacimiento</span>
              <input
                type='date'
                style={input}
                required
                value={form.fecha_nacimiento}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fecha_nacimiento: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Curso</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                value={form.id_curso}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_curso: e.target.value }))
                }
              >
                <option value=''>Sin asignar</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.nivel} — {c.grado_anio} "{c.division}"
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span style={label}>Email del padre/tutor</span>
              <input
                type='email'
                style={input}
                value={form.email_padre}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email_padre: e.target.value }))
                }
                placeholder='Debe existir en usuarios'
              />
            </div>
            <div>
              <span style={label}>Obra social</span>
              <input
                style={input}
                value={form.obra_social}
                onChange={(e) =>
                  setForm((p) => ({ ...p, obra_social: e.target.value }))
                }
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type='submit'
                disabled={loading}
                style={{
                  ...btnPrimary,
                  width: '100%',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Guardando...' : 'Registrar alumno'}
              </button>
            </div>
            {msg && (
              <div
                style={{
                  gridColumn: '1/-1',
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      )}

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Alumno</th>
              <th style={th}>DNI</th>
              <th style={th}>Curso</th>
              <th style={th}>Estado</th>
              <th style={th}>Legajo</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => (
              <tr key={a.id_alumno}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {a.apellido}, {a.nombre}
                </td>
                <td style={{ ...td, color: C.textMuted }}>{a.dni}</td>
                <td style={td}>
                  {a.cursos ? (
                    `${a.cursos.nivel} — ${a.cursos.grado_anio} "${a.cursos.division}"`
                  ) : (
                    <span style={{ color: C.textMuted }}>Sin asignar</span>
                  )}
                </td>
                <td style={td}>
                  <span style={badge(a.activo ? C.green : C.red)}>
                    {a.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={td}>
                  <button
                    style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }}
                    onClick={() => setLegajoId(a.id_alumno)}
                  >
                    Ver legajo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  LEGAJO DEL ALUMNO — historial consolidado + documentación (R1/R3)
// ═══════════════════════════════════════════════════════════════
interface AlumnoLegajo {
  id_alumno: number
  nombre: string
  apellido: string
  dni: string
  fecha_nacimiento: string | null
  obra_social: string | null
  activo: boolean
  cursos: { nivel: string; grado_anio: string; division: string } | null
}

const TIPOS_DOC = [
  'DNI',
  'Partida de nacimiento',
  'Certificado médico',
  'Boletín / certificado de estudios',
  'Ficha de inscripción',
  'Otro',
]

function LegajoAlumno({
  idAlumno,
  onClose,
}: {
  idAlumno: number
  onClose: () => void
}) {
  const [alumno, setAlumno] = useState<AlumnoLegajo | null>(null)
  const [califs, setCalifs] = useState<Calificacion[]>([])
  const [asist, setAsist] = useState<{ estado: string }[]>([])
  const [amonest, setAmonest] = useState<
    { id_amonestacion: number; tipo: string; descripcion: string; fecha: string }[]
  >([])
  const [documentos, setDocumentos] = useState<DocumentoAlumno[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [docNombre, setDocNombre] = useState('')
  const [docTipo, setDocTipo] = useState(TIPOS_DOC[0])
  const [subiendo, setSubiendo] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const { data: al } = await supabase
      .from('alumnos')
      .select(
        'id_alumno, nombre, apellido, dni, fecha_nacimiento, obra_social, activo, cursos(nivel, grado_anio, division)',
      )
      .eq('id_alumno', idAlumno)
      .single()
    if (al) setAlumno(al as unknown as AlumnoLegajo)

    const { data: ca } = await supabase
      .from('calificaciones')
      .select('*, asignaciones(materias(nombre))')
      .eq('id_alumno', idAlumno)
      .order('fecha_carga', { ascending: false })
    if (ca) setCalifs(ca as unknown as Calificacion[])

    const { data: as } = await supabase
      .from('asistencias')
      .select('estado')
      .eq('id_alumno', idAlumno)
    if (as) setAsist(as as { estado: string }[])

    const { data: am } = await supabase
      .from('amonestaciones')
      .select('id_amonestacion, tipo, descripcion, fecha')
      .eq('id_alumno', idAlumno)
      .order('fecha', { ascending: false })
    if (am) setAmonest(am as typeof amonest)

    const { data: doc } = await supabase
      .from('documentos_alumno')
      .select('*')
      .eq('id_alumno', idAlumno)
      .order('fecha_carga', { ascending: false })
    if (doc) setDocumentos(doc as DocumentoAlumno[])
  }, [idAlumno])

  useEffect(() => {
    load()
  }, [load])

  const subirDocumento = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (!file) {
      setMsg('Seleccioná un archivo.')
      return
    }
    setSubiendo(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${idAlumno}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('documentos-alumnos')
        .upload(fileName, file)
      if (upErr) throw new Error(upErr.message)
      const { data } = supabase.storage
        .from('documentos-alumnos')
        .getPublicUrl(fileName)
      const { error } = await supabase.from('documentos_alumno').insert([
        {
          id_alumno: idAlumno,
          nombre: docNombre || file.name,
          tipo: docTipo,
          url_archivo: data.publicUrl,
        },
      ])
      if (error) throw new Error(error.message)
      setMsg('✅ Documento cargado.')
      setFile(null)
      setDocNombre('')
      load()
    } catch (err) {
      setMsg('Error: ' + (err as Error).message)
    } finally {
      setSubiendo(false)
    }
  }

  const eliminarDocumento = async (d: DocumentoAlumno) => {
    if (!window.confirm('¿Eliminar este documento?')) return
    if (d.url_archivo.includes('documentos-alumnos')) {
      const idx = d.url_archivo.indexOf('documentos-alumnos/')
      const path = d.url_archivo.slice(idx + 'documentos-alumnos/'.length)
      await supabase.storage.from('documentos-alumnos').remove([path])
    }
    await supabase
      .from('documentos_alumno')
      .delete()
      .eq('id_documento', d.id_documento)
    load()
  }

  // ── Derivados ──────────────────────────────────────────────
  const promedioGeneral = califs.length
    ? (califs.reduce((a, c) => a + Number(c.nota), 0) / califs.length).toFixed(2)
    : '—'

  const asistResumen = asist.reduce(
    (acc, a) => {
      acc[a.estado] = (acc[a.estado] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const totalAsist = asist.length
  const pctPresente =
    totalAsist > 0
      ? Math.round(((asistResumen['Presente'] ?? 0) / totalAsist) * 100)
      : null

  const dato = (etiqueta: string, valor: string) => (
    <div>
      <div style={{ ...label, marginBottom: 2 }}>{etiqueta}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{valor}</div>
    </div>
  )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          📁 Legajo del alumno
        </h2>
        <button style={btnSecondary} onClick={onClose}>
          ← Volver a la lista
        </button>
      </div>

      {/* Datos personales */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>Datos personales</div>
        {alumno ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 18,
            }}
          >
            {dato('Apellido y nombre', `${alumno.apellido}, ${alumno.nombre}`)}
            {dato('DNI', alumno.dni)}
            {dato(
              'Fecha de nacimiento',
              alumno.fecha_nacimiento
                ? new Date(
                    alumno.fecha_nacimiento + 'T00:00:00',
                  ).toLocaleDateString('es-AR')
                : '—',
            )}
            {dato(
              'Curso',
              alumno.cursos
                ? `${alumno.cursos.nivel} — ${alumno.cursos.grado_anio} "${alumno.cursos.division}"`
                : 'Sin asignar',
            )}
            {dato('Obra social', alumno.obra_social ?? '—')}
            {dato('Estado', alumno.activo ? 'Activo' : 'Inactivo')}
          </div>
        ) : (
          <div style={{ color: C.textMuted, fontSize: 13 }}>Cargando...</div>
        )}
      </div>

      {/* Resumen académico */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={card}>
          <div style={label}>Promedio general</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.purple }}>
            {promedioGeneral}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            {califs.length} calificaciones registradas
          </div>
        </div>
        <div style={card}>
          <div style={label}>Asistencia</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.green }}>
            {pctPresente !== null ? `${pctPresente}%` : '—'}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            {asistResumen['Presente'] ?? 0} pres. · {asistResumen['Ausente'] ?? 0}{' '}
            aus. · {asistResumen['Tarde'] ?? 0} tarde
          </div>
        </div>
        <div style={card}>
          <div style={label}>Amonestaciones</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.orange }}>
            {amonest.length}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            registradas en su trayectoria
          </div>
        </div>
      </div>

      {/* Historial de calificaciones */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>Historial de calificaciones</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Materia</th>
              <th style={th}>Trimestre</th>
              <th style={th}>Evaluación</th>
              <th style={th}>Nota</th>
              <th style={th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {califs.map((c) => (
              <tr key={c.id_calificacion}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {c.asignaciones?.materias?.nombre ?? '—'}
                </td>
                <td style={td}>{c.trimestre}°</td>
                <td style={{ ...td, color: C.textMuted }}>
                  {c.tipo_evaluacion}
                </td>
                <td style={td}>
                  <span
                    style={badge(
                      Number(c.nota) >= 6 ? C.green : C.red,
                    )}
                  >
                    {c.nota}
                  </span>
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {new Date(c.fecha_carga).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
            {califs.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={5}>
                  Sin calificaciones registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Amonestaciones */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>Amonestaciones</div>
        {amonest.length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: 13 }}>
            Sin amonestaciones registradas.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {amonest.map((a) => (
              <div
                key={a.id_amonestacion}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <span style={badge(C.orange)}>{a.tipo}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{a.descripcion}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>
                    {new Date(a.fecha).toLocaleDateString('es-AR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentación */}
      <div style={card}>
        <div style={cardTitle}>Documentación del legajo</div>
        <form
          onSubmit={subirDocumento}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            marginBottom: 18,
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <span style={label}>Nombre del documento</span>
            <input
              style={input}
              value={docNombre}
              placeholder='Ej: DNI frente y dorso'
              onChange={(e) => setDocNombre(e.target.value)}
            />
          </div>
          <div>
            <span style={label}>Tipo</span>
            <select
              style={{ ...input, width: 220, appearance: 'none' as const }}
              value={docTipo}
              onChange={(e) => setDocTipo(e.target.value)}
            >
              {TIPOS_DOC.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Archivo</span>
            <input
              type='file'
              style={{ ...input, padding: 7 }}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            type='submit'
            disabled={subiendo}
            style={{ ...btnPrimary, opacity: subiendo ? 0.6 : 1 }}
          >
            {subiendo ? 'Subiendo...' : 'Subir documento'}
          </button>
        </form>
        {msg && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
              color: msg.startsWith('✅') ? C.green : C.red,
            }}
          >
            {msg}
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Documento</th>
              <th style={th}>Tipo</th>
              <th style={th}>Fecha</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((d) => (
              <tr key={d.id_documento}>
                <td style={{ ...td, fontWeight: 700 }}>{d.nombre}</td>
                <td style={td}>
                  <span style={badge(C.blue)}>{d.tipo ?? 'Documento'}</span>
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {new Date(d.fecha_carga).toLocaleDateString('es-AR')}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a
                      href={d.url_archivo}
                      target='_blank'
                      rel='noreferrer'
                      style={{
                        ...btnSecondary,
                        padding: '6px 12px',
                        fontSize: 12,
                        textDecoration: 'none',
                      }}
                    >
                      Ver
                    </a>
                    <button
                      style={btnDanger}
                      onClick={() => eliminarDocumento(d)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {documentos.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={4}>
                  Sin documentación cargada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE DOCENTES
// ═══════════════════════════════════════════════════════════════
function GestionDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([])

  useEffect(() => {
    supabase
      .from('docentes')
      .select('*, usuarios(nombre, apellido, email)')
      .order('id_docente')
      .then(({ data }) => {
        if (data) setDocentes(data as unknown as Docente[])
      })
  }, [])

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        👨‍🏫 Docentes
      </h2>
      <div style={{ ...card, marginBottom: 12 }}>
        <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
          Para agregar docentes, primero creá el usuario desde{' '}
          <strong>Usuarios</strong> con rol <strong>Docente</strong>. El
          registro en esta tabla se crea automáticamente.
        </p>
      </div>
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Docente</th>
              <th style={th}>Email</th>
              <th style={th}>Especialidad</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((d) => (
              <tr key={d.id_docente}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {d.usuarios?.apellido}, {d.usuarios?.nombre}
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {d.usuarios?.email}
                </td>
                <td style={td}>{d.especialidad ?? '—'}</td>
                <td style={td}>
                  <span style={badge(d.activo ? C.green : C.red)}>
                    {d.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE CURSOS
// ═══════════════════════════════════════════════════════════════
function GestionCursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    nivel: 'Inicial',
    grado_anio: '',
    division: 'A',
    capacidad_maxima: '30',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('cursos')
      .select('*')
      .eq('activo', true)
      .order('nivel')
    if (data) setCursos(data as Curso[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    // Obtener período activo
    const { data: periodo } = await supabase
      .from('periodos_academicos')
      .select('id_periodo')
      .eq('activo', true)
      .single()
    const { error } = await supabase.from('cursos').insert([
      {
        nivel: form.nivel,
        grado_anio: form.grado_anio,
        division: form.division,
        capacidad_maxima: Number(form.capacidad_maxima),
        id_periodo: periodo?.id_periodo ?? null,
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('✅ Curso creado.')
      setShowForm(false)
      load()
    }
    setLoading(false)
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🏫 Cursos</h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo curso'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Crear curso</div>
          <form
            onSubmit={handleCreate}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <span style={label}>Nivel</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                value={form.nivel}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nivel: e.target.value }))
                }
              >
                <option>Inicial</option>
                <option>Primario</option>
                <option>Secundario</option>
              </select>
            </div>
            <div>
              <span style={label}>Grado / Año</span>
              <input
                style={input}
                required
                value={form.grado_anio}
                placeholder='1er Grado'
                onChange={(e) =>
                  setForm((p) => ({ ...p, grado_anio: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>División</span>
              <input
                style={input}
                required
                value={form.division}
                placeholder='A'
                onChange={(e) =>
                  setForm((p) => ({ ...p, division: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Capacidad máx.</span>
              <input
                type='number'
                style={input}
                value={form.capacidad_maxima}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacidad_maxima: e.target.value }))
                }
              />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button
                type='submit'
                disabled={loading}
                style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Guardando...' : 'Crear curso'}
              </button>
            </div>
            {msg && (
              <div
                style={{
                  gridColumn: '1/-1',
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      )}

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Nivel</th>
              <th style={th}>Grado / Año</th>
              <th style={th}>División</th>
              <th style={th}>Capacidad</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c) => (
              <tr key={c.id_curso}>
                <td style={td}>
                  <span
                    style={badge(
                      c.nivel === 'Inicial'
                        ? C.green
                        : c.nivel === 'Primario'
                          ? C.blue
                          : C.purple,
                    )}
                  >
                    {c.nivel}
                  </span>
                </td>
                <td style={{ ...td, fontWeight: 700 }}>{c.grado_anio}</td>
                <td style={td}>División {c.division}</td>
                <td style={{ ...td, color: C.textMuted }}>
                  {c.capacidad_maxima} alumnos
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE MATERIAS
// ═══════════════════════════════════════════════════════════════
function GestionMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nombre: '', horas_semanales: '4' })
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('materias').select('*').order('nombre')
    if (data) setMaterias(data as Materia[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase
      .from('materias')
      .insert([
        { nombre: form.nombre, horas_semanales: Number(form.horas_semanales) },
      ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('✅ Materia creada.')
      setShowForm(false)
      load()
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          📚 Materias
        </h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva materia'}
        </button>
      </div>
      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <form
            onSubmit={handleCreate}
            style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}
          >
            <div style={{ flex: 2 }}>
              <span style={label}>Nombre de la materia</span>
              <input
                style={input}
                required
                value={form.nombre}
                onChange={(e) =>
                  setForm((p) => ({ ...p, nombre: e.target.value }))
                }
              />
            </div>
            <div style={{ flex: 1 }}>
              <span style={label}>Horas semanales</span>
              <input
                type='number'
                style={input}
                value={form.horas_semanales}
                onChange={(e) =>
                  setForm((p) => ({ ...p, horas_semanales: e.target.value }))
                }
              />
            </div>
            <button type='submit' style={btnPrimary}>
              Guardar
            </button>
          </form>
          {msg && (
            <div
              style={{
                marginTop: 10,
                fontSize: 13,
                fontWeight: 700,
                color: msg.startsWith('✅') ? C.green : C.red,
              }}
            >
              {msg}
            </div>
          )}
        </div>
      )}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Materia</th>
              <th style={th}>Horas semanales</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id_materia}>
                <td style={{ ...td, fontWeight: 700 }}>{m.nombre}</td>
                <td style={td}>{m.horas_semanales} hs</td>
                <td style={td}>
                  <span style={badge(m.activo ? C.green : C.red)}>
                    {m.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  ASIGNACIONES (docente + materia + curso)
// ═══════════════════════════════════════════════════════════════
function GestionAsignaciones() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [docentes, setDocentes] = useState<Docente[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    id_docente: '',
    id_materia: '',
    id_curso: '',
  })
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    const [{ data: as }, { data: do_ }, { data: ma }, { data: cu }] =
      await Promise.all([
        supabase
          .from('asignaciones')
          .select(
            '*, docentes(usuarios(nombre,apellido)), materias(nombre), cursos(nivel,grado_anio,division)',
          )
          .eq('activo', true),
        supabase
          .from('docentes')
          .select('*, usuarios(nombre,apellido)')
          .eq('activo', true),
        supabase.from('materias').select('*').eq('activo', true),
        supabase.from('cursos').select('*').eq('activo', true),
      ])
    if (as) setAsignaciones(as as unknown as Asignacion[])
    if (do_) setDocentes(do_ as unknown as Docente[])
    if (ma) setMaterias(ma as Materia[])
    if (cu) setCursos(cu as Curso[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { data: periodo } = await supabase
      .from('periodos_academicos')
      .select('id_periodo')
      .eq('activo', true)
      .single()
    const { error } = await supabase.from('asignaciones').insert([
      {
        id_docente: Number(form.id_docente),
        id_materia: Number(form.id_materia),
        id_curso: Number(form.id_curso),
        id_periodo: periodo?.id_periodo ?? null,
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('✅ Asignación creada.')
      setShowForm(false)
      load()
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          🔗 Asignaciones
        </h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva asignación'}
        </button>
      </div>
      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Asignar docente a materia y curso</div>
          <form
            onSubmit={handleCreate}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <span style={label}>Docente</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                required
                value={form.id_docente}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_docente: e.target.value }))
                }
              >
                <option value=''>Seleccioná...</option>
                {docentes.map((d) => (
                  <option key={d.id_docente} value={d.id_docente}>
                    {d.usuarios?.apellido}, {d.usuarios?.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span style={label}>Materia</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                required
                value={form.id_materia}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_materia: e.target.value }))
                }
              >
                <option value=''>Seleccioná...</option>
                {materias.map((m) => (
                  <option key={m.id_materia} value={m.id_materia}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span style={label}>Curso</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                required
                value={form.id_curso}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_curso: e.target.value }))
                }
              >
                <option value=''>Seleccioná...</option>
                {cursos.map((c) => (
                  <option key={c.id_curso} value={c.id_curso}>
                    {c.nivel} — {c.grado_anio} "{c.division}"
                  </option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <button type='submit' style={btnPrimary}>
                Crear asignación
              </button>
            </div>
            {msg && (
              <div
                style={{
                  gridColumn: '1/-1',
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      )}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Docente</th>
              <th style={th}>Materia</th>
              <th style={th}>Curso</th>
            </tr>
          </thead>
          <tbody>
            {asignaciones.map((a) => (
              <tr key={a.id_asignacion}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {a.docentes?.usuarios?.apellido},{' '}
                  {a.docentes?.usuarios?.nombre}
                </td>
                <td style={td}>{a.materias?.nombre}</td>
                <td style={td}>
                  {a.cursos?.nivel} — {a.cursos?.grado_anio} "
                  {a.cursos?.division}"
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  CUOTAS — Generación automática
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
//  NOTIFICACIONES AUTOMÁTICAS A LAS FAMILIAS (R6)
//  Crea avisos en la tabla `notificaciones`, dirigidos al usuario
//  del padre/tutor (o, si no tiene, al del propio alumno).
// ═══════════════════════════════════════════════════════════════
async function notificarFamilias(
  items: { id_alumno: number; titulo: string; mensaje: string }[],
  tipo: string,
) {
  if (items.length === 0) return
  const ids = [...new Set(items.map((i) => i.id_alumno))]
  const { data: alumnos } = await supabase
    .from('alumnos')
    .select('id_alumno, id_usuario, id_usuario_padre')
    .in('id_alumno', ids)

  const destinoPorAlumno: Record<number, string> = {}
  ;(alumnos ?? []).forEach(
    (a: {
      id_alumno: number
      id_usuario: string | null
      id_usuario_padre: string | null
    }) => {
      const destino = a.id_usuario_padre ?? a.id_usuario
      if (destino) destinoPorAlumno[a.id_alumno] = destino
    },
  )

  const rows = items
    .filter((i) => destinoPorAlumno[i.id_alumno])
    .map((i) => ({
      id_usuario_destino: destinoPorAlumno[i.id_alumno],
      titulo: i.titulo,
      mensaje: i.mensaje,
      tipo,
      leida: false,
    }))

  if (rows.length) await supabase.from('notificaciones').insert(rows)
}

function GestionCuotas() {
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    monto_base: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('cuotas')
      .select('*, alumnos(nombre, apellido)')
      .order('fecha_vencimiento', { ascending: false })
      .limit(50)
    if (data) setCuotas(data as unknown as Cuota[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const generarCuotas = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    // Traer todos los alumnos activos
    const { data: alumnos } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .eq('activo', true)
    if (!alumnos || alumnos.length === 0) {
      setMsg('No hay alumnos activos.')
      setLoading(false)
      return
    }

    const mes = Number(form.mes)
    const anio = Number(form.anio)
    const vencimiento = new Date(anio, mes - 1, 10) // vence el 10 de cada mes
    const montoBase = Number(form.monto_base)

    // Becas activas → mapa id_alumno → porcentaje de descuento
    const { data: becas } = await supabase
      .from('becas')
      .select('id_alumno, porcentaje')
      .eq('activo', true)
    const becaPorAlumno: Record<number, number> = {}
    ;(becas ?? []).forEach((b: { id_alumno: number; porcentaje: number }) => {
      becaPorAlumno[b.id_alumno] = Number(b.porcentaje)
    })

    const cuotasNuevas = alumnos.map((a) => {
      const pct = becaPorAlumno[a.id_alumno] ?? 0
      return {
        id_alumno: a.id_alumno,
        mes,
        anio,
        monto_base: montoBase,
        recargo: 0,
        descuento: Math.round((montoBase * pct) / 100),
        fecha_vencimiento: vencimiento.toISOString().split('T')[0],
        estado: 'Pendiente',
      }
    })

    // upsert para no duplicar si ya existen
    const { error } = await supabase
      .from('cuotas')
      .upsert(cuotasNuevas, { onConflict: 'id_alumno,mes,anio' })
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg(
        `✅ ${alumnos.length} cuotas generadas para ${MESES[mes - 1]} ${anio}.`,
      )
      load()
    }
    setLoading(false)
  }

  // R6 · Marca como vencidas las cuotas impagas pasadas de fecha
  //       y notifica automáticamente a las familias.
  const procesarVencimientos = async () => {
    setLoading(true)
    setMsg('')
    const hoy = new Date().toISOString().slice(0, 10)
    const { data: vencidas } = await supabase
      .from('cuotas')
      .select('id_cuota, id_alumno, mes, anio')
      .eq('estado', 'Pendiente')
      .lt('fecha_vencimiento', hoy)
    if (!vencidas || vencidas.length === 0) {
      setMsg('No hay cuotas pendientes que hayan vencido.')
      setLoading(false)
      return
    }
    await supabase
      .from('cuotas')
      .update({ estado: 'Vencida' })
      .in(
        'id_cuota',
        vencidas.map((c) => c.id_cuota),
      )
    await notificarFamilias(
      vencidas.map((c) => ({
        id_alumno: c.id_alumno,
        titulo: 'Cuota vencida',
        mensaje: `La cuota de ${MESES[c.mes - 1]} ${c.anio} se encuentra vencida. Te pedimos regularizar el pago.`,
      })),
      'Cuota',
    )
    setMsg(
      `✅ ${vencidas.length} cuota(s) marcadas como vencidas y familias notificadas.`,
    )
    load()
    setLoading(false)
  }

  const CUOTA_COLOR: Record<string, string> = {
    Pendiente: C.orange,
    Pagada: C.green,
    Vencida: C.red,
    'En mora': '#C0392B',
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        💳 Cuotas
      </h2>

      {/* Generador */}
      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>
          Generar cuotas automáticamente para todos los alumnos
        </div>
        <form
          onSubmit={generarCuotas}
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={label}>Mes</span>
            <select
              style={{ ...input, width: 160, appearance: 'none' as const }}
              value={form.mes}
              onChange={(e) => setForm((p) => ({ ...p, mes: e.target.value }))}
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Año</span>
            <input
              style={{ ...input, width: 100 }}
              value={form.anio}
              onChange={(e) => setForm((p) => ({ ...p, anio: e.target.value }))}
            />
          </div>
          <div>
            <span style={label}>Monto base ($)</span>
            <input
              type='number'
              style={{ ...input, width: 160 }}
              required
              value={form.monto_base}
              onChange={(e) =>
                setForm((p) => ({ ...p, monto_base: e.target.value }))
              }
              placeholder='15000'
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Generando...' : '⚡ Generar cuotas'}
          </button>
          <button
            type='button'
            disabled={loading}
            onClick={procesarVencimientos}
            style={{ ...btnSecondary, opacity: loading ? 0.6 : 1 }}
            title='Marca como vencidas las cuotas impagas pasadas de fecha y notifica a las familias'
          >
            ⏰ Procesar vencimientos
          </button>
        </form>
        {msg && (
          <div
            style={{
              marginTop: 12,
              fontSize: 13,
              fontWeight: 700,
              color: msg.startsWith('✅') ? C.green : C.red,
            }}
          >
            {msg}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div style={card}>
        <div style={cardTitle}>Últimas cuotas generadas</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Alumno</th>
              <th style={th}>Período</th>
              <th style={th}>Monto base</th>
              <th style={th}>Descuento beca</th>
              <th style={th}>Neto a pagar</th>
              <th style={th}>Vencimiento</th>
              <th style={th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.map((c) => {
              const desc = c.descuento ?? 0
              return (
                <tr key={c.id_cuota}>
                  <td style={{ ...td, fontWeight: 700 }}>
                    {c.alumnos?.apellido}, {c.alumnos?.nombre}
                  </td>
                  <td style={td}>
                    {MESES[c.mes - 1]} {c.anio}
                  </td>
                  <td style={td}>
                    ${c.monto_base.toLocaleString('es-AR')}
                  </td>
                  <td style={{ ...td, color: desc > 0 ? C.green : C.textMuted }}>
                    {desc > 0 ? `– $${desc.toLocaleString('es-AR')}` : '—'}
                  </td>
                  <td style={{ ...td, fontWeight: 800, color: C.purple }}>
                    ${(c.monto_base - desc).toLocaleString('es-AR')}
                  </td>
                  <td style={{ ...td, color: C.textMuted }}>
                    {c.fecha_vencimiento}
                  </td>
                  <td style={td}>
                    <span style={badge(CUOTA_COLOR[c.estado] ?? C.textMuted)}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  BECAS (R4)
// ═══════════════════════════════════════════════════════════════
function GestionBecas() {
  const [becas, setBecas] = useState<Beca[]>([])
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    id_alumno: '',
    porcentaje: '',
    motivo: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('becas')
      .select('*, alumnos(nombre, apellido)')
      .order('fecha_otorgamiento', { ascending: false })
    if (data) setBecas(data as unknown as Beca[])

    const { data: al } = await supabase
      .from('alumnos')
      .select('id_alumno, nombre, apellido, dni, activo, cursos(nivel, grado_anio, division)')
      .eq('activo', true)
      .order('apellido', { ascending: true })
    if (al) setAlumnos(al as unknown as Alumno[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const pct = Number(form.porcentaje)
    if (pct <= 0 || pct > 100) {
      setMsg('El porcentaje debe estar entre 1 y 100.')
      return
    }
    // upsert: una beca por alumno (unique id_alumno)
    const { error } = await supabase.from('becas').upsert(
      [
        {
          id_alumno: Number(form.id_alumno),
          porcentaje: pct,
          motivo: form.motivo || null,
          activo: true,
        },
      ],
      { onConflict: 'id_alumno' },
    )
    if (error) setMsg('Error: ' + error.message)
    else {
      setForm({ id_alumno: '', porcentaje: '', motivo: '' })
      load()
    }
  }

  const toggleActivo = async (b: Beca) => {
    await supabase
      .from('becas')
      .update({ activo: !b.activo })
      .eq('id_beca', b.id_beca)
    load()
  }

  const eliminar = async (id: number) => {
    await supabase.from('becas').delete().eq('id_beca', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        🎟️ Becas
      </h2>

      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>Otorgar / actualizar beca</div>
        <form
          onSubmit={guardar}
          style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 240px' }}>
            <span style={label}>Alumno</span>
            <select
              style={{ ...input, appearance: 'none' as const }}
              required
              value={form.id_alumno}
              onChange={(e) =>
                setForm((p) => ({ ...p, id_alumno: e.target.value }))
              }
            >
              <option value=''>Seleccioná un alumno...</option>
              {alumnos.map((a) => (
                <option key={a.id_alumno} value={a.id_alumno}>
                  {a.apellido}, {a.nombre} — DNI {a.dni}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Descuento (%)</span>
            <input
              style={{ ...input, width: 130 }}
              type='number'
              min={1}
              max={100}
              required
              value={form.porcentaje}
              onChange={(e) =>
                setForm((p) => ({ ...p, porcentaje: e.target.value }))
              }
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <span style={label}>Motivo (opcional)</span>
            <input
              style={input}
              value={form.motivo}
              placeholder='Ej: beca por hermanos'
              onChange={(e) =>
                setForm((p) => ({ ...p, motivo: e.target.value }))
              }
            />
          </div>
          <button type='submit' style={btnPrimary}>
            Guardar beca
          </button>
        </form>
        {msg && (
          <div style={{ marginTop: 12, fontSize: 12, color: C.red, fontWeight: 700 }}>
            {msg}
          </div>
        )}
        <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>
          El descuento se aplica automáticamente al generar las cuotas del mes.
        </div>
      </div>

      <div style={card}>
        <div style={cardTitle}>Becas otorgadas</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Alumno</th>
              <th style={th}>Descuento</th>
              <th style={th}>Motivo</th>
              <th style={th}>Estado</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {becas.map((b) => (
              <tr key={b.id_beca}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {b.alumnos?.apellido}, {b.alumnos?.nombre}
                </td>
                <td style={td}>
                  <span style={badge(C.green)}>{b.porcentaje}%</span>
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {b.motivo ?? '—'}
                </td>
                <td style={td}>
                  <span style={badge(b.activo ? C.green : C.textMuted)}>
                    {b.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }}
                      onClick={() => toggleActivo(b)}
                    >
                      {b.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button style={btnDanger} onClick={() => eliminar(b.id_beca)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {becas.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={5}>
                  No hay becas otorgadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SUELDOS (R4)
// ═══════════════════════════════════════════════════════════════
function GestionSueldos() {
  const [sueldos, setSueldos] = useState<Sueldo[]>([])
  const [personal, setPersonal] = useState<UsuarioPanel[]>([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    id_usuario: '',
    mes: String(new Date().getMonth() + 1),
    anio: String(new Date().getFullYear()),
    monto: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('sueldos')
      .select('*, usuarios(nombre, apellido, rol)')
      .order('anio', { ascending: false })
      .order('mes', { ascending: false })
    if (data) setSueldos(data as unknown as Sueldo[])

    const { data: us } = await supabase
      .from('usuarios')
      .select('*')
      .in('rol', ['Admin', 'Directivo', 'Docente'])
      .eq('activo', true)
      .order('apellido', { ascending: true })
    if (us) setPersonal(us as UsuarioPanel[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('sueldos').insert([
      {
        id_usuario: form.id_usuario,
        mes: Number(form.mes),
        anio: Number(form.anio),
        monto: Number(form.monto),
        estado: 'Pendiente',
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setForm((p) => ({ ...p, id_usuario: '', monto: '' }))
      load()
    }
  }

  const marcarPagado = async (id: number) => {
    await supabase
      .from('sueldos')
      .update({
        estado: 'Pagado',
        fecha_pago: new Date().toISOString().slice(0, 10),
      })
      .eq('id_sueldo', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        💼 Sueldos del personal
      </h2>

      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>Registrar pago de sueldo</div>
        <form
          onSubmit={registrar}
          style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div style={{ flex: '1 1 240px' }}>
            <span style={label}>Personal</span>
            <select
              style={{ ...input, appearance: 'none' as const }}
              required
              value={form.id_usuario}
              onChange={(e) =>
                setForm((p) => ({ ...p, id_usuario: e.target.value }))
              }
            >
              <option value=''>Seleccioná...</option>
              {personal.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.apellido}, {u.nombre} ({u.rol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Mes</span>
            <select
              style={{ ...input, width: 150, appearance: 'none' as const }}
              value={form.mes}
              onChange={(e) => setForm((p) => ({ ...p, mes: e.target.value }))}
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Año</span>
            <input
              style={{ ...input, width: 100 }}
              value={form.anio}
              onChange={(e) => setForm((p) => ({ ...p, anio: e.target.value }))}
            />
          </div>
          <div>
            <span style={label}>Monto ($)</span>
            <input
              style={{ ...input, width: 150 }}
              type='number'
              required
              value={form.monto}
              onChange={(e) => setForm((p) => ({ ...p, monto: e.target.value }))}
              placeholder='350000'
            />
          </div>
          <button type='submit' style={btnPrimary}>
            Registrar
          </button>
        </form>
        {msg && (
          <div style={{ marginTop: 12, fontSize: 12, color: C.red, fontWeight: 700 }}>
            {msg}
          </div>
        )}
      </div>

      <div style={card}>
        <div style={cardTitle}>Sueldos registrados</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Personal</th>
              <th style={th}>Período</th>
              <th style={th}>Monto</th>
              <th style={th}>Estado</th>
              <th style={th}>Pagado el</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {sueldos.map((s) => (
              <tr key={s.id_sueldo}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {s.usuarios
                    ? `${s.usuarios.apellido}, ${s.usuarios.nombre}`
                    : '—'}
                  {s.usuarios && (
                    <>
                      <br />
                      <span style={{ fontSize: 11, color: C.textMuted }}>
                        {s.usuarios.rol}
                      </span>
                    </>
                  )}
                </td>
                <td style={td}>
                  {MESES[s.mes - 1]} {s.anio}
                </td>
                <td style={{ ...td, fontWeight: 800, color: C.purple }}>
                  ${Number(s.monto).toLocaleString('es-AR')}
                </td>
                <td style={td}>
                  <span
                    style={badge(s.estado === 'Pagado' ? C.green : C.orange)}
                  >
                    {s.estado}
                  </span>
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {s.fecha_pago ?? '—'}
                </td>
                <td style={td}>
                  {s.estado !== 'Pagado' && (
                    <button
                      style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }}
                      onClick={() => marcarPagado(s.id_sueldo)}
                    >
                      Marcar pagado
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {sueldos.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={6}>
                  No hay sueldos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  COMPRAS DE INSUMOS (R4)
// ═══════════════════════════════════════════════════════════════
const DESTINOS_INSUMO = [
  'Laboratorio de computación',
  'Laboratorio de física',
  'Laboratorio de química',
  'Enfermería',
]

function GestionCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [msg, setMsg] = useState('')
  const FORM_VACIO = {
    descripcion: '',
    destino: DESTINOS_INSUMO[0],
    cantidad: '1',
    monto: '',
    proveedor: '',
    fecha_compra: new Date().toISOString().slice(0, 10),
  }
  const [form, setForm] = useState(FORM_VACIO)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('compras_insumos')
      .select('*')
      .order('fecha_compra', { ascending: false })
    if (data) setCompras(data as Compra[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('compras_insumos').insert([
      {
        descripcion: form.descripcion,
        destino: form.destino,
        cantidad: Number(form.cantidad),
        monto: Number(form.monto),
        proveedor: form.proveedor || null,
        fecha_compra: form.fecha_compra,
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setForm(FORM_VACIO)
      load()
    }
  }

  const eliminar = async (id: number) => {
    await supabase.from('compras_insumos').delete().eq('id_compra', id)
    load()
  }

  const totalGastado = compras.reduce((acc, c) => acc + Number(c.monto), 0)

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        🧪 Compras de insumos
      </h2>

      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>Registrar compra</div>
        <form
          onSubmit={registrar}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1.5fr',
              gap: 14,
            }}
          >
            <div>
              <span style={label}>Descripción</span>
              <input
                style={input}
                required
                value={form.descripcion}
                placeholder='Ej: 10 tubos de ensayo'
                onChange={(e) =>
                  setForm((p) => ({ ...p, descripcion: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Destino</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                value={form.destino}
                onChange={(e) =>
                  setForm((p) => ({ ...p, destino: e.target.value }))
                }
              >
                {DESTINOS_INSUMO.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1.5fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <span style={label}>Cantidad</span>
              <input
                style={input}
                type='number'
                min={1}
                required
                value={form.cantidad}
                onChange={(e) =>
                  setForm((p) => ({ ...p, cantidad: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Monto total ($)</span>
              <input
                style={input}
                type='number'
                required
                value={form.monto}
                onChange={(e) =>
                  setForm((p) => ({ ...p, monto: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Proveedor (opcional)</span>
              <input
                style={input}
                value={form.proveedor}
                onChange={(e) =>
                  setForm((p) => ({ ...p, proveedor: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Fecha</span>
              <input
                style={input}
                type='date'
                value={form.fecha_compra}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fecha_compra: e.target.value }))
                }
              />
            </div>
          </div>
          {msg && (
            <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>
              {msg}
            </div>
          )}
          <button type='submit' style={{ ...btnPrimary, alignSelf: 'flex-start' }}>
            Registrar compra
          </button>
        </form>
      </div>

      <div style={card}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div style={{ ...cardTitle, marginBottom: 0 }}>
            Compras registradas
          </div>
          <span style={badge(C.purple)}>
            Total: ${totalGastado.toLocaleString('es-AR')}
          </span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Descripción</th>
              <th style={th}>Destino</th>
              <th style={th}>Cant.</th>
              <th style={th}>Monto</th>
              <th style={th}>Proveedor</th>
              <th style={th}>Fecha</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {compras.map((c) => (
              <tr key={c.id_compra}>
                <td style={{ ...td, fontWeight: 700 }}>{c.descripcion}</td>
                <td style={td}>
                  <span style={badge(C.blue)}>{c.destino}</span>
                </td>
                <td style={td}>{c.cantidad}</td>
                <td style={{ ...td, fontWeight: 800, color: C.purple }}>
                  ${Number(c.monto).toLocaleString('es-AR')}
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {c.proveedor ?? '—'}
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {c.fecha_compra}
                </td>
                <td style={td}>
                  <button
                    style={btnDanger}
                    onClick={() => eliminar(c.id_compra)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {compras.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={7}>
                  No hay compras registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  INSCRIPCIONES
// ═══════════════════════════════════════════════════════════════
function GestionInscripciones({
  onRegistrar,
}: {
  onRegistrar: (data: PrefillUsuario) => void
}) {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([])

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('inscripciones')
      .select('*')
      .order('fecha_solicitud', { ascending: false })
    if (data) setInscripciones(data as Inscripcion[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const cambiarEstado = async (id: number, estado: string) => {
    await supabase
      .from('inscripciones')
      .update({ estado })
      .eq('id_inscripcion', id)
    load()
  }

  const ESTADOS = [
    'Pendiente',
    'En revisión',
    'Aprobada',
    'Rechazada',
    'En lista de espera',
  ]
  const EST_COLOR: Record<string, string> = {
    Pendiente: C.orange,
    'En revisión': C.blue,
    Aprobada: C.green,
    Rechazada: C.red,
    'En lista de espera': C.textMuted,
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        📋 Inscripciones
      </h2>
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Aspirante</th>
              <th style={th}>Tutor</th>
              <th style={th}>Nivel</th>
              <th style={th}>Fecha</th>
              <th style={th}>Estado</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((i) => (
              <tr key={i.id_inscripcion}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {i.nombre_aspirante} {i.apellido_aspirante ?? ''}
                  <br />
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    DNI: {i.dni_aspirante}
                    {i.fecha_nacimiento_aspirante &&
                      ` · Nac: ${new Date(
                        i.fecha_nacimiento_aspirante,
                      ).toLocaleDateString('es-AR')}`}
                  </span>
                </td>
                <td style={td}>
                  {i.nombre_tutor}
                  <br />
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    {i.email_tutor}
                  </span>
                </td>
                <td style={td}>
                  <span style={badge(C.purple)}>{i.nivel_solicitado}</span>
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {new Date(i.fecha_solicitud).toLocaleDateString('es-AR')}
                </td>
                <td style={td}>
                  <span style={badge(EST_COLOR[i.estado] ?? C.textMuted)}>
                    {i.estado}
                  </span>
                </td>
                <td style={td}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <select
                      style={{
                        ...input,
                        width: 160,
                        padding: '6px 10px',
                        appearance: 'none' as const,
                      }}
                      value={i.estado}
                      onChange={(e) =>
                        cambiarEstado(i.id_inscripcion, e.target.value)
                      }
                    >
                      {ESTADOS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      style={{
                        ...btnPrimary,
                        width: 160,
                        padding: '6px 10px',
                        fontSize: 12,
                      }}
                      onClick={() => {
                        const partes = i.nombre_tutor.trim().split(/\s+/)
                        onRegistrar({
                          nombre: partes[0] ?? '',
                          apellido: partes.slice(1).join(' '),
                          email: i.email_tutor,
                          password: i.dni_aspirante,
                          rol: 'Padre',
                          alumno: {
                            nombre: i.nombre_aspirante,
                            apellido: i.apellido_aspirante ?? '',
                            dni: i.dni_aspirante,
                            fecha_nacimiento: i.fecha_nacimiento_aspirante ?? '',
                          },
                        })
                      }}
                    >
                      Registrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  ACTIVIDADES EXTRACURRICULARES (R2)
// ═══════════════════════════════════════════════════════════════
function GestionActividades() {
  const [actividades, setActividades] = useState<ActividadEx[]>([])
  const [conteos, setConteos] = useState<Record<number, number>>({})
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const FORM_VACIO = {
    nombre: '',
    tipo: 'Idioma',
    descripcion: '',
    cupo_maximo: 20,
  }
  const [form, setForm] = useState(FORM_VACIO)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('actividades_extracurriculares')
      .select('*')
      .order('tipo', { ascending: true })
      .order('nombre', { ascending: true })
    if (data) setActividades(data as ActividadEx[])

    const { data: insc } = await supabase
      .from('inscripciones_actividades')
      .select('id_actividad')
    const cnt: Record<number, number> = {}
    ;(insc ?? []).forEach((i: { id_actividad: number }) => {
      cnt[i.id_actividad] = (cnt[i.id_actividad] ?? 0) + 1
    })
    setConteos(cnt)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const abrirNueva = () => {
    setEditId(null)
    setForm(FORM_VACIO)
    setShowForm(true)
  }

  const abrirEdicion = (a: ActividadEx) => {
    setEditId(a.id_actividad)
    setForm({
      nombre: a.nombre,
      tipo: a.tipo,
      descripcion: a.descripcion ?? '',
      cupo_maximo: a.cupo_maximo,
    })
    setShowForm(true)
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const payload = { ...form, cupo_maximo: Number(form.cupo_maximo) }
    const { error } = editId
      ? await supabase
          .from('actividades_extracurriculares')
          .update(payload)
          .eq('id_actividad', editId)
      : await supabase
          .from('actividades_extracurriculares')
          .insert([payload])
    if (error) setMsg('Error: ' + error.message)
    else {
      setShowForm(false)
      load()
    }
  }

  const toggleActivo = async (a: ActividadEx) => {
    await supabase
      .from('actividades_extracurriculares')
      .update({ activo: !a.activo })
      .eq('id_actividad', a.id_actividad)
    load()
  }

  const idiomas = actividades.filter((a) => a.tipo === 'Idioma')
  const deportes = actividades.filter((a) => a.tipo === 'Deporte')

  const renderGrupo = (titulo: string, items: ActividadEx[]) => (
    <div style={{ ...card, marginBottom: 20 }}>
      <div style={cardTitle}>{titulo}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Actividad</th>
            <th style={th}>Cupo</th>
            <th style={th}>Inscriptos</th>
            <th style={th}>Estado</th>
            <th style={th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const ocupados = conteos[a.id_actividad] ?? 0
            const completo = ocupados >= a.cupo_maximo
            return (
              <tr key={a.id_actividad}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {a.nombre}
                  {a.descripcion && (
                    <>
                      <br />
                      <span style={{ fontSize: 11, color: C.textMuted }}>
                        {a.descripcion}
                      </span>
                    </>
                  )}
                </td>
                <td style={td}>{a.cupo_maximo}</td>
                <td style={td}>
                  <span
                    style={badge(
                      completo ? C.red : ocupados > 0 ? C.green : C.textMuted,
                    )}
                  >
                    {ocupados} / {a.cupo_maximo}
                    {completo ? ' · COMPLETO' : ''}
                  </span>
                </td>
                <td style={td}>
                  <span style={badge(a.activo ? C.green : C.textMuted)}>
                    {a.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12 }}
                      onClick={() => abrirEdicion(a)}
                    >
                      Editar
                    </button>
                    <button
                      style={{ ...btnDanger }}
                      onClick={() => toggleActivo(a)}
                    >
                      {a.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {items.length === 0 && (
            <tr>
              <td style={{ ...td, color: C.textMuted }} colSpan={5}>
                Sin actividades cargadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          🎨 Actividades extracurriculares
        </h2>
        <button style={btnPrimary} onClick={abrirNueva}>
          + Nueva actividad
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>
            {editId ? 'Editar actividad' : 'Nueva actividad'}
          </div>
          <form
            onSubmit={guardar}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
              <div>
                <span style={label}>Nombre</span>
                <input
                  style={input}
                  required
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nombre: e.target.value }))
                  }
                />
              </div>
              <div>
                <span style={label}>Tipo</span>
                <select
                  style={{ ...input, appearance: 'none' as const }}
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tipo: e.target.value }))
                  }
                >
                  <option value='Idioma'>Idioma</option>
                  <option value='Deporte'>Deporte</option>
                </select>
              </div>
              <div>
                <span style={label}>Cupo máximo</span>
                <input
                  style={input}
                  type='number'
                  min={1}
                  required
                  value={form.cupo_maximo}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cupo_maximo: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <span style={label}>Descripción (opcional)</span>
              <input
                style={input}
                value={form.descripcion}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descripcion: e.target.value }))
                }
              />
            </div>
            {msg && (
              <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>
                {msg}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type='submit' style={btnPrimary}>
                {editId ? 'Guardar cambios' : 'Crear actividad'}
              </button>
              <button
                type='button'
                style={btnSecondary}
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {renderGrupo('🗣️ Idiomas', idiomas)}
      {renderGrupo('⚽ Disciplinas deportivas', deportes)}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  RESERVAS DE INSTALACIONES (R5)
// ═══════════════════════════════════════════════════════════════
function GestionReservas({ userId }: { userId: string }) {
  const [instalaciones, setInstalaciones] = useState<Instalacion[]>([])
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [msg, setMsg] = useState('')
  const FORM_VACIO = {
    id_instalacion: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
  }
  const [form, setForm] = useState(FORM_VACIO)

  const hoy = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    const { data: inst } = await supabase
      .from('instalaciones')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    if (inst) setInstalaciones(inst as Instalacion[])

    const { data: res } = await supabase
      .from('reservas_instalaciones')
      .select('*, instalaciones(nombre), usuarios(nombre, apellido)')
      .gte('fecha', new Date().toISOString().slice(0, 10))
      .order('fecha', { ascending: true })
      .order('hora_inicio', { ascending: true })
    if (res) setReservas(res as unknown as Reserva[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (form.hora_fin <= form.hora_inicio) {
      setMsg('La hora de fin debe ser posterior a la de inicio.')
      return
    }
    const { error } = await supabase.from('reservas_instalaciones').insert([
      {
        id_instalacion: Number(form.id_instalacion),
        fecha: form.fecha,
        hora_inicio: form.hora_inicio,
        hora_fin: form.hora_fin,
        motivo: form.motivo || null,
        reservado_por: userId,
      },
    ])
    if (error) {
      setMsg(
        error.message.includes('ya está reservada')
          ? '⛔ La instalación ya está reservada en ese horario. Elegí otra franja.'
          : 'Error: ' + error.message,
      )
    } else {
      setForm(FORM_VACIO)
      load()
    }
  }

  const eliminar = async (id: number) => {
    await supabase
      .from('reservas_instalaciones')
      .delete()
      .eq('id_reserva', id)
    load()
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        🏟️ Reservas de instalaciones
      </h2>

      <div style={{ ...card, marginBottom: 24 }}>
        <div style={cardTitle}>Nueva reserva</div>
        <form
          onSubmit={crear}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 14,
            }}
          >
            <div>
              <span style={label}>Instalación</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                required
                value={form.id_instalacion}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_instalacion: e.target.value }))
                }
              >
                <option value=''>Seleccioná...</option>
                {instalaciones.map((i) => (
                  <option key={i.id_instalacion} value={i.id_instalacion}>
                    {i.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span style={label}>Fecha</span>
              <input
                style={input}
                type='date'
                required
                min={hoy}
                value={form.fecha}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fecha: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Hora inicio</span>
              <input
                style={input}
                type='time'
                required
                value={form.hora_inicio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hora_inicio: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Hora fin</span>
              <input
                style={input}
                type='time'
                required
                value={form.hora_fin}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hora_fin: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <span style={label}>Motivo (opcional)</span>
            <input
              style={input}
              value={form.motivo}
              placeholder='Ej: entrenamiento de natación'
              onChange={(e) =>
                setForm((p) => ({ ...p, motivo: e.target.value }))
              }
            />
          </div>
          {msg && (
            <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>
              {msg}
            </div>
          )}
          <button type='submit' style={{ ...btnPrimary, alignSelf: 'flex-start' }}>
            Reservar
          </button>
        </form>
      </div>

      <div style={card}>
        <div style={cardTitle}>Próximas reservas</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Instalación</th>
              <th style={th}>Fecha</th>
              <th style={th}>Horario</th>
              <th style={th}>Motivo</th>
              <th style={th}>Reservó</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id_reserva}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {r.instalaciones?.nombre ?? '—'}
                </td>
                <td style={td}>
                  {new Date(r.fecha + 'T00:00:00').toLocaleDateString('es-AR')}
                </td>
                <td style={td}>
                  {r.hora_inicio.slice(0, 5)} – {r.hora_fin.slice(0, 5)}
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {r.motivo ?? '—'}
                </td>
                <td style={{ ...td, color: C.textMuted, fontSize: 12 }}>
                  {r.usuarios
                    ? `${r.usuarios.nombre} ${r.usuarios.apellido}`
                    : '—'}
                </td>
                <td style={td}>
                  <button
                    style={btnDanger}
                    onClick={() => eliminar(r.id_reserva)}
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
            {reservas.length === 0 && (
              <tr>
                <td style={{ ...td, color: C.textMuted }} colSpan={6}>
                  No hay reservas próximas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  MENSAJES DE CONTACTO
// ═══════════════════════════════════════════════════════════════
function GestionMensajes() {
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([])
  const [abierto, setAbierto] = useState<number | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('mensajes_contacto')
      .select('*')
      .order('fecha_envio', { ascending: false })
    if (data) setMensajes(data as MensajeContacto[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const marcarLeido = async (id: number, leido: boolean) => {
    await supabase
      .from('mensajes_contacto')
      .update({ leido })
      .eq('id_mensaje', id)
    load()
  }

  const sinLeer = mensajes.filter((m) => !m.leido).length

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        ✉️ Mensajes de contacto
        {sinLeer > 0 && (
          <span style={{ ...badge(C.orange), marginLeft: 10 }}>
            {sinLeer} sin leer
          </span>
        )}
      </h2>
      <div style={card}>
        {mensajes.length === 0 ? (
          <div style={{ color: C.textMuted, fontSize: 13 }}>
            No hay mensajes recibidos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensajes.map((m) => (
              <div
                key={m.id_mensaje}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 14,
                  background: m.leido ? C.white : C.purpleLight,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setAbierto(abierto === m.id_mensaje ? null : m.id_mensaje)
                  }
                >
                  <div>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>
                      {m.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: C.textMuted,
                        marginLeft: 8,
                      }}
                    >
                      {m.email}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted }}>
                    {new Date(m.fecha_envio).toLocaleString('es-AR')}
                  </span>
                </div>
                {abierto === m.id_mensaje && (
                  <div style={{ marginTop: 12 }}>
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: C.text,
                        whiteSpace: 'pre-wrap',
                        margin: '0 0 12px',
                      }}
                    >
                      {m.mensaje}
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a
                        href={`mailto:${m.email}`}
                        style={{
                          ...btnSecondary,
                          padding: '6px 14px',
                          fontSize: 12,
                          textDecoration: 'none',
                        }}
                      >
                        Responder por correo
                      </a>
                      <button
                        style={{ ...btnSecondary, padding: '6px 14px', fontSize: 12 }}
                        onClick={() => marcarLeido(m.id_mensaje, !m.leido)}
                      >
                        {m.leido ? 'Marcar como no leído' : 'Marcar como leído'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  NOTICIAS
// ═══════════════════════════════════════════════════════════════
function GestionNoticias({ userId }: { userId: string }) {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [notificar, setNotificar] = useState(true)
  const [form, setForm] = useState({
    titulo: '',
    resumen: '',
    contenido: '',
    url_imagen: '',
    destacada: false,
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('fecha_publicacion', { ascending: false })
    if (data) setNoticias(data as Noticia[])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const { error } = await supabase
      .from('noticias')
      .insert([{ ...form, id_autor: userId }])
    if (error) setMsg('Error: ' + error.message)
    else {
      let aviso = '✅ Noticia publicada.'
      // R6 · Comunicado institucional a las familias
      if (notificar) {
        const { data: todos } = await supabase
          .from('alumnos')
          .select('id_alumno')
          .eq('activo', true)
        await notificarFamilias(
          (todos ?? []).map((a: { id_alumno: number }) => ({
            id_alumno: a.id_alumno,
            titulo: 'Comunicado institucional',
            mensaje: form.titulo,
          })),
          'Novedad',
        )
        aviso = '✅ Noticia publicada y familias notificadas.'
      }
      setMsg(aviso)
      setShowForm(false)
      load()
    }
    setLoading(false)
  }

  const toggleActivo = async (id: number, activo: boolean) => {
    await supabase
      .from('noticias')
      .update({ activo: !activo })
      .eq('id_noticia', id)
    load()
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          📰 Noticias
        </h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nueva noticia'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Publicar noticia</div>
          <form
            onSubmit={handleCreate}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div>
              <span style={label}>Título</span>
              <input
                style={input}
                required
                value={form.titulo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, titulo: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>Resumen (opcional)</span>
              <input
                style={input}
                value={form.resumen}
                onChange={(e) =>
                  setForm((p) => ({ ...p, resumen: e.target.value }))
                }
              />
            </div>
            <div>
              <span style={label}>URL de imagen (opcional)</span>
              <input
                style={input}
                value={form.url_imagen}
                onChange={(e) =>
                  setForm((p) => ({ ...p, url_imagen: e.target.value }))
                }
                placeholder='https://...'
              />
            </div>
            <div>
              <span style={label}>Contenido</span>
              <textarea
                style={{
                  ...input,
                  minHeight: 120,
                  resize: 'vertical' as const,
                }}
                required
                value={form.contenido}
                onChange={(e) =>
                  setForm((p) => ({ ...p, contenido: e.target.value }))
                }
              />
            </div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type='checkbox'
                checked={form.destacada}
                onChange={(e) =>
                  setForm((p) => ({ ...p, destacada: e.target.checked }))
                }
              />
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                Marcar como destacada
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type='checkbox'
                checked={notificar}
                onChange={(e) => setNotificar(e.target.checked)}
              />
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                Notificar a las familias como comunicado institucional
              </span>
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type='submit'
                disabled={loading}
                style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
            {msg && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </div>
            )}
          </form>
        </div>
      )}

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Título</th>
              <th style={th}>Fecha</th>
              <th style={th}>Destacada</th>
              <th style={th}>Estado</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {noticias.map((n) => (
              <tr key={n.id_noticia}>
                <td style={{ ...td, fontWeight: 700, maxWidth: 300 }}>
                  {n.titulo}
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {new Date(n.fecha_publicacion).toLocaleDateString('es-AR')}
                </td>
                <td style={td}>{n.destacada ? '⭐' : '—'}</td>
                <td style={td}>
                  <span style={badge(n.activo ? C.green : C.red)}>
                    {n.activo ? 'Publicada' : 'Oculta'}
                  </span>
                </td>
                <td style={td}>
                  <button
                    style={
                      n.activo
                        ? btnDanger
                        : {
                            ...btnDanger,
                            background: '#27AE601A',
                            color: C.green,
                          }
                    }
                    onClick={() => toggleActivo(n.id_noticia, n.activo)}
                  >
                    {n.activo ? 'Ocultar' : 'Publicar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  TOMAR ASISTENCIA (Docente)
// ═══════════════════════════════════════════════════════════════
function TomarAsistencia({ userId }: { userId: string }) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [selAsignacion, setSelAsignacion] = useState<number | null>(null)
  const [alumnos, setAlumnos] = useState<AlumnoAsistencia[]>([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from('docentes')
      .select('id_docente')
      .eq('id_usuario', userId)
      .single()
      .then(({ data: doc }) => {
        if (!doc) return
        supabase
          .from('asignaciones')
          .select('*, materias(nombre), cursos(nivel, grado_anio, division)')
          .eq('id_docente', doc.id_docente)
          .eq('activo', true)
          .then(({ data }) => {
            if (data) setAsignaciones(data as unknown as Asignacion[])
          })
      })
  }, [userId])

  useEffect(() => {
    if (!selAsignacion) return
    // Cargar alumnos del curso de la asignación
    const asig = asignaciones.find((a) => a.id_asignacion === selAsignacion)
    if (!asig) return
    // Obtener el id_curso de la asignación
    supabase
      .from('asignaciones')
      .select('id_curso')
      .eq('id_asignacion', selAsignacion)
      .single()
      .then(({ data: a }) => {
        if (!a) return
        supabase
          .from('alumnos')
          .select('id_alumno, nombre, apellido')
          .eq('id_curso', a.id_curso)
          .eq('activo', true)
          .order('apellido')
          .then(({ data: al }) => {
            if (al)
              setAlumnos(al.map((a) => ({ ...a, estado: 'Presente' as const })))
          })
      })
  }, [selAsignacion, asignaciones])

  const toggleEstado = (id: number) => {
    setAlumnos((prev) =>
      prev.map((a) => {
        if (a.id_alumno !== id) return a
        const ciclo: AlumnoAsistencia['estado'][] = [
          'Presente',
          'Ausente',
          'Tarde',
          'Justificado',
        ]
        const next = ciclo[(ciclo.indexOf(a.estado) + 1) % ciclo.length]
        return { ...a, estado: next }
      }),
    )
  }

  const guardar = async () => {
    if (!selAsignacion || alumnos.length === 0) return
    setLoading(true)
    setMsg('')
    const registros = alumnos.map((a) => ({
      id_alumno: a.id_alumno,
      id_asignacion: selAsignacion,
      fecha,
      estado: a.estado,
      registrado_por: userId,
    }))
    const { error } = await supabase
      .from('asistencias')
      .upsert(registros, { onConflict: 'id_alumno,id_asignacion,fecha' })
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      // R6 · Notificación automática por inasistencia
      const ausentes = alumnos.filter((a) => a.estado === 'Ausente')
      await notificarFamilias(
        ausentes.map((a) => ({
          id_alumno: a.id_alumno,
          titulo: 'Inasistencia registrada',
          mensaje: `${a.nombre} ${a.apellido} fue registrado/a como ausente el ${new Date(
            fecha + 'T00:00:00',
          ).toLocaleDateString('es-AR')}.`,
        })),
        'Asistencia',
      )
      setMsg(
        ausentes.length > 0
          ? `✅ Asistencia guardada. Se notificó a ${ausentes.length} familia(s) por inasistencia.`
          : '✅ Asistencia guardada correctamente.',
      )
    }
    setLoading(false)
  }

  const EST_COLOR: Record<string, string> = {
    Presente: C.green,
    Ausente: C.red,
    Tarde: C.orange,
    Justificado: C.blue,
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        📅 Tomar asistencia
      </h2>

      <div style={{ ...card, marginBottom: 20 }}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={label}>Clase / Materia</span>
            <select
              style={{ ...input, width: 280, appearance: 'none' as const }}
              value={selAsignacion ?? ''}
              onChange={(e) => setSelAsignacion(Number(e.target.value))}
            >
              <option value=''>Seleccioná una clase...</option>
              {asignaciones.map((a) => (
                <option key={a.id_asignacion} value={a.id_asignacion}>
                  {a.materias?.nombre} — {a.cursos?.nivel}{' '}
                  {a.cursos?.grado_anio} "{a.cursos?.division}"
                </option>
              ))}
            </select>
          </div>
          <div>
            <span style={label}>Fecha</span>
            <input
              type='date'
              style={{ ...input, width: 160 }}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selAsignacion && alumnos.length > 0 && (
        <div style={card}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <div style={cardTitle}>
              {alumnos.length} alumnos — Tocá el estado para cambiar
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['Presente', 'Ausente', 'Tarde', 'Justificado'] as const).map(
                (e) => (
                  <span key={e} style={badge(EST_COLOR[e])}>
                    {e}
                  </span>
                ),
              )}
            </div>
          </div>

          {alumnos.map((a) => (
            <div
              key={a.id_alumno}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: `${C.purple}18`,
                    color: C.purple,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 13,
                  }}
                >
                  {a.nombre[0]}
                  {a.apellido[0]}
                </div>
                <span style={{ fontWeight: 700 }}>
                  {a.apellido}, {a.nombre}
                </span>
              </div>
              <button
                onClick={() => toggleEstado(a.id_alumno)}
                style={{
                  ...badge(EST_COLOR[a.estado]),
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  padding: '8px 20px',
                  fontSize: 13,
                  fontWeight: 800,
                  transition: 'all 0.15s',
                }}
              >
                {a.estado}
              </button>
            </div>
          ))}

          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <button
              onClick={guardar}
              disabled={loading}
              style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Guardando...' : '💾 Guardar asistencia'}
            </button>
            {msg && (
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: msg.startsWith('✅') ? C.green : C.red,
                }}
              >
                {msg}
              </span>
            )}
          </div>
        </div>
      )}

      {selAsignacion && alumnos.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: C.textMuted }}>
          No hay alumnos asignados a este curso.
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  CARGAR CALIFICACIONES (Docente)
// ═══════════════════════════════════════════════════════════════
function CargarCalificaciones({ userId }: { userId: string }) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [selAsignacion, setSelAsig] = useState<number | null>(null)
  const [calificaciones, setCals] = useState<Calificacion[]>([])
  const [alumnos, setAlumnos] = useState<
    { id_alumno: number; nombre: string; apellido: string }[]
  >([])
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    id_alumno: '',
    trimestre: '1',
    tipo_evaluacion: 'Parcial',
    nota: '',
    descripcion: '',
  })

  useEffect(() => {
    supabase
      .from('docentes')
      .select('id_docente')
      .eq('id_usuario', userId)
      .single()
      .then(({ data: doc }) => {
        if (!doc) return
        supabase
          .from('asignaciones')
          .select('*, materias(nombre), cursos(nivel, grado_anio, division)')
          .eq('id_docente', doc.id_docente)
          .eq('activo', true)
          .then(({ data }) => {
            if (data) setAsignaciones(data as unknown as Asignacion[])
          })
      })
  }, [userId])

  useEffect(() => {
    if (!selAsignacion) return
    supabase
      .from('asignaciones')
      .select('id_curso')
      .eq('id_asignacion', selAsignacion)
      .single()
      .then(({ data: a }) => {
        if (!a) return
        supabase
          .from('alumnos')
          .select('id_alumno, nombre, apellido')
          .eq('id_curso', a.id_curso)
          .eq('activo', true)
          .order('apellido')
          .then(({ data: al }) => {
            if (al) setAlumnos(al)
          })
      })
    supabase
      .from('calificaciones')
      .select('*, alumnos(nombre, apellido), asignaciones(materias(nombre))')
      .eq('id_asignacion', selAsignacion)
      .order('fecha_carga', { ascending: false })
      .then(({ data }) => {
        if (data) setCals(data as unknown as Calificacion[])
      })
  }, [selAsignacion])

  const handleCargar = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { data: periodo } = await supabase
      .from('periodos_academicos')
      .select('id_periodo')
      .eq('activo', true)
      .single()
    const { error } = await supabase.from('calificaciones').insert([
      {
        id_alumno: Number(form.id_alumno),
        id_asignacion: selAsignacion,
        id_periodo: periodo?.id_periodo ?? null,
        trimestre: Number(form.trimestre),
        tipo_evaluacion: form.tipo_evaluacion,
        nota: Number(form.nota),
        descripcion: form.descripcion || null,
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      // R6 · Notificación automática por publicación de calificación
      const asig = asignaciones.find(
        (a) => a.id_asignacion === selAsignacion,
      )
      const materia = asig?.materias?.nombre ?? 'una materia'
      await notificarFamilias(
        [
          {
            id_alumno: Number(form.id_alumno),
            titulo: 'Nueva calificación publicada',
            mensaje: `Se publicó una nota de ${materia}: ${form.nota} (${form.tipo_evaluacion}, ${form.trimestre}° trimestre).`,
          },
        ],
        'Calificación',
      )
      setMsg('✅ Nota cargada y familia notificada.')
      setForm((p) => ({ ...p, id_alumno: '', nota: '', descripcion: '' }))
      // Recargar calificaciones
      if (selAsignacion) {
        supabase
          .from('calificaciones')
          .select(
            '*, alumnos(nombre, apellido), asignaciones(materias(nombre))',
          )
          .eq('id_asignacion', selAsignacion)
          .order('fecha_carga', { ascending: false })
          .then(({ data }) => {
            if (data) setCals(data as unknown as Calificacion[])
          })
      }
    }
  }

  const notaColor = (n: number) =>
    n >= 8 ? C.green : n >= 6 ? C.orange : C.red

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        📝 Calificaciones
      </h2>

      <div style={{ ...card, marginBottom: 20 }}>
        <span style={label}>Clase / Materia</span>
        <select
          style={{ ...input, maxWidth: 360, appearance: 'none' as const }}
          value={selAsignacion ?? ''}
          onChange={(e) => setSelAsig(Number(e.target.value))}
        >
          <option value=''>Seleccioná una clase...</option>
          {asignaciones.map((a) => (
            <option key={a.id_asignacion} value={a.id_asignacion}>
              {a.materias?.nombre} — {a.cursos?.nivel} {a.cursos?.grado_anio} "
              {a.cursos?.division}"
            </option>
          ))}
        </select>
      </div>

      {selAsignacion && (
        <>
          {/* Formulario */}
          <div style={{ ...card, marginBottom: 20 }}>
            <div style={cardTitle}>Cargar nota</div>
            <form
              onSubmit={handleCargar}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: 14,
              }}
            >
              <div>
                <span style={label}>Alumno</span>
                <select
                  style={{ ...input, appearance: 'none' as const }}
                  required
                  value={form.id_alumno}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, id_alumno: e.target.value }))
                  }
                >
                  <option value=''>Seleccioná...</option>
                  {alumnos.map((a) => (
                    <option key={a.id_alumno} value={a.id_alumno}>
                      {a.apellido}, {a.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span style={label}>Trimestre</span>
                <select
                  style={{ ...input, appearance: 'none' as const }}
                  value={form.trimestre}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, trimestre: e.target.value }))
                  }
                >
                  <option value='1'>1º Trimestre</option>
                  <option value='2'>2º Trimestre</option>
                  <option value='3'>3º Trimestre</option>
                </select>
              </div>
              <div>
                <span style={label}>Tipo</span>
                <select
                  style={{ ...input, appearance: 'none' as const }}
                  value={form.tipo_evaluacion}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tipo_evaluacion: e.target.value }))
                  }
                >
                  <option>Parcial</option>
                  <option>Final</option>
                  <option>Trabajo Práctico</option>
                  <option>Oral</option>
                  <option>Recuperatorio</option>
                </select>
              </div>
              <div>
                <span style={label}>Nota (0–10)</span>
                <input
                  type='number'
                  min='0'
                  max='10'
                  step='0.25'
                  required
                  style={input}
                  value={form.nota}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nota: e.target.value }))
                  }
                />
              </div>
              <div
                style={{
                  gridColumn: '1/-1',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-end',
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={label}>Descripción (opcional)</span>
                  <input
                    style={input}
                    value={form.descripcion}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, descripcion: e.target.value }))
                    }
                    placeholder='Ej: Primer parcial unidad 1'
                  />
                </div>
                <button type='submit' style={btnPrimary}>
                  Cargar nota
                </button>
              </div>
              {msg && (
                <div
                  style={{
                    gridColumn: '1/-1',
                    fontSize: 13,
                    fontWeight: 700,
                    color: msg.startsWith('✅') ? C.green : C.red,
                  }}
                >
                  {msg}
                </div>
              )}
            </form>
          </div>

          {/* Historial */}
          <div style={card}>
            <div style={cardTitle}>Notas cargadas</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Alumno</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Trimestre</th>
                  <th style={th}>Fecha</th>
                  <th style={th}>Nota</th>
                </tr>
              </thead>
              <tbody>
                {calificaciones.map((c) => (
                  <tr key={c.id_calificacion}>
                    <td style={{ ...td, fontWeight: 700 }}>
                      {c.alumnos?.apellido}, {c.alumnos?.nombre}
                    </td>
                    <td style={td}>
                      <span style={badge(C.purple)}>{c.tipo_evaluacion}</span>
                    </td>
                    <td style={{ ...td, color: C.textMuted }}>
                      T{c.trimestre}
                    </td>
                    <td style={{ ...td, color: C.textMuted }}>
                      {new Date(c.fecha_carga).toLocaleDateString('es-AR')}
                    </td>
                    <td style={td}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: notaColor(c.nota) + '1A',
                          color: notaColor(c.nota),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: 14,
                        }}
                      >
                        {c.nota}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  AMONESTACIONES (Docente)
// ═══════════════════════════════════════════════════════════════
function GestionAmonestaciones({ userId }: { userId: string }) {
  const [idDocente, setIdDocente] = useState<number | null>(null)
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [alumnos, setAlumnos] = useState<
    { id_alumno: number; nombre: string; apellido: string }[]
  >([])
  const [amonestaciones, setAmonest] = useState<
    {
      id_amonestacion: number
      tipo: string
      descripcion: string
      fecha: string
      alumnos: { nombre: string; apellido: string } | null
    }[]
  >([])
  const [selCurso, setSelCurso] = useState<number | null>(null)
  const [form, setForm] = useState({
    id_alumno: '',
    tipo: 'Leve',
    descripcion: '',
  })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from('docentes')
      .select('id_docente')
      .eq('id_usuario', userId)
      .single()
      .then(({ data: doc }) => {
        if (!doc) return
        setIdDocente(doc.id_docente)
        supabase
          .from('asignaciones')
          .select(
            '*, materias(nombre), cursos(id_curso, nivel, grado_anio, division)',
          )
          .eq('id_docente', doc.id_docente)
          .eq('activo', true)
          .then(({ data }) => {
            if (data) setAsignaciones(data as unknown as Asignacion[])
          })
        supabase
          .from('amonestaciones')
          .select('*, alumnos(nombre, apellido)')
          .eq('id_docente', doc.id_docente)
          .order('fecha', { ascending: false })
          .then(({ data }) => {
            if (data) setAmonest(data as any)
          })
      })
  }, [userId])

  const handleSelCurso = (idCurso: number) => {
    setSelCurso(idCurso)
    supabase
      .from('alumnos')
      .select('id_alumno, nombre, apellido')
      .eq('id_curso', idCurso)
      .eq('activo', true)
      .order('apellido')
      .then(({ data }) => {
        if (data) setAlumnos(data)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const { error } = await supabase.from('amonestaciones').insert([
      {
        id_alumno: Number(form.id_alumno),
        id_docente: idDocente,
        tipo: form.tipo,
        descripcion: form.descripcion,
      },
    ])
    if (error) setMsg('Error: ' + error.message)
    else {
      setMsg('✅ Amonestación registrada.')
      setForm({ id_alumno: '', tipo: 'Leve', descripcion: '' })
      supabase
        .from('amonestaciones')
        .select('*, alumnos(nombre, apellido)')
        .eq('id_docente', idDocente!)
        .order('fecha', { ascending: false })
        .then(({ data }) => {
          if (data) setAmonest(data as any)
        })
    }
  }

  const TIPO_COLOR: Record<string, string> = {
    Leve: C.orange,
    Grave: C.red,
    'Muy grave': '#C0392B',
  }
  const cursosUnicos = asignaciones.filter(
    (a, i, arr) =>
      arr.findIndex(
        (b) => (b.cursos as any)?.id_curso === (a.cursos as any)?.id_curso,
      ) === i,
  )

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 20px' }}>
        ⚠️ Amonestaciones
      </h2>

      <div style={{ ...card, marginBottom: 20 }}>
        <div style={cardTitle}>Registrar amonestación</div>
        <div style={{ marginBottom: 14 }}>
          <span style={label}>Seleccioná el curso</span>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {cursosUnicos.map((a) => (
              <button
                key={(a.cursos as any)?.id_curso}
                style={
                  selCurso === (a.cursos as any)?.id_curso
                    ? btnPrimary
                    : btnSecondary
                }
                onClick={() => handleSelCurso((a.cursos as any)?.id_curso)}
              >
                {a.cursos?.nivel} {a.cursos?.grado_anio} "{a.cursos?.division}"
              </button>
            ))}
          </div>
        </div>
        {selCurso && (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}
          >
            <div>
              <span style={label}>Alumno</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                required
                value={form.id_alumno}
                onChange={(e) =>
                  setForm((p) => ({ ...p, id_alumno: e.target.value }))
                }
              >
                <option value=''>Seleccioná...</option>
                {alumnos.map((a) => (
                  <option key={a.id_alumno} value={a.id_alumno}>
                    {a.apellido}, {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span style={label}>Tipo</span>
              <select
                style={{ ...input, appearance: 'none' as const }}
                value={form.tipo}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tipo: e.target.value }))
                }
              >
                <option>Leve</option>
                <option>Grave</option>
                <option>Muy grave</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <span style={label}>Descripción del hecho</span>
              <textarea
                style={{ ...input, minHeight: 80, resize: 'vertical' as const }}
                required
                value={form.descripcion}
                onChange={(e) =>
                  setForm((p) => ({ ...p, descripcion: e.target.value }))
                }
              />
            </div>
            <div
              style={{
                gridColumn: '1/-1',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <button type='submit' style={btnPrimary}>
                Registrar amonestación
              </button>
              {msg && (
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: msg.startsWith('✅') ? C.green : C.red,
                  }}
                >
                  {msg}
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      <div style={card}>
        <div style={cardTitle}>Historial de amonestaciones</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Alumno</th>
              <th style={th}>Tipo</th>
              <th style={th}>Descripción</th>
              <th style={th}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {amonestaciones.map((a) => (
              <tr key={a.id_amonestacion}>
                <td style={{ ...td, fontWeight: 700 }}>
                  {a.alumnos?.apellido}, {a.alumnos?.nombre}
                </td>
                <td style={td}>
                  <span style={badge(TIPO_COLOR[a.tipo] ?? C.textMuted)}>
                    {a.tipo}
                  </span>
                </td>
                <td style={{ ...td, color: C.textMuted, maxWidth: 300 }}>
                  {a.descripcion}
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {new Date(a.fecha).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
// ═══════════════════════════════════════════════════════════════
//  R7: GESTIÓN DE GALERÍA DE FOTOS (Admin / Directivos)
// ═══════════════════════════════════════════════════════════════
function GestionGaleria({ userId }: { userId: string }) {
  const [imagenes, setImagenes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'Instalaciones',
    url_imagen: '',
  })

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('galeria')
      .select('*')
      .order('fecha_subida', { ascending: false })
    if (data) setImagenes(data)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      let finalUrl = form.url_imagen

      // Si el usuario adjuntó un archivo local, procesamos la subida a Supabase Storage
      if (file) {
        const fileExt = file.name.split('.').pop()
        const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('galeria-imagenes')
          .upload(uniqueFileName, file)

        if (uploadError) throw new Error('Error en Storage: ' + uploadError.message)

        // Recuperar URL pública del archivo cargado
        const { data } = supabase.storage
          .from('galeria-imagenes')
          .getPublicUrl(uniqueFileName)

        finalUrl = data.publicUrl
      }

      if (!finalUrl) {
        throw new Error('Debes seleccionar un archivo de imagen o ingresar una URL externa.')
      }

      // Persistir registro meta en la base de datos relacional
      const { error } = await supabase
        .from('galeria')
        .insert([
          {
            titulo: form.titulo || null,
            descripcion: form.descripcion || null,
            categoria: form.categoria || null,
            url_imagen: finalUrl,
            id_autor: userId,
          },
        ])

      if (error) throw error

      setMsg('✅ Imagen incorporada a la galería correctamente.')
      setForm({ titulo: '', descripcion: '', categoria: 'Instalaciones', url_imagen: '' })
      setFile(null)
      setShowForm(false)
      load()
    } catch (err: any) {
      setMsg('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleActivo = async (id: number, activo: boolean) => {
    await supabase
      .from('galeria')
      .update({ activo: !activo })
      .eq('id_imagen', id)
    load()
  }

  const eliminarImagen = async (id: number, urlImagen: string) => {
    if (!window.confirm('¿Confirmás la eliminación permanente de esta fotografía?')) return
    
    try {
      // Si la imagen pertenece al storage propio, borramos el binario para evitar archivos huérfanos
      if (urlImagen.includes('galeria-imagenes')) {
        const parts = urlImagen.split('/')
        const fileName = parts[parts.length - 1]
        await supabase.storage.from('galeria-imagenes').remove([fileName])
      }

      const { error } = await supabase.from('galeria').delete().eq('id_imagen', id)
      if (error) throw error

      setMsg('✅ Registro fotográfico purgado con éxito.')
      load()
    } catch (err: any) {
      setMsg('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>🖼️ Galería Institucional</h2>
        <button style={btnPrimary} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Agregar Imagen'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: 24 }}>
          <div style={cardTitle}>Publicar nueva fotografía</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <span style={label}>Título de la foto (Opcional)</span>
                <input
                  style={input}
                  value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder='Ej: Laboratorio de Ciencias Avanzadas'
                />
              </div>
              <div>
                <span style={label}>Categoría / Sección</span>
                <select
                  style={{ ...input, appearance: 'none' as const }}
                  value={form.categoria}
                  onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
                >
                  <option value='Instalaciones'>Instalaciones</option>
                  <option value='Actividades'>Actividades</option>
                  <option value='Idiomas'>Idiomas</option>
                  <option value='Deportes'>Deportes</option>
                  <option value='Arte'>Arte</option>
                  <option value='Tecnología'>Tecnología</option>
                </select>
              </div>
            </div>

            <div>
              <span style={label}>Descripción descriptiva (Opcional)</span>
              <input
                style={input}
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                placeholder='Breve reseña sobre lo que muestra la imagen...'
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'center' }}>
              <div>
                <span style={label}>Opción A: Seleccionar archivo local</span>
                <input
                  type='file'
                  accept='image/*'
                  style={input}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0])
                    }
                  }}
                />
              </div>
              <div>
                <span style={label}>Opción B: Vincular URL de imagen remota</span>
                <input
                  style={input}
                  value={form.url_imagen}
                  onChange={(e) => setForm((p) => ({ ...p, url_imagen: e.target.value }))}
                  placeholder='https://images.unsplash.com/...'
                  disabled={!!file}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type='submit' disabled={loading} style={{ ...btnPrimary, opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Subiendo contenido...' : 'Publicar en Galería'}
              </button>
            </div>

            {msg && (
              <div style={{ fontSize: 13, fontWeight: 700, color: msg.startsWith('✅') ? C.green : C.red }}>
                {msg}
              </div>
            )}
          </form>
        </div>
      )}

      {/* Lista del Repositorio Visual */}
      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Miniatura</th>
              <th style={th}>Título / Categoría</th>
              <th style={th}>Fecha de Subida</th>
              <th style={th}>Estado</th>
              <th style={th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {imagenes.map((img) => (
              <tr key={img.id_imagen}>
                <td style={td}>
                  <img
                    src={img.url_imagen}
                    alt={img.titulo || 'Mina'}
                    style={{ width: 65, height: 48, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }}
                  />
                </td>
                <td style={td}>
                  <span style={{ fontWeight: 700 }}>{img.titulo || 'Fotografía sin título'}</span>
                  <br />
                  <span style={badge(C.purple)}>{img.categoria || 'General'}</span>
                </td>
                <td style={{ ...td, color: C.textMuted }}>
                  {new Date(img.fecha_subida).toLocaleDateString('es-AR')}
                </td>
                <td style={td}>
                  <span style={badge(img.activo ? C.green : C.red)}>
                    {img.activo ? 'Visible en Home' : 'Oculta'}
                  </span>
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={img.activo ? btnDanger : { ...btnDanger, background: '#27AE601A', color: C.green }}
                      onClick={() => toggleActivo(img.id_imagen, img.activo)}
                    >
                      {img.activo ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                      style={{ ...btnDanger, background: '#E74C3C26' }}
                      onClick={() => eliminarImagen(img.id_imagen, img.url_imagen)}
                    >
                      Eliminar permanentemente
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {imagenes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: 'center', color: C.textMuted, padding: 32 }}>
                  No se registran imágenes en la galería institucional.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}