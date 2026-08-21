create extension if not exists pgcrypto;

create table if not exists public.pilot_participants (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  landing_session_id text,
  adult_first_name text not null,
  adult_email text not null,
  child_age_band text not null,
  activity_language text not null,
  counts_aloud text not null,
  counts_five text not null,
  matches_numerals text not null,
  composes_numbers text not null,
  printer_format text not null,
  qualification_reason text not null,
  qualified boolean not null,
  status text not null check (status in ('accepted', 'waitlisted', 'not_now', 'withdrawn')),
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  accepted_at timestamptz,
  personal_deadline date,
  downloaded_at timestamptz,
  downloaded_edition text,
  feedback_status text not null default 'pending' check (feedback_status in ('pending', 'submitted', 'usable', 'needs_clarification', 'no_use')),
  reward_status text not null default 'not_eligible' check (reward_status in ('not_eligible', 'review_pending', 'confirmed', 'issued')),
  reminder_print_sent_at timestamptz,
  reminder_session_sent_at timestamptz,
  reminder_feedback_sent_at timestamptz,
  email_delivery_failed_at timestamptz,
  withdrawn_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pilot_events (
  id bigint generated always as identity primary key,
  participant_id uuid references public.pilot_participants(id) on delete cascade,
  landing_session_id text,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.pilot_token_delivery (
  participant_id uuid primary key references public.pilot_participants(id) on delete cascade,
  delivery_token text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_feedback (
  participant_id uuid primary key references public.pilot_participants(id) on delete cascade,
  printed text not null,
  print_friction text,
  sittings text not null,
  sections_used text[] not null default '{}',
  page_codes text,
  used_objects text not null,
  instruction_friction text,
  concrete_observation text,
  behaviours text[] not null default '{}',
  easiest_section text,
  hardest_section text,
  difficulty_reason text,
  numeral_cues text,
  knew_next text,
  knew_next_note text,
  continue_next_week text not null,
  continue_reason text,
  anything_else text,
  follow_up_consent boolean not null default false,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pilot_participants_status_idx on public.pilot_participants(status, created_at);
create index if not exists pilot_participants_feedback_idx on public.pilot_participants(feedback_status, accepted_at);
create index if not exists pilot_events_session_idx on public.pilot_events(landing_session_id, occurred_at);
create index if not exists pilot_events_participant_idx on public.pilot_events(participant_id, occurred_at);

alter table public.pilot_participants enable row level security;
alter table public.pilot_events enable row level security;
alter table public.pilot_feedback enable row level security;
alter table public.pilot_token_delivery enable row level security;

revoke all on public.pilot_participants from anon, authenticated;
revoke all on public.pilot_events from anon, authenticated;
revoke all on public.pilot_feedback from anon, authenticated;
revoke all on public.pilot_token_delivery from anon, authenticated;

create or replace function public.pilot_apply(
  p_token_hash text,
  p_delivery_token text,
  p_landing_session_id text,
  p_adult_first_name text,
  p_adult_email text,
  p_child_age_band text,
  p_activity_language text,
  p_counts_aloud text,
  p_counts_five text,
  p_matches_numerals text,
  p_composes_numbers text,
  p_printer_format text,
  p_qualification_reason text,
  p_qualified boolean,
  p_source text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_cohort_cap integer default 20
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_id uuid;
  v_deadline date;
  v_delivery_token text;
begin
  perform pg_advisory_xact_lock(hashtext('first-numbers-founding-families-v1'));

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
    return jsonb_build_object('id', v_id, 'status', v_status, 'deadline', v_deadline, 'delivery_token', v_delivery_token, 'existing', true);
  end if;

  if not p_qualified then
    v_status := 'not_now';
  elsif (select count(*) from public.pilot_participants where status = 'accepted') < p_cohort_cap then
    v_status := 'accepted';
    v_deadline := current_date + 8;
  else
    v_status := 'waitlisted';
  end if;

  insert into public.pilot_participants (
    token_hash, landing_session_id, adult_first_name, adult_email,
    child_age_band, activity_language, counts_aloud, counts_five,
    matches_numerals, composes_numbers, printer_format,
    qualification_reason, qualified, status, source,
    utm_source, utm_medium, utm_campaign, accepted_at, personal_deadline,
    reward_status
  ) values (
    p_token_hash, p_landing_session_id, p_adult_first_name, lower(p_adult_email),
    p_child_age_band, p_activity_language, p_counts_aloud, p_counts_five,
    p_matches_numerals, p_composes_numbers, p_printer_format,
    p_qualification_reason, p_qualified, v_status, p_source,
    p_utm_source, p_utm_medium, p_utm_campaign,
    case when v_status = 'accepted' then now() else null end,
    v_deadline,
    'not_eligible'
  ) returning id into v_id;

  insert into public.pilot_token_delivery (participant_id, delivery_token)
  values (v_id, p_delivery_token);

  insert into public.pilot_events (participant_id, landing_session_id, event_name, metadata)
  values (v_id, p_landing_session_id, 'application_submit', jsonb_build_object('status', v_status));

  if p_qualified then
    insert into public.pilot_events (participant_id, landing_session_id, event_name)
    values (v_id, p_landing_session_id, 'qualified');
  end if;

  if v_status = 'accepted' then
    insert into public.pilot_events (participant_id, landing_session_id, event_name)
    values (v_id, p_landing_session_id, 'accepted');
  end if;

  return jsonb_build_object('id', v_id, 'status', v_status, 'deadline', v_deadline, 'delivery_token', p_delivery_token, 'existing', false);
end;
$$;

revoke all on function public.pilot_apply(text,text,text,text,text,text,text,text,text,text,text,text,text,boolean,text,text,text,text,integer) from public, anon, authenticated;
grant execute on function public.pilot_apply(text,text,text,text,text,text,text,text,text,text,text,text,text,boolean,text,text,text,text,integer) to service_role;
