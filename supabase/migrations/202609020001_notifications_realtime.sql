begin;

alter table public.dashboard_notifications
  replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dashboard_notifications'
  ) then
    execute
      'alter publication supabase_realtime
       add table public.dashboard_notifications';
  end if;
exception
  when undefined_object then
    null;
end
$$;

commit;

alter type public.dashboard_notification_type
  add value if not exists 'contact_submitted';
