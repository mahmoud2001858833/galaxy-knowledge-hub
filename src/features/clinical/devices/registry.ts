import type React from 'react';
import InteractiveECG from './InteractiveECG';
import InteractiveAED from './InteractiveAED';
import InteractiveStethoscope from './InteractiveStethoscope';
import {
  SimBP, SimPulseOx, SimGlucometer, SimThermo, SimSpirometer, SimPeakFlow,
  SimNebulizer, SimO2, SimCapno, SimXRay, SimCT, SimMRI, SimUS, SimEcho,
  SimGoniometer, SimReflex, SimTuning, SimGCS, SimEEG, SimOtoscope, SimOphthalmo,
  SimUrineStrip, SimTroponin, SimDoppler, SimHolter, type SimProps, type CaseContext,
} from './simulators';

export type { SimProps, CaseContext };

// Device key → component
export const DEVICE_REGISTRY: Record<string, React.FC<any>> = {
  ecg_12lead: InteractiveECG as any,
  aed: InteractiveAED as any,
  stethoscope: InteractiveStethoscope as any,
  bp_monitor: SimBP,
  pulse_ox: SimPulseOx,
  glucometer: SimGlucometer,
  ir_thermo: SimThermo,
  spirometer: SimSpirometer,
  peak_flow: SimPeakFlow,
  nebulizer: SimNebulizer,
  o2_concentrator: SimO2,
  capnograph: SimCapno,
  xray: SimXRay,
  ct: SimCT,
  mri: SimMRI,
  us_msk: SimUS,
  echo: SimEcho,
  goniometer: SimGoniometer,
  reflex_hammer: SimReflex,
  tuning_fork: SimTuning,
  gcs: SimGCS,
  eeg: SimEEG,
  otoscope: SimOtoscope,
  ophthalmoscope: SimOphthalmo,
  urine_strip: SimUrineStrip,
  troponin: SimTroponin,
  vascular_doppler: SimDoppler,
  holter: SimHolter,
};
