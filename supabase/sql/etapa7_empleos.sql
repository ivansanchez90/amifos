-- ════════════════════════════════════════════════════════════════
-- ETAPA 7 — Bolsa de empleos institucional
-- Correr en: Supabase → SQL Editor
-- ════════════════════════════════════════════════════════════════

create table if not exists empleos (
  id_empleo         bigint generated always as identity primary key,
  titulo            text not null,
  descripcion       text,
  area              text,
  requisitos        text,
  modalidad         text check (modalidad in ('Presencial', 'Remoto', 'Híbrido')),
  tipo_contrato     text check (tipo_contrato in (
                      'Full-time', 'Part-time', 'Pasantía', 'Suplencia', 'Temporal')),
  activo            boolean not null default true,
  fecha_publicacion date    not null default current_date,
  fecha_cierre      date,
  fecha_registro    timestamptz not null default now()
);

-- RLS: lectura pública, escritura solo autenticados
alter table empleos enable row level security;

create policy "empleos_public_read" on empleos
  for select using (true);

create policy "empleos_auth_write" on empleos
  for all using (auth.role() = 'authenticated');
