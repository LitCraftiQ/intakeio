begin;

do $$
begin
  create type public.dashboard_notification_type
    as enum (
      'share_page_opened'
    );
exception
  when duplicate_object then null;
end
$$;

create table if not exists
  public.dashboard_notifications (
    id uuid primary key
      default gen_random_uuid(),

    owner_user_id uuid not null
      references auth.users(id)
      on delete cascade,

    type public.dashboard_notification_type
      not null,

    title text not null,
    body text not null,
    href text not null,

    share_page_id uuid
      references public.share_pages(id)
      on delete set null,

    read_at timestamptz,
    created_at timestamptz not null
      default now(),

    constraint dashboard_notifications_title_length
      check (
        char_length(title)
        between 1 and 80
      ),

    constraint dashboard_notifications_body_length
      check (
        char_length(body)
        between 1 and 180
      ),

    constraint dashboard_notifications_href_length
      check (
        char_length(href)
        between 1 and 200
      )
  );

create index if not exists
  dashboard_notifications_owner_created_idx
on public.dashboard_notifications (
  owner_user_id,
  created_at desc
);

create index if not exists
  dashboard_notifications_owner_unread_idx
on public.dashboard_notifications (
  owner_user_id,
  created_at desc
)
where read_at is null;

create index if not exists
  dashboard_notifications_page_opened_idx
on public.dashboard_notifications (
  share_page_id,
  created_at desc
)
where type = 'share_page_opened';

alter table public.dashboard_notifications
  enable row level security;

alter table public.dashboard_notifications
  force row level security;

drop policy if exists
  "Owners read their notifications"
on public.dashboard_notifications;

create policy
  "Owners read their notifications"
on public.dashboard_notifications
for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Owners update their notifications"
on public.dashboard_notifications;

create policy
  "Owners update their notifications"
on public.dashboard_notifications
for update
to authenticated
using (
  (select auth.uid()) = owner_user_id
)
with check (
  (select auth.uid()) = owner_user_id
);

grant select, update
  on public.dashboard_notifications
  to authenticated;

grant select, insert, update
  on public.dashboard_notifications
  to service_role;

create or replace function
  public.protect_dashboard_notification_update()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.owner_user_id is distinct from
      old.owner_user_id
    or new.type is distinct from old.type
    or new.title is distinct from old.title
    or new.body is distinct from old.body
    or new.href is distinct from old.href
    or new.share_page_id is distinct from
      old.share_page_id
    or new.created_at is distinct from
      old.created_at
  then
    raise exception
      'notification_is_immutable'
      using errcode = '42501';
  end if;

  if old.read_at is not null then
    new.read_at := old.read_at;
  end if;

  return new;
end;
$$;

drop trigger if exists
  protect_dashboard_notification_update
on public.dashboard_notifications;

create trigger
  protect_dashboard_notification_update
before update on
  public.dashboard_notifications
for each row
execute function
  public.protect_dashboard_notification_update();

create or replace function
  public.notify_share_page_opened(
    p_public_owner_id text,
    p_slug text
  )
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_page record;
  v_page_name text;
begin
  if p_public_owner_id is null
    or p_public_owner_id !~ '^[a-f0-9]{6}$'
    or p_slug is null
    or char_length(p_slug) not between 3 and 60
    or p_slug !~
      '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    return;
  end if;

  select
    id,
    owner_user_id,
    display_name,
    internal_name
  into v_page
  from public.share_pages
  where public_owner_id = p_public_owner_id
    and slug = p_slug
    and status = 'published'
    and deleted_at is null
  limit 1;

  if not found then
    return;
  end if;

  if exists (
    select 1
    from public.dashboard_notifications
    where owner_user_id = v_page.owner_user_id
      and share_page_id = v_page.id
      and type = 'share_page_opened'
      and created_at >
        now() - interval '30 minutes'
  ) then
    return;
  end if;

  v_page_name := nullif(
    btrim(coalesce(v_page.internal_name, '')),
    ''
  );

  if v_page_name is null then
    v_page_name := v_page.display_name;
  end if;

  insert into public.dashboard_notifications (
    owner_user_id,
    type,
    title,
    body,
    href,
    share_page_id
  )
  values (
    v_page.owner_user_id,
    'share_page_opened',
    'Share page opened',
    left(
      'Someone opened ' || v_page_name || '.',
      180
    ),
    '/dashboard',
    v_page.id
  );
end;
$$;

revoke all on function
  public.notify_share_page_opened(
    text,
    text
  )
from public;

grant execute on function
  public.notify_share_page_opened(
    text,
    text
  )
to anon, authenticated;

commit;
