begin;

do $$
begin
  create type public.proposal_status as enum (
    'draft',
    'sent',
    'viewed',
    'accepted',
    'changes_requested'
  );
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create type public.proposal_creation_mode as enum (
    'manual',
    'ai'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists
  public.proposals (
    id uuid primary key
      default gen_random_uuid(),

    owner_user_id uuid not null
      references auth.users(id)
      on delete cascade,

    contact_id uuid not null
      references public.contacts(id)
      on delete cascade,

    public_token text not null
      default encode(gen_random_bytes(12), 'hex'),

    creation_mode public.proposal_creation_mode
      not null
      default 'manual',

    status public.proposal_status
      not null
      default 'draft',

    project_title text not null default '',
    executive_summary text not null default '',
    scope_of_work text not null default '',
    deliverables text not null default '',
    timeline text not null default '',
    milestones text not null default '',
    pricing text not null default '',
    payment_schedule text not null default '',
    terms text not null default '',
    acceptance_section text not null default '',

    client_message text,

    sent_at timestamptz,
    viewed_at timestamptz,
    responded_at timestamptz,
    created_at timestamptz not null
      default now(),
    updated_at timestamptz not null
      default now(),

    constraint proposals_public_token_format
      check (
        public_token ~ '^[a-f0-9]{24}$'
      ),

    constraint proposals_title_length
      check (
        char_length(project_title) <= 160
      ),

    constraint proposals_section_length
      check (
        char_length(executive_summary) <= 8000
        and char_length(scope_of_work) <= 8000
        and char_length(deliverables) <= 8000
        and char_length(timeline) <= 4000
        and char_length(milestones) <= 8000
        and char_length(pricing) <= 4000
        and char_length(payment_schedule) <= 4000
        and char_length(terms) <= 8000
        and char_length(acceptance_section) <= 4000
      ),

    constraint proposals_client_message_length
      check (
        client_message is null
        or char_length(client_message) <= 2000
      )
  );

create unique index if not exists
  proposals_public_token_idx
on public.proposals (public_token);

create index if not exists
  proposals_owner_updated_idx
on public.proposals (
  owner_user_id,
  updated_at desc
);

create index if not exists
  proposals_contact_idx
on public.proposals (
  contact_id,
  updated_at desc
);

alter table public.proposals
  enable row level security;

alter table public.proposals
  force row level security;

drop policy if exists
  "Owners manage their proposals"
on public.proposals;

create policy
  "Owners manage their proposals"
on public.proposals
for all
to authenticated
using (
  (select auth.uid()) = owner_user_id
)
with check (
  (select auth.uid()) = owner_user_id
);

grant select, insert, update, delete
  on public.proposals
  to authenticated;

grant select, insert, update
  on public.proposals
  to service_role;

create or replace function
  public.touch_proposal_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists
  touch_proposal_updated_at
on public.proposals;

create trigger
  touch_proposal_updated_at
before update on public.proposals
for each row
execute function
  public.touch_proposal_updated_at();

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
    or p_token !~ '^[a-f0-9]{24}$'
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
    or p_token !~ '^[a-f0-9]{24}$'
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

revoke all on function
  public.mark_proposal_viewed(text)
from public;

revoke all on function
  public.respond_to_proposal(text, text, text)
from public;

grant execute on function
  public.mark_proposal_viewed(text)
to anon, authenticated;

grant execute on function
  public.respond_to_proposal(text, text, text)
to anon, authenticated;

commit;
