import { ExcursionPreset, SubstrateStrip, SubstrateUnit, MachineTelemetry, EightDReport, FmeaRecord } from '../types/osat';

export const EXCURSION_PRESETS: ExcursionPreset[] = [
  {
    id: 'excursion-da-07',
    title: 'Die-Attach Delamination & Voiding (High-Density FC-BGA)',
    equipmentId: 'LINE-DA-07 (Besi Datacon 8800)',
    packageType: 'FC-BGA 1152-Ball (35x35mm)',
    defectType: 'Die-to-Paddle Acoustic Delamination (>34% void area)',
    lotId: 'LOT-2026-BGA-9420',
    stripId: 'STRIP-2026-X89',
    firstFailedIndex: 42,
    description: 'During epoxy dispense, nozzle heating block drifted +4.8°C above target 110°C, causing premature solvent volatilization and interfacial air entrapment.',
    physicsSnippet: 'Acoustic phase inversion detected at 100MHz transducer: Negative reflection coefficient indicates acoustic wave transition into low-density air pocket instead of cured adhesive matrix.',
    preventableScrapUsd: 38400,
    telemetry: {
      temp: 114.8,
      vacuum: -12.4,
      pressure: 39.2,
      bondForce: 14.8,
      ultrasonic: 84.0,
      cpk: 0.84,
    },
  },
  {
    id: 'excursion-mp-02',
    title: 'Epoxy Mold Compound (EMC) Pot Cavitation Voids',
    equipmentId: 'LINE-MP-02 (TOWA 120T Multi-Plunger)',
    packageType: 'QFN-48 Dual-Row (7x7mm)',
    defectType: 'EMC Internal Micro-Voids & Incomplete Fill',
    lotId: 'LOT-2026-QFN-4112',
    stripId: 'STRIP-2026-M14',
    firstFailedIndex: 18,
    description: 'Vacuum degas manifold pressure dropped to -10.2 kPa (target -18 kPa). Entrapped gas micro-bubbles compressed into mold cavity during transfer packing stage.',
    physicsSnippet: 'Scanning Acoustic Tomography depth gating at package center plane reveals clustered 25–90µm acoustic scattering voids near leadframe tie-bars.',
    preventableScrapUsd: 19200,
    telemetry: {
      temp: 176.2,
      vacuum: -10.2,
      pressure: 52.8,
      bondForce: 12.0,
      ultrasonic: 80.0,
      cpk: 0.98,
    },
  },
  {
    id: 'excursion-wb-04',
    title: 'Ultrasonic Wire Bond Lifted Ball & Heel Cracking',
    equipmentId: 'LINE-WB-04 (K&S Asterion Cu/Au)',
    packageType: 'SiP Power Management Module (15x15mm)',
    defectType: 'Wire Bond First Ball Intermetallic Lift-off',
    lotId: 'LOT-2026-SIP-7703',
    stripId: 'STRIP-2026-W05',
    firstFailedIndex: 67,
    description: 'Ultrasonic transducer horn resonance shifted by 1.8 kHz due to capillary clamp wear, dropping effective scrubbing power below JEDEC intermetallic bond threshold.',
    physicsSnippet: 'A-Scan shear wave velocity attenuation at bond pad interface indicates non-wetting and lack of Au-Al intermetallic compound (IMC) formation.',
    preventableScrapUsd: 27500,
    telemetry: {
      temp: 180.0,
      vacuum: -17.5,
      pressure: 34.0,
      bondForce: 7.2,
      ultrasonic: 61.5,
      cpk: 0.76,
    },
  },
  {
    id: 'excursion-golden',
    title: 'Golden Benchmark Strip (Zero Excursions / High Yield)',
    equipmentId: 'LINE-DA-07 (Besi Datacon 8800)',
    packageType: 'FC-BGA 1152-Ball (35x35mm)',
    defectType: 'Nominal Quality (Zero Defect / Cpk 1.88)',
    lotId: 'LOT-2026-BGA-9421',
    stripId: 'STRIP-2026-GOLD-01',
    firstFailedIndex: -1,
    description: 'Nominal process execution within tight 6-sigma guardrails. 100% C-SAM acoustic transmission across all 100 units.',
    physicsSnippet: 'Acoustic impedance matching within 1.2% variance across all bond interfaces; continuous Au-Si eutectic boundary with 0% delamination.',
    preventableScrapUsd: 0,
    telemetry: {
      temp: 110.1,
      vacuum: -18.2,
      pressure: 35.0,
      bondForce: 12.0,
      ultrasonic: 85.0,
      cpk: 1.88,
    },
  },
];

// Generate 100 substrate units (4 rows x 25 columns)
export function generateStripUnits(presetId: string, isInhibited: boolean): SubstrateUnit[] {
  const preset = EXCURSION_PRESETS.find((p) => p.id === presetId) || EXCURSION_PRESETS[0];
  const units: SubstrateUnit[] = [];
  const rows = 4;
  const cols = 25;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c + 1; // 1 to 100

      if (preset.firstFailedIndex === -1) {
        // Golden unit
        units.push({
          index: idx,
          row: r + 1,
          col: c + 1,
          status: 'pass',
          acousticReflectionPercent: 2.1 + (idx % 3) * 0.4,
          bondlineThicknessUm: 14.8 + (idx % 5) * 0.1,
          wireBondPullGf: 10.5 + (idx % 4) * 0.2,
          thermalConductivityWmK: 2.6,
        });
      } else {
        const isFirstFailed = idx === preset.firstFailedIndex;
        const isDownstream = idx > preset.firstFailedIndex && idx <= preset.firstFailedIndex + 7;
        const isProtectedByInhibit = idx > preset.firstFailedIndex + 7;

        let status: 'pass' | 'defect' | 'marginal' | 'inhibited' = 'pass';
        let acousticReflection = 3.2 + (idx % 4) * 0.5;
        let defectType: string | undefined = undefined;

        if (isFirstFailed) {
          status = 'defect';
          acousticReflection = 38.6;
          defectType = preset.defectType;
        } else if (isDownstream) {
          if (isInhibited) {
            status = 'inhibited';
            acousticReflection = 32.0;
            defectType = 'Contained defect unit (SECS/GEM Inhibit)';
          } else {
            status = 'defect';
            acousticReflection = 35.4;
            defectType = 'Propagated Excursion Defect';
          }
        } else if (isProtectedByInhibit) {
          if (isInhibited) {
            status = 'inhibited'; // Safely halted
            acousticReflection = 2.8;
            defectType = 'Protected (Line Halted Before Processing)';
          } else {
            // Defect continues to propagate if not inhibited!
            status = (idx % 2 === 0) ? 'defect' : 'marginal';
            acousticReflection = 26.5;
            defectType = 'Uncontained Scrap Escape';
          }
        } else if (idx === preset.firstFailedIndex - 1 || idx === preset.firstFailedIndex - 2) {
          status = 'marginal';
          acousticReflection = 14.2;
          defectType = 'Early Thermal Drift Inception';
        }

        units.push({
          index: idx,
          row: r + 1,
          col: c + 1,
          status,
          acousticReflectionPercent: acousticReflection,
          bondlineThicknessUm: status === 'defect' ? 22.4 : 15.2,
          wireBondPullGf: status === 'defect' ? 4.8 : 10.2,
          thermalConductivityWmK: status === 'defect' ? 1.1 : 2.5,
          defectType,
        });
      }
    }
  }

  return units;
}

export const INITIAL_TELEMETRY_SERIES: MachineTelemetry[] = Array.from({ length: 24 }).map((_, i) => {
  const isExcursionWindow = i >= 16 && i <= 19;
  const temp = isExcursionWindow ? 114.8 + Math.sin(i) * 0.8 : 110.2 + (Math.random() - 0.5) * 1.2;
  const vac = isExcursionWindow ? -12.4 + Math.sin(i) * 0.6 : -18.1 + (Math.random() - 0.5) * 0.5;
  const cpk = isExcursionWindow ? 0.82 : 1.68 + (Math.random() - 0.5) * 0.08;

  return {
    timestamp: `T-${(24 - i) * 30}s`,
    temperatureC: Number(temp.toFixed(1)),
    tempUcl: 112.5,
    tempLcl: 107.5,
    vacuumPressureKpa: Number(vac.toFixed(1)),
    vacUcl: -16.0,
    vacLcl: -20.0,
    dispensePressurePsi: isExcursionWindow ? 39.5 : 35.1,
    bondForceGf: isExcursionWindow ? 14.2 : 11.9,
    ultrasonicPowerMw: isExcursionWindow ? 87.5 : 84.8,
    cpk: Number(cpk.toFixed(2)),
  };
});

export const INITIAL_8D_REPORT: EightDReport = {
  reportId: '8D-2026-YLD-8802',
  d0_plan: 'YieldGuard Autonomous Inhibit triggered via SECS/GEM interlock on Line DA-07 within 340ms of acoustic threshold breach. Physical carrier quarantined immediately to prevent 58 units scrap.',
  d1_team: [
    { name: 'Dr. Karman Fong', role: 'Champion / Chief Quality Officer', dept: 'Global QA & Reliability' },
    { name: 'Marcus Chen', role: 'Process Engineering Lead', dept: 'Die-Attach & Wirebond Ops' },
    { name: 'Elena Rostova', role: 'Packaging R&D SME', dept: 'Advanced Materials Lab' },
    { name: 'David Kim', role: 'MES Automation Architect', dept: 'Lights-Out Fab Systems' },
  ],
  d2_problemDescription: {
    what: 'Interfacial acoustic delamination (>34% area threshold) between Silicon Die underside and Copper Heat Slug paddle on FC-BGA 1152 packages.',
    where: 'Line DA-07 (Besi Datacon 8800), Strip STRIP-2026-X89, Unit #42 onward.',
    when: '2026-10-17 19:42:10 UTC during high-density FC-BGA batch dispatch.',
    howMuch: '8 confirmed rejected units on strip; 58 unproccessed units saved by immediate SECS/GEM line halt. Net cost avoidance: $38,400.',
    isNot: 'Wire bond stitch pull strength normal; mold compound chemistry within shelf-life; substrate gold plating intact.',
  },
  d3_containment: {
    action: 'Autonomous SECS/GEM S2F41 LOT_INHIBIT sent to carrier handler. Physical diverter routed strip to nitrogen purge buffer.',
    validation: 'Acoustic SAT 100MHz transducer rescan of 10 adjacent strips confirmed zero escapes downline.',
    quarantinedCount: 14,
  },
  d4_rootCause: {
    fiveWhys: [
      'Why did the acoustic scan detect delamination? -> High acoustic reflection at die-epoxy interface indicates air void.',
      'Why did air voids form under the die? -> Conductive silver epoxy experienced localized micro-outgassing during ramp.',
      'Why did outgassing occur? -> Dispenser heating nozzle temperature drifted +4.8°C above 110°C glass transition limit.',
      'Why did the temperature drift? -> RTD thermistor sensor calibrated 8 months ago suffered resistive oxidation.',
      'Why was oxidation not caught earlier? -> Preventive maintenance calibration frequency was 12 months instead of 6 months for high-thermal recipe lines.',
    ],
    fishboneCategories: {
      Machine: ['RTD sensor calibration drift on dispense block', 'Dispense valve pneumatic pulse jitter'],
      Material: ['Epoxy syringe thawed 45 minutes past optimal pot-life window'],
      Method: ['Recipe ramp-up rate set to 3.5°C/sec instead of optimized 2.0°C/sec'],
      Man: ['Unmanned lights-out cell, reliance on closed-loop telemetry interlock'],
      Measurement: ['Off-line C-SAM inspection gate was scheduled for end-of-strip instead of unit-by-unit'],
      Environment: ['Cleanroom RH dropped from 45% to 37% during diurnal HVAC cycling'],
    },
    escapeRootCause: 'Standard inline optical AOI cannot penetrate opaque silicon to view buried epoxy bondline; requires high-frequency SAT acoustic tomography.',
  },
  d5_correctiveActions: [
    { action: 'Replace RTD temperature probe with dual-redundant optical pyrometer', owner: 'Marcus Chen', targetDate: '2026-10-24', status: 'In Progress' },
    { action: 'Update MES SECS/GEM recipe guardrail: auto-abort if dispense temp exceeds ±1.5°C for >3 seconds', owner: 'David Kim', targetDate: '2026-10-19', status: 'Completed' },
    { action: 'Mandate automated RF-ID barcode scan on epoxy syringes to enforce strict 120-minute pot-life hard stop', owner: 'Elena Rostova', targetDate: '2026-10-22', status: 'In Progress' },
  ],
  d6_verification: {
    validationPlan: '30-strip pilot run with real-time acoustic scanning and inline bondline thickness (BLT) measurement.',
    resultsTarget: 'Cpk >= 1.72 across 3,000 units with 0.00% delamination voids >15µm.',
  },
  d7_prevention: {
    controlPlanUpdate: 'Control Plan CP-BGA-880 Rev G amended with tightened dispense nozzle temperature tolerances.',
    fmeaUpdate: 'FMEA item #DA-104 revised: Occurrence reduced from 6 to 2, Detection improved from 5 to 1 via inline SAT.',
    sopRevisions: 'SOP-DA-042 updated with pyrometer verification checklist during batch changeover.',
  },
  d8_closure: 'Excursion successfully contained with zero customer escapes. Cross-functional team recognized for sub-second MES response.',
};

export const INITIAL_FMEA_RECORD: FmeaRecord = {
  processStep: 'Die-Attach Dispense & Epoxy Placement',
  failureMode: 'Die-to-Paddle Interfacial Delamination & Micro-Voids',
  potentialEffect: 'Degraded thermal dissipation (theta-JC spike), hot-spot generation, die cracking during temperature cycling (AEC-Q100 Grade 1 failure).',
  potentialCause: 'Epoxy outgassing from heater block thermal drift (+4.8°C), adhesive syringe expired pot-life, and vacuum assist degradation.',
  initial: {
    severity: 8,
    occurrence: 6,
    detection: 7,
    rpn: 336,
    actionPriority: 'High',
  },
  mitigationActions: 'YieldGuard Autonomous Gemini 3.8 Flash Ingestion: Inline C-SAM acoustic gating at unit #1 + Closed-loop SECS/GEM S2F41 Lot Inhibit within 340ms.',
  revised: {
    severity: 8,
    occurrence: 2,
    detection: 1,
    rpn: 16,
    actionPriority: 'Low',
  },
  rpnReductionPercent: 95.2,
  complianceStandard: 'AIAG-VDA 1st Edition / IATF 16949 / AEC-Q100',
};

export const INITIAL_RUL_COMPONENTS: import('../types/osat').EquipmentRulComponent[] = [
  {
    componentId: 'dispense_heater_nozzle',
    name: 'Dispense Nozzle & RTD Heating Block',
    equipmentId: 'LINE-DA-07 (Besi Datacon 8800)',
    category: 'Thermal',
    healthScorePercent: 22,
    rulHours: 14.2,
    rulStrips: 340,
    wearRatePerHour: 1.85,
    failureMechanism: 'Resistive oxidation of thin-film RTD sensor elements causing thermal feedback drift (+4.8°C above setpoint) and localized heater coil thinning.',
    telemetryCorrelations: [
      'Heater resistance drift (+1.4 Ω over 48h baseline)',
      'Stage thermocouple variance (σ = 2.1°C vs spec 0.4°C)',
      'Dispense pulse rise time degradation (+18ms)'
    ],
    recommendedAction: 'Schedule nozzle replacement during upcoming Strip #80 changeover (in ~2.5 hrs) before thermal runaway triggers complete die delamination.',
    partNumber: 'OEM-BESI-8800-NOZZLE-HTR-v4',
    maintenancePriority: 'CRITICAL',
    historicalWearPoints: [
      { hour: -48, health: 92 },
      { hour: -36, health: 81 },
      { hour: -24, health: 64 },
      { hour: -12, health: 43 },
      { hour: -6, health: 31 },
      { hour: 0, health: 22 },
    ]
  },
  {
    componentId: 'vacuum_manifold_seal',
    name: 'Vacuum Degas Manifold & Cavitation Seal',
    equipmentId: 'LINE-MP-02 (TOWA 120T Multi-Plunger)',
    category: 'Pneumatic / Vacuum',
    healthScorePercent: 42,
    rulHours: 38.5,
    rulStrips: 920,
    wearRatePerHour: 0.95,
    failureMechanism: 'Elastomer micro-fissuring and abrasive wear from silica filler particulates during high-pressure resin transfer cycles.',
    telemetryCorrelations: [
      'Vacuum chamber pump-down delay (+3.4 seconds)',
      'Transient pressure drop (-12.4 kPa vs -18.0 kPa baseline)',
      'Plunger seal friction coefficient (+24%)'
    ],
    recommendedAction: 'Inspect vacuum assist manifold O-rings; swap during scheduled shift changeover PM window.',
    partNumber: 'OEM-TOWA-120T-VAC-MANIFOLD-SEAL',
    maintenancePriority: 'WARNING',
    historicalWearPoints: [
      { hour: -48, health: 88 },
      { hour: -36, health: 79 },
      { hour: -24, health: 68 },
      { hour: -12, health: 54 },
      { hour: -6, health: 48 },
      { hour: 0, health: 42 },
    ]
  },
  {
    componentId: 'transducer_capillary_clamp',
    name: 'Ultrasonic Transducer Capillary & Horn Clamp',
    equipmentId: 'LINE-WB-04 (K&S Asterion Cu/Au)',
    category: 'Ultrasonic / Acoustic',
    healthScorePercent: 15,
    rulHours: 8.4,
    rulStrips: 200,
    wearRatePerHour: 2.10,
    failureMechanism: 'Piezoelectric transducer resonant frequency drift (1.8 kHz shift) caused by horn clamp screw torque relaxation and capillary bore erosion.',
    telemetryCorrelations: [
      'Transducer impedance spike at 138 kHz resonance',
      'Effective scrubbing velocity attenuation (-18%)',
      'Wire bond first ball shear strength degradation'
    ],
    recommendedAction: 'Immediate tool halt. Replace ceramic capillary and retorque horn clamp with calibrated digital wrench.',
    partNumber: 'OEM-KS-ASTERION-CAPILLARY-CU99',
    maintenancePriority: 'CRITICAL',
    historicalWearPoints: [
      { hour: -48, health: 85 },
      { hour: -36, health: 68 },
      { hour: -24, health: 49 },
      { hour: -12, health: 32 },
      { hour: -6, health: 21 },
      { hour: 0, health: 15 },
    ]
  },
  {
    componentId: 'reflow_blower_convection',
    name: 'Reflow Forced Convection Blower & N2 Valve',
    equipmentId: 'LINE-RO-03 (Heller 1936 MK5)',
    category: 'Mechanical',
    healthScorePercent: 88,
    rulHours: 210.0,
    rulStrips: 5040,
    wearRatePerHour: 0.15,
    failureMechanism: 'Nominal bearing vibration within ISO 10816 Class 1 standards. Zero flux residue contamination detected on impeller blades.',
    telemetryCorrelations: [
      'Vibration RMS 0.38 mm/s (Spec <1.2 mm/s)',
      'Zone 6 temperature stability ±0.3°C',
      'N2 consumption rate 18.2 m³/h (Nominal)'
    ],
    recommendedAction: 'Component healthy. Continue automated telemetry monitoring. Next routine PM in 30 days.',
    partNumber: 'OEM-HELLER-1936-BLOWER-MOTOR',
    maintenancePriority: 'HEALTHY',
    historicalWearPoints: [
      { hour: -48, health: 96 },
      { hour: -36, health: 94 },
      { hour: -24, health: 92 },
      { hour: -12, health: 90 },
      { hour: -6, health: 89 },
      { hour: 0, health: 88 },
    ]
  }
];

