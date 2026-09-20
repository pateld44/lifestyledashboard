-- The earlier migrations enabled RLS and wrote policies for every Phase 2
-- table, but never explicitly GRANTed base table privileges to the
-- `authenticated` role. RLS only narrows access you already have at the SQL
-- grant level — without the grant, every operation fails with a flat
-- "permission denied for table X" before RLS is even evaluated. Discovered
-- by testing against a live project: profiles first (avatar upload), then
-- every other Phase 2 table (habit/vitals/finance widgets all failed the
-- same way).

grant select, insert, update, delete on profiles to authenticated;
grant select, insert, update, delete on habits to authenticated;
grant select, insert, update, delete on habit_logs to authenticated;
grant select, insert, update, delete on vitals_logs to authenticated;
grant select, insert, update, delete on budgets to authenticated;
grant select, insert, update, delete on expenses to authenticated;
