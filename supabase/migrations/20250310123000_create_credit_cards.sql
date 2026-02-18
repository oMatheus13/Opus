-- Credit cards storage
create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  bank_id text not null,
  brand_id text not null,
  limit_total numeric(12, 2) not null default 0,
  limit_used numeric(12, 2) not null default 0,
  skin text not null default 'aurora',
  tone text not null default 'blue',
  status text not null default 'ok',
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_cards_skin_check check (skin in ('aurora', 'ripple', 'stack')),
  constraint credit_cards_tone_check check (tone in ('blue', 'olive', 'amber')),
  constraint credit_cards_status_check check (status in ('ok', 'late')),
  constraint credit_cards_limits_check check (
    limit_total >= 0 and limit_used >= 0 and limit_used <= limit_total
  )
);

create index if not exists credit_cards_user_id_idx on public.credit_cards (user_id);
create index if not exists credit_cards_user_created_idx on public.credit_cards (user_id, created_at desc);
create unique index if not exists credit_cards_primary_unique
  on public.credit_cards (user_id)
  where is_primary;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger credit_cards_set_updated_at
before update on public.credit_cards
for each row
execute function public.set_updated_at();

alter table public.credit_cards enable row level security;

create policy "Users can view own cards"
  on public.credit_cards
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own cards"
  on public.credit_cards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cards"
  on public.credit_cards
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own cards"
  on public.credit_cards
  for delete
  using (auth.uid() = user_id);
