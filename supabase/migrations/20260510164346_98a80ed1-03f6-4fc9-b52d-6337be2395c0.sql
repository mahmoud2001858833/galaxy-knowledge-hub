
-- 1) Add vitals_initial to clinical_cases
ALTER TABLE public.clinical_cases
  ADD COLUMN IF NOT EXISTS vitals_initial jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2) Backfill vitals_initial based on category+severity
UPDATE public.clinical_cases SET vitals_initial = jsonb_build_object(
  'hr', CASE
    WHEN category IN ('cardiology','emergency') AND severity IN ('high','critical') THEN 118
    WHEN category IN ('cardiology','emergency') THEN 95
    WHEN category = 'pulmonology' THEN 92
    WHEN category = 'pediatrics' THEN 110
    WHEN category IN ('neurology','psychiatry') AND severity IN ('high','critical') THEN 102
    ELSE 78
  END,
  'bp_sys', CASE
    WHEN category = 'cardiology' AND severity IN ('high','critical') THEN 88
    WHEN category = 'emergency' AND severity IN ('high','critical') THEN 92
    WHEN category = 'cardiology' THEN 142
    WHEN category = 'endocrinology' THEN 138
    ELSE 122
  END,
  'bp_dia', CASE
    WHEN category IN ('cardiology','emergency') AND severity IN ('high','critical') THEN 58
    WHEN category = 'cardiology' THEN 88
    ELSE 78
  END,
  'spo2', CASE
    WHEN category = 'pulmonology' AND severity IN ('high','critical') THEN 86
    WHEN category = 'pulmonology' THEN 92
    WHEN category IN ('cardiology','emergency') AND severity IN ('high','critical') THEN 91
    WHEN category = 'cardiology' THEN 96
    ELSE 98
  END,
  'rr', CASE
    WHEN category = 'pulmonology' AND severity IN ('high','critical') THEN 28
    WHEN category = 'pulmonology' THEN 22
    WHEN category IN ('cardiology','emergency') AND severity IN ('high','critical') THEN 24
    WHEN category = 'pediatrics' THEN 24
    ELSE 16
  END,
  'temp', CASE
    WHEN category = 'pediatrics' THEN 38.6
    WHEN category = 'emergency' AND severity IN ('high','critical') THEN 38.2
    WHEN category = 'pulmonology' THEN 37.9
    ELSE 37.0
  END,
  'glucose', CASE
    WHEN category = 'endocrinology' AND severity IN ('high','critical') THEN 312
    WHEN category = 'endocrinology' THEN 178
    ELSE 108
  END,
  'pain', CASE
    WHEN category IN ('orthopedics','emergency') AND severity IN ('high','critical') THEN 9
    WHEN category IN ('orthopedics','emergency') THEN 6
    ELSE 2
  END
) WHERE vitals_initial = '{}'::jsonb OR vitals_initial IS NULL;

-- 3) Update ui_kind per device key (all 28 mapped to dedicated simulators)
UPDATE public.clinical_devices SET ui_kind = CASE key
  WHEN 'ecg_12lead'      THEN 'interactive_ecg'
  WHEN 'aed'             THEN 'interactive_aed'
  WHEN 'stethoscope'     THEN 'interactive_stetho'
  WHEN 'bp_monitor'      THEN 'interactive_bp'
  WHEN 'pulse_ox'        THEN 'interactive_pulseox'
  WHEN 'glucometer'      THEN 'interactive_glucometer'
  WHEN 'ir_thermo'       THEN 'interactive_thermo'
  WHEN 'spirometer'      THEN 'interactive_spirometer'
  WHEN 'peak_flow'       THEN 'interactive_peakflow'
  WHEN 'nebulizer'       THEN 'interactive_nebulizer'
  WHEN 'o2_concentrator' THEN 'interactive_o2'
  WHEN 'capnograph'      THEN 'interactive_capno'
  WHEN 'xray'            THEN 'interactive_xray'
  WHEN 'ct'              THEN 'interactive_ct'
  WHEN 'mri'             THEN 'interactive_mri'
  WHEN 'us_msk'          THEN 'interactive_us'
  WHEN 'echo'            THEN 'interactive_echo'
  WHEN 'goniometer'      THEN 'interactive_goniometer'
  WHEN 'reflex_hammer'   THEN 'interactive_reflex'
  WHEN 'tuning_fork'     THEN 'interactive_tuning'
  WHEN 'gcs'             THEN 'interactive_gcs'
  WHEN 'eeg'             THEN 'interactive_eeg'
  WHEN 'otoscope'        THEN 'interactive_otoscope'
  WHEN 'ophthalmoscope'  THEN 'interactive_ophthalmoscope'
  WHEN 'urine_strip'     THEN 'interactive_urinestrip'
  WHEN 'troponin'        THEN 'interactive_troponin'
  WHEN 'vascular_doppler' THEN 'interactive_doppler'
  WHEN 'holter'          THEN 'interactive_holter'
  ELSE ui_kind
END;
