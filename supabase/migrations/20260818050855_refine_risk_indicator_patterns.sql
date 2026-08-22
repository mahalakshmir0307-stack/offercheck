-- ============================================================
-- Refine risk indicator patterns to reduce false positives
-- ============================================================
-- Key changes:
-- 1. "Upfront Payment Request": removed bare "pay" (matches "payroll", "repay"),
--    kept specific payment-request phrases
-- 2. "Unrealistic Salary Claims": removed bare "stipend", "ctc", "lpa",
--    "per annum", "monthly salary" (normal in legit postings); kept only
--    superlative phrases. The engine also does contextual salary checks.
-- 3. "Missing Terms and Conditions": inverted — patterns now detect signals
--    that terms are deliberately absent, not that terms exist
-- 4. "Communication via Personal Channels": removed bare "gmail", "yahoo"
--    (too broad); kept messaging-app-specific channels
-- 5. "Vague Role Description": removed "career growth", "exciting opportunity"
--    (extremely common in legit postings); kept more manipulative phrases
-- 6. "Unclear Organization Identity": removed "we are hiring" (normal phrase);
--    kept vague identity-avoidance phrases
-- 7. "Selection Without Documented Process": removed bare "selected"
--    (matches "shortlisted and selected for interview" in legit flows);
--    kept phrases implying selection WITHOUT a process

UPDATE risk_indicators SET patterns = '["registration fee", "confirm seat", "booking amount", "refundable deposit", "course fee", "training fee", "security deposit", "seat confirmation fee", "enrollment fee", "participation fee"]'::jsonb,
  updated_at = now()
WHERE name = 'Upfront Payment Request';

UPDATE risk_indicators SET patterns = '["highest package", "highest salary", "dream package", "guaranteed salary", "guaranteed package", "assured salary", "top package", "best salary", "unrealistic salary"]'::jsonb,
  updated_at = now()
WHERE name = 'Unrealistic Salary Claims';

UPDATE risk_indicators SET patterns = '["no contract", "no agreement", "no paperwork", "no formal agreement", "no terms", "no documentation", "start immediately without", "join directly", "no need for contract"]'::jsonb,
  updated_at = now()
WHERE name = 'Missing Terms and Conditions';

UPDATE risk_indicators SET patterns = '["whatsapp", "telegram", "instagram dm", "facebook message", "direct message", "personal number", "personal email only", "contact via whatsapp", "message on whatsapp", "dm us", "ping me"]'::jsonb,
  updated_at = now()
WHERE name = 'Communication via Personal Channels';

UPDATE risk_indicators SET patterns = '["golden opportunity", "once in a lifetime", "can''t miss this", "rare chance", "exclusive opportunity just for you", "handpicked", "specially chosen", "secret opportunity"]'::jsonb,
  updated_at = now()
WHERE name = 'Vague Role Description';

UPDATE risk_indicators SET patterns = '["leading company", "mnc", "fortune 500", "reputed firm", "well known company", "our client", "a major company", "top mnc", "cannot disclose company name", "confidential company"]'::jsonb,
  updated_at = now()
WHERE name = 'Unclear Organization Identity';

UPDATE risk_indicators SET patterns = '["congratulations", "you have been chosen", "lucky candidate", "selected candidate", "you won", "chosen one", "you have been shortlisted without", "selected without interview"]'::jsonb,
  updated_at = now()
WHERE name = 'Selection Without Documented Process';

-- "Unclear Refund Policy" — keep "non-refundable" and "no refund" (genuine red flags)
-- but remove "refundable" (which is actually a positive signal) and "subject to"
-- (too common in legitimate legal language)
UPDATE risk_indicators SET patterns = '["non-refundable", "no refund", "fees are non-refundable", "no refund policy", "strictly non-refundable", "refund not available"]'::jsonb,
  updated_at = now()
WHERE name = 'Unclear Refund Policy';

-- "Urgency or Pressure Language" — remove "immediately" (common in legit
-- "please reply immediately if interested" contexts); keep high-pressure phrases
UPDATE risk_indicators SET patterns = '["limited seats", "act now", "today only", "last chance", "hurry", "closing soon", "first come first serve", "few seats left", "offer expires", "don''t miss", "seats filling fast", "register before it''s too late"]'::jsonb,
  updated_at = now()
WHERE name = 'Urgency or Pressure Language';

-- "Request for Sensitive Information" — add word-boundary safety by using
-- more specific phrases; remove bare "pin" (matches "pin code", "pinpoint")
-- and bare "password" (too common in IT job descriptions about password systems)
UPDATE risk_indicators SET patterns = '["otp", "pin number", "bank details", "account number", "cvv", "aadhaar", "pan card", "credit card", "debit card", "net banking", "login credentials", "share your password", "share your otp"]'::jsonb,
  updated_at = now()
WHERE name = 'Request for Sensitive Information';

-- "Request for Excessive Personal Information" — make patterns more specific
UPDATE risk_indicators SET patterns = '["aadhaar number", "pan number", "bank account", "passport", "voter id", "ration card", "family details", "parent''s income", "community certificate", "share your aadhaar", "upload your aadhaar"]'::jsonb,
  updated_at = now()
WHERE name = 'Request for Excessive Personal Information';
