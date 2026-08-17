begin;

grant select, insert, update
  on public.dashboard_notifications
  to service_role;

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

commit;
