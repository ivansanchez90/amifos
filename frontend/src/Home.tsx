/**
 * Home.tsx
 * Página pública — Educar Para Transformar
 * Secciones: Nav, Info general, Contamos con, Misión, Novedades, Galería, Contacto
 */

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
)

// ═══════════════════════════════════════════════════════════════
//  TIPOS
// ═══════════════════════════════════════════════════════════════
interface Noticia {
  id_noticia: number
  titulo: string
  resumen: string | null
  url_imagen: string | null
  fecha_publicacion: string
  destacada: boolean
}

interface ImagenGaleria {
  id_imagen: number
  titulo: string | null
  url_imagen: string
  categoria: string | null
}

// ═══════════════════════════════════════════════════════════════
//  PALETA
// ═══════════════════════════════════════════════════════════════
const C = {
  purple: '#5B35C5',
  purpleLight: '#EEE9FF',
  purpleDark: '#3D2092',
  purpleMid: '#7B55E8',
  white: '#FFFFFF',
  bg: '#F7F6FC',
  text: '#1A1A2E',
  textMuted: '#6B6B8A',
  border: '#E8E6F5',
  pink: '#E91E8C',
  green: '#27AE60',
  orange: '#E67E22',
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

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

// Imágenes placeholder por sección (unsplash)
const PLACEHOLDERS: Record<string, string> = {
  alumnos:
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
  docentes:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
  niveles:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80',
  instalaciones:
    'https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80',
  idiomas:
    'https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=600&q=80',
  deportes:
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80',
  tecnologia:
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80',
  arte: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  hero: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=80',
  noticia:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
}

// ═══════════════════════════════════════════════════════════════
//  CAROUSEL DATA
// ═══════════════════════════════════════════════════════════════
const CAROUSEL_ITEMS = [
  { label: 'Instalaciones', color: C.purple, img: PLACEHOLDERS.instalaciones },
  { label: 'Idiomas', color: C.blue, img: PLACEHOLDERS.idiomas },
  { label: 'Deportes', color: C.green, img: PLACEHOLDERS.deportes },
  { label: 'Tecnología', color: C.orange, img: PLACEHOLDERS.tecnologia },
  { label: 'Arte', color: C.pink, img: PLACEHOLDERS.arte },
]

const INFO_CARDS = [
  {
    label: 'Perfil de los alumnos',
    color: C.pink,
    img: 'https://images.ecestaticos.com/CKUfRzWT3KFUBKN7Ho1h4N9P9io=/189x5:2202x1515/1200x900/filters:fill(white):format(jpg)/f.elconfidencial.com%2Foriginal%2Fa3d%2F216%2F63b%2Fa3d21663bc3dc3a57cf5f0dfb50a2d18.jpg',
  },
  { label: 'Planta docente', color: C.green, img: PLACEHOLDERS.docentes },
  { label: 'Niveles educativos', color: C.orange, img: PLACEHOLDERS.niveles },
]

// ═══════════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const navigate = useNavigate()
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [galeria, setGaleria] = useState<ImagenGaleria[]>([])
  const [carouselIdx, setCarouselIdx] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    loadNoticias()
    loadGaleria()
  }, [])

  // Verificar el rol del usuario para redirección correcta
  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('usuarios')
          .select('rol')
          .eq('id_usuario', session.user.id)
          .single()
        if (data) {
          setUserRole(data.rol)
        }
      }
    }
    checkUserRole()
  }, [])

  async function loadNoticias() {
    const { data } = await supabase
      .from('noticias')
      .select(
        'id_noticia, titulo, resumen, url_imagen, fecha_publicacion, destacada',
      )
      .eq('activo', true)
      .order('fecha_publicacion', { ascending: false })
      .limit(6)
    if (data) setNoticias(data as Noticia[])
  }

  async function loadGaleria() {
    const { data } = await supabase
      .from('galeria')
      .select('id_imagen, titulo, url_imagen, categoria')
      .eq('activo', true)
      .limit(8)
    if (data) setGaleria(data as ImagenGaleria[])
  }

  const prevCarousel = () =>
    setCarouselIdx(
      (i) => (i - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length,
    )
  const nextCarousel = () =>
    setCarouselIdx((i) => (i + 1) % CAROUSEL_ITEMS.length)

  // Determinar la ruta correcta según el rol del usuario
  const getCorrectRoute = () => {
    if (
      userRole === 'Admin' ||
      userRole === 'Directivo' ||
      userRole === 'Docente'
    ) {
      return '/admin'
    }
    return '/portal'
  }

  // 3 items visibles en el carousel
  const visibleItems = [0, 1, 2].map(
    (offset) => CAROUSEL_ITEMS[(carouselIdx + offset) % CAROUSEL_ITEMS.length],
  )

  return (
    <div
      style={{
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        color: C.text,
        background: C.bg,
      }}
    >
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NAVBAR
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header
        style={{
          background: C.white,
          borderBottom: `3px solid ${C.purple}`,
          position: 'sticky',
          top: 0,
          zIndex: 200,
          boxShadow: '0 2px 16px rgba(91,53,197,0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 24px',
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexShrink: 0,
            }}
          >
            <img
              src='/logo.png'
              alt='Logo'
              style={{ height: 50, width: 'auto' }}
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
                  letterSpacing: '0.05em',
                  lineHeight: 1.2,
                }}
              >
                Educar Para Transformar
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: C.textMuted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Centro Educativo
              </div>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Nosotros', href: '#nosotros' },
              { label: 'Ingresantes', href: '#ingresantes' },
              { label: 'Novedades', href: '#novedades' },
              { label: 'Galerías', href: '#galeria' },
              {
                label: 'Campus Virtual',
                href: getCorrectRoute(),
                isRoute: true,
              },
              { label: 'Contacto', href: '#contacto' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.isRoute ? undefined : item.href}
                onClick={item.isRoute ? () => navigate(item.href) : undefined}
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: item.isRoute ? C.white : C.textMuted,
                  background: item.isRoute
                    ? `linear-gradient(135deg, ${C.purple}, ${C.purpleMid})`
                    : 'none',
                  padding: item.isRoute ? '7px 14px' : '7px 10px',
                  borderRadius: item.isRoute ? 8 : 0,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (!item.isRoute)
                    (e.target as HTMLElement).style.color = C.purple
                }}
                onMouseLeave={(e) => {
                  if (!item.isRoute)
                    (e.target as HTMLElement).style.color = C.textMuted
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Buscador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type='text'
              placeholder='Buscar...'
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              style={{
                border: `2px solid ${C.border}`,
                borderRadius: 20,
                padding: '7px 16px',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                color: C.text,
                width: 160,
              }}
            />
            <span style={{ fontSize: 18, cursor: 'pointer', color: C.purple }}>
              🔍
            </span>
          </div>
        </div>
      </header>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          position: 'relative',
          height: 420,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src={PLACEHOLDERS.hero}
          alt='Hero'
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${C.purpleDark}CC 0%, ${C.purple}99 50%, transparent 100%)`,
          }}
        />
        <div
          style={{
            position: 'relative',
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 40px',
            color: C.white,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: 12,
            }}
          >
            Centro Educativo
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.15,
              margin: '0 0 16px',
              maxWidth: 580,
            }}
          >
            Educamos para transformar el mundo
          </h1>
          <p
            style={{
              fontSize: 16,
              opacity: 0.9,
              maxWidth: 460,
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            Inspiramos, desafiamos y empoderamos a nuestros alumnos a ser
            agentes de cambio en su comunidad.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href='#ingresantes'
              style={{
                background: C.white,
                color: C.purple,
                borderRadius: 10,
                padding: '12px 28px',
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Quiero inscribirme
            </a>
            <a
              href='#nosotros'
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: C.white,
                borderRadius: 10,
                padding: '12px 28px',
                fontWeight: 800,
                fontSize: 14,
                textDecoration: 'none',
                border: '2px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              Conocenos
            </a>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          INFORMACIÓN GENERAL
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id='nosotros'
        style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 40px' }}
      >
        <div style={{ marginBottom: 36 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.purple,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            Quiénes somos
          </span>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              margin: '8px 0 0',
              color: C.text,
            }}
          >
            Información general del Instituto
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 20,
          }}
        >
          {INFO_CARDS.map((card) => (
            <div
              key={card.label}
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                height: 260,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget.querySelector(
                  '.overlay',
                ) as HTMLElement
                if (el) el.style.opacity = '0.45'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget.querySelector(
                  '.overlay',
                ) as HTMLElement
                if (el) el.style.opacity = '0.15'
              }}
            >
              <img
                src={card.img}
                alt={card.label}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                className='overlay'
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: card.color,
                  opacity: 0.15,
                  transition: 'opacity 0.3s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '20px 24px',
                  color: C.white,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {card.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONTAMOS CON (CAROUSEL)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section style={{ background: C.white, padding: '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 36 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.purple,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Nuestra oferta
            </span>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                margin: '8px 0 0',
                color: C.text,
              }}
            >
              Contamos con:
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Flecha izq */}
            <button
              onClick={prevCarousel}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `2px solid ${C.border}`,
                background: C.white,
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: C.purple,
                boxShadow: '0 2px 8px rgba(91,53,197,0.1)',
              }}
            >
              ‹
            </button>

            {/* Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 20,
                flex: 1,
              }}
            >
              {visibleItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(91,53,197,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'translateY(-4px)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'translateY(0)')
                  }
                >
                  <div style={{ position: 'relative', height: 200 }}>
                    <img
                      src={item.img}
                      alt={item.label}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      padding: '16px 20px',
                      borderTop: `3px solid ${item.color}`,
                      background: C.white,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 900,
                        color: item.color,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Flecha der */}
            <button
              onClick={nextCarousel}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: `2px solid ${C.border}`,
                background: C.white,
                cursor: 'pointer',
                fontSize: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: C.purple,
                boxShadow: '0 2px 8px rgba(91,53,197,0.1)',
              }}
            >
              ›
            </button>
          </div>

          {/* Dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
            }}
          >
            {CAROUSEL_ITEMS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIdx(i)}
                style={{
                  width: i === carouselIdx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === carouselIdx ? C.purple : C.border,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MISIÓN
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        style={{
          background: `linear-gradient(135deg, ${C.purpleDark} 0%, ${C.purple} 60%, ${C.purpleMid} 100%)`,
          padding: '80px 24px',
          textAlign: 'center',
          color: C.white,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            right: -60,
            top: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -80,
            bottom: -80,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />

        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 20,
              padding: '6px 20px',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Nuestra filosofía
          </div>
          <h2 style={{ fontSize: 36, fontWeight: 900, margin: '0 0 24px' }}>
            Nuestra misión
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.8,
              opacity: 0.92,
              margin: '0 0 32px',
            }}
          >
            Inspiramos, desafiamos y empoderamos a todos nuestros alumnos a ser
            miembros comprometidos y éticos de una comunidad global, para que se
            conviertan en agentes de cambio conscientes de sí mismos, seguros,
            innovadores y colaborativos.
          </p>
          <a
            href='#nosotros'
            style={{
              display: 'inline-block',
              background: C.white,
              color: C.purple,
              borderRadius: 10,
              padding: '12px 32px',
              fontWeight: 900,
              fontSize: 14,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            Conocé más sobre nosotros
          </a>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          NOVEDADES (desde Supabase)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id='novedades'
        style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 36,
          }}
        >
          <div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.purple,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Últimas noticias
            </span>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                margin: '8px 0 0',
                color: C.text,
              }}
            >
              Novedades
            </h2>
          </div>
          {noticias.length > 0 && (
            <a
              href='#novedades'
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: C.purple,
                textDecoration: 'none',
              }}
            >
              Ver todas →
            </a>
          )}
        </div>

        {noticias.length === 0 ? (
          /* Placeholder si no hay noticias cargadas aún */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: C.white,
                  boxShadow: '0 2px 16px rgba(91,53,197,0.06)',
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    height: 180,
                    background: C.purpleLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: 32 }}>📰</span>
                </div>
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Próximamente
                  </div>
                  <div
                    style={{
                      height: 16,
                      background: C.border,
                      borderRadius: 4,
                      marginBottom: 8,
                      width: '80%',
                    }}
                  />
                  <div
                    style={{
                      height: 12,
                      background: C.border,
                      borderRadius: 4,
                      width: '60%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {noticias.slice(0, 6).map((n) => (
              <div
                key={n.id_noticia}
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  background: C.white,
                  boxShadow: '0 2px 16px rgba(91,53,197,0.06)',
                  border: `1px solid ${C.border}`,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px rgba(91,53,197,0.14)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 2px 16px rgba(91,53,197,0.06)'
                }}
              >
                <img
                  src={n.url_imagen ?? PLACEHOLDERS.noticia}
                  alt={n.titulo}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = PLACEHOLDERS.noticia
                  }}
                />
                {n.destacada && (
                  <div
                    style={{
                      background: C.purple,
                      color: C.white,
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '4px 12px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    ⭐ Destacado
                  </div>
                )}
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: C.textMuted,
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    {formatFecha(n.fecha_publicacion)}
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 900,
                      margin: '0 0 8px',
                      color: C.text,
                      lineHeight: 1.4,
                    }}
                  >
                    {n.titulo}
                  </h3>
                  {n.resumen && (
                    <p
                      style={{
                        fontSize: 13,
                        color: C.textMuted,
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {n.resumen.slice(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          GALERÍA (desde Supabase)
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id='galeria' style={{ background: C.white, padding: '60px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 36 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: C.purple,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              Imágenes
            </span>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                margin: '8px 0 0',
                color: C.text,
              }}
            >
              Galería
            </h2>
          </div>

          {galeria.length === 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 180,
                    borderRadius: 12,
                    background: C.purpleLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}
                >
                  🖼️
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {galeria.map((img) => (
                <div
                  key={img.id_imagen}
                  style={{
                    position: 'relative',
                    height: 180,
                    borderRadius: 12,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector(
                      '.gal-overlay',
                    ) as HTMLElement
                    if (overlay) overlay.style.opacity = '1'
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector(
                      '.gal-overlay',
                    ) as HTMLElement
                    if (overlay) overlay.style.opacity = '0'
                  }}
                >
                  <img
                    src={img.url_imagen}
                    alt={img.titulo ?? ''}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    className='gal-overlay'
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `${C.purple}CC`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      color: C.white,
                      fontWeight: 800,
                      fontSize: 13,
                      textAlign: 'center',
                      padding: 12,
                    }}
                  >
                    {img.titulo ?? img.categoria ?? 'Ver imagen'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          INGRESANTES / INSCRIPCIÓN
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section
        id='ingresantes'
        style={{
          background: C.bg,
          padding: '60px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 48,
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.purple,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                Inscripciones abiertas
              </span>
              <h2
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  margin: '8px 0 16px',
                  color: C.text,
                }}
              >
                ¿Querés ser parte de nuestra comunidad?
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: C.textMuted,
                  lineHeight: 1.7,
                  margin: '0 0 28px',
                }}
              >
                Ofrecemos los niveles Inicial, Primario y Secundario. Completá
                el formulario y nos pondremos en contacto con vos a la brevedad
                para guiarte en el proceso.
              </p>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
              >
                {[
                  'Nivel Inicial (3, 4 y 5 años)',
                  'Nivel Primario (1º a 7º grado)',
                  'Nivel Secundario (1º a 5º año)',
                ].map((nivel) => (
                  <div
                    key={nivel}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: C.purpleLight,
                        color: C.purple,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {nivel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulario de inscripción */}
            <div
              style={{
                background: C.white,
                borderRadius: 20,
                padding: 32,
                boxShadow: '0 4px 32px rgba(91,53,197,0.1)',
                border: `1px solid ${C.border}`,
              }}
            >
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  margin: '0 0 20px',
                  color: C.text,
                }}
              >
                Solicitar inscripción
              </h3>
              <InscripcionForm />
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CONTACTO / FOOTER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <footer
        id='contacto'
        style={{
          background: C.text,
          color: C.white,
          padding: '48px 24px 28px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: 40,
              marginBottom: 40,
            }}
          >
            {/* Info */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <img
                  src='/logo.png'
                  alt='Logo'
                  style={{
                    width: 'auto',
                    height: 44,
                    filter: 'brightness(0) invert(1)',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Educar Para Transformar
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      opacity: 0.6,
                      letterSpacing: '0.08em',
                    }}
                  >
                    CENTRO EDUCATIVO
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                Formando líderes del mañana con valores, conocimiento y
                compromiso social.
              </p>
            </div>

            {/* Navegación */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                }}
              >
                Navegación
              </div>
              {['Nosotros', 'Ingresantes', 'Novedades', 'Galerías'].map(
                (item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    style={{
                      display: 'block',
                      fontSize: 13,
                      opacity: 0.7,
                      textDecoration: 'none',
                      color: C.white,
                      marginBottom: 10,
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </a>
                ),
              )}
            </div>

            {/* Contacto */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                }}
              >
                Datos de contacto
              </div>
              {[
                { icon: '📞', text: '+57 321 456 7890' },
                { icon: '✉️', text: 'educarparatransformar@gmail.com' },
                { icon: '📍', text: 'Resistencia, Chaco' },
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Redes */}
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  opacity: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 16,
                }}
              >
                Redes sociales
              </div>
              {[
                {
                  icon: '📸',
                  label: 'Instagram',
                  handle: '@educarparatransformar',
                },
                {
                  icon: '📘',
                  label: 'Facebook',
                  handle: 'Educar Para Transformar',
                },
              ].map((red) => (
                <div
                  key={red.label}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    marginBottom: 14,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 16,
                    }}
                  >
                    {red.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {red.label}
                    </div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                      {red.handle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.5 }}>
              © {new Date().getFullYear()} Educar Para Transformar. Todos los
              derechos reservados.
            </span>
            <button
              onClick={() => navigate(getCorrectRoute())}
              style={{
                background: C.purple,
                color: C.white,
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Acceder al Campus Virtual →
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  FORMULARIO DE INSCRIPCIÓN
// ═══════════════════════════════════════════════════════════════
function InscripcionForm() {
  const [form, setForm] = useState({
    nombre_aspirante: '',
    dni_aspirante: '',
    nombre_tutor: '',
    email_tutor: '',
    telefono_tutor: '',
    nivel_solicitado: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.from('inscripciones').insert([form])
    if (err) {
      setError('Hubo un error al enviar. Intentá de nuevo.')
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `2px solid ${C.border}`,
    fontSize: 13,
    fontFamily: 'inherit',
    outline: 'none',
    color: C.text,
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 800,
    color: C.textMuted,
    display: 'block',
    marginBottom: 5,
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: C.purple,
            marginBottom: 8,
          }}
        >
          ¡Solicitud enviada!
        </div>
        <p style={{ fontSize: 13, color: C.textMuted }}>
          Nos pondremos en contacto con vos a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Nombre del aspirante</label>
          <input
            name='nombre_aspirante'
            required
            value={form.nombre_aspirante}
            onChange={handleChange}
            placeholder='Juan Pérez'
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>DNI del aspirante</label>
          <input
            name='dni_aspirante'
            required
            value={form.dni_aspirante}
            onChange={handleChange}
            placeholder='12345678'
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Nombre del tutor / padre</label>
        <input
          name='nombre_tutor'
          required
          value={form.nombre_tutor}
          onChange={handleChange}
          placeholder='María García'
          style={inputStyle}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>Email de contacto</label>
          <input
            type='email'
            name='email_tutor'
            required
            value={form.email_tutor}
            onChange={handleChange}
            placeholder='mail@gmail.com'
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Teléfono</label>
          <input
            name='telefono_tutor'
            value={form.telefono_tutor}
            onChange={handleChange}
            placeholder='+54 9 362...'
            style={inputStyle}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Nivel solicitado</label>
        <select
          name='nivel_solicitado'
          required
          value={form.nivel_solicitado}
          onChange={handleChange}
          style={{ ...inputStyle, appearance: 'none' as const }}
        >
          <option value=''>Seleccioná un nivel...</option>
          <option value='Inicial'>Inicial</option>
          <option value='Primario'>Primario</option>
          <option value='Secundario'>Secundario</option>
        </select>
      </div>

      {error && (
        <div
          style={{
            background: '#E74C3C12',
            border: '1px solid #E74C3C40',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 12,
            color: '#E74C3C',
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
          borderRadius: 10,
          padding: '13px',
          fontSize: 14,
          fontWeight: 800,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          marginTop: 4,
        }}
      >
        {loading ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  )
}
