begin;

create or replace function
  public.notify_contact_submitted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.dashboard_notifications (
    owner_user_id,
    type,
    title,
    body,
    href
  )
  values (
    new.owner_user_id,
    'contact_submitted',
    'New contact',
    left(
      new.full_name
      || ' submitted the intake form.',
      180
    ),
    left(
      '/dashboard/contacts?contact='
      || new.id::text,
      200
    )
  );

  return new;
end;
$$;

drop trigger if exists
  notify_contact_submitted
on public.contacts;

create trigger
  notify_contact_submitted
after insert on public.contacts
for each row
execute function
  public.notify_contact_submitted();

commit;
