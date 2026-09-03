/*
# Seed Risk Indicators and Demo Organizations

## Overview
1. Inserts 14 configurable risk indicator rules covering financial, placement, manipulation, identity, transparency, and sensitive info categories
2. Creates 3 fictional demo organizations (clearly labeled as demo)
3. Creates 3 demo organization verification records

## Important Notes
- All organizations are FICTIONAL and clearly labeled with is_demo = true
- Risk indicators have weighted scores and keyword patterns for the rule-based engine
- No real companies are referenced
*/

-- ============================================================
-- RISK INDICATORS (14 configurable rules)
-- ============================================================
INSERT INTO risk_indicators (name, description, category, weight, patterns, recommendation, is_active) VALUES
(
  'Upfront Payment Request',
  'The opportunity requires an upfront payment to confirm a seat, register, or participate. Legitimate internships and jobs typically pay you, not the other way around.',
  'financial',
  20,
  '["pay", "payment", "fees", "registration fee", "confirm seat", "booking amount", "refundable deposit", "course fee", "training fee", "security deposit"]'::jsonb,
  'Do not make any payment until you have independently verified the organization and received written terms. Request a formal invoice and refund policy.',
  true
),
(
  'Guaranteed Placement Claim',
  'The opportunity claims guaranteed or 100% job placement. No legitimate organization can guarantee employment outcomes for all candidates.',
  'placement',
  20,
  '["guaranteed placement", "100% placement", "job guarantee", "assured placement", "guaranteed job", "100% job guarantee", "placement assurance", "sure placement"]'::jsonb,
  'Ask for verifiable placement statistics, including the percentage of placed students, companies that hired, and median salary. Contact placed alumni if possible.',
  true
),
(
  'Urgency or Pressure Language',
  'The communication uses urgency tactics to pressure you into acting quickly without time to verify. This is a common manipulation strategy.',
  'manipulation',
  10,
  '["limited seats", "act now", "today only", "last chance", "immediately", "urgent", "hurry", "closing soon", "first come first serve", "few seats left", "offer expires", "don''t miss"]'::jsonb,
  'Take your time to verify. Legitimate opportunities do not disappear within hours. Ask for the deadline in writing and verify independently.',
  true
),
(
  'Request for Sensitive Information',
  'The opportunity asks for OTP, PIN, passwords, bank details, or sensitive identity information early in the process.',
  'sensitive_info',
  25,
  '["otp", "pin", "password", "bank details", "account number", "cvv", "aadhaar", "pan card", "credit card", "debit card", "net banking", "login credentials"]'::jsonb,
  'Never share OTPs, PINs, passwords, or banking credentials. Legitimate organizations never ask for these. Report any such request immediately.',
  true
),
(
  'Unclear Organization Identity',
  'The organization providing the opportunity cannot be clearly identified or verified through public sources.',
  'identity',
  15,
  '["we are hiring", "leading company", "mnc", "fortune 500", "reputed firm", "well known company", "our client", "a major company"]'::jsonb,
  'Research the organization independently. Check their official website, LinkedIn presence, GST registration, and employee reviews on Glassdoor or similar platforms.',
  true
),
(
  'Missing Terms and Conditions',
  'The opportunity does not provide clear terms and conditions, including role description, duration, stipend, and cancellation policy.',
  'transparency',
  10,
  '["terms and conditions", "t&c", "agreement", "contract", "policy", "cancellation", "refund policy"]'::jsonb,
  'Request written terms and conditions before making any commitment or payment. A legitimate organization will provide formal documentation.',
  true
),
(
  'Selection Without Documented Process',
  'The opportunity claims you have been selected without a clear, documented selection process such as an interview or assessment.',
  'selection',
  15,
  '["shortlisted", "selected", "congratulations", "you have been chosen", "lucky candidate", "selected candidate", "you won", "chosen one"]'::jsonb,
  'Ask about the selection criteria and process. Legitimate organizations conduct interviews, review applications, or administer assessments before selecting candidates.',
  true
),
(
  'Unrealistic Salary Claims',
  'The opportunity advertises salary packages that seem unrealistically high for the role, experience level, or market.',
  'financial',
  15,
  '["lakh per month", "lpa", "per annum", "highest package", "salary package", "ctc", "monthly salary", "stipend"]'::jsonb,
  'Research typical salary ranges for similar roles and experience levels on platforms like Glassdoor, Naukri, or LinkedIn. Be cautious of claims that significantly exceed market norms.',
  true
),
(
  'Suspicious URL Pattern',
  'The website URL shows suspicious patterns such as misspelled domains, unusual TLDs, or URL shorteners that can mask the real destination.',
  'identity',
  20,
  '["bit.ly", "tinyurl", "goo.gl", "t.me", "forms.gle", "shorturl", ".tk", ".ml", ".ga", ".cf"]'::jsonb,
  'Do not click shortened or suspicious links. Verify the official website independently through search engines. Check for HTTPS and official domain names.',
  true
),
(
  'Inconsistent Organization Information',
  'The organization provides inconsistent information across communications, such as different names, addresses, or contact details.',
  'identity',
  10,
  '["also known as", "formerly", "formerly known", "sister concern", "group company", "division of"]'::jsonb,
  'Cross-check the organization name and details across multiple sources. Verify the registered legal name and any DBA (doing business as) names.',
  true
),
(
  'Unclear Refund Policy',
  'The opportunity mentions payment but does not clearly state the refund policy or makes the refund conditional on unclear terms.',
  'financial',
  10,
  '["non-refundable", "no refund", "refundable", "partial refund", "subject to", "conditions apply", "at our discretion"]'::jsonb,
  'Request the complete refund policy in writing before making any payment. Understand under what conditions a refund would be issued and the timeline for processing.',
  true
),
(
  'Communication via Personal Channels',
  'The opportunity communicates primarily through personal channels like WhatsApp, Telegram, or personal email rather than official company channels.',
  'communication',
  10,
  '["whatsapp", "telegram", "personal email", "gmail", "yahoo", "instagram dm", "facebook message", "direct message"]'::jsonb,
  'Verify that communication comes from official organization channels (e.g., @companyname.com email). Be cautious of outreach from personal accounts.',
  true
),
(
  'Vague Role Description',
  'The opportunity description is vague about the actual role, responsibilities, or learning outcomes, focusing primarily on benefits or outcomes.',
  'transparency',
  10,
  '["exciting opportunity", "great career", "amazing role", "fantastic chance", "golden opportunity", "dream job", "career growth"]'::jsonb,
  'Ask for a detailed job description including day-to-day responsibilities, reporting structure, learning objectives, and expected outcomes.',
  true
),
(
  'Request for Excessive Personal Information',
  'The opportunity requests excessive personal information beyond what is needed at the application stage, such as full bank details, ID numbers, or family information.',
  'sensitive_info',
  15,
  '["aadhaar number", "pan number", "bank account", "passport", "voter id", "ration card", "family details", "parent''s income", "community certificate"]'::jsonb,
  'Provide only the information necessary for the current stage of the application. Sensitive documents like Aadhaar or PAN should only be shared after joining, not during initial application.',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO ORGANIZATIONS (3 fictional, clearly labeled)
-- ============================================================
INSERT INTO organizations (id, name, website, description, industry, location, verification_status, reports_count, opportunities_count, is_demo, created_at) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'TechNova Learning Pvt. Ltd.',
  'https://technovalearning.example.com',
  'TechNova Learning is a fictional demo organization created for illustration purposes. It claims to offer internship and training programs in software development, data science, and digital marketing. This is a DEMO organization and does not represent any real company.',
  'EdTech / Training',
  'Bengaluru, Karnataka',
  'unverified',
  3,
  2,
  true,
  now() - interval '30 days'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'CareerBridge Academy',
  'https://careerbridge.example.com',
  'CareerBridge Academy is a fictional demo organization for illustration. It advertises placement programs and career acceleration courses with guaranteed job claims. This is a DEMO organization and does not represent any real company.',
  'Career Services',
  'Pune, Maharashtra',
  'partially_verified',
  1,
  2,
  true,
  now() - interval '20 days'
),
(
  'a0000000-0000-0000-0000-000000000003',
  'SkillOrbit Technologies',
  'https://skillorbit.example.com',
  'SkillOrbit Technologies is a fictional demo organization. It offers apprenticeship programs and certification courses in cloud computing and AI. This is a DEMO organization and does not represent any real company.',
  'IT Services',
  'Hyderabad, Telangana',
  'verified',
  0,
  1,
  true,
  now() - interval '15 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO ORGANIZATION VERIFICATIONS
-- ============================================================
INSERT INTO organization_verifications (id, organization_id, status, submitted_data, reviewer_notes, submitted_at, reviewed_at) VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'approved',
  '{"gst_number": "DEMO-GST-001", "website_verified": true, "linkedin_verified": true}'::jsonb,
  'Demo verification - all checks passed. Organization has verifiable web presence and registration.',
  now() - interval '14 days',
  now() - interval '12 days'
),
(
  'f0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'approved',
  '{"gst_number": "DEMO-GST-002", "website_verified": true, "linkedin_verified": false}'::jsonb,
  'Demo verification - partial checks passed. Website verified but LinkedIn presence incomplete.',
  now() - interval '18 days',
  now() - interval '16 days'
),
(
  'f0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'pending',
  '{"gst_number": null, "website_verified": false, "linkedin_verified": false}'::jsonb,
  null,
  now() - interval '5 days',
  null
)
ON CONFLICT DO NOTHING;
