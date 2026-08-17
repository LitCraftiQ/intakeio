begin;

create table if not exists
  public.intake_form_links (
    owner_user_id uuid primary key
      references auth.users(id)
      on delete cascade,

    public_owner_id text not null,

    created_at timestamptz not null
      default now(),

    constraint intake_form_links_public_owner_id_format
      check (
        public_owner_id ~ '^[a-f0-9]{6}$'
      )
  );

create unique index if not exists
  intake_form_links_public_owner_id_idx
on public.intake_form_links (
  public_owner_id
);

create table if not exists
  public.contacts (
    id uuid primary key
      default gen_random_uuid(),

    owner_user_id uuid not null
      references auth.users(id)
      on delete cascade,

    full_name text not null,
    email text not null,

    phone_number text,
    phone_international text,
    country_name text,
    country_code text,

    telegram_username text,
    company_name text,
    website text,

    project_title text,
    project_description text,
    budget text,
    preferred_contact_method text,
    preferred_meeting_time text,
    additional_information text,

    status text not null
      default 'pending',
    private_notes text,

    submitted_at timestamptz not null
      default now(),

    constraint contacts_full_name_length
      check (
        char_length(full_name)
        between 1 and 120
      ),

    constraint contacts_email_length
      check (
        char_length(email) <= 255
      ),

    constraint contacts_status_value
      check (
        status in (
          'pending',
          'contacted',
          'qualified',
          'archived'
        )
      )
  );

create index if not exists
  contacts_owner_submitted_idx
on public.contacts (
  owner_user_id,
  submitted_at desc
);

alter table public.intake_form_links
  enable row level security;

alter table public.intake_form_links
  force row level security;

alter table public.contacts
  enable row level security;

alter table public.contacts
  force row level security;

drop policy if exists
  "Owners read their form link"
on public.intake_form_links;

create policy
  "Owners read their form link"
on public.intake_form_links
for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Public reads created form links"
on public.intake_form_links;

create policy
  "Public reads created form links"
on public.intake_form_links
for select
to anon, authenticated
using (true);

drop policy if exists
  "Owners create their form link"
on public.intake_form_links;

create policy
  "Owners create their form link"
on public.intake_form_links
for insert
to authenticated
with check (
  (select auth.uid()) = owner_user_id
);

drop policy if exists
  "Owners read their contacts"
on public.contacts;

create policy
  "Owners read their contacts"
on public.contacts
for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
);

grant select
  on public.intake_form_links
  to anon, authenticated;

grant insert
  on public.intake_form_links
  to authenticated;

grant select
  on public.contacts
  to authenticated;

grant select, insert
  on public.intake_form_links
  to service_role;

grant select, insert, update
  on public.contacts
  to service_role;

create or replace function
  public.create_intake_form_link()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid;
  v_public_owner_id text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'unauthorized'
      using errcode = '42501';
  end if;

  v_public_owner_id :=
    public.get_or_create_share_public_id();

  insert into public.intake_form_links (
    owner_user_id,
    public_owner_id
  )
  values (
    v_user_id,
    v_public_owner_id
  )
  on conflict (owner_user_id)
    do nothing;

  select public_owner_id
    into v_public_owner_id
  from public.intake_form_links
  where owner_user_id = v_user_id;

  return v_public_owner_id;
end;
$$;

revoke all on function
  public.create_intake_form_link()
from public, anon;

grant execute on function
  public.create_intake_form_link()
to authenticated;

commit;
