import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AdminPanel.tsx - Versión TailwindCSS
 * Panel de administración — Educar Para Transformar
 * Roles: Admin / Directivo → acceso completo
 *        Docente           → solo sus secciones
 */
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
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
];
const NAV_DOCENTE = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'asistencia', icon: '📅', label: 'Tomar asistencia' },
    { key: 'calificaciones', icon: '📝', label: 'Calificaciones' },
    { key: 'amonestaciones', icon: '⚠️', label: 'Amonestaciones' },
];
// ═════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════
export default function AdminPanel() {
    const [user, setUser] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [activeNav, setActiveNav] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_e, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        supabase
            .from('usuarios')
            .select('*')
            .eq('id_usuario', user.id)
            .single()
            .then(({ data }) => {
            if (data)
                setPerfil(data);
            setLoading(false);
        });
    }, [user]);
    if (!user || loading)
        return _jsx(LoginAdmin, { onLogin: setUser, loading: loading });
    if (!perfil || !['Admin', 'Directivo', 'Docente'].includes(perfil.rol)) {
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen font-sans bg-bg text-text", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83D\uDEAB" }), _jsx("div", { className: "text-xl font-bold text-red mb-4", children: "Sin acceso" }), _jsx("p", { className: "text-textMuted", children: "Tu usuario no tiene permisos para este panel." }), _jsx("button", { onClick: () => supabase.auth.signOut(), className: "bg-purple hover:bg-purpleDark text-white px-6 py-3 rounded-btn font-bold transition-colors", children: "Salir" })] }) }));
    }
    const esAdmin = ['Admin', 'Directivo'].includes(perfil.rol);
    const navItems = esAdmin ? NAV_ADMIN : NAV_DOCENTE;
    const initials = `${perfil.nombre[0]}${perfil.apellido[0]}`;
    return (_jsxs("div", { className: "font-sans bg-bg text-text min-h-screen", children: [_jsx("header", { className: "sticky top-0 z-50 bg-white border-b-4 border-purple h-[68px] shadow-[0_2px_16px_rgba(91,53,197,0.08)]", children: _jsxs("div", { className: "flex items-center justify-between px-7 h-full", children: [_jsxs("div", { className: "flex items-center gap-2.5 flex-shrink-0", children: [_jsx("img", { src: "/logo.png", alt: "Logo", className: "h-[46px] w-auto", onError: (e) => {
                                        ;
                                        e.target.style.display = 'none';
                                    } }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-black text-purple uppercase tracking-[0.04em] leading-tight", children: "Educar Para Transformar" }), _jsxs("div", { className: "text-[10px] text-textMuted uppercase tracking-[0.1em]", children: ["Panel ", perfil.rol] })] })] }), _jsxs("div", { className: "flex items-center gap-3.5", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-purple to-purpleMid text-white flex items-center justify-center font-black text-sm", children: initials }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-bold text-text", children: [perfil.nombre, " ", perfil.apellido] }), _jsx("div", { className: "text-xs text-textMuted", children: perfil.rol })] }), _jsx("button", { onClick: () => supabase.auth.signOut(), className: "bg-purpleLight text-purple px-3.5 py-2 rounded-btn text-xs font-bold hover:bg-purple transition-colors", children: "Salir" })] })] }) }), _jsxs("div", { className: "flex min-h-[calc(100vh-68px)]", children: [_jsxs("aside", { className: "w-[220px] bg-white border-r border-border flex-shrink-0 py-5", children: [_jsx("div", { className: "text-[10px] text-textMuted font-black uppercase tracking-[0.1em] px-5 pb-3.5 border-b border-border mb-1.5", children: "Men\u00FA" }), navItems.map((item) => (_jsxs("div", { onClick: () => setActiveNav(item.key), className: `flex items-center gap-2.5 px-5 py-2.5 cursor-pointer text-sm font-bold transition-all ${activeNav === item.key
                                    ? 'text-purple bg-purpleLight border-l-[3px] border-purple'
                                    : 'text-textMuted hover:text-purple hover:bg-purpleLight/50 border-l-[3px] border-transparent'}`, children: [_jsx("span", { children: item.icon }), _jsx("span", { children: item.label })] }, item.key)))] }), _jsxs("main", { className: "flex-1 p-7 overflow-y-auto", children: [activeNav === 'dashboard' && (_jsx(Dashboard, { esAdmin: esAdmin, perfil: perfil })), activeNav === 'usuarios' && esAdmin && _jsx(GestionUsuarios, {}), activeNav === 'alumnos' && esAdmin && _jsx(GestionAlumnos, {}), activeNav === 'docentes' && esAdmin && _jsx(GestionDocentes, {}), activeNav === 'cursos' && esAdmin && _jsx(GestionCursos, {}), activeNav === 'materias' && esAdmin && _jsx(GestionMaterias, {}), activeNav === 'asignaciones' && esAdmin && _jsx(GestionAsignaciones, {}), activeNav === 'cuotas' && esAdmin && _jsx(GestionCuotas, {}), activeNav === 'inscripciones' && esAdmin && _jsx(GestionInscripciones, {}), activeNav === 'noticias' && esAdmin && (_jsx(GestionNoticias, { userId: user.id })), activeNav === 'asistencia' && !esAdmin && (_jsx(TomarAsistencia, { userId: user.id })), activeNav === 'calificaciones' && !esAdmin && (_jsx(CargarCalificaciones, { userId: user.id })), activeNav === 'amonestaciones' && !esAdmin && (_jsx(GestionAmonestaciones, { userId: user.id }))] })] })] }));
}
// ═══════════════════════════════════════════════════════════════
//  LOGIN ADMIN
// ═════════════════════════════════════════════════════════════
function LoginAdmin({ onLogin, loading, }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    if (loading)
        return (_jsx("div", { className: "flex items-center justify-center min-h-screen font-sans bg-bg text-text", children: _jsx("p", { className: "text-purple font-bold", children: "Cargando..." }) }));
    const handleLogin = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { data, error: err } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (err || !data.user) {
            setError('Credenciales incorrectas.');
            setBusy(false);
            return;
        }
        onLogin(data.user);
        setBusy(false);
    };
    return (_jsx("div", { className: "flex items-center justify-center min-h-screen font-sans bg-gradient-to-br from-purpleLight to-bg", children: _jsxs("div", { className: "bg-white rounded-2xl p-11 w-full max-w-[380px] shadow-card", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("img", { src: "/logo.png", alt: "Logo", className: "h-[70px] mb-3 mx-auto", onError: (e) => {
                                ;
                                e.target.style.display = 'none';
                            } }), _jsx("div", { className: "text-[17px] font-black text-purple", children: "Panel Administrativo" }), _jsx("div", { className: "text-xs text-textMuted mt-1", children: "Educar Para Transformar" })] }), _jsxs("form", { onSubmit: handleLogin, className: "flex flex-col gap-3.5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-textMuted text-xs font-bold mb-2", children: "Email" }), _jsx("input", { type: "email", required: true, className: "w-full px-3.5 py-2.5 rounded-input border border-border focus:outline-none focus:ring-2 focus:ring-purple text-text", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@email.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-textMuted text-xs font-bold mb-2", children: "Contrase\u00F1a" }), _jsx("input", { type: "password", required: true, className: "w-full px-3.5 py-2.5 rounded-input border border-border focus:outline-none focus:ring-2 focus:ring-purple text-text", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), error && (_jsxs("div", { className: "bg-red-500/10 border border-red-500/40 rounded-lg p-3.5 text-xs font-bold text-red mb-3.5", children: ["\u26A0\uFE0F ", error] })), _jsx("button", { type: "submit", disabled: busy, className: `w-full bg-gradient-to-r from-purple to-purpleMid text-white py-3.5 rounded-btn text-sm font-bold transition-colors ${busy ? 'opacity-60 cursor-not-allowed' : ''}`, children: busy ? 'Ingresando...' : 'Ingresar' })] })] }) }));
}
// ═════════════════════════════════════════════════════════
//  DASHBOARD
// ═════════════════════════════════════════════════════════
function Dashboard({ esAdmin, perfil, }) {
    const [stats, setStats] = useState({
        alumnos: 0,
        docentes: 0,
        inscripciones: 0,
        cuotasPendientes: 0,
    });
    useEffect(() => {
        if (!esAdmin)
            return;
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
            });
        });
    }, [esAdmin]);
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
        : [];
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-7", children: [_jsxs("h2", { className: "text-2xl font-black text-purple mb-6", children: ["Bienvenido/a, ", perfil.nombre, " \uD83D\uDC4B"] }), _jsx("p", { className: "text-textMuted mb-0", children: new Date().toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }) })] }), esAdmin && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-7", children: statItems.map((s) => (_jsxs("div", { className: `bg-white rounded-2xl shadow-card p-6 border-t-[3px] ${s.color}`, children: [_jsx("div", { className: "text-3xl mb-2", children: s.icon }), _jsx("div", { className: "text-4xl font-black", style: { color: s.color }, children: s.value }), _jsx("div", { className: "text-xs text-textMuted font-bold mt-1", children: s.label })] }, s.label))) })), _jsxs("div", { className: "bg-white rounded-2xl shadow-card p-6", children: [_jsx("div", { className: "text-xl font-black text-purple mb-4", children: "Accesos r\u00E1pidos" }), _jsx("div", { className: "flex flex-wrap gap-3", children: (esAdmin ? NAV_ADMIN : NAV_DOCENTE)
                            .filter((n) => n.key !== 'dashboard')
                            .map((item) => (_jsxs("div", { className: "bg-white rounded-2xl shadow-card p-4 cursor-pointer min-w-[140px] text-center transition-all duration-150 hover:-translate-y-1 hover:shadow-card-hover flex-1", children: [_jsx("div", { className: "text-3xl mb-2", children: item.icon }), _jsx("div", { className: "text-sm font-bold text-purple", children: item.label })] }, item.key))) })] })] }));
}
