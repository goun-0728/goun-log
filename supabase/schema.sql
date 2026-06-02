create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  content text not null,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists articles_status_published_at_idx
on public.articles (status, published_at desc);

create index if not exists articles_slug_idx
on public.articles (slug);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_articles_updated_at on public.articles;

create trigger set_articles_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

drop table if exists public.site_visits;

create table public.site_visits (
  id bigint primary key generated always as identity,
  visited_at timestamptz default now(),
  path text
);

create index site_visits_visited_at_idx
on public.site_visits (visited_at);

create index site_visits_path_idx
on public.site_visits (path);

alter table public.articles enable row level security;
alter table public.site_visits enable row level security;

drop policy if exists "Public can read published articles" on public.articles;

create policy "Public can read published articles"
on public.articles
for select
using (status = 'published');

drop policy if exists "Public can read site visits" on public.site_visits;

create policy "Public can read site visits"
on public.site_visits
for select
using (true);
