begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.share_page_status as enum (
    'draft',
    'published'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.share_page_theme as enum (
    'aurora',
    'ocean',
    'plum'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.share_link_platform as enum (
    'Instagram',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'YouTube',
    'Telegram',
    'WhatsApp',
    'Website',
    'Custom'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.share_pages (
  id uuid primary key default gen_random_uuid(),

  owner_user_id uuid not null
    references auth.users(id)
    on delete cascade,

  display_name text not null,
  slug text not null,

  email text,
  phone text,

  internal_name text,
  introduction text,

  status public.share_page_status not null
    default 'draft',

  theme public.share_page_theme not null
    default 'aurora',

  published_at timestamptz,
  deleted_at timestamptz,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint share_pages_display_name_length
    check (
      char_length(display_name)
      between 1 and 80
    ),

  constraint share_pages_slug_format
    check (
      char_length(slug)
      between 3 and 60
      and slug ~
        '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    ),

  constraint share_pages_email_length
    check (
      email is null
      or char_length(email) <= 320
    ),

  constraint share_pages_phone_length
    check (
      phone is null
      or char_length(phone) <= 30
    ),

  constraint share_pages_internal_name_length
    check (
      internal_name is null
      or char_length(internal_name) <= 80
    ),

  constraint share_pages_introduction_length
    check (
      introduction is null
      or char_length(introduction) <= 180
    )
);

create unique index if not exists
  share_pages_slug_unique
on public.share_pages (slug);

create index if not exists
  share_pages_owner_updated_idx
on public.share_pages (
  owner_user_id,
  updated_at desc
);

create index if not exists
  share_pages_public_lookup_idx
on public.share_pages (
  slug,
  status,
  deleted_at
);

create table if not exists public.share_page_links (
  id uuid primary key default gen_random_uuid(),

  share_page_id uuid not null
    references public.share_pages(id)
    on delete cascade,

  platform public.share_link_platform
    not null,

  url text not null,

  position smallint not null,

  created_at timestamptz not null
    default now(),

  constraint share_page_links_url_length
    check (
      char_length(url)
      between 1 and 500
    ),

  constraint share_page_links_url_protocol
    check (
      url ~* '^https?://[^[:space:]]+$'
    ),

  constraint share_page_links_position
    check (
      position between 0 and 11
    ),

  constraint share_page_links_unique_position
    unique (
      share_page_id,
      position
    )
);

create index if not exists
  share_page_links_page_position_idx
on public.share_page_links (
  share_page_id,
  position
);

create or replace function
  public.set_share_page_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists
  set_share_page_updated_at
on public.share_pages;

create trigger set_share_page_updated_at
before update on public.share_pages
for each row
execute function
  public.set_share_page_updated_at();

alter table public.share_pages
  enable row level security;

alter table public.share_pages
  force row level security;

alter table public.share_page_links
  enable row level security;

alter table public.share_page_links
  force row level security;

drop policy if exists
  "Owners read their share pages"
on public.share_pages;

create policy
  "Owners read their share pages"
on public.share_pages
for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Public reads published share pages"
on public.share_pages;

create policy
  "Public reads published share pages"
on public.share_pages
for select
to anon, authenticated
using (
  status = 'published'
  and deleted_at is null
);

drop policy if exists
  "Owners create share pages"
on public.share_pages;

create policy
  "Owners create share pages"
on public.share_pages
for insert
to authenticated
with check (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Owners update share pages"
on public.share_pages;

create policy
  "Owners update share pages"
on public.share_pages
for update
to authenticated
using (
  (select auth.uid()) = owner_user_id
)
with check (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Owners read share page links"
on public.share_page_links;

create policy
  "Owners read share page links"
on public.share_page_links
for select
to authenticated
using (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.owner_user_id =
        (select auth.uid())
  )
);

drop policy if exists
  "Public reads published share page links"
on public.share_page_links;

create policy
  "Public reads published share page links"
on public.share_page_links
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.status =
        'published'
      and share_pages.deleted_at
        is null
  )
);

drop policy if exists
  "Owners create share page links"
on public.share_page_links;

create policy
  "Owners create share page links"
on public.share_page_links
for insert
to authenticated
with check (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.owner_user_id =
        (select auth.uid())
      and share_pages.deleted_at
        is null
  )
);

drop policy if exists
  "Owners update share page links"
on public.share_page_links;

create policy
  "Owners update share page links"
on public.share_page_links
for update
to authenticated
using (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.owner_user_id =
        (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.owner_user_id =
        (select auth.uid())
      and share_pages.deleted_at
        is null
  )
);

drop policy if exists
  "Owners remove share page links"
on public.share_page_links;

create policy
  "Owners remove share page links"
on public.share_page_links
for delete
to authenticated
using (
  exists (
    select 1
    from public.share_pages
    where share_pages.id =
      share_page_links.share_page_id
      and share_pages.owner_user_id =
        (select auth.uid())
  )
);

grant select on public.share_pages
  to anon;

grant select, insert, update
  on public.share_pages
  to authenticated;

grant select on public.share_page_links
  to anon;

grant select, insert, update, delete
  on public.share_page_links
  to authenticated;

create or replace function
  public.save_share_page(
    p_id uuid,
    p_display_name text,
    p_slug text,
    p_email text,
    p_phone text,
    p_internal_name text,
    p_introduction text,
    p_status public.share_page_status,
    p_theme public.share_page_theme,
    p_links jsonb
  )
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_page_id uuid;
  v_link jsonb;
  v_platform text;
  v_url text;
  v_position integer := 0;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'unauthorized'
      using errcode = '42501';
  end if;

  p_display_name := btrim(
    coalesce(p_display_name, '')
  );

  p_slug := lower(
    btrim(coalesce(p_slug, ''))
  );

  if char_length(p_display_name)
    not between 1 and 80
  then
    raise exception 'invalid_display_name'
      using errcode = '22023';
  end if;

  if char_length(p_slug)
    not between 3 and 60
    or p_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'invalid_slug'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_links) <> 'array' then
    raise exception 'invalid_links'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_links) > 12 then
    raise exception 'too_many_links'
      using errcode = '22023';
  end if;

  if p_id is null then
    insert into public.share_pages (
      owner_user_id,
      display_name,
      slug,
      email,
      phone,
      internal_name,
      introduction,
      status,
      theme,
      published_at
    )
    values (
      v_user_id,
      p_display_name,
      p_slug,
      nullif(btrim(p_email), ''),
      nullif(btrim(p_phone), ''),
      nullif(btrim(p_internal_name), ''),
      nullif(btrim(p_introduction), ''),
      p_status,
      p_theme,
      case
        when p_status = 'published'
          then now()
        else null
      end
    )
    returning id into v_page_id;
  else
    update public.share_pages
    set
      display_name = p_display_name,
      slug = p_slug,
      email =
        nullif(btrim(p_email), ''),
      phone =
        nullif(btrim(p_phone), ''),
      internal_name =
        nullif(
          btrim(p_internal_name),
          ''
        ),
      introduction =
        nullif(
          btrim(p_introduction),
          ''
        ),
      status = p_status,
      theme = p_theme,
      published_at = case
        when p_status = 'published'
          and published_at is null
            then now()
        when p_status = 'draft'
            then null
        else published_at
      end
    where id = p_id
      and owner_user_id = v_user_id
      and deleted_at is null
    returning id into v_page_id;

    if v_page_id is null then
      raise exception 'share_page_not_found'
        using errcode = 'P0002';
    end if;
  end if;

  delete from public.share_page_links
  where share_page_id = v_page_id;

  for v_link in
    select value
    from jsonb_array_elements(p_links)
  loop
    v_platform :=
      v_link ->> 'platform';

    v_url := btrim(
      coalesce(
        v_link ->> 'url',
        ''
      )
    );

    if v_platform not in (
      'Instagram',
      'Facebook',
      'LinkedIn',
      'TikTok',
      'YouTube',
      'Telegram',
      'WhatsApp',
      'Website',
      'Custom'
    ) then
      raise exception 'invalid_platform'
        using errcode = '22023';
    end if;

    if char_length(v_url)
      not between 1 and 500
      or v_url !~
        '^https?://[^[:space:]]+$'
    then
      raise exception 'invalid_link_url'
        using errcode = '22023';
    end if;

    insert into public.share_page_links (
      share_page_id,
      platform,
      url,
      position
    )
    values (
      v_page_id,
      v_platform::public.share_link_platform,
      v_url,
      v_position
    );

    v_position := v_position + 1;
  end loop;

  return v_page_id;
end;
$$;

create or replace function
  public.soft_delete_share_page(
    p_id uuid
  )
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_slug text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'unauthorized'
      using errcode = '42501';
  end if;

  update public.share_pages
  set
    deleted_at = now(),
    status = 'draft',
    published_at = null
  where id = p_id
    and owner_user_id = v_user_id
    and deleted_at is null
  returning slug into v_slug;

  if v_slug is null then
    raise exception 'share_page_not_found'
      using errcode = 'P0002';
  end if;

  return v_slug;
end;
$$;

revoke all on function
  public.save_share_page(
    uuid,
    text,
    text,
    text,
    text,
    text,
    text,
    public.share_page_status,
    public.share_page_theme,
    jsonb
  )
from public, anon;

grant execute on function
  public.save_share_page(
    uuid,
    text,
    text,
    text,
    text,
    text,
    text,
    public.share_page_status,
    public.share_page_theme,
    jsonb
  )
to authenticated;

revoke all on function
  public.soft_delete_share_page(uuid)
from public, anon;

grant execute on function
  public.soft_delete_share_page(uuid)
to authenticated;

commit;