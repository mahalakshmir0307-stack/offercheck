/*
# Seed Demo Opportunities, Analyses, Reports, Evidence, and Audit Logs

## Overview
1. Inserts 5 demo opportunities with varying risk levels (high, medium, low)
2. Inserts 5 demo analyses with extracted claims and risk scores
3. Inserts 3 demo reports with different categories and statuses
4. Inserts 3 demo evidence files (metadata only, no actual files)
5. Inserts 3 demo audit log entries

## Important Notes
- All demo data is clearly labeled with is_demo = true
- Demo data is owned by the demo user (a0000000-0000-0000-0000-000000000000)
- Opportunities reference the 3 fictional demo organizations
- Risk scores and levels match the analysis results
*/

-- ============================================================
-- DEMO OPPORTUNITIES (5 with varying risk levels)
-- ============================================================
INSERT INTO opportunities (id, user_id, organization_id, title, organization_name, opportunity_type, message_text, website_url, contact_info, payment_amount, payment_currency, risk_score, risk_level, status, is_demo, created_at) VALUES
(
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'Internship + Placement Program',
  'TechNova Learning Pvt. Ltd.',
  'placement_program',
  'Congratulations! You have been shortlisted for our internship + placement program. Pay ₹2,000 today to confirm your seat. Limited seats available - act now! 100% placement guarantee. Don''t miss this opportunity!',
  'https://bit.ly/technova-apply',
  'WhatsApp: +91-9876543210',
  2000.00,
  'INR',
  78,
  'high',
  'analyzed',
  true,
  now() - interval '10 days'
),
(
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Data Science Internship',
  'CareerBridge Academy',
  'internship',
  'We are pleased to offer you a 3-month data science internship. The program includes training in Python, ML, and data visualization. A registration fee of ₹1,500 applies. Placement assistance provided.',
  'https://careerbridge.example.com/internships',
  'careers@careerbridge.example.com',
  1500.00,
  'INR',
  45,
  'medium',
  'analyzed',
  true,
  now() - interval '8 days'
),
(
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000003',
  'Cloud Computing Apprenticeship',
  'SkillOrbit Technologies',
  'apprenticeship',
  'We are offering a 6-month apprenticeship in cloud computing (AWS/Azure). This is a paid apprenticeship with a monthly stipend of ₹15,000. Selection is based on a technical assessment and interview. No registration fees.',
  'https://skillorbit.example.com/careers',
  'hr@skillorbit.example.com',
  0,
  'INR',
  12,
  'low',
  'analyzed',
  true,
  now() - interval '5 days'
),
(
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'Digital Marketing Training Program',
  'TechNova Learning Pvt. Ltd.',
  'training',
  'Join our 2-month digital marketing training program. Pay ₹5,000 registration fee. Guaranteed job placement within 30 days of completion. Hurry - only 5 seats left! Contact us on Telegram @technova_dm for instant enrollment.',
  'https://t.me/technova_dm',
  'Telegram: @technova_dm',
  5000.00,
  'INR',
  85,
  'high',
  'analyzed',
  true,
  now() - interval '3 days'
),
(
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Full-Stack Developer Job (Entry Level)',
  'CareerBridge Academy',
  'job',
  'We are hiring entry-level full-stack developers. The role involves working with React, Node.js, and PostgreSQL. Salary: ₹4-6 LPA. Selection process includes a coding test and two technical interviews. Please apply through our website.',
  'https://careerbridge.example.com/jobs',
  'careers@careerbridge.example.com',
  0,
  'INR',
  20,
  'low',
  'analyzed',
  true,
  now() - interval '1 day'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO ANALYSES
-- ============================================================
INSERT INTO analyses (id, opportunity_id, user_id, risk_score, risk_level, extracted_claims, summary, created_at) VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000000',
  78,
  'high',
  '["Shortlisted for internship + placement program", "Payment of ₹2,000 required to confirm seat", "100% placement guarantee claimed", "Limited seats with urgency to act now", "Communication via WhatsApp"]'::jsonb,
  'This opportunity exhibits multiple high-risk indicators including upfront payment, guaranteed placement, urgency tactics, and suspicious URL. Exercise extreme caution.',
  now() - interval '10 days'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000000',
  45,
  'medium',
  '["3-month data science internship offered", "Registration fee of ₹1,500", "Training in Python, ML, data visualization", "Placement assistance (not guaranteed)"]'::jsonb,
  'This opportunity has moderate risk indicators. The registration fee is a concern, but the organization uses official contact channels and does not guarantee placement.',
  now() - interval '8 days'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000000',
  12,
  'low',
  '["6-month paid apprenticeship in cloud computing", "Monthly stipend of ₹15,000", "Selection based on technical assessment and interview", "No registration fees"]'::jsonb,
  'This opportunity shows few risk indicators. It is a paid apprenticeship with a documented selection process and no upfront fees.',
  now() - interval '5 days'
),
(
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000000',
  85,
  'high',
  '["2-month digital marketing training", "Registration fee of ₹5,000", "Guaranteed job placement within 30 days", "Only 5 seats left - urgency", "Communication via Telegram"]'::jsonb,
  'This opportunity exhibits multiple severe risk indicators. Guaranteed placement, upfront payment, urgency tactics, and communication via personal channels all present significant concerns.',
  now() - interval '3 days'
),
(
  'c0000000-0000-0000-0000-000000000005',
  'b0000000-0000-0000-0000-000000000005',
  'a0000000-0000-0000-0000-000000000000',
  20,
  'low',
  '["Entry-level full-stack developer position", "Salary ₹4-6 LPA", "Selection via coding test and two technical interviews", "React, Node.js, PostgreSQL stack"]'::jsonb,
  'This opportunity shows few risk indicators. It has a documented selection process, uses official channels, and the salary range is realistic for an entry-level role.',
  now() - interval '1 day'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO REPORTS
-- ============================================================
INSERT INTO reports (id, user_id, opportunity_id, organization_id, category, description, organization_name, opportunity_title, amount_requested, amount_paid, communication_channel, status, is_demo, created_at) VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'unexpected_payment_request',
  'I was asked to pay ₹2,000 immediately to confirm my seat for an internship. They said limited seats and I had to pay today. When I asked for terms, they said details would be shared after payment.',
  'TechNova Learning Pvt. Ltd.',
  'Internship + Placement Program',
  2000.00,
  0,
  'WhatsApp',
  'under_review',
  true,
  now() - interval '7 days'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'false_placement_claim',
  'They claimed 100% job placement guarantee within 30 days of completing their digital marketing course. After paying ₹5,000, the training was poor quality and no placement was provided.',
  'TechNova Learning Pvt. Ltd.',
  'Digital Marketing Training Program',
  5000.00,
  5000.00,
  'Telegram',
  'submitted',
  true,
  now() - interval '2 days'
),
(
  'd0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000002',
  'misleading_selection_claim',
  'I received a message saying I was shortlisted for a data science internship I never applied for. They asked for a registration fee. Seems like they are sending the same message to many students.',
  'CareerBridge Academy',
  'Data Science Internship',
  1500.00,
  0,
  'Email',
  'resolved',
  true,
  now() - interval '12 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO EVIDENCE FILES (metadata only)
-- ============================================================
INSERT INTO evidence_files (id, user_id, report_id, opportunity_id, file_name, file_path, file_size, file_type, evidence_type, verification_status, created_at) VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'whatsapp_screenshot.png',
  'demo/whatsapp_screenshot.png',
  245678,
  'image/png',
  'screenshot',
  'pending',
  now() - interval '7 days'
),
(
  'e0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000004',
  'payment_receipt.pdf',
  'demo/payment_receipt.pdf',
  87432,
  'application/pdf',
  'payment_receipt',
  'pending',
  now() - interval '2 days'
),
(
  'e0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000000',
  'd0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  'offer_email.eml',
  'demo/offer_email.eml',
  32145,
  'message/rfc822',
  'email',
  'verified',
  now() - interval '12 days'
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DEMO AUDIT LOGS
-- ============================================================
INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, details, created_at) VALUES
(
  'a0000000-0000-0000-0000-000000000000',
  'organization_verified',
  'organization',
  'a0000000-0000-0000-0000-000000000003',
  '{"verification_status": "verified", "notes": "Demo verification approved"}'::jsonb,
  now() - interval '12 days'
),
(
  'a0000000-0000-0000-0000-000000000000',
  'report_status_changed',
  'report',
  'd0000000-0000-0000-0000-000000000003',
  '{"old_status": "under_review", "new_status": "resolved"}'::jsonb,
  now() - interval '5 days'
),
(
  'a0000000-0000-0000-0000-000000000000',
  'organization_marked_under_review',
  'organization',
  'a0000000-0000-0000-0000-000000000001',
  '{"reason": "Multiple reports received"}'::jsonb,
  now() - interval '3 days'
)
ON CONFLICT DO NOTHING;
