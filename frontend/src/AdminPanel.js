import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * AdminPanel.tsx
 * Panel de administración — Educar Para Transformar
 * Roles: Admin / Directivo → acceso completo
 *        Docente           → solo sus secciones
 */
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
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
};
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
];
// ═══════════════════════════════════════════════════════════════
//  ESTILOS REUTILIZABLES
// ═══════════════════════════════════════════════════════════════
const card = {
    background: C.white,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 16px rgba(91,53,197,0.06)',
    border: `1px solid ${C.border}`,
};
const cardTitle = {
    fontSize: 15,
    fontWeight: 800,
    color: C.text,
    marginBottom: 20,
};
const th = {
    textAlign: 'left',
    fontSize: 10,
    fontWeight: 800,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    padding: '0 12px 12px 0',
    borderBottom: `2px solid ${C.border}`,
};
const td = {
    padding: '11px 12px 11px 0',
    fontSize: 13,
    borderBottom: `1px solid ${C.border}`,
    verticalAlign: 'middle',
};
const input = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `2px solid ${C.border}`,
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    color: C.text,
    boxSizing: 'border-box',
};
const label = {
    fontSize: 11,
    fontWeight: 800,
    color: C.textMuted,
    display: 'block',
    marginBottom: 5,
};
const btnPrimary = {
    background: `linear-gradient(135deg, ${C.purple}, ${C.purpleMid})`,
    color: C.white,
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'inherit',
};
const btnSecondary = {
    background: C.purpleLight,
    color: C.purple,
    border: 'none',
    borderRadius: 10,
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'inherit',
};
const btnDanger = {
    background: '#E74C3C1A',
    color: C.red,
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'inherit',
};
const badge = (color) => ({
    display: 'inline-block',
    background: color + '1A',
    color,
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 800,
});
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
    { key: 'inscripciones', icon: '📋', label: 'Inscripciones' },
    { key: 'noticias', icon: '📰', label: 'Noticias' },
];
const NAV_DOCENTE = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'asistencia', icon: '📅', label: 'Tomar asistencia' },
    { key: 'calificaciones', icon: '📝', label: 'Calificaciones' },
    { key: 'amonestaciones', icon: '⚠️', label: 'Amonestaciones' },
];
// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
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
        return (_jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: "'Nunito',sans-serif",
            }, children: _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 48, marginBottom: 16 }, children: "\uD83D\uDEAB" }), _jsx("div", { style: { fontSize: 18, fontWeight: 800, color: C.red }, children: "Sin acceso" }), _jsx("p", { style: { color: C.textMuted }, children: "Tu usuario no tiene permisos para este panel." }), _jsx("button", { style: btnPrimary, onClick: () => supabase.auth.signOut(), children: "Salir" })] }) }));
    }
    const esAdmin = ['Admin', 'Directivo'].includes(perfil.rol);
    const navItems = esAdmin ? NAV_ADMIN : NAV_DOCENTE;
    const initials = `${perfil.nombre[0]}${perfil.apellido[0]}`;
    return (_jsxs("div", { style: {
            fontFamily: "'Nunito','Segoe UI',sans-serif",
            background: C.bg,
            minHeight: '100vh',
            color: C.text,
        }, children: [_jsxs("header", { style: {
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
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("img", { src: '/logo.png', alt: 'Logo', style: { height: 46 }, onError: (e) => {
                                    ;
                                    e.target.style.display = 'none';
                                } }), _jsxs("div", { children: [_jsx("div", { style: {
                                            fontSize: 12,
                                            fontWeight: 900,
                                            color: C.purple,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                        }, children: "Educar Para Transformar" }), _jsxs("div", { style: { fontSize: 10, color: C.textMuted }, children: ["Panel ", perfil.rol] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14 }, children: [_jsx("div", { style: {
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
                                }, children: initials }), _jsxs("div", { children: [_jsxs("div", { style: { fontSize: 13, fontWeight: 800 }, children: [perfil.nombre, " ", perfil.apellido] }), _jsx("div", { style: { fontSize: 11, color: C.textMuted }, children: perfil.rol })] }), _jsx("button", { style: { ...btnSecondary, padding: '7px 14px', fontSize: 12 }, onClick: () => supabase.auth.signOut(), children: "Salir" })] })] }), _jsxs("div", { style: { display: 'flex', minHeight: 'calc(100vh - 68px)' }, children: [_jsxs("aside", { style: {
                            width: 220,
                            background: C.white,
                            borderRight: `1px solid ${C.border}`,
                            padding: '20px 0',
                            flexShrink: 0,
                        }, children: [_jsx("div", { style: {
                                    fontSize: 10,
                                    color: C.textMuted,
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    padding: '0 20px 14px',
                                    borderBottom: `1px solid ${C.border}`,
                                    marginBottom: 6,
                                }, children: "Men\u00FA" }), navItems.map((item) => (_jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '11px 20px',
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: activeNav === item.key ? 800 : 600,
                                    color: activeNav === item.key ? C.purple : C.textMuted,
                                    background: activeNav === item.key ? C.purpleLight : 'none',
                                    borderLeft: activeNav === item.key
                                        ? `3px solid ${C.purple}`
                                        : '3px solid transparent',
                                    transition: 'all 0.15s',
                                }, onClick: () => setActiveNav(item.key), children: [_jsx("span", { children: item.icon }), _jsx("span", { children: item.label })] }, item.key)))] }), _jsxs("main", { style: { flex: 1, padding: 28, overflowY: 'auto' }, children: [activeNav === 'dashboard' && (_jsx(Dashboard, { esAdmin: esAdmin, perfil: perfil })), activeNav === 'usuarios' && esAdmin && _jsx(GestionUsuarios, {}), activeNav === 'alumnos' && esAdmin && _jsx(GestionAlumnos, {}), activeNav === 'docentes' && esAdmin && _jsx(GestionDocentes, {}), activeNav === 'cursos' && esAdmin && _jsx(GestionCursos, {}), activeNav === 'materias' && esAdmin && _jsx(GestionMaterias, {}), activeNav === 'asignaciones' && esAdmin && _jsx(GestionAsignaciones, {}), activeNav === 'cuotas' && esAdmin && _jsx(GestionCuotas, {}), activeNav === 'inscripciones' && esAdmin && _jsx(GestionInscripciones, {}), activeNav === 'noticias' && esAdmin && (_jsx(GestionNoticias, { userId: user.id })), activeNav === 'asistencia' && !esAdmin && (_jsx(TomarAsistencia, { userId: user.id })), activeNav === 'calificaciones' && !esAdmin && (_jsx(CargarCalificaciones, { userId: user.id })), activeNav === 'amonestaciones' && !esAdmin && (_jsx(GestionAmonestaciones, { userId: user.id }))] })] })] }));
}
// ═══════════════════════════════════════════════════════════════
//  LOGIN ADMIN
// ═══════════════════════════════════════════════════════════════
function LoginAdmin({ onLogin, loading, }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    if (loading)
        return (_jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: "'Nunito',sans-serif",
            }, children: _jsx("p", { style: { color: C.purple, fontWeight: 800 }, children: "Cargando..." }) }));
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
    return (_jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            fontFamily: "'Nunito',sans-serif",
            background: `radial-gradient(ellipse at 60% 0%, ${C.purpleLight} 0%, ${C.bg} 60%)`,
        }, children: _jsxs("div", { style: { ...card, width: '100%', maxWidth: 380, padding: '44px 36px' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 32 }, children: [_jsx("img", { src: '/logo.png', alt: 'Logo', style: { height: 70, marginBottom: 12 }, onError: (e) => {
                                ;
                                e.target.style.display = 'none';
                            } }), _jsx("div", { style: { fontSize: 17, fontWeight: 900, color: C.purple }, children: "Panel Administrativo" }), _jsx("div", { style: { fontSize: 12, color: C.textMuted, marginTop: 4 }, children: "Educar Para Transformar" })] }), _jsxs("form", { onSubmit: handleLogin, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Email" }), _jsx("input", { type: 'email', required: true, style: input, value: email, onChange: (e) => setEmail(e.target.value), placeholder: 'admin@email.com' })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Contrase\u00F1a" }), _jsx("input", { type: 'password', required: true, style: input, value: password, onChange: (e) => setPassword(e.target.value), placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' })] }), error && (_jsxs("div", { style: {
                                background: '#E74C3C12',
                                border: '1px solid #E74C3C40',
                                borderRadius: 8,
                                padding: '10px 14px',
                                fontSize: 12,
                                color: C.red,
                                fontWeight: 700,
                            }, children: ["\u26A0\uFE0F ", error] })), _jsx("button", { type: 'submit', disabled: busy, style: {
                                ...btnPrimary,
                                padding: 14,
                                fontSize: 14,
                                opacity: busy ? 0.6 : 1,
                            }, children: busy ? 'Ingresando...' : 'Ingresar' })] })] }) }));
}
// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════
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
            });
        });
    }, [esAdmin]);
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
        : [];
    return (_jsxs("div", { children: [_jsxs("div", { style: { marginBottom: 28 }, children: [_jsxs("h2", { style: { fontSize: 24, fontWeight: 900, margin: '0 0 6px' }, children: ["Bienvenido/a, ", perfil.nombre, " \uD83D\uDC4B"] }), _jsx("p", { style: { color: C.textMuted, margin: 0, fontSize: 14 }, children: new Date().toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        }) })] }), esAdmin && (_jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 16,
                    marginBottom: 28,
                }, children: statItems.map((s) => (_jsxs("div", { style: { ...card, borderTop: `3px solid ${s.color}` }, children: [_jsx("div", { style: { fontSize: 28, marginBottom: 8 }, children: s.icon }), _jsx("div", { style: { fontSize: 30, fontWeight: 900, color: s.color }, children: s.value }), _jsx("div", { style: {
                                fontSize: 12,
                                color: C.textMuted,
                                fontWeight: 700,
                                marginTop: 4,
                            }, children: s.label })] }, s.label))) })), _jsxs("div", { style: { ...card }, children: [_jsx("div", { style: cardTitle, children: "Accesos r\u00E1pidos" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 12 }, children: (esAdmin ? NAV_ADMIN : NAV_DOCENTE)
                            .filter((n) => n.key !== 'dashboard')
                            .map((item) => (_jsxs("div", { style: {
                                ...card,
                                padding: '16px 20px',
                                cursor: 'pointer',
                                minWidth: 140,
                                textAlign: 'center',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                                flex: 1,
                            }, onMouseEnter: (e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow =
                                    '0 6px 24px rgba(91,53,197,0.12)';
                            }, onMouseLeave: (e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '';
                            }, children: [_jsx("div", { style: { fontSize: 28, marginBottom: 8 }, children: item.icon }), _jsx("div", { style: { fontSize: 13, fontWeight: 800, color: C.purple }, children: item.label })] }, item.key))) })] })] }));
}
// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE USUARIOS (crear directivos, docentes, alumnos)
// ═══════════════════════════════════════════════════════════════
function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        rol: 'Docente',
    });
    const [msg, setMsg] = useState('');
    const load = useCallback(async () => {
        const { data } = await supabase
            .from('usuarios')
            .select('*')
            .order('apellido');
        if (data)
            setUsuarios(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        const { error } = await supabase.functions.invoke('crear-usuario', {
            body: {
                email: form.email,
                password: form.password,
                nombre: form.nombre,
                apellido: form.apellido,
                rol: form.rol,
            },
        });
        if (error) {
            setMsg('Error: ' + error.message);
            setLoading(false);
            return;
        }
        setMsg('✅ Usuario creado correctamente.');
        setForm({
            email: '',
            password: '',
            nombre: '',
            apellido: '',
            rol: 'Docente',
        });
        setShowForm(false);
        load();
        setLoading(false);
    };
    const toggleActivo = async (id, activo) => {
        await supabase
            .from('usuarios')
            .update({ activo: !activo })
            .eq('id_usuario', id);
        load();
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83D\uDC65 Usuarios" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nuevo usuario' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Crear nuevo usuario" }), _jsxs("form", { onSubmit: handleCreate, style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Nombre" }), _jsx("input", { style: input, required: true, value: form.nombre, onChange: (e) => setForm((p) => ({ ...p, nombre: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Apellido" }), _jsx("input", { style: input, required: true, value: form.apellido, onChange: (e) => setForm((p) => ({ ...p, apellido: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Email" }), _jsx("input", { type: 'email', style: input, required: true, value: form.email, onChange: (e) => setForm((p) => ({ ...p, email: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Contrase\u00F1a" }), _jsx("input", { type: 'password', style: input, required: true, minLength: 6, value: form.password, onChange: (e) => setForm((p) => ({ ...p, password: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Rol" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.rol, onChange: (e) => setForm((p) => ({ ...p, rol: e.target.value })), children: [_jsx("option", { value: 'Docente', children: "Docente" }), _jsx("option", { value: 'Directivo', children: "Directivo" }), _jsx("option", { value: 'Admin', children: "Admin" })] })] }), _jsx("div", { style: { display: 'flex', alignItems: 'flex-end' }, children: _jsx("button", { type: 'submit', disabled: loading, style: {
                                        ...btnPrimary,
                                        width: '100%',
                                        opacity: loading ? 0.6 : 1,
                                    }, children: loading ? 'Creando...' : 'Crear usuario' }) }), msg && (_jsx("div", { style: {
                                    gridColumn: '1/-1',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Nombre" }), _jsx("th", { style: th, children: "Email" }), _jsx("th", { style: th, children: "Rol" }), _jsx("th", { style: th, children: "Estado" }), _jsx("th", { style: th, children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: usuarios.map((u) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [u.apellido, ", ", u.nombre] }), _jsx("td", { style: { ...td, color: C.textMuted }, children: u.email }), _jsx("td", { style: td, children: _jsx("span", { style: badge(u.rol === 'Admin' || u.rol === 'Directivo'
                                                ? C.purple
                                                : C.blue), children: u.rol }) }), _jsx("td", { style: td, children: _jsx("span", { style: badge(u.activo ? C.green : C.red), children: u.activo ? 'Activo' : 'Inactivo' }) }), _jsx("td", { style: td, children: _jsx("button", { style: u.activo
                                                ? btnDanger
                                                : {
                                                    ...btnDanger,
                                                    background: '#27AE601A',
                                                    color: C.green,
                                                }, onClick: () => toggleActivo(u.id_usuario, u.activo), children: u.activo ? 'Desactivar' : 'Activar' }) })] }, u.id_usuario))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE ALUMNOS
// ═══════════════════════════════════════════════════════════════
function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        fecha_nacimiento: '',
        id_curso: '',
        email_padre: '',
        obra_social: '',
    });
    const load = useCallback(async () => {
        const [{ data: al }, { data: cu }] = await Promise.all([
            supabase
                .from('alumnos')
                .select('*, cursos(nivel, grado_anio, division)')
                .order('apellido'),
            supabase.from('cursos').select('*').eq('activo', true),
        ]);
        if (al)
            setAlumnos(al);
        if (cu)
            setCursos(cu);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        // Buscar usuario padre por email
        const { data: padre } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .eq('email', form.email_padre)
            .single();
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
        ]);
        if (error) {
            setMsg('Error: ' + error.message);
        }
        else {
            setMsg('✅ Alumno registrado.');
            setShowForm(false);
            load();
        }
        setLoading(false);
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83C\uDF93 Alumnos" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nuevo alumno' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Registrar alumno" }), _jsxs("form", { onSubmit: handleCreate, style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Nombre" }), _jsx("input", { style: input, required: true, value: form.nombre, onChange: (e) => setForm((p) => ({ ...p, nombre: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Apellido" }), _jsx("input", { style: input, required: true, value: form.apellido, onChange: (e) => setForm((p) => ({ ...p, apellido: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "DNI" }), _jsx("input", { style: input, required: true, value: form.dni, onChange: (e) => setForm((p) => ({ ...p, dni: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Fecha de nacimiento" }), _jsx("input", { type: 'date', style: input, required: true, value: form.fecha_nacimiento, onChange: (e) => setForm((p) => ({ ...p, fecha_nacimiento: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Curso" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.id_curso, onChange: (e) => setForm((p) => ({ ...p, id_curso: e.target.value })), children: [_jsx("option", { value: '', children: "Sin asignar" }), cursos.map((c) => (_jsxs("option", { value: c.id_curso, children: [c.nivel, " \u2014 ", c.grado_anio, " \"", c.division, "\""] }, c.id_curso)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Email del padre/tutor" }), _jsx("input", { type: 'email', style: input, value: form.email_padre, onChange: (e) => setForm((p) => ({ ...p, email_padre: e.target.value })), placeholder: 'Debe existir en usuarios' })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Obra social" }), _jsx("input", { style: input, value: form.obra_social, onChange: (e) => setForm((p) => ({ ...p, obra_social: e.target.value })) })] }), _jsx("div", { style: { display: 'flex', alignItems: 'flex-end' }, children: _jsx("button", { type: 'submit', disabled: loading, style: {
                                        ...btnPrimary,
                                        width: '100%',
                                        opacity: loading ? 0.6 : 1,
                                    }, children: loading ? 'Guardando...' : 'Registrar alumno' }) }), msg && (_jsx("div", { style: {
                                    gridColumn: '1/-1',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Alumno" }), _jsx("th", { style: th, children: "DNI" }), _jsx("th", { style: th, children: "Curso" }), _jsx("th", { style: th, children: "Estado" })] }) }), _jsx("tbody", { children: alumnos.map((a) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [a.apellido, ", ", a.nombre] }), _jsx("td", { style: { ...td, color: C.textMuted }, children: a.dni }), _jsx("td", { style: td, children: a.cursos ? (`${a.cursos.nivel} — ${a.cursos.grado_anio} "${a.cursos.division}"`) : (_jsx("span", { style: { color: C.textMuted }, children: "Sin asignar" })) }), _jsx("td", { style: td, children: _jsx("span", { style: badge(a.activo ? C.green : C.red), children: a.activo ? 'Activo' : 'Inactivo' }) })] }, a.id_alumno))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE DOCENTES
// ═══════════════════════════════════════════════════════════════
function GestionDocentes() {
    const [docentes, setDocentes] = useState([]);
    useEffect(() => {
        supabase
            .from('docentes')
            .select('*, usuarios(nombre, apellido, email)')
            .order('id_docente')
            .then(({ data }) => {
            if (data)
                setDocentes(data);
        });
    }, []);
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\uD83D\uDC68\u200D\uD83C\uDFEB Docentes" }), _jsx("div", { style: { ...card, marginBottom: 12 }, children: _jsxs("p", { style: { fontSize: 13, color: C.textMuted, margin: 0 }, children: ["Para agregar docentes, primero cre\u00E1 el usuario desde", ' ', _jsx("strong", { children: "Usuarios" }), " con rol ", _jsx("strong", { children: "Docente" }), ". El registro en esta tabla se crea autom\u00E1ticamente."] }) }), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Docente" }), _jsx("th", { style: th, children: "Email" }), _jsx("th", { style: th, children: "Especialidad" }), _jsx("th", { style: th, children: "Estado" })] }) }), _jsx("tbody", { children: docentes.map((d) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [d.usuarios?.apellido, ", ", d.usuarios?.nombre] }), _jsx("td", { style: { ...td, color: C.textMuted }, children: d.usuarios?.email }), _jsx("td", { style: td, children: d.especialidad ?? '—' }), _jsx("td", { style: td, children: _jsx("span", { style: badge(d.activo ? C.green : C.red), children: d.activo ? 'Activo' : 'Inactivo' }) })] }, d.id_docente))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE CURSOS
// ═══════════════════════════════════════════════════════════════
function GestionCursos() {
    const [cursos, setCursos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        nivel: 'Inicial',
        grado_anio: '',
        division: 'A',
        capacidad_maxima: '30',
    });
    const load = useCallback(async () => {
        const { data } = await supabase
            .from('cursos')
            .select('*')
            .eq('activo', true)
            .order('nivel');
        if (data)
            setCursos(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        // Obtener período activo
        const { data: periodo } = await supabase
            .from('periodos_academicos')
            .select('id_periodo')
            .eq('activo', true)
            .single();
        const { error } = await supabase.from('cursos').insert([
            {
                nivel: form.nivel,
                grado_anio: form.grado_anio,
                division: form.division,
                capacidad_maxima: Number(form.capacidad_maxima),
                id_periodo: periodo?.id_periodo ?? null,
            },
        ]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Curso creado.');
            setShowForm(false);
            load();
        }
        setLoading(false);
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83C\uDFEB Cursos" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nuevo curso' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Crear curso" }), _jsxs("form", { onSubmit: handleCreate, style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr 1fr',
                            gap: 14,
                        }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Nivel" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.nivel, onChange: (e) => setForm((p) => ({ ...p, nivel: e.target.value })), children: [_jsx("option", { children: "Inicial" }), _jsx("option", { children: "Primario" }), _jsx("option", { children: "Secundario" })] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Grado / A\u00F1o" }), _jsx("input", { style: input, required: true, value: form.grado_anio, placeholder: '1er Grado', onChange: (e) => setForm((p) => ({ ...p, grado_anio: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Divisi\u00F3n" }), _jsx("input", { style: input, required: true, value: form.division, placeholder: 'A', onChange: (e) => setForm((p) => ({ ...p, division: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Capacidad m\u00E1x." }), _jsx("input", { type: 'number', style: input, value: form.capacidad_maxima, onChange: (e) => setForm((p) => ({ ...p, capacidad_maxima: e.target.value })) })] }), _jsx("div", { style: { gridColumn: '1/-1' }, children: _jsx("button", { type: 'submit', disabled: loading, style: { ...btnPrimary, opacity: loading ? 0.6 : 1 }, children: loading ? 'Guardando...' : 'Crear curso' }) }), msg && (_jsx("div", { style: {
                                    gridColumn: '1/-1',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Nivel" }), _jsx("th", { style: th, children: "Grado / A\u00F1o" }), _jsx("th", { style: th, children: "Divisi\u00F3n" }), _jsx("th", { style: th, children: "Capacidad" })] }) }), _jsx("tbody", { children: cursos.map((c) => (_jsxs("tr", { children: [_jsx("td", { style: td, children: _jsx("span", { style: badge(c.nivel === 'Inicial'
                                                ? C.green
                                                : c.nivel === 'Primario'
                                                    ? C.blue
                                                    : C.purple), children: c.nivel }) }), _jsx("td", { style: { ...td, fontWeight: 700 }, children: c.grado_anio }), _jsxs("td", { style: td, children: ["Divisi\u00F3n ", c.division] }), _jsxs("td", { style: { ...td, color: C.textMuted }, children: [c.capacidad_maxima, " alumnos"] })] }, c.id_curso))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  GESTIÓN DE MATERIAS
// ═══════════════════════════════════════════════════════════════
function GestionMaterias() {
    const [materias, setMaterias] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ nombre: '', horas_semanales: '4' });
    const [msg, setMsg] = useState('');
    const load = useCallback(async () => {
        const { data } = await supabase.from('materias').select('*').order('nombre');
        if (data)
            setMaterias(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setMsg('');
        const { error } = await supabase
            .from('materias')
            .insert([
            { nombre: form.nombre, horas_semanales: Number(form.horas_semanales) },
        ]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Materia creada.');
            setShowForm(false);
            load();
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83D\uDCDA Materias" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nueva materia' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsxs("form", { onSubmit: handleCreate, style: { display: 'flex', gap: 14, alignItems: 'flex-end' }, children: [_jsxs("div", { style: { flex: 2 }, children: [_jsx("span", { style: label, children: "Nombre de la materia" }), _jsx("input", { style: input, required: true, value: form.nombre, onChange: (e) => setForm((p) => ({ ...p, nombre: e.target.value })) })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("span", { style: label, children: "Horas semanales" }), _jsx("input", { type: 'number', style: input, value: form.horas_semanales, onChange: (e) => setForm((p) => ({ ...p, horas_semanales: e.target.value })) })] }), _jsx("button", { type: 'submit', style: btnPrimary, children: "Guardar" })] }), msg && (_jsx("div", { style: {
                            marginTop: 10,
                            fontSize: 13,
                            fontWeight: 700,
                            color: msg.startsWith('✅') ? C.green : C.red,
                        }, children: msg }))] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Materia" }), _jsx("th", { style: th, children: "Horas semanales" }), _jsx("th", { style: th, children: "Estado" })] }) }), _jsx("tbody", { children: materias.map((m) => (_jsxs("tr", { children: [_jsx("td", { style: { ...td, fontWeight: 700 }, children: m.nombre }), _jsxs("td", { style: td, children: [m.horas_semanales, " hs"] }), _jsx("td", { style: td, children: _jsx("span", { style: badge(m.activo ? C.green : C.red), children: m.activo ? 'Activa' : 'Inactiva' }) })] }, m.id_materia))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  ASIGNACIONES (docente + materia + curso)
// ═══════════════════════════════════════════════════════════════
function GestionAsignaciones() {
    const [asignaciones, setAsignaciones] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        id_docente: '',
        id_materia: '',
        id_curso: '',
    });
    const [msg, setMsg] = useState('');
    const load = useCallback(async () => {
        const [{ data: as }, { data: do_ }, { data: ma }, { data: cu }] = await Promise.all([
            supabase
                .from('asignaciones')
                .select('*, docentes(usuarios(nombre,apellido)), materias(nombre), cursos(nivel,grado_anio,division)')
                .eq('activo', true),
            supabase
                .from('docentes')
                .select('*, usuarios(nombre,apellido)')
                .eq('activo', true),
            supabase.from('materias').select('*').eq('activo', true),
            supabase.from('cursos').select('*').eq('activo', true),
        ]);
        if (as)
            setAsignaciones(as);
        if (do_)
            setDocentes(do_);
        if (ma)
            setMaterias(ma);
        if (cu)
            setCursos(cu);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setMsg('');
        const { data: periodo } = await supabase
            .from('periodos_academicos')
            .select('id_periodo')
            .eq('activo', true)
            .single();
        const { error } = await supabase.from('asignaciones').insert([
            {
                id_docente: Number(form.id_docente),
                id_materia: Number(form.id_materia),
                id_curso: Number(form.id_curso),
                id_periodo: periodo?.id_periodo ?? null,
            },
        ]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Asignación creada.');
            setShowForm(false);
            load();
        }
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83D\uDD17 Asignaciones" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nueva asignación' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Asignar docente a materia y curso" }), _jsxs("form", { onSubmit: handleCreate, style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr',
                            gap: 14,
                        }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Docente" }), _jsxs("select", { style: { ...input, appearance: 'none' }, required: true, value: form.id_docente, onChange: (e) => setForm((p) => ({ ...p, id_docente: e.target.value })), children: [_jsx("option", { value: '', children: "Seleccion\u00E1..." }), docentes.map((d) => (_jsxs("option", { value: d.id_docente, children: [d.usuarios?.apellido, ", ", d.usuarios?.nombre] }, d.id_docente)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Materia" }), _jsxs("select", { style: { ...input, appearance: 'none' }, required: true, value: form.id_materia, onChange: (e) => setForm((p) => ({ ...p, id_materia: e.target.value })), children: [_jsx("option", { value: '', children: "Seleccion\u00E1..." }), materias.map((m) => (_jsx("option", { value: m.id_materia, children: m.nombre }, m.id_materia)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Curso" }), _jsxs("select", { style: { ...input, appearance: 'none' }, required: true, value: form.id_curso, onChange: (e) => setForm((p) => ({ ...p, id_curso: e.target.value })), children: [_jsx("option", { value: '', children: "Seleccion\u00E1..." }), cursos.map((c) => (_jsxs("option", { value: c.id_curso, children: [c.nivel, " \u2014 ", c.grado_anio, " \"", c.division, "\""] }, c.id_curso)))] })] }), _jsx("div", { style: { gridColumn: '1/-1' }, children: _jsx("button", { type: 'submit', style: btnPrimary, children: "Crear asignaci\u00F3n" }) }), msg && (_jsx("div", { style: {
                                    gridColumn: '1/-1',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Docente" }), _jsx("th", { style: th, children: "Materia" }), _jsx("th", { style: th, children: "Curso" })] }) }), _jsx("tbody", { children: asignaciones.map((a) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [a.docentes?.usuarios?.apellido, ",", ' ', a.docentes?.usuarios?.nombre] }), _jsx("td", { style: td, children: a.materias?.nombre }), _jsxs("td", { style: td, children: [a.cursos?.nivel, " \u2014 ", a.cursos?.grado_anio, " \"", a.cursos?.division, "\""] })] }, a.id_asignacion))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  CUOTAS — Generación automática
// ═══════════════════════════════════════════════════════════════
function GestionCuotas() {
    const [cuotas, setCuotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        mes: String(new Date().getMonth() + 1),
        anio: String(new Date().getFullYear()),
        monto_base: '',
    });
    const load = useCallback(async () => {
        const { data } = await supabase
            .from('cuotas')
            .select('*, alumnos(nombre, apellido)')
            .order('fecha_vencimiento', { ascending: false })
            .limit(50);
        if (data)
            setCuotas(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const generarCuotas = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        // Traer todos los alumnos activos
        const { data: alumnos } = await supabase
            .from('alumnos')
            .select('id_alumno')
            .eq('activo', true);
        if (!alumnos || alumnos.length === 0) {
            setMsg('No hay alumnos activos.');
            setLoading(false);
            return;
        }
        const mes = Number(form.mes);
        const anio = Number(form.anio);
        const vencimiento = new Date(anio, mes - 1, 10); // vence el 10 de cada mes
        const cuotasNuevas = alumnos.map((a) => ({
            id_alumno: a.id_alumno,
            mes,
            anio,
            monto_base: Number(form.monto_base),
            recargo: 0,
            descuento: 0,
            fecha_vencimiento: vencimiento.toISOString().split('T')[0],
            estado: 'Pendiente',
        }));
        // upsert para no duplicar si ya existen
        const { error } = await supabase
            .from('cuotas')
            .upsert(cuotasNuevas, { onConflict: 'id_alumno,mes,anio' });
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg(`✅ ${alumnos.length} cuotas generadas para ${MESES[mes - 1]} ${anio}.`);
            load();
        }
        setLoading(false);
    };
    const CUOTA_COLOR = {
        Pendiente: C.orange,
        Pagada: C.green,
        Vencida: C.red,
        'En mora': '#C0392B',
    };
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\uD83D\uDCB3 Cuotas" }), _jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Generar cuotas autom\u00E1ticamente para todos los alumnos" }), _jsxs("form", { onSubmit: generarCuotas, style: {
                            display: 'flex',
                            gap: 14,
                            alignItems: 'flex-end',
                            flexWrap: 'wrap',
                        }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Mes" }), _jsx("select", { style: { ...input, width: 160, appearance: 'none' }, value: form.mes, onChange: (e) => setForm((p) => ({ ...p, mes: e.target.value })), children: MESES.map((m, i) => (_jsx("option", { value: i + 1, children: m }, i))) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "A\u00F1o" }), _jsx("input", { style: { ...input, width: 100 }, value: form.anio, onChange: (e) => setForm((p) => ({ ...p, anio: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Monto base ($)" }), _jsx("input", { type: 'number', style: { ...input, width: 160 }, required: true, value: form.monto_base, onChange: (e) => setForm((p) => ({ ...p, monto_base: e.target.value })), placeholder: '15000' })] }), _jsx("button", { type: 'submit', disabled: loading, style: { ...btnPrimary, opacity: loading ? 0.6 : 1 }, children: loading ? 'Generando...' : '⚡ Generar cuotas' })] }), msg && (_jsx("div", { style: {
                            marginTop: 12,
                            fontSize: 13,
                            fontWeight: 700,
                            color: msg.startsWith('✅') ? C.green : C.red,
                        }, children: msg }))] }), _jsxs("div", { style: card, children: [_jsx("div", { style: cardTitle, children: "\u00DAltimas cuotas generadas" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Alumno" }), _jsx("th", { style: th, children: "Per\u00EDodo" }), _jsx("th", { style: th, children: "Monto" }), _jsx("th", { style: th, children: "Vencimiento" }), _jsx("th", { style: th, children: "Estado" })] }) }), _jsx("tbody", { children: cuotas.map((c) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [c.alumnos?.apellido, ", ", c.alumnos?.nombre] }), _jsxs("td", { style: td, children: [MESES[c.mes - 1], " ", c.anio] }), _jsxs("td", { style: { ...td, fontWeight: 800, color: C.purple }, children: ["$", c.monto_base.toLocaleString('es-AR')] }), _jsx("td", { style: { ...td, color: C.textMuted }, children: c.fecha_vencimiento }), _jsx("td", { style: td, children: _jsx("span", { style: badge(CUOTA_COLOR[c.estado] ?? C.textMuted), children: c.estado }) })] }, c.id_cuota))) })] })] })] }));
}
// ═══════════════════════════════════════════════════════════════
//  INSCRIPCIONES
// ═══════════════════════════════════════════════════════════════
function GestionInscripciones() {
    const [inscripciones, setInscripciones] = useState([]);
    const load = useCallback(async () => {
        const { data } = await supabase
            .from('inscripciones')
            .select('*')
            .order('fecha_solicitud', { ascending: false });
        if (data)
            setInscripciones(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const cambiarEstado = async (id, estado) => {
        await supabase
            .from('inscripciones')
            .update({ estado })
            .eq('id_inscripcion', id);
        load();
    };
    const ESTADOS = [
        'Pendiente',
        'En revisión',
        'Aprobada',
        'Rechazada',
        'En lista de espera',
    ];
    const EST_COLOR = {
        Pendiente: C.orange,
        'En revisión': C.blue,
        Aprobada: C.green,
        Rechazada: C.red,
        'En lista de espera': C.textMuted,
    };
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\uD83D\uDCCB Inscripciones" }), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Aspirante" }), _jsx("th", { style: th, children: "Tutor" }), _jsx("th", { style: th, children: "Nivel" }), _jsx("th", { style: th, children: "Fecha" }), _jsx("th", { style: th, children: "Estado" }), _jsx("th", { style: th, children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: inscripciones.map((i) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [i.nombre_aspirante, _jsx("br", {}), _jsxs("span", { style: { fontSize: 11, color: C.textMuted }, children: ["DNI: ", i.dni_aspirante] })] }), _jsxs("td", { style: td, children: [i.nombre_tutor, _jsx("br", {}), _jsx("span", { style: { fontSize: 11, color: C.textMuted }, children: i.email_tutor })] }), _jsx("td", { style: td, children: _jsx("span", { style: badge(C.purple), children: i.nivel_solicitado }) }), _jsx("td", { style: { ...td, color: C.textMuted, fontSize: 12 }, children: new Date(i.fecha_solicitud).toLocaleDateString('es-AR') }), _jsx("td", { style: td, children: _jsx("span", { style: badge(EST_COLOR[i.estado] ?? C.textMuted), children: i.estado }) }), _jsx("td", { style: td, children: _jsx("select", { style: {
                                                ...input,
                                                width: 160,
                                                padding: '6px 10px',
                                                appearance: 'none',
                                            }, value: i.estado, onChange: (e) => cambiarEstado(i.id_inscripcion, e.target.value), children: ESTADOS.map((s) => (_jsx("option", { value: s, children: s }, s))) }) })] }, i.id_inscripcion))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  NOTICIAS
// ═══════════════════════════════════════════════════════════════
function GestionNoticias({ userId }) {
    const [noticias, setNoticias] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        titulo: '',
        resumen: '',
        contenido: '',
        url_imagen: '',
        destacada: false,
    });
    const load = useCallback(async () => {
        const { data } = await supabase
            .from('noticias')
            .select('*')
            .order('fecha_publicacion', { ascending: false });
        if (data)
            setNoticias(data);
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        const { error } = await supabase
            .from('noticias')
            .insert([{ ...form, id_autor: userId }]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Noticia publicada.');
            setShowForm(false);
            load();
        }
        setLoading(false);
    };
    const toggleActivo = async (id, activo) => {
        await supabase
            .from('noticias')
            .update({ activo: !activo })
            .eq('id_noticia', id);
        load();
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
                }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: 0 }, children: "\uD83D\uDCF0 Noticias" }), _jsx("button", { style: btnPrimary, onClick: () => setShowForm(!showForm), children: showForm ? 'Cancelar' : '+ Nueva noticia' })] }), showForm && (_jsxs("div", { style: { ...card, marginBottom: 24 }, children: [_jsx("div", { style: cardTitle, children: "Publicar noticia" }), _jsxs("form", { onSubmit: handleCreate, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "T\u00EDtulo" }), _jsx("input", { style: input, required: true, value: form.titulo, onChange: (e) => setForm((p) => ({ ...p, titulo: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Resumen (opcional)" }), _jsx("input", { style: input, value: form.resumen, onChange: (e) => setForm((p) => ({ ...p, resumen: e.target.value })) })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "URL de imagen (opcional)" }), _jsx("input", { style: input, value: form.url_imagen, onChange: (e) => setForm((p) => ({ ...p, url_imagen: e.target.value })), placeholder: 'https://...' })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Contenido" }), _jsx("textarea", { style: {
                                            ...input,
                                            minHeight: 120,
                                            resize: 'vertical',
                                        }, required: true, value: form.contenido, onChange: (e) => setForm((p) => ({ ...p, contenido: e.target.value })) })] }), _jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    cursor: 'pointer',
                                }, children: [_jsx("input", { type: 'checkbox', checked: form.destacada, onChange: (e) => setForm((p) => ({ ...p, destacada: e.target.checked })) }), _jsx("span", { style: { fontSize: 13, fontWeight: 700 }, children: "Marcar como destacada" })] }), _jsx("div", { style: { display: 'flex', gap: 12 }, children: _jsx("button", { type: 'submit', disabled: loading, style: { ...btnPrimary, opacity: loading ? 0.6 : 1 }, children: loading ? 'Publicando...' : 'Publicar' }) }), msg && (_jsx("div", { style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), _jsx("div", { style: card, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "T\u00EDtulo" }), _jsx("th", { style: th, children: "Fecha" }), _jsx("th", { style: th, children: "Destacada" }), _jsx("th", { style: th, children: "Estado" }), _jsx("th", { style: th, children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: noticias.map((n) => (_jsxs("tr", { children: [_jsx("td", { style: { ...td, fontWeight: 700, maxWidth: 300 }, children: n.titulo }), _jsx("td", { style: { ...td, color: C.textMuted }, children: new Date(n.fecha_publicacion).toLocaleDateString('es-AR') }), _jsx("td", { style: td, children: n.destacada ? '⭐' : '—' }), _jsx("td", { style: td, children: _jsx("span", { style: badge(n.activo ? C.green : C.red), children: n.activo ? 'Publicada' : 'Oculta' }) }), _jsx("td", { style: td, children: _jsx("button", { style: n.activo
                                                ? btnDanger
                                                : {
                                                    ...btnDanger,
                                                    background: '#27AE601A',
                                                    color: C.green,
                                                }, onClick: () => toggleActivo(n.id_noticia, n.activo), children: n.activo ? 'Ocultar' : 'Publicar' }) })] }, n.id_noticia))) })] }) })] }));
}
// ═══════════════════════════════════════════════════════════════
//  TOMAR ASISTENCIA (Docente)
// ═══════════════════════════════════════════════════════════════
function TomarAsistencia({ userId }) {
    const [asignaciones, setAsignaciones] = useState([]);
    const [selAsignacion, setSelAsignacion] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    useEffect(() => {
        supabase
            .from('docentes')
            .select('id_docente')
            .eq('id_usuario', userId)
            .single()
            .then(({ data: doc }) => {
            if (!doc)
                return;
            supabase
                .from('asignaciones')
                .select('*, materias(nombre), cursos(nivel, grado_anio, division)')
                .eq('id_docente', doc.id_docente)
                .eq('activo', true)
                .then(({ data }) => {
                if (data)
                    setAsignaciones(data);
            });
        });
    }, [userId]);
    useEffect(() => {
        if (!selAsignacion)
            return;
        // Cargar alumnos del curso de la asignación
        const asig = asignaciones.find((a) => a.id_asignacion === selAsignacion);
        if (!asig)
            return;
        // Obtener el id_curso de la asignación
        supabase
            .from('asignaciones')
            .select('id_curso')
            .eq('id_asignacion', selAsignacion)
            .single()
            .then(({ data: a }) => {
            if (!a)
                return;
            supabase
                .from('alumnos')
                .select('id_alumno, nombre, apellido')
                .eq('id_curso', a.id_curso)
                .eq('activo', true)
                .order('apellido')
                .then(({ data: al }) => {
                if (al)
                    setAlumnos(al.map((a) => ({ ...a, estado: 'Presente' })));
            });
        });
    }, [selAsignacion, asignaciones]);
    const toggleEstado = (id) => {
        setAlumnos((prev) => prev.map((a) => {
            if (a.id_alumno !== id)
                return a;
            const ciclo = [
                'Presente',
                'Ausente',
                'Tarde',
                'Justificado',
            ];
            const next = ciclo[(ciclo.indexOf(a.estado) + 1) % ciclo.length];
            return { ...a, estado: next };
        }));
    };
    const guardar = async () => {
        if (!selAsignacion || alumnos.length === 0)
            return;
        setLoading(true);
        setMsg('');
        const registros = alumnos.map((a) => ({
            id_alumno: a.id_alumno,
            id_asignacion: selAsignacion,
            fecha,
            estado: a.estado,
            registrado_por: userId,
        }));
        const { error } = await supabase
            .from('asistencias')
            .upsert(registros, { onConflict: 'id_alumno,id_asignacion,fecha' });
        if (error)
            setMsg('Error: ' + error.message);
        else
            setMsg('✅ Asistencia guardada correctamente.');
        setLoading(false);
    };
    const EST_COLOR = {
        Presente: C.green,
        Ausente: C.red,
        Tarde: C.orange,
        Justificado: C.blue,
    };
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\uD83D\uDCC5 Tomar asistencia" }), _jsx("div", { style: { ...card, marginBottom: 20 }, children: _jsxs("div", { style: {
                        display: 'flex',
                        gap: 16,
                        alignItems: 'flex-end',
                        flexWrap: 'wrap',
                    }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Clase / Materia" }), _jsxs("select", { style: { ...input, width: 280, appearance: 'none' }, value: selAsignacion ?? '', onChange: (e) => setSelAsignacion(Number(e.target.value)), children: [_jsx("option", { value: '', children: "Seleccion\u00E1 una clase..." }), asignaciones.map((a) => (_jsxs("option", { value: a.id_asignacion, children: [a.materias?.nombre, " \u2014 ", a.cursos?.nivel, ' ', a.cursos?.grado_anio, " \"", a.cursos?.division, "\""] }, a.id_asignacion)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Fecha" }), _jsx("input", { type: 'date', style: { ...input, width: 160 }, value: fecha, onChange: (e) => setFecha(e.target.value) })] })] }) }), selAsignacion && alumnos.length > 0 && (_jsxs("div", { style: card, children: [_jsxs("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 16,
                        }, children: [_jsxs("div", { style: cardTitle, children: [alumnos.length, " alumnos \u2014 Toc\u00E1 el estado para cambiar"] }), _jsx("div", { style: { display: 'flex', gap: 8 }, children: ['Presente', 'Ausente', 'Tarde', 'Justificado'].map((e) => (_jsx("span", { style: badge(EST_COLOR[e]), children: e }, e))) })] }), alumnos.map((a) => (_jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 0',
                            borderBottom: `1px solid ${C.border}`,
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsxs("div", { style: {
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
                                        }, children: [a.nombre[0], a.apellido[0]] }), _jsxs("span", { style: { fontWeight: 700 }, children: [a.apellido, ", ", a.nombre] })] }), _jsx("button", { onClick: () => toggleEstado(a.id_alumno), style: {
                                    ...badge(EST_COLOR[a.estado]),
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    padding: '8px 20px',
                                    fontSize: 13,
                                    fontWeight: 800,
                                    transition: 'all 0.15s',
                                }, children: a.estado })] }, a.id_alumno))), _jsxs("div", { style: {
                            marginTop: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                        }, children: [_jsx("button", { onClick: guardar, disabled: loading, style: { ...btnPrimary, opacity: loading ? 0.6 : 1 }, children: loading ? 'Guardando...' : '💾 Guardar asistencia' }), msg && (_jsx("span", { style: {
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: msg.startsWith('✅') ? C.green : C.red,
                                }, children: msg }))] })] })), selAsignacion && alumnos.length === 0 && (_jsx("div", { style: { ...card, textAlign: 'center', color: C.textMuted }, children: "No hay alumnos asignados a este curso." }))] }));
}
// ═══════════════════════════════════════════════════════════════
//  CARGAR CALIFICACIONES (Docente)
// ═══════════════════════════════════════════════════════════════
function CargarCalificaciones({ userId }) {
    const [asignaciones, setAsignaciones] = useState([]);
    const [selAsignacion, setSelAsig] = useState(null);
    const [calificaciones, setCals] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({
        id_alumno: '',
        trimestre: '1',
        tipo_evaluacion: 'Parcial',
        nota: '',
        descripcion: '',
    });
    useEffect(() => {
        supabase
            .from('docentes')
            .select('id_docente')
            .eq('id_usuario', userId)
            .single()
            .then(({ data: doc }) => {
            if (!doc)
                return;
            supabase
                .from('asignaciones')
                .select('*, materias(nombre), cursos(nivel, grado_anio, division)')
                .eq('id_docente', doc.id_docente)
                .eq('activo', true)
                .then(({ data }) => {
                if (data)
                    setAsignaciones(data);
            });
        });
    }, [userId]);
    useEffect(() => {
        if (!selAsignacion)
            return;
        supabase
            .from('asignaciones')
            .select('id_curso')
            .eq('id_asignacion', selAsignacion)
            .single()
            .then(({ data: a }) => {
            if (!a)
                return;
            supabase
                .from('alumnos')
                .select('id_alumno, nombre, apellido')
                .eq('id_curso', a.id_curso)
                .eq('activo', true)
                .order('apellido')
                .then(({ data: al }) => {
                if (al)
                    setAlumnos(al);
            });
        });
        supabase
            .from('calificaciones')
            .select('*, alumnos(nombre, apellido), asignaciones(materias(nombre))')
            .eq('id_asignacion', selAsignacion)
            .order('fecha_carga', { ascending: false })
            .then(({ data }) => {
            if (data)
                setCals(data);
        });
    }, [selAsignacion]);
    const handleCargar = async (e) => {
        e.preventDefault();
        setMsg('');
        const { data: periodo } = await supabase
            .from('periodos_academicos')
            .select('id_periodo')
            .eq('activo', true)
            .single();
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
        ]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Nota cargada.');
            setForm((p) => ({ ...p, id_alumno: '', nota: '', descripcion: '' }));
            // Recargar calificaciones
            if (selAsignacion) {
                supabase
                    .from('calificaciones')
                    .select('*, alumnos(nombre, apellido), asignaciones(materias(nombre))')
                    .eq('id_asignacion', selAsignacion)
                    .order('fecha_carga', { ascending: false })
                    .then(({ data }) => {
                    if (data)
                        setCals(data);
                });
            }
        }
    };
    const notaColor = (n) => n >= 8 ? C.green : n >= 6 ? C.orange : C.red;
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\uD83D\uDCDD Calificaciones" }), _jsxs("div", { style: { ...card, marginBottom: 20 }, children: [_jsx("span", { style: label, children: "Clase / Materia" }), _jsxs("select", { style: { ...input, maxWidth: 360, appearance: 'none' }, value: selAsignacion ?? '', onChange: (e) => setSelAsig(Number(e.target.value)), children: [_jsx("option", { value: '', children: "Seleccion\u00E1 una clase..." }), asignaciones.map((a) => (_jsxs("option", { value: a.id_asignacion, children: [a.materias?.nombre, " \u2014 ", a.cursos?.nivel, " ", a.cursos?.grado_anio, " \"", a.cursos?.division, "\""] }, a.id_asignacion)))] })] }), selAsignacion && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { ...card, marginBottom: 20 }, children: [_jsx("div", { style: cardTitle, children: "Cargar nota" }), _jsxs("form", { onSubmit: handleCargar, style: {
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                    gap: 14,
                                }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Alumno" }), _jsxs("select", { style: { ...input, appearance: 'none' }, required: true, value: form.id_alumno, onChange: (e) => setForm((p) => ({ ...p, id_alumno: e.target.value })), children: [_jsx("option", { value: '', children: "Seleccion\u00E1..." }), alumnos.map((a) => (_jsxs("option", { value: a.id_alumno, children: [a.apellido, ", ", a.nombre] }, a.id_alumno)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Trimestre" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.trimestre, onChange: (e) => setForm((p) => ({ ...p, trimestre: e.target.value })), children: [_jsx("option", { value: '1', children: "1\u00BA Trimestre" }), _jsx("option", { value: '2', children: "2\u00BA Trimestre" }), _jsx("option", { value: '3', children: "3\u00BA Trimestre" })] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Tipo" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.tipo_evaluacion, onChange: (e) => setForm((p) => ({ ...p, tipo_evaluacion: e.target.value })), children: [_jsx("option", { children: "Parcial" }), _jsx("option", { children: "Final" }), _jsx("option", { children: "Trabajo Pr\u00E1ctico" }), _jsx("option", { children: "Oral" }), _jsx("option", { children: "Recuperatorio" })] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Nota (0\u201310)" }), _jsx("input", { type: 'number', min: '0', max: '10', step: '0.25', required: true, style: input, value: form.nota, onChange: (e) => setForm((p) => ({ ...p, nota: e.target.value })) })] }), _jsxs("div", { style: {
                                            gridColumn: '1/-1',
                                            display: 'flex',
                                            gap: 12,
                                            alignItems: 'flex-end',
                                        }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("span", { style: label, children: "Descripci\u00F3n (opcional)" }), _jsx("input", { style: input, value: form.descripcion, onChange: (e) => setForm((p) => ({ ...p, descripcion: e.target.value })), placeholder: 'Ej: Primer parcial unidad 1' })] }), _jsx("button", { type: 'submit', style: btnPrimary, children: "Cargar nota" })] }), msg && (_jsx("div", { style: {
                                            gridColumn: '1/-1',
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: msg.startsWith('✅') ? C.green : C.red,
                                        }, children: msg }))] })] }), _jsxs("div", { style: card, children: [_jsx("div", { style: cardTitle, children: "Notas cargadas" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Alumno" }), _jsx("th", { style: th, children: "Tipo" }), _jsx("th", { style: th, children: "Trimestre" }), _jsx("th", { style: th, children: "Fecha" }), _jsx("th", { style: th, children: "Nota" })] }) }), _jsx("tbody", { children: calificaciones.map((c) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [c.alumnos?.apellido, ", ", c.alumnos?.nombre] }), _jsx("td", { style: td, children: _jsx("span", { style: badge(C.purple), children: c.tipo_evaluacion }) }), _jsxs("td", { style: { ...td, color: C.textMuted }, children: ["T", c.trimestre] }), _jsx("td", { style: { ...td, color: C.textMuted }, children: new Date(c.fecha_carga).toLocaleDateString('es-AR') }), _jsx("td", { style: td, children: _jsx("div", { style: {
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
                                                        }, children: c.nota }) })] }, c.id_calificacion))) })] })] })] }))] }));
}
// ═══════════════════════════════════════════════════════════════
//  AMONESTACIONES (Docente)
// ═══════════════════════════════════════════════════════════════
function GestionAmonestaciones({ userId }) {
    const [idDocente, setIdDocente] = useState(null);
    const [asignaciones, setAsignaciones] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [amonestaciones, setAmonest] = useState([]);
    const [selCurso, setSelCurso] = useState(null);
    const [form, setForm] = useState({
        id_alumno: '',
        tipo: 'Leve',
        descripcion: '',
    });
    const [msg, setMsg] = useState('');
    useEffect(() => {
        supabase
            .from('docentes')
            .select('id_docente')
            .eq('id_usuario', userId)
            .single()
            .then(({ data: doc }) => {
            if (!doc)
                return;
            setIdDocente(doc.id_docente);
            supabase
                .from('asignaciones')
                .select('*, materias(nombre), cursos(id_curso, nivel, grado_anio, division)')
                .eq('id_docente', doc.id_docente)
                .eq('activo', true)
                .then(({ data }) => {
                if (data)
                    setAsignaciones(data);
            });
            supabase
                .from('amonestaciones')
                .select('*, alumnos(nombre, apellido)')
                .eq('id_docente', doc.id_docente)
                .order('fecha', { ascending: false })
                .then(({ data }) => {
                if (data)
                    setAmonest(data);
            });
        });
    }, [userId]);
    const handleSelCurso = (idCurso) => {
        setSelCurso(idCurso);
        supabase
            .from('alumnos')
            .select('id_alumno, nombre, apellido')
            .eq('id_curso', idCurso)
            .eq('activo', true)
            .order('apellido')
            .then(({ data }) => {
            if (data)
                setAlumnos(data);
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        const { error } = await supabase.from('amonestaciones').insert([
            {
                id_alumno: Number(form.id_alumno),
                id_docente: idDocente,
                tipo: form.tipo,
                descripcion: form.descripcion,
            },
        ]);
        if (error)
            setMsg('Error: ' + error.message);
        else {
            setMsg('✅ Amonestación registrada.');
            setForm({ id_alumno: '', tipo: 'Leve', descripcion: '' });
            supabase
                .from('amonestaciones')
                .select('*, alumnos(nombre, apellido)')
                .eq('id_docente', idDocente)
                .order('fecha', { ascending: false })
                .then(({ data }) => {
                if (data)
                    setAmonest(data);
            });
        }
    };
    const TIPO_COLOR = {
        Leve: C.orange,
        Grave: C.red,
        'Muy grave': '#C0392B',
    };
    const cursosUnicos = asignaciones.filter((a, i, arr) => arr.findIndex((b) => b.cursos?.id_curso === a.cursos?.id_curso) === i);
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 900, margin: '0 0 20px' }, children: "\u26A0\uFE0F Amonestaciones" }), _jsxs("div", { style: { ...card, marginBottom: 20 }, children: [_jsx("div", { style: cardTitle, children: "Registrar amonestaci\u00F3n" }), _jsxs("div", { style: { marginBottom: 14 }, children: [_jsx("span", { style: label, children: "Seleccion\u00E1 el curso" }), _jsx("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: cursosUnicos.map((a) => (_jsxs("button", { style: selCurso === a.cursos?.id_curso
                                        ? btnPrimary
                                        : btnSecondary, onClick: () => handleSelCurso(a.cursos?.id_curso), children: [a.cursos?.nivel, " ", a.cursos?.grado_anio, " \"", a.cursos?.division, "\""] }, a.cursos?.id_curso))) })] }), selCurso && (_jsxs("form", { onSubmit: handleSubmit, style: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: label, children: "Alumno" }), _jsxs("select", { style: { ...input, appearance: 'none' }, required: true, value: form.id_alumno, onChange: (e) => setForm((p) => ({ ...p, id_alumno: e.target.value })), children: [_jsx("option", { value: '', children: "Seleccion\u00E1..." }), alumnos.map((a) => (_jsxs("option", { value: a.id_alumno, children: [a.apellido, ", ", a.nombre] }, a.id_alumno)))] })] }), _jsxs("div", { children: [_jsx("span", { style: label, children: "Tipo" }), _jsxs("select", { style: { ...input, appearance: 'none' }, value: form.tipo, onChange: (e) => setForm((p) => ({ ...p, tipo: e.target.value })), children: [_jsx("option", { children: "Leve" }), _jsx("option", { children: "Grave" }), _jsx("option", { children: "Muy grave" })] })] }), _jsxs("div", { style: { gridColumn: '1/-1' }, children: [_jsx("span", { style: label, children: "Descripci\u00F3n del hecho" }), _jsx("textarea", { style: { ...input, minHeight: 80, resize: 'vertical' }, required: true, value: form.descripcion, onChange: (e) => setForm((p) => ({ ...p, descripcion: e.target.value })) })] }), _jsxs("div", { style: {
                                    gridColumn: '1/-1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                }, children: [_jsx("button", { type: 'submit', style: btnPrimary, children: "Registrar amonestaci\u00F3n" }), msg && (_jsx("span", { style: {
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: msg.startsWith('✅') ? C.green : C.red,
                                        }, children: msg }))] })] }))] }), _jsxs("div", { style: card, children: [_jsx("div", { style: cardTitle, children: "Historial de amonestaciones" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "Alumno" }), _jsx("th", { style: th, children: "Tipo" }), _jsx("th", { style: th, children: "Descripci\u00F3n" }), _jsx("th", { style: th, children: "Fecha" })] }) }), _jsx("tbody", { children: amonestaciones.map((a) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...td, fontWeight: 700 }, children: [a.alumnos?.apellido, ", ", a.alumnos?.nombre] }), _jsx("td", { style: td, children: _jsx("span", { style: badge(TIPO_COLOR[a.tipo] ?? C.textMuted), children: a.tipo }) }), _jsx("td", { style: { ...td, color: C.textMuted, maxWidth: 300 }, children: a.descripcion }), _jsx("td", { style: { ...td, color: C.textMuted }, children: new Date(a.fecha).toLocaleDateString('es-AR') })] }, a.id_amonestacion))) })] })] })] }));
}
