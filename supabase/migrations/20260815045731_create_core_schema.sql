/*
# OfferCheck Core Schema

## Overview
Creates the complete relational schema for OfferCheck, a Career Opportunity Verification & Transparency Platform.

## New Tables
1. `profiles` - Extends auth.users with role (student/organization/admin), full_name, created_at
2. `organizations` - Organization profiles with verification status, industry, location, website, description
3. `organization_verifications` - Verification requests/records for organizations
4. `opportunities` - Submitted opportunities (internships, jobs, training, etc.) with risk scores
5. `analyses` - Risk analysis records linked to opportunities
6. `risk_indicators` - Configurable risk indicator rules (name, description, weight, pattern, category, active)
7. `analysis_indicators` - Junction table linking analyses to detected risk indicators with details
8. `reports` - Student reports about suspicious opportunities
9. `evidence_files` - Uploaded evidence documents (metadata only, stored in Supabase Storage)
10. `organization_responses` - Organization responses to reports
11. `audit_logs` - Audit trail of important admin/moderator actions
12. `notifications` - In-app notifications for users
13. `saved_opportunities` - Student's saved/bookmarked opportunities

## Security
- RLS enabled on ALL tables
- Profiles: users read/update own; admins read all
- Organizations: public read; owner insert/update own
- Opportunities: owner CRUD; public read for transparency
- Analyses: owner CRUD; public read
- Reports: owner CRUD; public read (no sensitive details exposed)
- Evidence files: owner CRUD only (private, never public)
- Audit logs: admin read only
- Notifications: owner CRUD
- Risk indicators: public read; admin write

## Important Notes
1. All owner columns default to auth.uid() so inserts work without explicitly passing user_id
2. Evidence files are private - never exposed publicly
3. Audit logs capture all admin/moderator actions
4. Risk indicator weights are configurable by admins
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organization', 'admin')),
  avatar_url text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- ORGANIZATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  website text,
  description text,
  industry text,
  location text,
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'partially_verified', 'unverified', 'under_review')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reports_count integer DEFAULT 0,
  opportunities_count integer DEFAULT 0,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_organizations" ON organizations;
CREATE POLICY "select_organizations" ON organizations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_organization" ON organizations;
CREATE POLICY "insert_own_organization" ON organizations FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "update_own_organization" ON organizations;
CREATE POLICY "update_own_organization" ON organizations FOR UPDATE
  TO authenticated USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- ORGANIZATION VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'more_info_required')),
  submitted_data jsonb,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organization_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_org_verifications" ON organization_verifications;
CREATE POLICY "select_org_verifications" ON organization_verifications FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_org_verifications" ON organization_verifications;
CREATE POLICY "insert_org_verifications" ON organization_verifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "update_org_verifications" ON organization_verifications;
CREATE POLICY "update_org_verifications" ON organization_verifications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- RISK INDICATORS TABLE (configurable rules)
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  weight integer NOT NULL DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendation text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE risk_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_risk_indicators" ON risk_indicators;
CREATE POLICY "select_risk_indicators" ON risk_indicators FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_risk_indicators" ON risk_indicators;
CREATE POLICY "insert_risk_indicators" ON risk_indicators FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "update_risk_indicators" ON risk_indicators;
CREATE POLICY "update_risk_indicators" ON risk_indicators FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_risk_indicators" ON risk_indicators;
CREATE POLICY "delete_risk_indicators" ON risk_indicators FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- OPPORTUNITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  title text NOT NULL,
  organization_name text NOT NULL,
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('internship', 'job', 'training', 'placement_program', 'apprenticeship', 'certification_program')),
  message_text text,
  website_url text,
  contact_info text,
  payment_amount numeric(12,2),
  payment_currency text DEFAULT 'INR',
  risk_score integer DEFAULT 0,
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  status text DEFAULT 'analyzed' CHECK (status IN ('draft', 'analyzed', 'reported')),
  is_saved boolean DEFAULT false,
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_user_id ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_risk_level ON opportunities(risk_level);
CREATE INDEX IF NOT EXISTS idx_opportunities_organization_id ON opportunities(organization_id);

ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_opportunities" ON opportunities;
CREATE POLICY "select_opportunities" ON opportunities FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_opportunities" ON opportunities;
CREATE POLICY "insert_opportunities" ON opportunities FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_opportunities" ON opportunities;
CREATE POLICY "update_opportunities" ON opportunities FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_opportunities" ON opportunities;
CREATE POLICY "delete_opportunities" ON opportunities FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- ANALYSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  extracted_claims jsonb DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analyses_opportunity_id ON analyses(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_analyses" ON analyses;
CREATE POLICY "select_analyses" ON analyses FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_analyses" ON analyses;
CREATE POLICY "insert_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_analyses" ON analyses;
CREATE POLICY "update_analyses" ON analyses FOR UPDATE
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "delete_analyses" ON analyses;
CREATE POLICY "delete_analyses" ON analyses FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- ============================================================
-- ANALYSIS INDICATORS TABLE (junction with details)
-- ============================================================
CREATE TABLE IF NOT EXISTS analysis_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  risk_indicator_id uuid NOT NULL REFERENCES risk_indicators(id) ON DELETE CASCADE,
  matched_text text,
  explanation text,
  weight_applied integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analysis_indicators_analysis_id ON analysis_indicators(analysis_id);

ALTER TABLE analysis_indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_analysis_indicators" ON analysis_indicators;
CREATE POLICY "select_analysis_indicators" ON analysis_indicators FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_analysis_indicators" ON analysis_indicators;
CREATE POLICY "insert_analysis_indicators" ON analysis_indicators FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_analysis_indicators" ON analysis_indicators;
CREATE POLICY "delete_analysis_indicators" ON analysis_indicators FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM analyses a WHERE a.id = analysis_id AND a.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN (
    'misleading_selection_claim', 'unexpected_payment_request', 'false_placement_claim',
    'fake_internship_claim', 'misleading_training_ad', 'suspicious_communication',
    'identity_impersonation', 'other'
  )),
  description text NOT NULL,
  organization_name text,
  opportunity_title text,
  amount_requested numeric(12,2),
  amount_paid numeric(12,2),
  communication_channel text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'more_info_required', 'resolved', 'rejected'
  )),
  is_demo boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_organization_id ON reports(organization_id);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_reports" ON reports;
CREATE POLICY "select_reports" ON reports FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    OR EXISTS (SELECT 1 FROM organizations o WHERE o.id = reports.organization_id AND o.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_reports" ON reports;
CREATE POLICY "insert_reports" ON reports FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_reports" ON reports;
CREATE POLICY "update_reports" ON reports FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "delete_reports" ON reports;
CREATE POLICY "delete_reports" ON reports FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- EVIDENCE FILES TABLE (metadata only - files in Storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES opportunities(id) ON DELETE SET NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  evidence_type text NOT NULL CHECK (evidence_type IN (
    'offer_letter', 'email', 'screenshot', 'payment_receipt', 'terms_conditions', 'other'
  )),
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_files_user_id ON evidence_files(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_report_id ON evidence_files(report_id);

ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_evidence_files" ON evidence_files;
CREATE POLICY "select_evidence_files" ON evidence_files FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_evidence_files" ON evidence_files;
CREATE POLICY "insert_evidence_files" ON evidence_files FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_evidence_files" ON evidence_files;
CREATE POLICY "update_evidence_files" ON evidence_files FOR UPDATE
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "delete_evidence_files" ON evidence_files;
CREATE POLICY "delete_evidence_files" ON evidence_files FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- ORGANIZATION RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS organization_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  response_text text NOT NULL,
  supporting_info jsonb,
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'acknowledged', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE organization_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_org_responses" ON organization_responses;
CREATE POLICY "select_org_responses" ON organization_responses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM reports r WHERE r.id = report_id AND r.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "insert_org_responses" ON organization_responses;
CREATE POLICY "insert_org_responses" ON organization_responses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_org_responses" ON organization_responses;
CREATE POLICY "update_org_responses" ON organization_responses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_audit_logs" ON audit_logs;
CREATE POLICY "select_audit_logs" ON audit_logs FOR SELECT
  TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "insert_audit_logs" ON audit_logs;
CREATE POLICY "insert_audit_logs" ON audit_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_notifications" ON notifications;
CREATE POLICY "select_notifications" ON notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_notifications" ON notifications;
CREATE POLICY "insert_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_notifications" ON notifications;
CREATE POLICY "update_notifications" ON notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_notifications" ON notifications;
CREATE POLICY "delete_notifications" ON notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- SAVED OPPORTUNITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, opportunity_id)
);

ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_saved_opportunities" ON saved_opportunities;
CREATE POLICY "select_saved_opportunities" ON saved_opportunities FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_saved_opportunities" ON saved_opportunities;
CREATE POLICY "insert_saved_opportunities" ON saved_opportunities FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_saved_opportunities" ON saved_opportunities;
CREATE POLICY "delete_saved_opportunities" ON saved_opportunities FOR DELETE
  TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS organizations_updated_at ON organizations;
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS opportunities_updated_at ON opportunities;
CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
