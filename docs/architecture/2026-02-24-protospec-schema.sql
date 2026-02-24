-- Phase A PostgreSQL schema draft
-- Purpose: persist compile jobs, ProtoSpec artifacts, and traceability data.

create table if not exists projects (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prd_documents (
  id text primary key,
  project_id text not null references projects(id),
  title text not null,
  source_type text not null check (source_type in ('markdown', 'structured')),
  source_content text not null,
  source_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists compile_jobs (
  id text primary key,
  project_id text not null references projects(id),
  prd_document_id text references prd_documents(id),
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  requested_by text,
  error_code text,
  error_message text,
  error_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_compile_jobs_project on compile_jobs(project_id, created_at desc);
create index if not exists idx_compile_jobs_status on compile_jobs(status, created_at desc);

create table if not exists proto_specs (
  id text primary key,
  project_id text not null references projects(id),
  compile_job_id text references compile_jobs(id),
  version text not null,
  compiler_version text not null,
  source_hash text not null,
  meta jsonb not null,
  tokens jsonb not null,
  spec_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_proto_specs_project on proto_specs(project_id, created_at desc);
create index if not exists idx_proto_specs_source_hash on proto_specs(project_id, source_hash);

create table if not exists requirement_traces (
  id bigserial primary key,
  spec_id text not null references proto_specs(id) on delete cascade,
  requirement_id text not null,
  requirement_text text not null,
  references_json jsonb not null
);

create unique index if not exists idx_requirement_traces_unique on requirement_traces(spec_id, requirement_id);
