create table if not exists public.generation_stats (
  id text primary key default 'detail_page_generator',
  generation_count bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint generation_stats_singleton check (id = 'detail_page_generator')
);

insert into public.generation_stats (id, generation_count)
values ('detail_page_generator', 0)
on conflict (id) do nothing;

create or replace function public.increment_generation_count(stat_id text default 'detail_page_generator')
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_count bigint;
begin
  insert into public.generation_stats (id, generation_count)
  values (stat_id, 1)
  on conflict (id)
  do update set
    generation_count = public.generation_stats.generation_count + 1,
    updated_at = now()
  returning generation_count into next_count;

  return next_count;
end;
$$;

alter table public.generation_stats enable row level security;

drop policy if exists "Public can read generation stats" on public.generation_stats;

create policy "Public can read generation stats"
on public.generation_stats
for select
using (true);
