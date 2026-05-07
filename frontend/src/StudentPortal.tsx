/**
 * StudentPortal.tsx
 * Portal Estudiantil — Educar Para Transformar
 * Stack: React + TypeScript + Supabase
 *
 * Instalación requerida:
 *   npm install @supabase/supabase-js
 *
 * Variables de entorno (.env):
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=tu_anon_key
 *
 * Logo: colocar /public/logo.png con el logo del centro
 * Fuente: agregar en index.html →
 *   <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
 */

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════════
//  SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

// ═══════════════════════════════════════════════════════════════
//  TIPOS — coinciden con el schema de la base de datos
// ═══════════════════════════════════════════════════════════════
interface Alumno {
  id_alumno: number
  nombre: string
  apellido: string
  dni: string
  obra_social: string | null
  cursos: { nivel: string; grado_anio: string; division: string } | null
}

interface Calificacion {
  id_calificacion: number
  trimestre: number
  tipo_evaluacion: string
  nota: number
  fecha_carga: string
  descripcion: string | null
  asignaciones: { materias: { nombre: string } }
}

interface Cuota {
  id_cuota: number
  mes: number
  anio: number
  monto_base: number
  recargo: number
  descuento: number
  fecha_vencimiento: string
  estado: 'Pendiente' | 'Pagada' | 'Vencida' | 'En mora'
}

interface Notificacion {
  id_notificacion: number
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  fecha_envio: string
}

interface HorarioHoy {
  id_horario: number
  hora_inicio: string
  hora_fin: string
  aula: string | null
  asignaciones: {
    materias: { nombre: string }
    docentes: { nombre: string; apellido: string }
  }
}

interface AsistenciaStats {
  presentes: number
  ausentes: number
  tarde: number
  justificados: number
  total: number
}

// ═══════════════════════════════════════════════════════════════
//  PALETA DE COLORES (basada en el logo del centro)
// ═══════════════════════════════════════════════════════════════
const C = {
  purple: '#5B35C5',
  purpleLight: '#EEE9FF',
  purpleDark: '#3D2092',
  purpleMid: '#7B55E8',
  white: '#FFFFFF',
  bg: '#F5F4FB',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textMuted: '#6B6B8A',
  border: '#E8E6F5',
  green: '#27AE60',
  orange: '#E67E22',
  red: '#E74C3C',
  pink: '#E91E8C',
  blue: '#2980B9',
}

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
const MESES = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
]
const DIAS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const diaActual = () => DIAS[new Date().getDay()]

const formatFecha = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const notaColor = (nota: number) => {
  if (nota >= 8) return C.green
  if (nota >= 6) return C.orange
  return C.red
}

const CUOTA_COLOR: Record<string, string> = {
  Pendiente: C.orange,
  Pagada: C.green,
  Vencida: C.red,
  'En mora': '#C0392B',
}

const NOTIF_COLOR: Record<string, string> = {
  General: C.purple,
  Asistencia: C.orange,
  Calificación: C.green,
  Cuota: C.red,
  Novedad: C.blue,
  Urgente: '#C0392B',
}

// ═══════════════════════════════════════════════════════════════
//  ESTILOS BASE (React.CSSProperties)
// ═══════════════════════════════════════════════════════════════
const S: Record<string, React.CSSProperties> = {
  root: {
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    background: C.bg,
    minHeight: '100vh',
    color: C.text,
  },
  header: {
    background: C.white,
    borderBottom: `3px solid ${C.purple}`,
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 16px rgba(91,53,197,0.08)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    height: 50,
    width: 'auto',
  },
  logoTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: C.purple,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  layout: {
    display: 'flex',
    minHeight: 'calc(100vh - 70px)',
  },
  sidebar: {
    width: 230,
    background: C.white,
    borderRight: `1px solid ${C.border}`,
    padding: '20px 0',
    flexShrink: 0,
  },
  sidebarLabel: {
    fontSize: 10,
    color: C.textMuted,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0 24px 16px',
    display: 'block',
    borderBottom: `1px solid ${C.border}`,
    marginBottom: 8,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 24px',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: C.textMuted,
    borderLeft: '3px solid transparent',
    transition: 'all 0.15s',
  },
  navActive: {
    color: C.purple,
    background: C.purpleLight,
    borderLeft: `3px solid ${C.purple}`,
    fontWeight: 800,
  },
  main: {
    flex: 1,
    padding: 28,
    overflowY: 'auto',
  },
  card: {
    background: C.card,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 16px rgba(91,53,197,0.06)',
    border: `1px solid ${C.border}`,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: C.text,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  welcome: {
    background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleMid} 100%)`,
    borderRadius: 20,
    padding: '28px 32px',
    color: C.white,
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: 900,
    marginBottom: 6,
  },
  welcomeSub: {
    fontSize: 13,
    opacity: 0.85,
  },
  welcomeBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: '4px 14px',
    fontSize: 12,
    fontWeight: 700,
    marginTop: 14,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: C.card,
    borderRadius: 14,
    padding: '18px 20px',
    boxShadow: '0 2px 12px rgba(91,53,197,0.06)',
    border: `1px solid ${C.border}`,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 900,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: 700,
    marginTop: 4,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 18,
    marginBottom: 18,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 800,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '0 0 12px',
    borderBottom: `2px solid ${C.border}`,
  },
  td: {
    padding: '11px 0',
    fontSize: 13,
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.purple}, ${C.purpleMid})`,
    color: C.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 14,
    cursor: 'pointer',
    flexShrink: 0,
  },
  logoutBtn: {
    background: 'none',
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 700,
    color: C.textMuted,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  horarioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 0',
    borderBottom: `1px solid ${C.border}`,
  },
  horarioTime: {
    background: C.purpleLight,
    color: C.purple,
    borderRadius: 10,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 800,
    minWidth: 96,
    textAlign: 'center',
    flexShrink: 0,
  },
  notifItem: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
    padding: '12px 0',
    borderBottom: `1px solid ${C.border}`,
    cursor: 'pointer',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 0',
    color: C.textMuted,
    fontSize: 13,
  },
}

// badge y notaCircle son funciones (reciben parámetros)
const badge = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  background: color + '1A',
  color,
  borderRadius: 20,
  padding: '3px 10px',
  fontSize: 11,
  fontWeight: 800,
})

const notaCircle = (nota: number): React.CSSProperties => ({
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: notaColor(nota) + '1A',
  color: notaColor(nota),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 900,
  fontSize: 14,
  flexShrink: 0,
})

// ═══════════════════════════════════════════════════════════════
//  SECCIONES DE NAVEGACIÓN
// ═══════════════════════════════════════════════════════════════
const NAV_ITEMS = [
  { key: 'inicio', icon: '🏠', label: 'Inicio' },
  { key: 'asistencias', icon: '📅', label: 'Asistencias' },
  { key: 'calificaciones', icon: '📊', label: 'Calificaciones' },
  { key: 'cuotas', icon: '💳', label: 'Cuotas' },
  { key: 'horario', icon: '🕐', label: 'Mi Horario' },
  { key: 'notificaciones', icon: '🔔', label: 'Notificaciones' },
]

// ═══════════════════════════════════════════════════════════════
//  PANTALLA DE LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (err)
      setError('Credenciales incorrectas. Verificá tu email y contraseña.')
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    border: `2px solid ${C.border}`,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    color: C.text,
  }

  return (
    <div
      style={{
        ...S.root,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 60% 0%, ${C.purpleLight} 0%, ${C.bg} 60%)`,
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 24,
          padding: '44px 40px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 8px 48px rgba(91,53,197,0.14)',
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src='/logo.png'
            alt='Educar Para Transformar'
            style={{ height: 80, marginBottom: 12 }}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div style={{ fontSize: 17, fontWeight: 900, color: C.purple }}>
            Educar Para Transformar
          </div>
          <div
            style={{
              fontSize: 12,
              color: C.textMuted,
              letterSpacing: '0.08em',
              marginTop: 4,
            }}
          >
            PORTAL ESTUDIANTIL
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.textMuted,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Correo electrónico
            </label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='tu@email.com'
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: C.textMuted,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Contraseña
            </label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div
              style={{
                background: C.red + '12',
                border: `1px solid ${C.red}40`,
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: C.red,
                fontWeight: 700,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            style={{
              background: loading
                ? C.border
                : `linear-gradient(135deg, ${C.purple}, ${C.purpleMid})`,
              color: loading ? C.textMuted : C.white,
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              marginTop: 6,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar al portal'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function StudentPortal() {
  const [user, setUser] = useState<User | null>(null)
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [cuotas, setCuotas] = useState<Cuota[]>([])
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [horarioHoy, setHorarioHoy] = useState<HorarioHoy[]>([])
  const [asistStats, setAsistStats] = useState<AsistenciaStats | null>(null)
  const [activeNav, setActiveNav] = useState('inicio')
  const [loading, setLoading] = useState(true)

  console.log(import.meta.env.VITE_SUPABASE_URL)
  console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)

  // ── Auth ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    loadAll(user.id)
  }, [user])

  // ── Data loading ─────────────────────────────────────────────
  const loadAll = useCallback(async (userId: string) => {
    setLoading(true)
    await Promise.all([
      loadAlumno(userId),
      loadCalificaciones(userId),
      loadCuotas(userId),
      loadNotificaciones(userId),
      loadHorarioHoy(userId),
      loadAsistencias(userId),
    ])
    setLoading(false)
  }, [])

  async function loadAlumno(userId: string) {
    const { data } = await supabase
      .from('alumnos')
      .select(
        'id_alumno, nombre, apellido, dni, obra_social, cursos(nivel, grado_anio, division)',
      )
      .eq('id_usuario', userId)
      .single()
    if (data) setAlumno(data as unknown as Alumno)
  }

  async function loadCalificaciones(userId: string) {
    const { data: al } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .eq('id_usuario', userId)
      .single()
    if (!al) return
    const { data } = await supabase
      .from('calificaciones')
      .select('*, asignaciones(materias(nombre))')
      .eq('id_alumno', al.id_alumno)
      .order('fecha_carga', { ascending: false })
      .limit(20)
    if (data) setCalificaciones(data as unknown as Calificacion[])
  }

  async function loadCuotas(userId: string) {
    const { data: al } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .eq('id_usuario', userId)
      .single()
    if (!al) return
    const { data } = await supabase
      .from('cuotas')
      .select('*')
      .eq('id_alumno', al.id_alumno)
      .in('estado', ['Pendiente', 'Vencida', 'En mora'])
      .order('fecha_vencimiento', { ascending: true })
    if (data) setCuotas(data as Cuota[])
  }

  async function loadNotificaciones(userId: string) {
    const { data } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('id_usuario_destino', userId)
      .order('fecha_envio', { ascending: false })
      .limit(20)
    if (data) setNotificaciones(data as Notificacion[])
  }

  async function loadHorarioHoy(userId: string) {
    const { data: al } = await supabase
      .from('alumnos')
      .select('id_curso')
      .eq('id_usuario', userId)
      .single()
    if (!al?.id_curso) return
    const { data } = await supabase
      .from('horarios')
      .select(
        '*, asignaciones!inner(materias(nombre), docentes(nombre, apellido), id_curso)',
      )
      .eq('dia_semana', diaActual())
      .eq('asignaciones.id_curso', al.id_curso)
      .order('hora_inicio', { ascending: true })
    if (data) setHorarioHoy(data as unknown as HorarioHoy[])
  }

  async function loadAsistencias(userId: string) {
    const { data: al } = await supabase
      .from('alumnos')
      .select('id_alumno')
      .eq('id_usuario', userId)
      .single()
    if (!al) return
    const { data } = await supabase
      .from('asistencias')
      .select('estado')
      .eq('id_alumno', al.id_alumno)
    if (!data) return
    const stats: AsistenciaStats = {
      presentes: 0,
      ausentes: 0,
      tarde: 0,
      justificados: 0,
      total: data.length,
    }
    data.forEach((a) => {
      if (a.estado === 'Presente') stats.presentes++
      if (a.estado === 'Ausente') stats.ausentes++
      if (a.estado === 'Tarde') stats.tarde++
      if (a.estado === 'Justificado') stats.justificados++
    })
    setAsistStats(stats)
  }

  async function marcarLeida(id: number) {
    await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id_notificacion', id)
    setNotificaciones((prev) =>
      prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n)),
    )
  }

  // ── Derived values ───────────────────────────────────────────
  const promedio = calificaciones.length
    ? (
        calificaciones.reduce((acc, c) => acc + c.nota, 0) /
        calificaciones.length
      ).toFixed(1)
    : '—'

  const pctAsistencia =
    asistStats && asistStats.total > 0
      ? Math.round((asistStats.presentes / asistStats.total) * 100)
      : null

  const notifNoLeidas = notificaciones.filter((n) => !n.leida).length
  const initials = alumno ? `${alumno.nombre[0]}${alumno.apellido[0]}` : '?'

  // ── Render guards ────────────────────────────────────────────
  if (!user) return <LoginScreen />

  if (loading) {
    return (
      <div
        style={{
          ...S.root,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ textAlign: 'center', color: C.purple }}>
          <div
            style={{
              fontSize: 36,
              marginBottom: 12,
              animation: 'spin 1s linear infinite',
            }}
          >
            ⟳
          </div>
          <p style={{ fontWeight: 800 }}>Cargando tu portal...</p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  //  RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={S.root}>
      {/* ── HEADER ── */}
      <header style={S.header}>
        <div style={S.logo}>
          <img
            src='/logo.png'
            alt='Educar Para Transformar'
            style={S.logoImg}
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={S.logoTitle}>Educar Para Transformar</span>
            <span style={S.logoSub}>Centro Educativo</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Campana notificaciones */}
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setActiveNav('notificaciones')}
            title='Ver notificaciones'
          >
            <span style={{ fontSize: 22 }}>🔔</span>
            {notifNoLeidas > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  background: C.red,
                  color: C.white,
                  borderRadius: '50%',
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifNoLeidas}
              </span>
            )}
          </div>

          {/* Avatar */}
          <div
            style={S.avatar}
            title={alumno ? `${alumno.nombre} ${alumno.apellido}` : ''}
          >
            {initials}
          </div>

          {/* Nombre */}
          {alumno && (
            <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>
              {alumno.nombre} {alumno.apellido}
            </span>
          )}

          {/* Logout */}
          <button style={S.logoutBtn} onClick={() => supabase.auth.signOut()}>
            Salir
          </button>
        </div>
      </header>

      <div style={S.layout}>
        {/* ── SIDEBAR ── */}
        <aside style={S.sidebar}>
          <span style={S.sidebarLabel}>Portal Estudiantil</span>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              style={{
                ...S.navItem,
                ...(activeNav === item.key ? S.navActive : {}),
              }}
              onClick={() => setActiveNav(item.key)}
            >
              <span>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.key === 'notificaciones' && notifNoLeidas > 0 && (
                <span
                  style={{
                    background: C.purple,
                    color: C.white,
                    borderRadius: 20,
                    padding: '1px 8px',
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {notifNoLeidas}
                </span>
              )}
              {item.key === 'cuotas' && cuotas.length > 0 && (
                <span
                  style={{
                    background: C.red,
                    color: C.white,
                    borderRadius: 20,
                    padding: '1px 8px',
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {cuotas.length}
                </span>
              )}
            </div>
          ))}
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main style={S.main}>
          {/* ━━━━━ INICIO ━━━━━ */}
          {activeNav === 'inicio' && (
            <>
              {/* Banner bienvenida */}
              <div style={S.welcome}>
                <div
                  style={{
                    position: 'absolute',
                    right: -30,
                    top: -30,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                />
                <div style={{ position: 'relative' }}>
                  <div style={S.welcomeName}>
                    Bienvenido/a, {alumno?.nombre} 👋
                  </div>
                  <div style={S.welcomeSub}>
                    {new Date().toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {alumno?.cursos && (
                    <div style={S.welcomeBadge}>
                      {alumno.cursos.nivel} · {alumno.cursos.grado_anio}{' '}
                      División {alumno.cursos.division}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div style={S.statsGrid}>
                {/* Asistencia */}
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: C.purpleLight }}>
                    📅
                  </div>
                  <div
                    style={{
                      ...S.statValue,
                      color:
                        pctAsistencia !== null && pctAsistencia < 75
                          ? C.red
                          : C.green,
                    }}
                  >
                    {pctAsistencia !== null ? `${pctAsistencia}%` : '—'}
                  </div>
                  <div style={S.statLabel}>Asistencia</div>
                </div>
                {/* Promedio */}
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: '#27AE601A' }}>
                    📊
                  </div>
                  <div style={{ ...S.statValue, color: C.purple }}>
                    {promedio}
                  </div>
                  <div style={S.statLabel}>Promedio general</div>
                </div>
                {/* Cuotas */}
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: '#E74C3C1A' }}>
                    💳
                  </div>
                  <div
                    style={{
                      ...S.statValue,
                      color: cuotas.length > 0 ? C.red : C.green,
                    }}
                  >
                    {cuotas.length}
                  </div>
                  <div style={S.statLabel}>Cuotas pendientes</div>
                </div>
                {/* Notificaciones */}
                <div style={S.statCard}>
                  <div style={{ ...S.statIcon, background: '#E67E221A' }}>
                    🔔
                  </div>
                  <div
                    style={{
                      ...S.statValue,
                      color: notifNoLeidas > 0 ? C.orange : C.textMuted,
                    }}
                  >
                    {notifNoLeidas}
                  </div>
                  <div style={S.statLabel}>Notificaciones nuevas</div>
                </div>
              </div>

              {/* Horario hoy + Notificaciones */}
              <div style={S.grid2}>
                {/* Clases de hoy */}
                <div style={S.card}>
                  <div style={S.cardTitle}>
                    🕐 Clases de hoy · {diaActual()}
                  </div>
                  {horarioHoy.length === 0 ? (
                    <div style={S.centered}>
                      No hay clases programadas para hoy
                    </div>
                  ) : (
                    horarioHoy.map((h) => (
                      <div key={h.id_horario} style={S.horarioItem}>
                        <div style={S.horarioTime}>
                          {h.hora_inicio.slice(0, 5)}
                          <br />
                          {h.hora_fin.slice(0, 5)}
                        </div>
                        <div
                          style={{
                            width: 3,
                            height: 44,
                            borderRadius: 4,
                            background: C.purple,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>
                            {h.asignaciones?.materias?.nombre}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: C.textMuted,
                              marginTop: 2,
                            }}
                          >
                            Prof. {h.asignaciones?.docentes?.apellido} ·{' '}
                            {h.aula ?? 'Aula s/d'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Notificaciones recientes */}
                <div style={S.card}>
                  <div style={S.cardTitle}>🔔 Notificaciones recientes</div>
                  {notificaciones.slice(0, 5).length === 0 ? (
                    <div style={S.centered}>Sin notificaciones</div>
                  ) : (
                    notificaciones.slice(0, 5).map((n) => (
                      <div
                        key={n.id_notificacion}
                        style={{ ...S.notifItem, opacity: n.leida ? 0.6 : 1 }}
                        onClick={() =>
                          !n.leida && marcarLeida(n.id_notificacion)
                        }
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            marginTop: 5,
                            background: n.leida
                              ? C.border
                              : (NOTIF_COLOR[n.tipo] ?? C.purple),
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: n.leida ? 600 : 800,
                            }}
                          >
                            {n.titulo}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: C.textMuted,
                              marginTop: 2,
                            }}
                          >
                            {formatFecha(n.fecha_envio)}
                          </div>
                        </div>
                        <span style={badge(NOTIF_COLOR[n.tipo] ?? C.purple)}>
                          {n.tipo}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Últimas calificaciones */}
              <div style={S.card}>
                <div style={S.cardTitle}>📊 Últimas calificaciones</div>
                {calificaciones.length === 0 ? (
                  <div style={S.centered}>Sin calificaciones registradas</div>
                ) : (
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Materia</th>
                        <th style={S.th}>Tipo</th>
                        <th style={S.th}>Trimestre</th>
                        <th style={S.th}>Fecha</th>
                        <th style={S.th}>Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calificaciones.slice(0, 6).map((c) => (
                        <tr key={c.id_calificacion}>
                          <td style={{ ...S.td, fontWeight: 800 }}>
                            {c.asignaciones?.materias?.nombre}
                          </td>
                          <td style={S.td}>
                            <span style={badge(C.purple)}>
                              {c.tipo_evaluacion}
                            </span>
                          </td>
                          <td style={{ ...S.td, color: C.textMuted }}>
                            Trimestre {c.trimestre}
                          </td>
                          <td style={{ ...S.td, color: C.textMuted }}>
                            {formatFecha(c.fecha_carga)}
                          </td>
                          <td style={S.td}>
                            <div style={notaCircle(c.nota)}>{c.nota}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ━━━━━ ASISTENCIAS ━━━━━ */}
          {activeNav === 'asistencias' && (
            <div style={S.card}>
              <div style={S.cardTitle}>📅 Mis Asistencias</div>
              {!asistStats ? (
                <div style={S.centered}>Cargando...</div>
              ) : (
                <>
                  {/* Counters */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: 12,
                      marginBottom: 28,
                    }}
                  >
                    {[
                      {
                        label: 'Presentes',
                        value: asistStats.presentes,
                        color: C.green,
                      },
                      {
                        label: 'Ausentes',
                        value: asistStats.ausentes,
                        color: C.red,
                      },
                      {
                        label: 'Tarde',
                        value: asistStats.tarde,
                        color: C.orange,
                      },
                      {
                        label: 'Justific.',
                        value: asistStats.justificados,
                        color: C.blue,
                      },
                      {
                        label: 'Total',
                        value: asistStats.total,
                        color: C.purple,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          ...S.statCard,
                          borderTop: `3px solid ${item.color}`,
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ ...S.statValue, color: item.color }}>
                          {item.value}
                        </div>
                        <div style={S.statLabel}>{item.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Barra de progreso */}
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        fontWeight: 800,
                        marginBottom: 10,
                      }}
                    >
                      <span>Porcentaje de asistencia</span>
                      <span
                        style={{
                          color:
                            pctAsistencia !== null && pctAsistencia < 75
                              ? C.red
                              : C.green,
                        }}
                      >
                        {pctAsistencia ?? 0}%
                      </span>
                    </div>
                    <div
                      style={{
                        background: C.border,
                        borderRadius: 8,
                        height: 14,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${pctAsistencia ?? 0}%`,
                          height: '100%',
                          background:
                            pctAsistencia !== null && pctAsistencia < 75
                              ? `linear-gradient(90deg, ${C.red}, ${C.orange})`
                              : `linear-gradient(90deg, ${C.purple}, ${C.green})`,
                          borderRadius: 8,
                          transition: 'width 0.8s ease',
                        }}
                      />
                    </div>
                    {pctAsistencia !== null && pctAsistencia < 75 && (
                      <div
                        style={{
                          marginTop: 12,
                          background: C.red + '12',
                          border: `1px solid ${C.red}40`,
                          borderRadius: 10,
                          padding: '10px 14px',
                          color: C.red,
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ⚠️ Tu asistencia está por debajo del 75% mínimo
                        requerido. Por favor comunicate con la institución.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ━━━━━ CALIFICACIONES ━━━━━ */}
          {activeNav === 'calificaciones' && (
            <div style={S.card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div style={S.cardTitle}>📊 Todas mis Calificaciones</div>
                {calificaciones.length > 0 && (
                  <div
                    style={{
                      background: C.purpleLight,
                      color: C.purple,
                      borderRadius: 12,
                      padding: '8px 18px',
                      fontWeight: 900,
                      fontSize: 16,
                    }}
                  >
                    Promedio: {promedio}
                  </div>
                )}
              </div>
              {calificaciones.length === 0 ? (
                <div style={S.centered}>Sin calificaciones registradas</div>
              ) : (
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Materia</th>
                      <th style={S.th}>Tipo</th>
                      <th style={S.th}>Trimestre</th>
                      <th style={S.th}>Fecha</th>
                      <th style={S.th}>Descripción</th>
                      <th style={S.th}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calificaciones.map((c) => (
                      <tr key={c.id_calificacion}>
                        <td style={{ ...S.td, fontWeight: 800 }}>
                          {c.asignaciones?.materias?.nombre}
                        </td>
                        <td style={S.td}>
                          <span style={badge(C.purple)}>
                            {c.tipo_evaluacion}
                          </span>
                        </td>
                        <td style={{ ...S.td, color: C.textMuted }}>
                          T{c.trimestre}
                        </td>
                        <td style={{ ...S.td, color: C.textMuted }}>
                          {formatFecha(c.fecha_carga)}
                        </td>
                        <td style={{ ...S.td, color: C.textMuted }}>
                          {c.descripcion ?? '—'}
                        </td>
                        <td style={S.td}>
                          <div style={notaCircle(c.nota)}>{c.nota}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ━━━━━ CUOTAS ━━━━━ */}
          {activeNav === 'cuotas' && (
            <div style={S.card}>
              <div style={S.cardTitle}>💳 Mis Cuotas Pendientes</div>
              {cuotas.length === 0 ? (
                <div
                  style={{ ...S.centered, flexDirection: 'column', gap: 10 }}
                >
                  <span style={{ fontSize: 44 }}>✅</span>
                  <span
                    style={{ color: C.green, fontWeight: 800, fontSize: 15 }}
                  >
                    ¡Estás al día con todas tus cuotas!
                  </span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      background: C.red + '10',
                      border: `1px solid ${C.red}30`,
                      borderRadius: 12,
                      padding: '12px 16px',
                      marginBottom: 20,
                      fontSize: 13,
                      color: C.red,
                      fontWeight: 700,
                    }}
                  >
                    ⚠️ Tenés {cuotas.length} cuota{cuotas.length > 1 ? 's' : ''}{' '}
                    sin abonar. Regularizá tu situación para evitar recargos.
                  </div>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Período</th>
                        <th style={S.th}>Monto base</th>
                        <th style={S.th}>Recargo</th>
                        <th style={S.th}>Total a pagar</th>
                        <th style={S.th}>Vencimiento</th>
                        <th style={S.th}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotas.map((c) => (
                        <tr key={c.id_cuota}>
                          <td style={{ ...S.td, fontWeight: 800 }}>
                            {MESES[c.mes - 1]} {c.anio}
                          </td>
                          <td style={S.td}>
                            ${c.monto_base.toLocaleString('es-AR')}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              color: c.recargo > 0 ? C.red : C.textMuted,
                            }}
                          >
                            {c.recargo > 0
                              ? `+$${c.recargo.toLocaleString('es-AR')}`
                              : '—'}
                          </td>
                          <td
                            style={{
                              ...S.td,
                              fontWeight: 900,
                              color: C.purple,
                            }}
                          >
                            $
                            {(
                              c.monto_base +
                              c.recargo -
                              c.descuento
                            ).toLocaleString('es-AR')}
                          </td>
                          <td style={{ ...S.td, color: C.textMuted }}>
                            {formatFecha(c.fecha_vencimiento)}
                          </td>
                          <td style={S.td}>
                            <span
                              style={badge(
                                CUOTA_COLOR[c.estado] ?? C.textMuted,
                              )}
                            >
                              {c.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* ━━━━━ HORARIO ━━━━━ */}
          {activeNav === 'horario' && (
            <div style={S.card}>
              <div style={S.cardTitle}>
                🕐 Mi Horario de hoy · {diaActual()}
              </div>
              {horarioHoy.length === 0 ? (
                <div
                  style={{ ...S.centered, flexDirection: 'column', gap: 10 }}
                >
                  <span style={{ fontSize: 36 }}>🎉</span>
                  <span style={{ fontWeight: 700, color: C.textMuted }}>
                    No tenés clases registradas para hoy
                  </span>
                </div>
              ) : (
                horarioHoy.map((h) => (
                  <div key={h.id_horario} style={S.horarioItem}>
                    <div
                      style={{
                        ...S.horarioTime,
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      {h.hora_inicio.slice(0, 5)}
                      <br />
                      {h.hora_fin.slice(0, 5)}
                    </div>
                    <div
                      style={{
                        width: 4,
                        height: 52,
                        borderRadius: 4,
                        background: C.purple,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15 }}>
                        {h.asignaciones?.materias?.nombre}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: C.textMuted,
                          marginTop: 3,
                        }}
                      >
                        Prof. {h.asignaciones?.docentes?.nombre}{' '}
                        {h.asignaciones?.docentes?.apellido}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.textMuted,
                          marginTop: 2,
                        }}
                      >
                        📍 {h.aula ?? 'Aula a confirmar'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ━━━━━ NOTIFICACIONES ━━━━━ */}
          {activeNav === 'notificaciones' && (
            <div style={S.card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <div style={S.cardTitle}>🔔 Todas mis Notificaciones</div>
                {notifNoLeidas > 0 && (
                  <button
                    style={{
                      ...S.logoutBtn,
                      color: C.purple,
                      borderColor: C.purple,
                    }}
                    onClick={async () => {
                      await supabase
                        .from('notificaciones')
                        .update({ leida: true })
                        .eq('id_usuario_destino', user?.id)
                      setNotificaciones((prev) =>
                        prev.map((n) => ({ ...n, leida: true })),
                      )
                    }}
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>
              {notificaciones.length === 0 ? (
                <div style={S.centered}>Sin notificaciones</div>
              ) : (
                notificaciones.map((n) => (
                  <div
                    key={n.id_notificacion}
                    style={{ ...S.notifItem, opacity: n.leida ? 0.55 : 1 }}
                    onClick={() => !n.leida && marcarLeida(n.id_notificacion)}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        marginTop: 6,
                        flexShrink: 0,
                        background: n.leida
                          ? C.border
                          : (NOTIF_COLOR[n.tipo] ?? C.purple),
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 4,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: n.leida ? 600 : 900,
                          }}
                        >
                          {n.titulo}
                        </span>
                        <span style={badge(NOTIF_COLOR[n.tipo] ?? C.purple)}>
                          {n.tipo}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 13,
                          color: C.textMuted,
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {n.mensaje}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          color: C.textMuted,
                          marginTop: 4,
                          display: 'block',
                        }}
                      >
                        {formatFecha(n.fecha_envio)}
                      </span>
                    </div>
                    {!n.leida && (
                      <span
                        style={{
                          fontSize: 11,
                          color: C.purple,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        Marcar leída
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
