begin;

alter table public.proposals
  drop constraint if exists
    proposals_public_token_format;

create or replace function
  public.assign_proposal_public_token()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_token text;
  v_tries integer := 0;
begin
  if new.public_token is not null
    and new.public_token ~ '^[a-f0-9]{6}$'
    and not exists (
      select 1
      from public.proposals
      where public_token = new.public_token
        and id is distinct from new.id
    )
  then
    return new;
  end if;

  loop
    v_tries := v_tries + 1;
    v_token := encode(gen_random_bytes(3), 'hex');

    exit when not exists (
      select 1
      from public.proposals
      where public_token = v_token
    );

    if v_tries > 32 then
      raise exception 'could not allocate proposal token';
    end if;
  end loop;

  new.public_token := v_token;
  return new;
end;
$$;

drop trigger if exists
  assign_proposal_public_token
on public.proposals;

create trigger
  assign_proposal_public_token
before insert on public.proposals
for each row
execute function
  public.assign_proposal_public_token();

do $$
declare
  r record;
  v_token text;
  v_tries integer;
begin
  for r in
    select id
    from public.proposals
    where public_token is null
      or public_token !~ '^[a-f0-9]{6}$'
  loop
    v_tries := 0;

    loop
      v_tries := v_tries + 1;
      v_token := encode(gen_random_bytes(3), 'hex');

      exit when not exists (
        select 1
        from public.proposals
        where public_token = v_token
      );

      if v_tries > 32 then
        raise exception 'could not allocate proposal token';
      end if;
    end loop;

    update public.proposals
    set public_token = v_token
    where id = r.id;
  end loop;
end
$$;

alter table public.proposals
  alter column public_token
  set default encode(gen_random_bytes(3), 'hex');

alter table public.proposals
  add constraint proposals_public_token_format
  check (
    public_token ~ '^[a-f0-9]{6}$'
  );

create or replace function
  public.mark_proposal_viewed(
    p_token text
  )
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null
    or p_token !~ '^[a-f0-9]{6}$'
  then
    return;
  end if;

  update public.proposals
  set
    status = 'viewed',
    viewed_at = coalesce(viewed_at, now())
  where public_token = p_token
    and status = 'sent';
end;
$$;

create or replace function
  public.respond_to_proposal(
    p_token text,
    p_decision text,
    p_message text
  )
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.proposal_status;
  v_message text;
begin
  if p_token is null
    or p_token !~ '^[a-f0-9]{6}$'
    or p_decision not in (
      'accepted',
      'changes_requested'
    )
  then
    return false;
  end if;

  v_message := nullif(btrim(coalesce(p_message, '')), '');

  if p_decision = 'changes_requested'
    and (v_message is null or char_length(v_message) < 8)
  then
    return false;
  end if;

  if p_decision = 'accepted' then
    v_status := 'accepted';
  else
    v_status := 'changes_requested';
  end if;

  update public.proposals
  set
    status = v_status,
    client_message = case
      when v_status = 'changes_requested' then left(v_message, 2000)
      else client_message
    end,
    responded_at = now()
  where public_token = p_token
    and status in ('sent', 'viewed');

  return found;
end;
$$;

commit;
