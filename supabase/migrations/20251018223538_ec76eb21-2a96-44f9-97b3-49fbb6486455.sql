-- ============================================================================
-- UNIFIED OPERATIONS PLATFORM - COMPLETE MULTI-TENANT DATABASE SCHEMA
-- ============================================================================
-- This migration creates a complete multi-tenant architecture supporting:
-- - SitePanda (SEO services with exclusive SEO tools)
-- - Decisions Unlimited (Business consulting)
-- - Logic Inbound (Marketing automation)
-- ============================================================================

-- ============================================================================
-- PHASE 1: ENUMS
-- ============================================================================

-- User roles within organizations
CREATE TYPE app_role AS ENUM ('admin', 'member', 'viewer');

-- Business statuses
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'lead');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'completed', 'on-hold');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE opportunity_stage AS ENUM ('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE webhook_status AS ENUM ('active', 'inactive');
CREATE TYPE sop_category AS ENUM ('operations', 'sales', 'marketing', 'customer_success', 'hr', 'finance');
CREATE TYPE sop_status AS ENUM ('draft', 'published');

-- SEO-specific enums
CREATE TYPE seo_report_type AS ENUM ('keyword_research', 'competitor_analysis', 'site_plan', 'content');
CREATE TYPE content_tone AS ENUM ('professional', 'friendly', 'authoritative', 'conversational');
CREATE TYPE content_status AS ENUM ('draft', 'generated', 'published');

-- ============================================================================
-- PHASE 2: CORE MULTI-TENANT TABLES
-- ============================================================================

-- Organizations table (multi-tenant isolation)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  tagline TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User-Organization relationship (many-to-many with roles)
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, organization_id)
);

-- ============================================================================
-- PHASE 3: BUSINESS TABLES (ORGANIZATION-SCOPED)
-- ============================================================================

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  company_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status client_status DEFAULT 'lead' NOT NULL,
  tags TEXT[] DEFAULT '{}',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status project_status DEFAULT 'planning' NOT NULL,
  priority project_priority DEFAULT 'medium' NOT NULL,
  budget NUMERIC(10,2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  deadline DATE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Opportunities
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stage opportunity_stage DEFAULT 'lead' NOT NULL,
  value NUMERIC(10,2) DEFAULT 0 NOT NULL,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  actual_close_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Notes
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SOPs
CREATE TABLE sops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  category sop_category NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  status sop_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- PHASE 4: INTEGRATION & AUTOMATION TABLES
-- ============================================================================

-- Webhooks (Outgoing)
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT[] NOT NULL,
  status webhook_status DEFAULT 'active' NOT NULL,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Webhook Logs
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Webhook Events (Incoming)
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  source TEXT,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- PHASE 5: SITEPANDA SEO MODULE (ORGANIZATION-EXCLUSIVE)
-- ============================================================================

-- SEO Projects
CREATE TABLE seo_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  target_location TEXT,
  target_language TEXT DEFAULT 'en',
  business_niche TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SEO Keywords
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  difficulty INTEGER,
  cpc NUMERIC(10,2),
  competition TEXT,
  current_position INTEGER,
  target_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SEO Competitor Analysis
CREATE TABLE seo_competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  competitor_domain TEXT NOT NULL,
  competitor_name TEXT,
  position INTEGER,
  rating NUMERIC(2,1),
  review_count INTEGER,
  phone TEXT,
  website TEXT,
  has_service_keyword BOOLEAN DEFAULT false,
  has_city_keyword BOOLEAN DEFAULT false,
  competitor_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SEO Site Plans
CREATE TABLE seo_site_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  seo_project_id UUID REFERENCES seo_projects(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  business_niche TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  target_keywords TEXT[],
  business_description TEXT,
  content_goals TEXT,
  page_count INTEGER DEFAULT 0,
  status project_status DEFAULT 'planning' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SEO Content Generation
CREATE TABLE seo_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  seo_project_id UUID REFERENCES seo_projects(id) ON DELETE SET NULL,
  seo_site_plan_id UUID REFERENCES seo_site_plans(id) ON DELETE SET NULL,
  site_name TEXT NOT NULL,
  page_type TEXT NOT NULL,
  target_keywords TEXT[],
  content_brief TEXT,
  tone content_tone DEFAULT 'professional',
  word_count INTEGER DEFAULT 500,
  generated_content TEXT,
  status content_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- SEO Reports
CREATE TABLE seo_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seo_project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE NOT NULL,
  report_type seo_report_type NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- PHASE 6: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User Organizations
CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);

-- Clients
CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_user ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_tags ON clients USING GIN(tags);

-- Projects
CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);

-- Opportunities
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_client ON opportunities(client_id);
CREATE INDEX idx_opportunities_user ON opportunities(user_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);

-- Notes
CREATE INDEX idx_notes_org ON notes(organization_id);
CREATE INDEX idx_notes_user ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- SOPs
CREATE INDEX idx_sops_org ON sops(organization_id);
CREATE INDEX idx_sops_category ON sops(category);
CREATE INDEX idx_sops_status ON sops(status);

-- Webhooks
CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);

-- Webhook Logs
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);

-- Webhook Events
CREATE INDEX idx_webhook_events_org ON webhook_events(organization_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);

-- SEO Tables
CREATE INDEX idx_seo_projects_org ON seo_projects(organization_id);
CREATE INDEX idx_seo_projects_client ON seo_projects(client_id);
CREATE INDEX idx_seo_keywords_project ON seo_keywords(seo_project_id);
CREATE INDEX idx_seo_competitors_project ON seo_competitor_analysis(seo_project_id);
CREATE INDEX idx_seo_site_plans_org ON seo_site_plans(organization_id);
CREATE INDEX idx_seo_site_plans_status ON seo_site_plans(status);
CREATE INDEX idx_seo_content_org ON seo_content(organization_id);
CREATE INDEX idx_seo_content_status ON seo_content(status);
CREATE INDEX idx_seo_content_project ON seo_content(seo_project_id);
CREATE INDEX idx_seo_reports_project ON seo_reports(seo_project_id);

-- ============================================================================
-- PHASE 7: SECURITY DEFINER FUNCTIONS (AVOID RLS RECURSION)
-- ============================================================================

-- Check if user has access to organization
CREATE OR REPLACE FUNCTION has_org_access(
  _user_id UUID,
  _org_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
  );
$$;

-- Check if user has specific role in organization
CREATE OR REPLACE FUNCTION has_org_role(
  _user_id UUID,
  _org_id UUID,
  _role app_role
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_organizations
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  );
$$;

-- Check if user is admin in organization
CREATE OR REPLACE FUNCTION is_admin_in_org(
  _user_id UUID,
  _org_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_org_role(_user_id, _org_id, 'admin');
$$;

-- ============================================================================
-- PHASE 8: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User Organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization memberships"
  ON user_organizations FOR SELECT
  USING (auth.uid() = user_id);

-- Clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view clients in their organizations"
  ON clients FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can insert clients in their organizations"
  ON clients FOR INSERT
  WITH CHECK (has_org_access(auth.uid(), organization_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update clients in their organizations"
  ON clients FOR UPDATE
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can delete clients in their organizations"
  ON clients FOR DELETE
  USING (is_admin_in_org(auth.uid(), organization_id));

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their organizations"
  ON projects FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can insert projects in their organizations"
  ON projects FOR INSERT
  WITH CHECK (has_org_access(auth.uid(), organization_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update projects in their organizations"
  ON projects FOR UPDATE
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can delete projects in their organizations"
  ON projects FOR DELETE
  USING (is_admin_in_org(auth.uid(), organization_id));

-- Opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view opportunities in their organizations"
  ON opportunities FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can insert opportunities in their organizations"
  ON opportunities FOR INSERT
  WITH CHECK (has_org_access(auth.uid(), organization_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update opportunities in their organizations"
  ON opportunities FOR UPDATE
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can delete opportunities in their organizations"
  ON opportunities FOR DELETE
  USING (is_admin_in_org(auth.uid(), organization_id));

-- Notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes in their organizations"
  ON notes FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can insert their own notes"
  ON notes FOR INSERT
  WITH CHECK (has_org_access(auth.uid(), organization_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON notes FOR DELETE
  USING (auth.uid() = user_id);

-- SOPs
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SOPs in their organizations"
  ON sops FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Members can insert SOPs in their organizations"
  ON sops FOR INSERT
  WITH CHECK (has_org_access(auth.uid(), organization_id) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own SOPs"
  ON sops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SOPs or admins can delete"
  ON sops FOR DELETE
  USING (auth.uid() = user_id OR is_admin_in_org(auth.uid(), organization_id));

-- Webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhooks in their organizations"
  ON webhooks FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can manage webhooks in their organizations"
  ON webhooks FOR ALL
  USING (is_admin_in_org(auth.uid(), organization_id))
  WITH CHECK (is_admin_in_org(auth.uid(), organization_id));

-- Webhook Logs (read-only for users with webhook access)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhook logs if they can access the webhook"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      WHERE webhooks.id = webhook_logs.webhook_id
        AND has_org_access(auth.uid(), webhooks.organization_id)
    )
  );

-- Webhook Events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view webhook events in their organizations"
  ON webhook_events FOR SELECT
  USING (organization_id IS NULL OR has_org_access(auth.uid(), organization_id));

CREATE POLICY "Service role can insert webhook events"
  ON webhook_events FOR INSERT
  WITH CHECK (true);

-- SEO Projects
ALTER TABLE seo_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO projects in their organizations"
  ON seo_projects FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can manage SEO projects in their organizations"
  ON seo_projects FOR ALL
  USING (has_org_access(auth.uid(), organization_id))
  WITH CHECK (has_org_access(auth.uid(), organization_id));

-- SEO Keywords
ALTER TABLE seo_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO keywords if they can access the project"
  ON seo_keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_keywords.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

CREATE POLICY "Users can manage SEO keywords if they can access the project"
  ON seo_keywords FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_keywords.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_keywords.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

-- SEO Competitor Analysis
ALTER TABLE seo_competitor_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO competitor analysis"
  ON seo_competitor_analysis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_competitor_analysis.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

CREATE POLICY "Users can manage SEO competitor analysis"
  ON seo_competitor_analysis FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_competitor_analysis.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_competitor_analysis.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

-- SEO Site Plans
ALTER TABLE seo_site_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO site plans in their organizations"
  ON seo_site_plans FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can manage SEO site plans in their organizations"
  ON seo_site_plans FOR ALL
  USING (has_org_access(auth.uid(), organization_id))
  WITH CHECK (has_org_access(auth.uid(), organization_id));

-- SEO Content
ALTER TABLE seo_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO content in their organizations"
  ON seo_content FOR SELECT
  USING (has_org_access(auth.uid(), organization_id));

CREATE POLICY "Users can manage SEO content in their organizations"
  ON seo_content FOR ALL
  USING (has_org_access(auth.uid(), organization_id))
  WITH CHECK (has_org_access(auth.uid(), organization_id));

-- SEO Reports
ALTER TABLE seo_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view SEO reports"
  ON seo_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_reports.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

CREATE POLICY "Users can create SEO reports"
  ON seo_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM seo_projects
      WHERE seo_projects.id = seo_reports.seo_project_id
        AND has_org_access(auth.uid(), seo_projects.organization_id)
    )
  );

-- ============================================================================
-- PHASE 9: TRIGGERS
-- ============================================================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sops_updated_at
  BEFORE UPDATE ON sops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seo_projects_updated_at
  BEFORE UPDATE ON seo_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seo_keywords_updated_at
  BEFORE UPDATE ON seo_keywords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seo_site_plans_updated_at
  BEFORE UPDATE ON seo_site_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_seo_content_updated_at
  BEFORE UPDATE ON seo_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PHASE 10: SEED DATA - CREATE THREE ORGANIZATIONS
-- ============================================================================

INSERT INTO organizations (slug, name, domain, icon, tagline, primary_color) VALUES
  ('sitepanda', 'SitePanda', 'sitepandaseo.com', '🐼', 'Local SEO Made Simple', '#3b82f6'),
  ('du', 'Decisions Unlimited', 'ducrm.com', '📊', 'Strategic Business Solutions', '#1e40af'),
  ('logicinbound', 'Logic Inbound', 'my.logicinbound.com', '🎯', 'Marketing Automation Experts', '#10b981');