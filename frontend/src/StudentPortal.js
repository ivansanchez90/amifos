import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
// ═══════════════════════════════════════════════════════════════
//  SUPABASE CLIENT
// ═══════════════════════════════════════════════════════════════
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
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
};
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
];
const DIAS = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
];
const diaActual = () => DIAS[new Date().getDay()];
const formatFecha = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};
const notaColor = (nota) => {
    if (nota >= 8)
        return C.green;
    if (nota >= 6)
        return C.orange;
    return C.red;
};
const CUOTA_COLOR = {
    Pendiente: C.orange,
    Pagada: C.green,
    Vencida: C.red,
    'En mora': '#C0392B',
};
const NOTIF_COLOR = {
    General: C.purple,
    Asistencia: C.orange,
    Calificación: C.green,
    Cuota: C.red,
    Novedad: C.blue,
    Urgente: '#C0392B',
};
// ═══════════════════════════════════════════════════════════════
//  ESTILOS BASE (React.CSSProperties)
// ═══════════════════════════════════════════════════════════════
const S = {
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
};
// badge y notaCircle son funciones (reciben parámetros)
const badge = (color) => ({
    display: 'inline-block',
    background: color + '1A',
    color,
    borderRadius: 20,
    padding: '3px 10px',
    fontSize: 11,
    fontWeight: 800,
});
const notaCircle = (nota) => ({
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
});
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
];
// ═══════════════════════════════════════════════════════════════
//  PANTALLA DE LOGIN
// ═══════════════════════════════════════════════════════════════
function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const { data, error: err } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (err) {
            setError('Credenciales incorrectas. Verificá tu email y contraseña.');
            setLoading(false);
            return;
        }
        // Verificar el rol del usuario después del login exitoso
        if (data.user) {
            const { data: userData } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id_usuario', data.user.id)
                .single();
            // Si es admin, Directivo o Docente, redirigir al panel administrativo
            if (userData?.rol === 'Admin' || userData?.rol === 'Directivo' || userData?.rol === 'Docente') {
                navigate('/admin');
            }
            // Si es Alumna, permanecer en el portal (el comportamiento por defecto)
        }
        setLoading(false);
    };
    const inputStyle = {
        width: '100%',
        padding: '13px 16px',
        borderRadius: 12,
        border: `2px solid ${C.border}`,
        fontSize: 14,
        fontFamily: 'inherit',
        outline: 'none',
        boxSizing: 'border-box',
        color: C.text,
    };
    return (_jsx("div", { style: {
            ...S.root,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: `radial-gradient(ellipse at 60% 0%, ${C.purpleLight} 0%, ${C.bg} 60%)`,
        }, children: _jsxs("div", { style: {
                background: C.white,
                borderRadius: 24,
                padding: '44px 40px',
                width: '100%',
                maxWidth: 400,
                boxShadow: '0 8px 48px rgba(91,53,197,0.14)',
                border: `1px solid ${C.border}`,
            }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 32 }, children: [_jsx("img", { src: '/logo.png', alt: 'Educar Para Transformar', style: { height: 80, marginBottom: 12 }, onError: (e) => {
                                ;
                                e.target.style.display = 'none';
                            } }), _jsx("div", { style: { fontSize: 17, fontWeight: 900, color: C.purple }, children: "Educar Para Transformar" }), _jsx("div", { style: {
                                fontSize: 12,
                                color: C.textMuted,
                                letterSpacing: '0.08em',
                                marginTop: 4,
                            }, children: "PORTAL ESTUDIANTIL" })] }), _jsxs("form", { onSubmit: handleLogin, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: C.textMuted,
                                        display: 'block',
                                        marginBottom: 6,
                                    }, children: "Correo electr\u00F3nico" }), _jsx("input", { type: 'email', value: email, onChange: (e) => setEmail(e.target.value), placeholder: 'tu@email.com', required: true, style: inputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: C.textMuted,
                                        display: 'block',
                                        marginBottom: 6,
                                    }, children: "Contrase\u00F1a" }), _jsx("input", { type: 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022', required: true, style: inputStyle })] }), error && (_jsxs("div", { style: {
                                background: C.red + '12',
                                border: `1px solid ${C.red}40`,
                                borderRadius: 10,
                                padding: '10px 14px',
                                fontSize: 13,
                                color: C.red,
                                fontWeight: 700,
                            }, children: ["\u26A0\uFE0F ", error] })), _jsx("button", { type: 'submit', disabled: loading, style: {
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
                            }, children: loading ? 'Ingresando...' : 'Ingresar al portal' })] })] }) }));
}
// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function StudentPortal() {
    const [user, setUser] = useState(null);
    const [alumno, setAlumno] = useState(null);
    const [calificaciones, setCalificaciones] = useState([]);
    const [cuotas, setCuotas] = useState([]);
    const [notificaciones, setNotificaciones] = useState([]);
    const [horarioHoy, setHorarioHoy] = useState([]);
    const [asistStats, setAsistStats] = useState(null);
    const [activeNav, setActiveNav] = useState('inicio');
    const [loading, setLoading] = useState(true);
    console.log(import.meta.env.VITE_SUPABASE_URL);
    console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
    // ── Auth ────────────────────────────────────────────────────
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });
        const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        loadAll(user.id);
    }, [user]);
    // ── Data loading ─────────────────────────────────────────────
    const loadAll = useCallback(async (userId) => {
        setLoading(true);
        await Promise.all([
            loadAlumno(userId),
            loadCalificaciones(userId),
            loadCuotas(userId),
            loadNotificaciones(userId),
            loadHorarioHoy(userId),
            loadAsistencias(userId),
        ]);
        setLoading(false);
    }, []);
    async function loadAlumno(userId) {
        const { data } = await supabase
            .from('alumnos')
            .select('id_alumno, nombre, apellido, dni, obra_social, cursos(nivel, grado_anio, division)')
            .eq('id_usuario', userId)
            .single();
        if (data)
            setAlumno(data);
    }
    async function loadCalificaciones(userId) {
        const { data: al } = await supabase
            .from('alumnos')
            .select('id_alumno')
            .eq('id_usuario', userId)
            .single();
        if (!al)
            return;
        const { data } = await supabase
            .from('calificaciones')
            .select('*, asignaciones(materias(nombre))')
            .eq('id_alumno', al.id_alumno)
            .order('fecha_carga', { ascending: false })
            .limit(20);
        if (data)
            setCalificaciones(data);
    }
    async function loadCuotas(userId) {
        const { data: al } = await supabase
            .from('alumnos')
            .select('id_alumno')
            .eq('id_usuario', userId)
            .single();
        if (!al)
            return;
        const { data } = await supabase
            .from('cuotas')
            .select('*')
            .eq('id_alumno', al.id_alumno)
            .in('estado', ['Pendiente', 'Vencida', 'En mora'])
            .order('fecha_vencimiento', { ascending: true });
        if (data)
            setCuotas(data);
    }
    async function loadNotificaciones(userId) {
        const { data } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('id_usuario_destino', userId)
            .order('fecha_envio', { ascending: false })
            .limit(20);
        if (data)
            setNotificaciones(data);
    }
    async function loadHorarioHoy(userId) {
        const { data: al } = await supabase
            .from('alumnos')
            .select('id_curso')
            .eq('id_usuario', userId)
            .single();
        if (!al?.id_curso)
            return;
        const { data } = await supabase
            .from('horarios')
            .select('*, asignaciones!inner(materias(nombre), docentes(nombre, apellido), id_curso)')
            .eq('dia_semana', diaActual())
            .eq('asignaciones.id_curso', al.id_curso)
            .order('hora_inicio', { ascending: true });
        if (data)
            setHorarioHoy(data);
    }
    async function loadAsistencias(userId) {
        const { data: al } = await supabase
            .from('alumnos')
            .select('id_alumno')
            .eq('id_usuario', userId)
            .single();
        if (!al)
            return;
        const { data } = await supabase
            .from('asistencias')
            .select('estado')
            .eq('id_alumno', al.id_alumno);
        if (!data)
            return;
        const stats = {
            presentes: 0,
            ausentes: 0,
            tarde: 0,
            justificados: 0,
            total: data.length,
        };
        data.forEach((a) => {
            if (a.estado === 'Presente')
                stats.presentes++;
            if (a.estado === 'Ausente')
                stats.ausentes++;
            if (a.estado === 'Tarde')
                stats.tarde++;
            if (a.estado === 'Justificado')
                stats.justificados++;
        });
        setAsistStats(stats);
    }
    async function marcarLeida(id) {
        await supabase
            .from('notificaciones')
            .update({ leida: true })
            .eq('id_notificacion', id);
        setNotificaciones((prev) => prev.map((n) => (n.id_notificacion === id ? { ...n, leida: true } : n)));
    }
    // ── Derived values ───────────────────────────────────────────
    const promedio = calificaciones.length
        ? (calificaciones.reduce((acc, c) => acc + c.nota, 0) /
            calificaciones.length).toFixed(1)
        : '—';
    const pctAsistencia = asistStats && asistStats.total > 0
        ? Math.round((asistStats.presentes / asistStats.total) * 100)
        : null;
    const notifNoLeidas = notificaciones.filter((n) => !n.leida).length;
    const initials = alumno ? `${alumno.nombre[0]}${alumno.apellido[0]}` : '?';
    // ── Render guards ────────────────────────────────────────────
    if (!user)
        return _jsx(LoginScreen, {});
    if (loading) {
        return (_jsx("div", { style: {
                ...S.root,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }, children: _jsxs("div", { style: { textAlign: 'center', color: C.purple }, children: [_jsx("div", { style: {
                            fontSize: 36,
                            marginBottom: 12,
                            animation: 'spin 1s linear infinite',
                        }, children: "\u27F3" }), _jsx("p", { style: { fontWeight: 800 }, children: "Cargando tu portal..." })] }) }));
    }
    // ═══════════════════════════════════════════════════════════
    //  RENDER PRINCIPAL
    // ═══════════════════════════════════════════════════════════
    return (_jsxs("div", { style: S.root, children: [_jsxs("header", { style: S.header, children: [_jsxs("div", { style: S.logo, children: [_jsx("img", { src: '/logo.png', alt: 'Educar Para Transformar', style: S.logoImg, onError: (e) => {
                                    ;
                                    e.target.style.display = 'none';
                                } }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("span", { style: S.logoTitle, children: "Educar Para Transformar" }), _jsx("span", { style: S.logoSub, children: "Centro Educativo" })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 18 }, children: [_jsxs("div", { style: { position: 'relative', cursor: 'pointer' }, onClick: () => setActiveNav('notificaciones'), title: 'Ver notificaciones', children: [_jsx("span", { style: { fontSize: 22 }, children: "\uD83D\uDD14" }), notifNoLeidas > 0 && (_jsx("span", { style: {
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
                                        }, children: notifNoLeidas }))] }), _jsx("div", { style: S.avatar, title: alumno ? `${alumno.nombre} ${alumno.apellido}` : '', children: initials }), alumno && (_jsxs("span", { style: { fontSize: 13, fontWeight: 800, color: C.text }, children: [alumno.nombre, " ", alumno.apellido] })), _jsx("button", { style: S.logoutBtn, onClick: () => supabase.auth.signOut(), children: "Salir" })] })] }), _jsxs("div", { style: S.layout, children: [_jsxs("aside", { style: S.sidebar, children: [_jsx("span", { style: S.sidebarLabel, children: "Portal Estudiantil" }), NAV_ITEMS.map((item) => (_jsxs("div", { style: {
                                    ...S.navItem,
                                    ...(activeNav === item.key ? S.navActive : {}),
                                }, onClick: () => setActiveNav(item.key), children: [_jsx("span", { children: item.icon }), _jsx("span", { style: { flex: 1 }, children: item.label }), item.key === 'notificaciones' && notifNoLeidas > 0 && (_jsx("span", { style: {
                                            background: C.purple,
                                            color: C.white,
                                            borderRadius: 20,
                                            padding: '1px 8px',
                                            fontSize: 11,
                                            fontWeight: 900,
                                        }, children: notifNoLeidas })), item.key === 'cuotas' && cuotas.length > 0 && (_jsx("span", { style: {
                                            background: C.red,
                                            color: C.white,
                                            borderRadius: 20,
                                            padding: '1px 8px',
                                            fontSize: 11,
                                            fontWeight: 900,
                                        }, children: cuotas.length }))] }, item.key)))] }), _jsxs("main", { style: S.main, children: [activeNav === 'inicio' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: S.welcome, children: [_jsx("div", { style: {
                                                    position: 'absolute',
                                                    right: -30,
                                                    top: -30,
                                                    width: 200,
                                                    height: 200,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255,255,255,0.05)',
                                                } }), _jsxs("div", { style: { position: 'relative' }, children: [_jsxs("div", { style: S.welcomeName, children: ["Bienvenido/a, ", alumno?.nombre, " \uD83D\uDC4B"] }), _jsx("div", { style: S.welcomeSub, children: new Date().toLocaleDateString('es-AR', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        }) }), alumno?.cursos && (_jsxs("div", { style: S.welcomeBadge, children: [alumno.cursos.nivel, " \u00B7 ", alumno.cursos.grado_anio, ' ', "Divisi\u00F3n ", alumno.cursos.division] }))] })] }), _jsxs("div", { style: S.statsGrid, children: [_jsxs("div", { style: S.statCard, children: [_jsx("div", { style: { ...S.statIcon, background: C.purpleLight }, children: "\uD83D\uDCC5" }), _jsx("div", { style: {
                                                            ...S.statValue,
                                                            color: pctAsistencia !== null && pctAsistencia < 75
                                                                ? C.red
                                                                : C.green,
                                                        }, children: pctAsistencia !== null ? `${pctAsistencia}%` : '—' }), _jsx("div", { style: S.statLabel, children: "Asistencia" })] }), _jsxs("div", { style: S.statCard, children: [_jsx("div", { style: { ...S.statIcon, background: '#27AE601A' }, children: "\uD83D\uDCCA" }), _jsx("div", { style: { ...S.statValue, color: C.purple }, children: promedio }), _jsx("div", { style: S.statLabel, children: "Promedio general" })] }), _jsxs("div", { style: S.statCard, children: [_jsx("div", { style: { ...S.statIcon, background: '#E74C3C1A' }, children: "\uD83D\uDCB3" }), _jsx("div", { style: {
                                                            ...S.statValue,
                                                            color: cuotas.length > 0 ? C.red : C.green,
                                                        }, children: cuotas.length }), _jsx("div", { style: S.statLabel, children: "Cuotas pendientes" })] }), _jsxs("div", { style: S.statCard, children: [_jsx("div", { style: { ...S.statIcon, background: '#E67E221A' }, children: "\uD83D\uDD14" }), _jsx("div", { style: {
                                                            ...S.statValue,
                                                            color: notifNoLeidas > 0 ? C.orange : C.textMuted,
                                                        }, children: notifNoLeidas }), _jsx("div", { style: S.statLabel, children: "Notificaciones nuevas" })] })] }), _jsxs("div", { style: S.grid2, children: [_jsxs("div", { style: S.card, children: [_jsxs("div", { style: S.cardTitle, children: ["\uD83D\uDD50 Clases de hoy \u00B7 ", diaActual()] }), horarioHoy.length === 0 ? (_jsx("div", { style: S.centered, children: "No hay clases programadas para hoy" })) : (horarioHoy.map((h) => (_jsxs("div", { style: S.horarioItem, children: [_jsxs("div", { style: S.horarioTime, children: [h.hora_inicio.slice(0, 5), _jsx("br", {}), h.hora_fin.slice(0, 5)] }), _jsx("div", { style: {
                                                                    width: 3,
                                                                    height: 44,
                                                                    borderRadius: 4,
                                                                    background: C.purple,
                                                                    flexShrink: 0,
                                                                } }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 800, fontSize: 14 }, children: h.asignaciones?.materias?.nombre }), _jsxs("div", { style: {
                                                                            fontSize: 12,
                                                                            color: C.textMuted,
                                                                            marginTop: 2,
                                                                        }, children: ["Prof. ", h.asignaciones?.docentes?.apellido, " \u00B7", ' ', h.aula ?? 'Aula s/d'] })] })] }, h.id_horario))))] }), _jsxs("div", { style: S.card, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDD14 Notificaciones recientes" }), notificaciones.slice(0, 5).length === 0 ? (_jsx("div", { style: S.centered, children: "Sin notificaciones" })) : (notificaciones.slice(0, 5).map((n) => (_jsxs("div", { style: { ...S.notifItem, opacity: n.leida ? 0.6 : 1 }, onClick: () => !n.leida && marcarLeida(n.id_notificacion), children: [_jsx("div", { style: {
                                                                    width: 9,
                                                                    height: 9,
                                                                    borderRadius: '50%',
                                                                    marginTop: 5,
                                                                    background: n.leida
                                                                        ? C.border
                                                                        : (NOTIF_COLOR[n.tipo] ?? C.purple),
                                                                    flexShrink: 0,
                                                                } }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: {
                                                                            fontSize: 13,
                                                                            fontWeight: n.leida ? 600 : 800,
                                                                        }, children: n.titulo }), _jsx("div", { style: {
                                                                            fontSize: 11,
                                                                            color: C.textMuted,
                                                                            marginTop: 2,
                                                                        }, children: formatFecha(n.fecha_envio) })] }), _jsx("span", { style: badge(NOTIF_COLOR[n.tipo] ?? C.purple), children: n.tipo })] }, n.id_notificacion))))] })] }), _jsxs("div", { style: S.card, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDCCA \u00DAltimas calificaciones" }), calificaciones.length === 0 ? (_jsx("div", { style: S.centered, children: "Sin calificaciones registradas" })) : (_jsxs("table", { style: S.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: S.th, children: "Materia" }), _jsx("th", { style: S.th, children: "Tipo" }), _jsx("th", { style: S.th, children: "Trimestre" }), _jsx("th", { style: S.th, children: "Fecha" }), _jsx("th", { style: S.th, children: "Nota" })] }) }), _jsx("tbody", { children: calificaciones.slice(0, 6).map((c) => (_jsxs("tr", { children: [_jsx("td", { style: { ...S.td, fontWeight: 800 }, children: c.asignaciones?.materias?.nombre }), _jsx("td", { style: S.td, children: _jsx("span", { style: badge(C.purple), children: c.tipo_evaluacion }) }), _jsxs("td", { style: { ...S.td, color: C.textMuted }, children: ["Trimestre ", c.trimestre] }), _jsx("td", { style: { ...S.td, color: C.textMuted }, children: formatFecha(c.fecha_carga) }), _jsx("td", { style: S.td, children: _jsx("div", { style: notaCircle(c.nota), children: c.nota }) })] }, c.id_calificacion))) })] }))] })] })), activeNav === 'asistencias' && (_jsxs("div", { style: S.card, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDCC5 Mis Asistencias" }), !asistStats ? (_jsx("div", { style: S.centered, children: "Cargando..." })) : (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                                    gap: 12,
                                                    marginBottom: 28,
                                                }, children: [
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
                                                ].map((item) => (_jsxs("div", { style: {
                                                        ...S.statCard,
                                                        borderTop: `3px solid ${item.color}`,
                                                        textAlign: 'center',
                                                    }, children: [_jsx("div", { style: { ...S.statValue, color: item.color }, children: item.value }), _jsx("div", { style: S.statLabel, children: item.label })] }, item.label))) }), _jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { style: {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            fontSize: 13,
                                                            fontWeight: 800,
                                                            marginBottom: 10,
                                                        }, children: [_jsx("span", { children: "Porcentaje de asistencia" }), _jsxs("span", { style: {
                                                                    color: pctAsistencia !== null && pctAsistencia < 75
                                                                        ? C.red
                                                                        : C.green,
                                                                }, children: [pctAsistencia ?? 0, "%"] })] }), _jsx("div", { style: {
                                                            background: C.border,
                                                            borderRadius: 8,
                                                            height: 14,
                                                            overflow: 'hidden',
                                                        }, children: _jsx("div", { style: {
                                                                width: `${pctAsistencia ?? 0}%`,
                                                                height: '100%',
                                                                background: pctAsistencia !== null && pctAsistencia < 75
                                                                    ? `linear-gradient(90deg, ${C.red}, ${C.orange})`
                                                                    : `linear-gradient(90deg, ${C.purple}, ${C.green})`,
                                                                borderRadius: 8,
                                                                transition: 'width 0.8s ease',
                                                            } }) }), pctAsistencia !== null && pctAsistencia < 75 && (_jsx("div", { style: {
                                                            marginTop: 12,
                                                            background: C.red + '12',
                                                            border: `1px solid ${C.red}40`,
                                                            borderRadius: 10,
                                                            padding: '10px 14px',
                                                            color: C.red,
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                        }, children: "\u26A0\uFE0F Tu asistencia est\u00E1 por debajo del 75% m\u00EDnimo requerido. Por favor comunicate con la instituci\u00F3n." }))] })] }))] })), activeNav === 'calificaciones' && (_jsxs("div", { style: S.card, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 20,
                                        }, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDCCA Todas mis Calificaciones" }), calificaciones.length > 0 && (_jsxs("div", { style: {
                                                    background: C.purpleLight,
                                                    color: C.purple,
                                                    borderRadius: 12,
                                                    padding: '8px 18px',
                                                    fontWeight: 900,
                                                    fontSize: 16,
                                                }, children: ["Promedio: ", promedio] }))] }), calificaciones.length === 0 ? (_jsx("div", { style: S.centered, children: "Sin calificaciones registradas" })) : (_jsxs("table", { style: S.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: S.th, children: "Materia" }), _jsx("th", { style: S.th, children: "Tipo" }), _jsx("th", { style: S.th, children: "Trimestre" }), _jsx("th", { style: S.th, children: "Fecha" }), _jsx("th", { style: S.th, children: "Descripci\u00F3n" }), _jsx("th", { style: S.th, children: "Nota" })] }) }), _jsx("tbody", { children: calificaciones.map((c) => (_jsxs("tr", { children: [_jsx("td", { style: { ...S.td, fontWeight: 800 }, children: c.asignaciones?.materias?.nombre }), _jsx("td", { style: S.td, children: _jsx("span", { style: badge(C.purple), children: c.tipo_evaluacion }) }), _jsxs("td", { style: { ...S.td, color: C.textMuted }, children: ["T", c.trimestre] }), _jsx("td", { style: { ...S.td, color: C.textMuted }, children: formatFecha(c.fecha_carga) }), _jsx("td", { style: { ...S.td, color: C.textMuted }, children: c.descripcion ?? '—' }), _jsx("td", { style: S.td, children: _jsx("div", { style: notaCircle(c.nota), children: c.nota }) })] }, c.id_calificacion))) })] }))] })), activeNav === 'cuotas' && (_jsxs("div", { style: S.card, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDCB3 Mis Cuotas Pendientes" }), cuotas.length === 0 ? (_jsxs("div", { style: { ...S.centered, flexDirection: 'column', gap: 10 }, children: [_jsx("span", { style: { fontSize: 44 }, children: "\u2705" }), _jsx("span", { style: { color: C.green, fontWeight: 800, fontSize: 15 }, children: "\u00A1Est\u00E1s al d\u00EDa con todas tus cuotas!" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                                                    background: C.red + '10',
                                                    border: `1px solid ${C.red}30`,
                                                    borderRadius: 12,
                                                    padding: '12px 16px',
                                                    marginBottom: 20,
                                                    fontSize: 13,
                                                    color: C.red,
                                                    fontWeight: 700,
                                                }, children: ["\u26A0\uFE0F Ten\u00E9s ", cuotas.length, " cuota", cuotas.length > 1 ? 's' : '', ' ', "sin abonar. Regulariz\u00E1 tu situaci\u00F3n para evitar recargos."] }), _jsxs("table", { style: S.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: S.th, children: "Per\u00EDodo" }), _jsx("th", { style: S.th, children: "Monto base" }), _jsx("th", { style: S.th, children: "Recargo" }), _jsx("th", { style: S.th, children: "Total a pagar" }), _jsx("th", { style: S.th, children: "Vencimiento" }), _jsx("th", { style: S.th, children: "Estado" })] }) }), _jsx("tbody", { children: cuotas.map((c) => (_jsxs("tr", { children: [_jsxs("td", { style: { ...S.td, fontWeight: 800 }, children: [MESES[c.mes - 1], " ", c.anio] }), _jsxs("td", { style: S.td, children: ["$", c.monto_base.toLocaleString('es-AR')] }), _jsx("td", { style: {
                                                                        ...S.td,
                                                                        color: c.recargo > 0 ? C.red : C.textMuted,
                                                                    }, children: c.recargo > 0
                                                                        ? `+$${c.recargo.toLocaleString('es-AR')}`
                                                                        : '—' }), _jsxs("td", { style: {
                                                                        ...S.td,
                                                                        fontWeight: 900,
                                                                        color: C.purple,
                                                                    }, children: ["$", (c.monto_base +
                                                                            c.recargo -
                                                                            c.descuento).toLocaleString('es-AR')] }), _jsx("td", { style: { ...S.td, color: C.textMuted }, children: formatFecha(c.fecha_vencimiento) }), _jsx("td", { style: S.td, children: _jsx("span", { style: badge(CUOTA_COLOR[c.estado] ?? C.textMuted), children: c.estado }) })] }, c.id_cuota))) })] })] }))] })), activeNav === 'horario' && (_jsxs("div", { style: S.card, children: [_jsxs("div", { style: S.cardTitle, children: ["\uD83D\uDD50 Mi Horario de hoy \u00B7 ", diaActual()] }), horarioHoy.length === 0 ? (_jsxs("div", { style: { ...S.centered, flexDirection: 'column', gap: 10 }, children: [_jsx("span", { style: { fontSize: 36 }, children: "\uD83C\uDF89" }), _jsx("span", { style: { fontWeight: 700, color: C.textMuted }, children: "No ten\u00E9s clases registradas para hoy" })] })) : (horarioHoy.map((h) => (_jsxs("div", { style: S.horarioItem, children: [_jsxs("div", { style: {
                                                    ...S.horarioTime,
                                                    fontSize: 13,
                                                    lineHeight: 1.5,
                                                }, children: [h.hora_inicio.slice(0, 5), _jsx("br", {}), h.hora_fin.slice(0, 5)] }), _jsx("div", { style: {
                                                    width: 4,
                                                    height: 52,
                                                    borderRadius: 4,
                                                    background: C.purple,
                                                    flexShrink: 0,
                                                } }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 900, fontSize: 15 }, children: h.asignaciones?.materias?.nombre }), _jsxs("div", { style: {
                                                            fontSize: 13,
                                                            color: C.textMuted,
                                                            marginTop: 3,
                                                        }, children: ["Prof. ", h.asignaciones?.docentes?.nombre, ' ', h.asignaciones?.docentes?.apellido] }), _jsxs("div", { style: {
                                                            fontSize: 12,
                                                            color: C.textMuted,
                                                            marginTop: 2,
                                                        }, children: ["\uD83D\uDCCD ", h.aula ?? 'Aula a confirmar'] })] })] }, h.id_horario))))] })), activeNav === 'notificaciones' && (_jsxs("div", { style: S.card, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 20,
                                        }, children: [_jsx("div", { style: S.cardTitle, children: "\uD83D\uDD14 Todas mis Notificaciones" }), notifNoLeidas > 0 && (_jsx("button", { style: {
                                                    ...S.logoutBtn,
                                                    color: C.purple,
                                                    borderColor: C.purple,
                                                }, onClick: async () => {
                                                    await supabase
                                                        .from('notificaciones')
                                                        .update({ leida: true })
                                                        .eq('id_usuario_destino', user?.id);
                                                    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
                                                }, children: "Marcar todas como le\u00EDdas" }))] }), notificaciones.length === 0 ? (_jsx("div", { style: S.centered, children: "Sin notificaciones" })) : (notificaciones.map((n) => (_jsxs("div", { style: { ...S.notifItem, opacity: n.leida ? 0.55 : 1 }, onClick: () => !n.leida && marcarLeida(n.id_notificacion), children: [_jsx("div", { style: {
                                                    width: 9,
                                                    height: 9,
                                                    borderRadius: '50%',
                                                    marginTop: 6,
                                                    flexShrink: 0,
                                                    background: n.leida
                                                        ? C.border
                                                        : (NOTIF_COLOR[n.tipo] ?? C.purple),
                                                } }), _jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 8,
                                                            marginBottom: 4,
                                                        }, children: [_jsx("span", { style: {
                                                                    fontSize: 14,
                                                                    fontWeight: n.leida ? 600 : 900,
                                                                }, children: n.titulo }), _jsx("span", { style: badge(NOTIF_COLOR[n.tipo] ?? C.purple), children: n.tipo })] }), _jsx("p", { style: {
                                                            fontSize: 13,
                                                            color: C.textMuted,
                                                            margin: 0,
                                                            lineHeight: 1.5,
                                                        }, children: n.mensaje }), _jsx("span", { style: {
                                                            fontSize: 11,
                                                            color: C.textMuted,
                                                            marginTop: 4,
                                                            display: 'block',
                                                        }, children: formatFecha(n.fecha_envio) })] }), !n.leida && (_jsx("span", { style: {
                                                    fontSize: 11,
                                                    color: C.purple,
                                                    fontWeight: 800,
                                                    flexShrink: 0,
                                                }, children: "Marcar le\u00EDda" }))] }, n.id_notificacion))))] }))] })] })] }));
}
