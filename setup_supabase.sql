
-- SQL to setup Supabase tables for JAAGO ERP

-- 1. Active Logs Table
CREATE TABLE IF NOT EXISTS public.active_logs (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    appraisal_id INTEGER,
    email TEXT,
    employee_name TEXT,
    action_type TEXT,
    details TEXT,
    status TEXT
);

-- 2. 360 Feedback Logs Table
CREATE TABLE IF NOT EXISTS public.three_sixty_feedback_logs (
    id BIGSERIAL PRIMARY KEY,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    invite_id BIGINT,
    template_id TEXT,
    requested_person_id INTEGER,
    requested_person_name TEXT,
    requested_person_email TEXT,
    feedback_giver_name TEXT,
    feedback_giver_email TEXT,
    positive_feedback_points JSONB,
    improve_feedback_points JSONB,
    status TEXT DEFAULT 'Submitted'
);

-- 3. 360 Invites Table
CREATE TABLE IF NOT EXISTS public.three_sixty_invites (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    requested_employee_id INTEGER,
    requested_employee_name TEXT,
    requested_employee_email TEXT,
    template_id TEXT,
    secure_token UUID DEFAULT gen_random_uuid(),
    expiry_date TIMESTAMPTZ,
    status TEXT DEFAULT 'Sent',
    positive_feedback_points JSONB,
    improve_feedback_points JSONB
);

-- 4. Active Emails Table
CREATE TABLE IF NOT EXISTS public.active_emails (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    appraisal_id INTEGER,
    receiver_name TEXT,
    receiver_email TEXT,
    subject TEXT,
    body_html TEXT,
    secure_token TEXT,
    status TEXT DEFAULT 'Pending'
);

-- 5. Active Submissions Table
CREATE TABLE IF NOT EXISTS public.active_submissions (
    id BIGSERIAL PRIMARY KEY,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    appraisal_id INTEGER,
    employee_name TEXT,
    submission_data JSONB,
    status TEXT DEFAULT 'Submitted'
);

-- 6. Appraisal Metadata Table
CREATE TABLE IF NOT EXISTS public.appraisal_metadata (
    id INTEGER PRIMARY KEY, -- Odoo ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    secure_token TEXT,
    template_id INTEGER,
    status TEXT DEFAULT 'pending_employee'
);

-- 7. Email Templates Table
CREATE TABLE IF NOT EXISTS public.email_templates (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT,
    subject TEXT,
    blocks JSONB,
    is_active BOOLEAN DEFAULT true,
    description TEXT
);

-- Enable RLS (Optional but recommended - currently using service_role or anon with open access in the app)
-- For a quick fix, you can keep them open for all authenticated users or just disable RLS if testing.
ALTER TABLE public.active_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.three_sixty_feedback_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.three_sixty_invites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appraisal_metadata DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates DISABLE ROW LEVEL SECURITY;
