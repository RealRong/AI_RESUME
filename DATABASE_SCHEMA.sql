create extension if not exists pgcrypto;

create table if not exists resume_uploads (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  file_size bigint not null check (file_size > 0),
  mime_type text not null check (mime_type = 'application/pdf'),
  preview_image_path text,
  status text not null check (
    status in ('uploaded', 'parsing', 'extracting', 'completed', 'failed')
  ) default 'uploaded',
  error_message text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references resume_uploads(id) on delete cascade,
  name text,
  phone text,
  email text,
  city text,
  status text not null check (
    status in ('pending', 'screening_passed', 'interviewing', 'hired', 'rejected')
  ) default 'pending',
  source_file_url text,
  raw_text text,
  cleaned_text text,
  extraction_status text not null check (
    extraction_status in ('pending', 'running', 'completed', 'failed')
  ) default 'pending',
  extraction_error text,
  latest_overall_score integer check (latest_overall_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidate_educations (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  school text not null,
  major text,
  degree text,
  graduation_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists candidate_work_experiences (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  company_name text not null,
  title text,
  start_date date,
  end_date date,
  summary text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists candidate_projects (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  project_name text not null,
  tech_stack jsonb not null default '[]'::jsonb,
  role_summary text,
  highlights jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists candidate_skills (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  skill_name text not null,
  skill_type text not null default 'general',
  normalized_name text generated always as (lower(skill_name)) stored,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  required_skills jsonb not null default '[]'::jsonb,
  bonus_skills jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists candidate_matchings (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  skill_match_score integer not null check (skill_match_score between 0 and 100),
  experience_relevance_score integer not null check (experience_relevance_score between 0 and 100),
  education_fit_score integer not null check (education_fit_score between 0 and 100),
  summary text not null,
  strengths_json jsonb not null default '[]'::jsonb,
  risks_json jsonb not null default '[]'::jsonb,
  evidence_json jsonb not null default '[]'::jsonb,
  model_name text,
  prompt_version text,
  created_at timestamptz not null default now()
);

create table if not exists upload_events (
  id uuid primary key default gen_random_uuid(),
  upload_id uuid not null references resume_uploads(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists candidate_audit_logs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidates(id) on delete cascade,
  action_type text not null,
  before_json jsonb not null default '{}'::jsonb,
  after_json jsonb not null default '{}'::jsonb,
  operator text not null default 'system',
  created_at timestamptz not null default now()
);

create index if not exists idx_resume_uploads_status on resume_uploads(status);
create index if not exists idx_resume_uploads_uploaded_at on resume_uploads(uploaded_at desc);

create index if not exists idx_candidates_upload_id on candidates(upload_id);
create index if not exists idx_candidates_status on candidates(status);
create index if not exists idx_candidates_created_at on candidates(created_at desc);
create index if not exists idx_candidates_latest_overall_score on candidates(latest_overall_score desc nulls last);
create index if not exists idx_candidates_email on candidates(email);
create index if not exists idx_candidates_name on candidates(name);

create index if not exists idx_candidate_educations_candidate_id on candidate_educations(candidate_id);
create index if not exists idx_candidate_work_experiences_candidate_id on candidate_work_experiences(candidate_id);
create index if not exists idx_candidate_projects_candidate_id on candidate_projects(candidate_id);
create index if not exists idx_candidate_skills_candidate_id on candidate_skills(candidate_id);
create index if not exists idx_candidate_skills_normalized_name on candidate_skills(normalized_name);

create index if not exists idx_jobs_created_at on jobs(created_at desc);
create index if not exists idx_candidate_matchings_candidate_job on candidate_matchings(candidate_id, job_id, created_at desc);
create index if not exists idx_upload_events_upload_id on upload_events(upload_id, created_at asc);
create index if not exists idx_candidate_audit_logs_candidate_id on candidate_audit_logs(candidate_id, created_at desc);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_resume_uploads_updated_at on resume_uploads;
create trigger trg_resume_uploads_updated_at
before update on resume_uploads
for each row
execute function set_updated_at();

drop trigger if exists trg_candidates_updated_at on candidates;
create trigger trg_candidates_updated_at
before update on candidates
for each row
execute function set_updated_at();

drop trigger if exists trg_jobs_updated_at on jobs;
create trigger trg_jobs_updated_at
before update on jobs
for each row
execute function set_updated_at();

