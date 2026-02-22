-- Enable Row Level Security on patient-owned tables.
-- These tables all have a user_id column that references auth.users.id.
-- The mobile client queries them directly; service-role functions bypass RLS.

-- ─── profiles_patient ───────────────────────────────────────────────────────
ALTER TABLE profiles_patient ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_patient: select own row"
  ON profiles_patient FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "profiles_patient: insert own row"
  ON profiles_patient FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_patient: update own row"
  ON profiles_patient FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── patient_intake ──────────────────────────────────────────────────────────
ALTER TABLE patient_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patient_intake: select own rows"
  ON patient_intake FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "patient_intake: insert own row"
  ON patient_intake FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ─── user_tags ───────────────────────────────────────────────────────────────
ALTER TABLE user_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_tags: select own rows"
  ON user_tags FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_tags: insert own row"
  ON user_tags FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_tags: update own rows"
  ON user_tags FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
