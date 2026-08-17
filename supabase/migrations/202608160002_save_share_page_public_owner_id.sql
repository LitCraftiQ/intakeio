begin;

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
  v_public_owner_id text;
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

  v_public_owner_id :=
    public.get_or_create_share_public_id();

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
      public_owner_id,
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
      v_public_owner_id,
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

commit;
