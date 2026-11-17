-- ============================================================================
-- Mama-G Edge Field Tablet SQLite Schema
-- Optimized for offline-first clinical triage, climate health extensions,
-- and secure synchronization with regional hubs.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ----------------------------------------------------------------------------
-- 1. Metadata & Sync State Management
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sync_metadata (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. Clinical Triage Rules & Climate Modules (Cached Offline)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS triage_rules (
    rule_id TEXT PRIMARY KEY,
    module_name TEXT NOT NULL, -- e.g., 'heat_stress', 'vector_malaria', 'obstetric_standard'
    severity_level INTEGER NOT NULL, -- 1 = Emergency, 2 = Urgent Warning, 3 = Standard Advisory
    trigger_condition TEXT NOT NULL, -- JSON or logical expression defining symptom match
    clinical_action TEXT NOT NULL, -- Actionable instructions for CHW/Mother
    effective_start_date TEXT,
    effective_end_date TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. Localized Lexicon Cache (Multilingual Support: Ibibio & Ibeno)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS localized_lexicon (
    term_id TEXT PRIMARY KEY,
    language_code TEXT NOT NULL, -- e.g., 'en', 'ibb', 'ibn'
    standard_english_phrase TEXT NOT NULL,
    localized_equivalent TEXT NOT NULL,
    phonetic_guide TEXT,
    clinical_category TEXT NOT NULL -- e.g., 'symptom_warning', 'body_part', 'action_prompt'
);

-- ----------------------------------------------------------------------------
-- 4. Patient Encounters & Triage Logs (Encrypted Storage)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_encounters (
    encounter_id TEXT PRIMARY KEY,
    device_id TEXT NOT NULL,
    session_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patient_age_group TEXT, -- e.g., 'pregnant_trimester_3', 'postpartum'
    location_lga TEXT, -- e.g., 'Uyo', 'Ibeno', 'Mbo'
    climate_risk_flagged TEXT, -- e.g., 'extreme_heat', 'post_flood_fever', 'none'
    matched_rule_id TEXT,
    severity_triggered INTEGER NOT NULL,
    action_taken TEXT NOT NULL,
    sync_status TEXT DEFAULT 'pending', -- 'pending', 'synced'
    FOREIGN KEY (matched_rule_id) REFERENCES triage_rules(rule_id)
);

-- ----------------------------------------------------------------------------
-- 5. Offline Sync Audit Logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_sync_logs (
    sync_log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    records_uploaded INTEGER DEFAULT 0,
    rules_downloaded INTEGER DEFAULT 0,
    status TEXT NOT NULL, -- 'success', 'failed', 'partial'
    error_message TEXT
);

-- ----------------------------------------------------------------------------
-- Indexes for High Performance on Edge Hardware
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rules_module ON triage_rules(module_name);
CREATE INDEX IF NOT EXISTS idx_lexicon_lang_cat ON localized_lexicon(language_code, clinical_category);
CREATE INDEX IF NOT EXISTS idx_encounters_sync ON clinical_encounters(sync_status);
CREATE INDEX IF NOT EXISTS idx_encounters_lga ON clinical_encounters(location_lga);

-- ----------------------------------------------------------------------------
-- Default Edge Seed Data: Climate Health Extension & Regional Lexicon
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO sync_metadata (key, value) VALUES
    ('schema_version', '1.0.0'),
    ('climate_module_version', 'MamaG_Climate_Health_Extension_1.0.0'),
    ('target_zone', 'Akwa Ibom / Lower Cross Coastal Belt');

INSERT OR IGNORE INTO triage_rules (rule_id, module_name, severity_level, trigger_condition, clinical_action, effective_start_date, effective_end_date, version) VALUES
    ('heat_hypertension_level_1', 'heat_stress', 1, '{"all":["headache_or_vision","trimester_2_or_3"],"any":["bp>=140/90","sudden_facial_hand_swelling","ruq_pain"]}', 'Immediate emergency transport to secondary/tertiary obstetric facility; initiate cooling protocols (shaded rest, damp cloths).', '2026-01-01', NULL, 1),
    ('heat_stress_level_2', 'heat_stress', 2, '{"all":["high_heat_index"],"any":["dizziness","excessive_fatigue","mild_dehydration"],"exclude":["bp>=140/90"]}', 'Administer Oral Rehydration Salts (ORS), mandatory relocation to shaded/ventilated area, and monitor vitals/BP for 2 hours.', '2026-01-01', NULL, 1),
    ('severe_malaria_level_1', 'vector_malaria', 1, '{"all":["fever_or_chills"],"any":["inability_to_keep_fluids","extreme_lethargy","jaundice","dark_urine","severe_anemia"]}', 'Immediate Malaria RDT, parenteral anti-malarials (IV Artesunate) per national guidelines, and urgent hospital transfer.', '2026-01-01', NULL, 1),
    ('uncomplicated_malaria_level_2', 'vector_malaria', 2, '{"all":["fever_or_chills","peak_vector_season"],"exclude":["severe_malaria_red_flags"]}', 'Immediate Malaria RDT, prompt guideline-approved ACT therapy, and ITN bednet utilization counseling.', '2026-01-01', NULL, 1),
    ('waterborne_flood_risk', 'flood_waterborne', 2, '{"all":["post_flood_exposure"],"any":["acute_watery_diarrhea","stomach_cramps"]}', 'Immediate WHO Oral Rehydration Salts (ORS), safe water chlorination/boiling counseling, and clinic evaluation.', '2026-01-01', NULL, 1),
    ('obstetric_preeclampsia_redflag', 'obstetric_standard', 1, '{"any":["bp>=160/110","convulsions","vaginal_bleeding","absent_fetal_kicks"]}', 'Emergency obstetric referral; initiate MgSO4 loading protocol where authorized and arrange rapid facility transfer.', '2026-01-01', NULL, 1);

INSERT OR IGNORE INTO localized_lexicon (term_id, language_code, standard_english_phrase, localized_equivalent, phonetic_guide, clinical_category) VALUES
    ('lex_heat_ibb', 'ibb', 'Are you feeling dizzy from the severe heat?', 'Idem kpon̄ ut mama? / Ekeme ndikot udim ufan̄ obio usen emi?', 'ee-dem kpon oot ma-ma', 'symptom_warning'),
    ('lex_swelling_ibb', 'ibb', 'Do you have sudden swelling in your face or hands?', 'Idem usụhọ / Isọn̄ ke ubọk ye iso', 'ee-dem oo-soo-ho / ee-song keh oo-bok yeh ee-so', 'symptom_warning'),
    ('lex_fever_ibb', 'ibb', 'Are you having chills and fever from mosquito illness?', 'Utọdọn̄ / Usen ofụn̄ mîkpon̄', 'oo-to-dong / oo-sen o-foon mee-kpong', 'symptom_warning'),
    ('lex_heat_ibn', 'ibn', 'Are you feeling dizzy from the severe heat?', 'Idem kpon̄ ut mama? / Udim obio emi akama ndikot', 'ee-dem kpon oot ma-ma', 'symptom_warning'),
    ('lex_ors_ibb', 'ibb', 'Drink clean water mixed with Oral Rehydration Salts and rest in the shade.', 'N̄wọn̄ edisana mmọn̄ ye ORS nyụn̄ duọk odudu ke mfụt.', 'ngwong eh-dee-sa-na mmong yeh ORS', 'action_prompt');
