create table if not exists public.pilot_settings (
  pilot_key text primary key,
  phase text not null check (phase in ('first_wave', 'paused', 'second_wave', 'closed')),
  first_wave_cap integer not null default 5 check (first_wave_cap > 0),
  cohort_cap integer not null default 20 check (cohort_cap >= first_wave_cap),
  second_wave_opened_at timestamptz,
  cohort_reviewed_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into public.pilot_settings (pilot_key, phase, first_wave_cap, cohort_cap)
values ('first_numbers_v1', 'first_wave', 5, 20)
on conflict (pilot_key) do nothing;

alter table public.pilot_participants
  drop constraint if exists pilot_participants_status_check;

alter table public.pilot_participants
  add constraint pilot_participants_status_check
  check (status in ('pending_review', 'accepted', 'waitlisted', 'not_now', 'withdrawn'));

alter table public.pilot_participants
  add column if not exists learning_stage text,
  add column if not exists reviewed_at timestamptz,
  add column if not exists decision_reason text,
  add column if not exists reminder_day3_sent_at timestamptz,
  add column if not exists reminder_day7_sent_at timestamptz,
  add column if not exists completion_qualified_at timestamptz,
  add column if not exists feedback_anonymized_at timestamptz,
  add column if not exists reward_issued_at timestamptz,
  add column if not exists email_failure_kind text;

alter table public.pilot_participants
  drop constraint if exists pilot_participants_learning_stage_check;

alter table public.pilot_participants
  add constraint pilot_participants_learning_stage_check
  check (learning_stage is null or learning_stage in ('emerging', 'beginning', 'confident', 'unsure'));

alter table public.pilot_participants
  alter column child_age_band drop not null,
  alter column activity_language drop not null,
  alter column counts_aloud drop not null,
  alter column counts_five drop not null,
  alter column matches_numerals drop not null,
  alter column composes_numbers drop not null,
  alter column printer_format drop not null;

alter table public.pilot_feedback
  add column if not exists use_outcome text,
  add column if not exists printing_note text;

alter table public.pilot_feedback
  drop constraint if exists pilot_feedback_use_outcome_check;

alter table public.pilot_feedback
  add constraint pilot_feedback_use_outcome_check
  check (use_outcome is null or use_outcome in ('used_with_objects', 'used_without_objects', 'printing_blocked', 'not_tried'));

alter table public.pilot_feedback
  alter column printed drop not null,
  alter column sittings drop not null,
  alter column used_objects drop not null;

create table if not exists public.pilot_feedback_anonymous (
  id uuid primary key default gen_random_uuid(),
  pilot_key text not null default 'first_numbers_v1',
  response jsonb not null,
  anonymized_at timestamptz not null default now()
);

create table if not exists public.marketing_opt_ins (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references public.pilot_participants(id) on delete set null,
  adult_email text not null unique,
  adult_first_name text,
  consent_source text not null,
  consented_at timestamptz not null default now(),
  resend_contact_id text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pilot_settings enable row level security;
alter table public.pilot_feedback_anonymous enable row level security;
alter table public.marketing_opt_ins enable row level security;

revoke all on public.pilot_settings from anon, authenticated;
revoke all on public.pilot_feedback_anonymous from anon, authenticated;
revoke all on public.marketing_opt_ins from anon, authenticated;

grant select, insert, update on public.pilot_settings to service_role;
grant select, insert on public.pilot_feedback_anonymous to service_role;
grant select, insert, update, delete on public.marketing_opt_ins to service_role;
grant insert, delete on public.pilot_token_delivery to service_role;
grant delete on public.pilot_events to service_role;
grant delete on public.pilot_feedback to service_role;
grant insert, delete on public.pilot_participants to service_role;

create or replace function public.pilot_apply_v2(
  p_token_hash text,
  p_delivery_token text,
  p_landing_session_id text,
  p_adult_first_name text,
  p_adult_email text,
  p_child_age_band text,
  p_learning_stage text,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_reason text;
  v_id uuid;
  v_deadline date;
  v_delivery_token text;
  v_phase text;
  v_first_wave_cap integer;
  v_cohort_cap integer;
  v_accepted_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('first-numbers-founding-families-v2'));

  select p.id, p.status, p.personal_deadline, t.delivery_token
  into v_id, v_status, v_deadline, v_delivery_token
  from public.pilot_participants p
  join public.pilot_token_delivery t on t.participant_id = p.id
  where lower(p.adult_email) = lower(p_adult_email)
    and p.withdrawn_at is null
  order by p.created_at desc
  limit 1;

  if v_id is not null then
    insert into public.pilot_events (participant_id, landing_session_id, event_name)
    values (v_id, p_landing_session_id, 'application_repeat');
    return jsonb_build_object(
      'id', v_id,
      'status', v_status,
      'deadline', v_deadline,
      'delivery_token', v_delivery_token,
      'existing', true
    );
  end if;

  select phase, first_wave_cap, cohort_cap
  into v_phase, v_first_wave_cap, v_cohort_cap
  from public.pilot_settings
  where pilot_key = 'first_numbers_v1'
  for update;

  select count(*) into v_accepted_count
  from public.pilot_participants
  where status = 'accepted';

  if p_learning_stage in ('beginning', 'confident') then
    v_status := 'not_now';
    v_reason := case when p_learning_stage = 'beginning' then 'likely_too_early' else 'likely_too_advanced' end;
  elsif v_phase in ('paused', 'closed') then
    v_status := 'waitlisted';
    v_reason := case when v_phase = 'paused' then 'first_wave_review' else 'cohort_closed' end;
  elsif v_phase = 'first_wave' then
    if v_accepted_count >= v_first_wave_cap then
      v_status := 'waitlisted';
      v_reason := 'first_wave_review';
    else
      v_status := 'pending_review';
      v_reason := case when p_learning_stage = 'unsure' then 'manual_unsure' else 'manual_first_wave' end;
    end if;
  elsif v_accepted_count >= v_cohort_cap then
    v_status := 'waitlisted';
    v_reason := 'cohort_full';
  elsif p_learning_stage = 'unsure' then
    v_status := 'pending_review';
    v_reason := 'manual_unsure';
  else
    v_status := 'accepted';
    v_reason := 'clear_fit';
    v_deadline := current_date + 7;
  end if;

  insert into public.pilot_participants (
    token_hash, landing_session_id, adult_first_name, adult_email,
    child_age_band, activity_language, learning_stage,
    qualification_reason, qualified, status, source,
    utm_source, utm_medium, utm_campaign, accepted_at,
    personal_deadline, reward_status, decision_reason
  ) values (
    p_token_hash, p_landing_session_id, p_adult_first_name, lower(p_adult_email),
    p_child_age_band, 'English', p_learning_stage,
    v_reason, p_learning_stage in ('emerging', 'unsure'), v_status, p_source,
    p_utm_source, p_utm_medium, p_utm_campaign,
    case when v_status = 'accepted' then now() else null end,
    v_deadline, 'not_eligible', v_reason
  ) returning id into v_id;

  insert into public.pilot_token_delivery (participant_id, delivery_token)
  values (v_id, p_delivery_token);

  insert into public.pilot_events (participant_id, landing_session_id, event_name, metadata)
  values (v_id, p_landing_session_id, 'application_submitted', jsonb_build_object('status', v_status));

  if v_status = 'accepted' then
    insert into public.pilot_events (participant_id, landing_session_id, event_name)
    values (v_id, p_landing_session_id, 'approved');
  end if;

  return jsonb_build_object(
    'id', v_id,
    'status', v_status,
    'deadline', v_deadline,
    'delivery_token', p_delivery_token,
    'existing', false
  );
end;
$$;

revoke all on function public.pilot_apply_v2(text,text,text,text,text,text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.pilot_apply_v2(text,text,text,text,text,text,text,text,text,text,text) to service_role;

create or replace function public.pilot_admin_decide(
  p_participant_id uuid,
  p_action text,
  p_reason text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_participant public.pilot_participants%rowtype;
  v_phase text;
  v_limit integer;
  v_count integer;
  v_deadline date;
  v_delivery_token text;
begin
  perform pg_advisory_xact_lock(hashtext('first-numbers-founding-families-v2'));

  select * into v_participant
  from public.pilot_participants
  where id = p_participant_id
  for update;

  if v_participant.id is null then
    raise exception 'participant_not_found';
  end if;

  if v_participant.status in ('accepted', 'not_now') then
    select delivery_token into v_delivery_token
    from public.pilot_token_delivery where participant_id = v_participant.id;
    return jsonb_build_object(
      'id', v_participant.id,
      'status', v_participant.status,
      'deadline', v_participant.personal_deadline,
      'delivery_token', v_delivery_token,
      'existing', true
    );
  end if;

  if v_participant.status <> 'pending_review' then
    raise exception 'participant_not_pending';
  end if;

  if p_action = 'decline' then
    update public.pilot_participants
    set status = 'not_now', qualified = false,
        decision_reason = coalesce(p_reason, 'manual_decline'),
        reviewed_at = now(), updated_at = now()
    where id = v_participant.id;

    insert into public.pilot_events (participant_id, landing_session_id, event_name, metadata)
    values (v_participant.id, v_participant.landing_session_id, 'not_now', jsonb_build_object('reason', coalesce(p_reason, 'manual_decline')));

    return jsonb_build_object('id', v_participant.id, 'status', 'not_now', 'existing', false);
  end if;

  if p_action <> 'accept' then
    raise exception 'invalid_action';
  end if;

  select phase,
    case when phase = 'first_wave' then first_wave_cap else cohort_cap end
  into v_phase, v_limit
  from public.pilot_settings
  where pilot_key = 'first_numbers_v1'
  for update;

  if v_phase in ('paused', 'closed') then
    raise exception 'pilot_not_accepting';
  end if;

  select count(*) into v_count from public.pilot_participants where status = 'accepted';
  if v_count >= v_limit then
    raise exception 'cohort_full';
  end if;

  v_deadline := current_date + 7;
  update public.pilot_participants
  set status = 'accepted', qualified = true, accepted_at = now(),
      personal_deadline = v_deadline, decision_reason = coalesce(p_reason, 'manual_accept'),
      reviewed_at = now(), updated_at = now()
  where id = v_participant.id;

  insert into public.pilot_events (participant_id, landing_session_id, event_name)
  values (v_participant.id, v_participant.landing_session_id, 'approved');

  select delivery_token into v_delivery_token
  from public.pilot_token_delivery where participant_id = v_participant.id;

  if v_phase = 'first_wave' and v_count + 1 >= v_limit then
    update public.pilot_settings
    set phase = 'paused', updated_at = now()
    where pilot_key = 'first_numbers_v1';
  end if;

  return jsonb_build_object(
    'id', v_participant.id,
    'status', 'accepted',
    'deadline', v_deadline,
    'delivery_token', v_delivery_token,
    'existing', false
  );
end;
$$;

revoke all on function public.pilot_admin_decide(uuid,text,text) from public, anon, authenticated;
grant execute on function public.pilot_admin_decide(uuid,text,text) to service_role;
