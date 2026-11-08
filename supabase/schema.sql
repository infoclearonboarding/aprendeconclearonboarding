create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nombre text not null,
  correo text not null,
  empresa text not null,
  estado text not null,
  whatsapp text,
  tamano_equipo text,
  preocupaciones text[] default '{}',
  tags text[] default '{}',
  consent_email boolean not null default false,
  consent_sms boolean not null default false,
  consent_privacidad boolean not null default false,
  consent_texts jsonb default '{}'::jsonb,
  ip_address text,
  user_agent text,
  page_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  resend_contact_id text,
  resend_email_id text,
  email_status text default 'pending',
  last_event_at timestamptz
);

create index if not exists idx_leads_correo on public.leads (correo);
create index if not exists idx_leads_estado on public.leads (estado);
create index if not exists idx_leads_tamano_equipo on public.leads (tamano_equipo);
create index if not exists idx_leads_tags on public.leads using gin (tags);
create index if not exists idx_leads_preocupaciones on public.leads using gin (preocupaciones);

create table if not exists public.marketing_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  correo text not null,
  event_type text not null,
  resend_email_id text,
  clicked_url text,
  raw_payload jsonb default '{}'::jsonb
);

create index if not exists idx_marketing_events_correo on public.marketing_events (correo);
create index if not exists idx_marketing_events_type on public.marketing_events (event_type);

alter table public.leads enable row level security;
alter table public.marketing_events enable row level security;

drop policy if exists "Permitir insertar leads desde el formulario" on public.leads;
create policy "Permitir insertar leads desde el formulario"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

create or replace view public.vista_leads_marketing as
select
  created_at as fecha_registro,
  nombre,
  correo,
  empresa,
  estado,
  whatsapp,
  tamano_equipo,
  array_to_string(preocupaciones, ' | ') as preocupaciones_principales,
  email_status as estado_correo_resend,
  last_event_at as ultima_interaccion,
  consent_sms as acepta_whatsapp_sms,
  utm_source,
  utm_campaign
from public.leads
order by created_at desc;
