/**
 * AdminPanel.tsx - Versión TailwindCSS
 * Panel de administración — Educar Para Transformar
 * Roles: Admin / Directivo → acceso completo
 *        Docente           → solo sus secciones
 */

import { useState, useEffect, useCallback, FormEvent } from 'react'
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

// ═════════════════════════════════════════════════════════
//  NAV ITEMS POR ROL
// ═══════════════════════════════════════════════════════════
const NAV_ADMIN = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'usuarios', icon: '👥', label: 'Usuarios' },
  { key: 'alumnos', icon: '🎓', label: 'Alumnos' },
  { key: 'docentes', icon: '👨‍🏫', label: 'Docentes' },
  { key: 'cursos', icon: '🏫', label: 'Cursos' },
  { key: 'materias', icon: '📚', label: 'Materias' },
  { key: 'asignaciones', icon: '🔗', label: 'Asignaciones' },
  { key: 'cuotas', icon: '💳', label: 'Cuotas' },
  { key: 'inscripciones', icon: '📋', label: 'Inscripciones' },
  { key: 'noticias', icon: '📰', label: 'Noticias' },
]

const NAV_DOCENTE = [
  { key: 'dashboard', icon: '📊', label: 'Dashboard' },
  { key: 'asistencia', icon: '📅', label: 'Tomar asistencia' },
  { key: 'calificaciones', icon: '📝', label: 'Calificaciones' },
  { key: 'amonestaciones', icon: '⚠️', label: 'Amonestaciones' },
]

// ═════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════
export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<UsuarioPanel | null>(null)
  const [activeNav, setActiveNav] = useState('dashboard')
  const [loading, setLoading] = useState(true)

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
      <div className="flex items-center justify-center min-h-screen font-sans bg-bg text-text">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <div className="text-xl font-bold text-red mb-4">
            Sin acceso
          </div>
          <p className="text-textMuted">
            Tu usuario no tiene permisos para este panel.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-purple hover:bg-purpleDark text-white px-6 py-3 rounded-btn font-bold transition-colors"
          >
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
    <div className="font-sans bg-bg text-text min-h-screen">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b-4 border-purple h-[68px] shadow-[0_2px_16px_rgba(91,53,197,0.08)]">
        <div className="flex items-center justify-between px-7 h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-[46px] w-auto"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <div className="text-xs font-black text-purple uppercase tracking-[0.04em] leading-tight">
                Educar Para Transformar
              </div>
              <div className="text-[10px] text-textMuted uppercase tracking-[0.1em]">
                Panel {perfil.rol}
              </div>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple to-purpleMid text-white flex items-center justify-center font-black text-sm">
              {initials}
            </div>
            <div>
              <div className="text-sm font-bold text-text">
                {perfil.nombre} {perfil.apellido}
              </div>
              <div className="text-xs text-textMuted">{perfil.rol}</div>
            </div>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-purpleLight text-purple px-3.5 py-2 rounded-btn text-xs font-bold hover:bg-purple transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-68px)]">
        {/* SIDEBAR */}
        <aside className="w-[220px] bg-white border-r border-border flex-shrink-0 py-5">
          <div className="text-[10px] text-textMuted font-black uppercase tracking-[0.1em] px-5 pb-3.5 border-b border-border mb-1.5">
            Menú
          </div>
          {navItems.map((item) => (
            <div
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`flex items-center gap-2.5 px-5 py-2.5 cursor-pointer text-sm font-bold transition-all ${
                activeNav === item.key
                  ? 'text-purple bg-purpleLight border-l-[3px] border-purple'
                  : 'text-textMuted hover:text-purple hover:bg-purpleLight/50 border-l-[3px] border-transparent'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-7 overflow-y-auto">
          {activeNav === 'dashboard' && (
            <Dashboard esAdmin={esAdmin} perfil={perfil} />
          )}
          {activeNav === 'usuarios' && esAdmin && <GestionUsuarios />}
          {activeNav === 'alumnos' && esAdmin && <GestionAlumnos />}
          {activeNav === 'docentes' && esAdmin && <GestionDocentes />}
          {activeNav === 'cursos' && esAdmin && <GestionCursos />}
          {activeNav === 'materias' && esAdmin && <GestionMaterias />}
          {activeNav === 'asignaciones' && esAdmin && <GestionAsignaciones />}
          {activeNav === 'cuotas' && esAdmin && <GestionCuotas />}
          {activeNav === 'inscripciones' && esAdmin && <GestionInscripciones />}
          {activeNav === 'noticias' && esAdmin && (
            <GestionNoticias userId={user.id} />
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
// ═════════════════════════════════════════════════════════════
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
      <div className="flex items-center justify-center min-h-screen font-sans bg-bg text-text">
        <p className="text-purple font-bold">Cargando...</p>
      </div>
    )

  const handleLogin = async (e: FormEvent) => {
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
    <div className="flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-purpleLight to-bg">
      <div className="bg-white rounded-2xl p-11 w-full max-w-[380px] shadow-card">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-[70px] mb-3 mx-auto"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="text-[17px] font-black text-purple">
            Panel Administrativo
          </div>
          <div className="text-xs text-textMuted mt-1">
            Educar Para Transformar
          </div>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-textMuted text-xs font-bold mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-3.5 py-2.5 rounded-input border border-border focus:outline-none focus:ring-2 focus:ring-purple text-text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
            />
          </div>
          <div>
            <label className="block text-textMuted text-xs font-bold mb-2">Contraseña</label>
            <input
              type="password"
              required
              className="w-full px-3.5 py-2.5 rounded-input border border-border focus:outline-none focus:ring-2 focus:ring-purple text-text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3.5 text-xs font-bold text-red mb-3.5">
              ⚠️ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className={`w-full bg-gradient-to-r from-purple to-purpleMid text-white py-3.5 rounded-btn text-sm font-bold transition-colors ${
              busy ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {busy ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
//  DASHBOARD
// ═════════════════════════════════════════════════════════
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
      supabase.from('alumnos').select('id_alumno', { count: 'exact' }).eq('activo', true),
      supabase.from('docentes').select('id_docente', { count: 'exact' }).eq('activo', true),
      supabase.from('inscripciones').select('id_inscripcion', { count: 'exact' }).eq('estado', 'Pendiente'),
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
          color: 'text-purple',
        },
        {
          icon: '👨‍🏫',
          label: 'Docentes activos',
          value: stats.docentes,
          color: 'text-blue',
        },
        {
          icon: '📋',
          label: 'Inscripciones pendientes',
          value: stats.inscripciones,
          color: 'text-orange',
        },
        {
          icon: '💳',
          label: 'Cuotas sin pagar',
          value: stats.cuotasPendientes,
          color: 'text-red',
        },
      ]
    : []

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-black text-purple mb-6">
          Bienvenido/a, {perfil.nombre} 👋
        </h2>
        <p className="text-textMuted mb-0">
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {esAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-7">
          {statItems.map((s) => (
            <div key={s.label} className={`bg-white rounded-2xl shadow-card p-6 border-t-[3px] ${s.color}`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-4xl font-black" style={{ color: s.color }}>
                {s.value}
              </div>
              <div className="text-xs text-textMuted font-bold mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="text-xl font-black text-purple mb-4">Accesos rápidos</div>
        <div className="flex flex-wrap gap-3">
          {(esAdmin ? NAV_ADMIN : NAV_DOCENTE)
            .filter((n) => n.key !== 'dashboard')
            .map((item) => (
              <div
                key={item.key}
                className="bg-white rounded-2xl shadow-card p-4 cursor-pointer min-w-[140px] text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-card-hover flex-1"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-bold text-purple">{item.label}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}